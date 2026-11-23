#!/usr/bin/env python3
"""Portföy güvenlik taraması: bütün depolarda aynı temel güvenlik kurallarını denetler.

Neden: Her inceleme turunda tek tek yeni açık çıkıyordu. Bu betik bilinen bütün önlemleri her depoda aynı anda
arar; yeni bir proje de aynı listeyle başlar (docs/GUVENLIK_TEMELI.md). Haftalık GitHub Actions işi
(.github/workflows/guvenlik-taramasi.yml) depoları klonlayıp bu betiği çalıştırır.

Kullanım:
  python3 araclar/guvenlik/tara.py <depo-klasörü>...            # rapor (Markdown) yazar
  python3 araclar/guvenlik/tara.py --audit <depo-klasörü>...    # npm audit de çalıştırır (ağ gerekir)
  --beklenen=depolar.txt --atlanan=atlanan.txt   # kapsam: beklenen / taranan / atlanan ayrı yazılır
Çıkış kodu: 0 temiz · 1 YÜKSEK ya da orta bulgu · 2 tarama tamamlanamadı (depo atlandı ya da npm audit okunamadı;
bu durumda sonuç "temiz" sayılmaz ve açık issue kapatılmaz).
İstisnalar: araclar/guvenlik/istisnalar.json (her istisna gerekçesiyle).
"""
import json, os, re, subprocess, sys
from collections import Counter

BURASI = os.path.dirname(os.path.abspath(__file__))
ISTISNA = json.load(open(os.path.join(BURASI, 'istisnalar.json'), encoding='utf-8'))
SIRA = ['YÜKSEK', 'orta', 'düşük', 'bilgi']
SECRET = re.compile(r'(sk-ant-api[0-9A-Za-z_-]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|'
                    r'-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|xox[bp]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35})')
ATLA = ('node_modules/', 'vendor/', 'lib/', 'dist/', 'scratchpad')
IKILI = ('.min.js', '.whl', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.mp4', '.woff2', '.woff', '.ttf', '.xlsx', '.pdf', '.b64.txt', '.ico', '.zip', '.vzetud', '.db', '.sqlite')


def oku(p):
    try:
        return open(p, encoding='utf-8', errors='ignore').read()
    except OSError:
        return ''


def dosyalar(d):
    r = subprocess.run(['git', 'ls-files'], cwd=d, capture_output=True, text=True)
    return [f for f in r.stdout.split('\n') if f]


def istisna_mi(depo, kural, yer):
    for i in ISTISNA.get(depo, []) + ISTISNA.get('*', []):
        if i['kural'] == kural and re.search(i.get('yer', '.*'), yer or ''):
            return True
    return False


EKSIK = []  # (depo, dosya, neden): denetimi tamamlanamayanlar


def tara(d, audit=False):
    depo = os.path.basename(os.path.abspath(d))
    F = dosyalar(d)
    B = []

    def b(sev, kural, mesaj, yer=''):
        if not istisna_mi(depo, kural, yer):
            B.append((sev, kural, mesaj, yer))

    # --- Depo hijyeni
    if not any(os.path.exists(os.path.join(d, x)) for x in ('LICENSE.md', 'LICENSE')):
        b('orta', 'lisans', 'Lisans dosyası yok (PolyForm Shield 1.0.0 beklenir)')
    if not os.path.exists(os.path.join(d, '.github/dependabot.yml')):
        b('düşük', 'dependabot', 'Bağımlılık botu (dependabot.yml) yok')
    if any(f.endswith('package.json') for f in F) and '.env' not in oku(os.path.join(d, '.gitignore')):
        b('orta', 'gitignore-env', '.gitignore .env içermiyor')
    for f in F:
        if f.startswith(ATLA) or f.endswith(IKILI):
            continue
        if re.search(r'(^|/)\.env$', f):
            b('YÜKSEK', 'env-depoda', '.env dosyası depoda', f)
        m = SECRET.search(oku(os.path.join(d, f)))
        if m:
            b('YÜKSEK', 'gizli-anahtar', f'Olası gizli anahtar ({m.group(0)[:10]}…)', f)

    # --- GitHub Actions
    for wf in [f for f in F if f.startswith('.github/workflows/')]:
        t = oku(os.path.join(d, wf))
        if not re.search(r'^permissions:', t, re.M):
            b('orta', 'actions-yetki', 'Üst düzey permissions yok (varsayılan yazma yetkisi)', wf)
        if 'pull_request_target' in t:
            b('YÜKSEK', 'actions-prt', 'pull_request_target kullanılıyor', wf)
        for u in re.findall(r'uses:\s*(\S+)', t):
            if '@' not in u and not u.startswith('./'):
                b('orta', 'actions-surum', f'Sürümsüz action: {u}', wf)
        if re.search(r'run:.*\$\{\{\s*github\.event\.(issue|pull_request|comment|review)[a-z_.]*\.(title|body|head_ref)', t):
            b('YÜKSEK', 'actions-enjeksiyon', 'Kullanıcı metni doğrudan run: içinde', wf)

    # --- Web sayfaları: CSP ve dış kaynak
    hdr = ''.join(oku(os.path.join(d, f)) for f in F if f.endswith('_headers'))
    for h in [f for f in F if f.endswith('.html') and not f.startswith(ATLA + ('tools/', 'araclar/', 'tests/', 'test/', 'docs/arsiv'))]:
        t = oku(os.path.join(d, h))
        if len(t) < 200 or re.search(r'http-equiv="refresh"', t, re.I):
            continue
        if 'Content-Security-Policy' not in t and "default-src" not in hdr:
            b('orta', 'csp', 'Sayfada içerik güvenlik politikası (CSP) yok', h)
        for m in re.finditer(r'<script[^>]+src=["\'](?:https?:)?//([^"\'/]+)', t):
            b('orta', 'dis-betik', f'Dış adresten betik: {m.group(1)}', h)
        if re.search(r'<a [^>]*target=["\']_blank["\'](?![^>]*noopener)(?![^>]*noreferrer)[^>]*>', t):
            b('düşük', 'noopener', 'target=_blank bağlantıda rel=noopener yok', h)

    # --- Cloudflare: başlık dosyası ve yayımlanan klasör
    wr = oku(os.path.join(d, 'wrangler.jsonc')) + oku(os.path.join(d, 'wrangler.toml'))
    if wr:
        kaynak = hdr + ''.join(oku(os.path.join(d, f)) for f in F if re.search(r'worker/.*\.(ts|js)$', f))
        for k in ('X-Content-Type-Options', 'Strict-Transport-Security', 'Referrer-Policy', 'Permissions-Policy'):
            if k not in kaynak:
                b('düşük', 'baslik', f'{k} başlığı yok (_headers ya da Worker)')
        if 'frame-ancestors' not in kaynak and 'X-Frame-Options' not in kaynak:
            b('düşük', 'baslik', 'Çerçevelenme kapalı değil (frame-ancestors / X-Frame-Options)')
        m = re.search(r'"directory"\s*:\s*"\./?"', wr)
        if m:
            ign = oku(os.path.join(d, '.assetsignore')).split()
            for x in ('.git', '.github', 'node_modules', 'tools', 'tests'):
                if os.path.exists(os.path.join(d, x)) and x not in ign:
                    b('orta', 'assetsignore', f'Depo kökü yayımlanıyor ama .assetsignore "{x}" içermiyor')

    # --- JavaScript riskleri
    for f in F:
        if not f.endswith(('.js', '.mjs', '.ts', '.tsx', '.jsx')) or f.startswith(ATLA + ('tests/', 'test/', 'tools/', 'araclar/')) or '.min.' in f:
            continue
        t = oku(os.path.join(d, f))
        if re.search(r'postMessage\([^)]*,\s*["\']\*["\']', t):
            b('orta', 'postmessage', 'postMessage hedefi "*"', f)
        if re.search(r"addEventListener\(\s*['\"]message['\"]", t) and not re.search(r'\.origin\b|\.source\b', t):
            b('orta', 'message-origin', 'message dinleyicisi gönderen kaynağı denetlemiyor', f)

    # --- Docker
    df = oku(os.path.join(d, 'Dockerfile'))
    if df:
        if not re.search(r'^USER\s+(?!root\b)\S+', df, re.M):
            b('YÜKSEK', 'docker-root', 'Konteyner root olarak çalışıyor (USER yok)', 'Dockerfile')
        if 'HEALTHCHECK' not in df:
            b('düşük', 'docker-saglik', 'HEALTHCHECK yok', 'Dockerfile')
        for img in re.findall(r'^FROM\s+(\S+)', df, re.M):
            if ':' not in img or img.endswith(':latest'):
                b('orta', 'docker-surum', f'Taban imaj sürümü sabit değil: {img}', 'Dockerfile')
    try:
        import yaml
    except ImportError:
        yaml = None
    for dc in [f for f in F if re.search(r'(^|/)(docker-)?compose[^/]*\.ya?ml$', f)]:
        t = oku(os.path.join(d, dc))
        if not yaml:
            continue
        y = yaml.safe_load(t) or {}
        if dc.startswith('deploy/') and not y.get('name'):
            b('orta', 'compose-ad', 'deploy/ altındaki compose dosyasında proje adı (name:) yok; başka uygulamayla çakışır', dc)
        for ad, s in (y.get('services') or {}).items():
            img = str(s.get('image', '')) + str(s.get('build', ''))
            vekil = 'caddy' in ad or 'caddy' in img
            veritabani = 'postgres' in img or 'redis' in img
            so = ' '.join(map(str, s.get('security_opt') or []))
            if 'no-new-privileges' not in so:
                b('orta', 'compose-nnp', f'{ad}: no-new-privileges yok', dc)
            if not veritabani and 'ALL' not in (s.get('cap_drop') or []):
                b('orta', 'compose-cap', f'{ad}: cap_drop ALL yok', dc)
            if not (vekil or veritabani) and not s.get('read_only'):
                b('düşük', 'compose-ro', f'{ad}: salt okunur kök dosya sistemi (read_only) yok', dc)
            if not (s.get('mem_limit') or (s.get('deploy') or {}).get('resources')):
                b('düşük', 'compose-bellek', f'{ad}: bellek sınırı yok', dc)
            if not (s.get('logging') or {}).get('options', {}).get('max-size'):
                b('düşük', 'compose-kayit', f'{ad}: kayıt boyutu sınırı yok', dc)
            for p in s.get('ports') or []:
                p = str(p)
                if not vekil and not p.startswith('127.'):
                    b('YÜKSEK', 'compose-port', f'{ad}: port tüm arayüzlere açık ({p})', dc)
    for cf in [f for f in F if os.path.basename(f) == 'Caddyfile']:
        t = oku(os.path.join(d, cf))
        if 'reverse_proxy' in t:
            for k in ('Strict-Transport-Security', 'X-Content-Type-Options', '-Server'):
                if k not in t:
                    b('düşük', 'caddy-baslik', f'Caddy: {k} yok', cf)

    # --- Uygulama katmanı (2. derin tur, Kasım 2026): bulunan açık türleri geri gelmesin
    kod = [f for f in F if f.endswith(('.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.html')) and not f.endswith(IKILI)
           and not f.startswith(ATLA) and not f.startswith(('tests/', 'test/', 'docs/', 'ders/')) and '/tests/' not in f
           and '.test.' not in f and '/lib/' not in f and '/vendor/' not in f]
    for f in kod:
        t = oku(os.path.join(d, f))
        # Yalnız gerçek CSV indirmesi (Blob türü ya da data: adresi). Kesit Power BI'daki Power Query benzetiminde
        # "text/csv" bir dosya türü metni olarak geçer, indirme değildir (yanlış alarm, 23 Kasım 2026).
        if re.search(r'''type\s*:\s*['"]text/csv|data:text/csv''', t) and re.search(r"""replace\(/"/g,\s*['"]""['"]\)""", t) and 'csvSafe(' not in t and not re.search(r'\[=\+(\\-|-)?@|\[=\+@', t):
            b('orta', 'csv-formul', 'CSV dışa aktarımında formül koruması yok (=, +, -, @ ile başlayan hücre Excel’de formül olur)', f)
        if re.search(r'DecompressionStream\([^)]*\)\)\)\.arrayBuffer\(\)', t):
            b('orta', 'zip-sinir', 'Sıkıştırılmış veri sınırsız açılıyor (zip bombası); akışla okuyup boyutu sınırla', f)
        if 'new BrowserWindow' in t and 'setPermissionRequestHandler' not in t:
            b('orta', 'electron-izin', 'Electron: setPermissionRequestHandler yok; kamera, konum, bildirim izinleri sorgusuz verilir', f)
        if re.search(r'(JSON\.parse|b64Oku|atob)\([^)]*location\.hash', t) and 'localStorage.setItem' in t and 'document.referrer' not in t:
            b('orta', 'hash-kayit', 'Adresin # kısmıyla gelen veri tarayıcı kaydına yazılıyor, kaynağı doğrulanmıyor (hazırlanmış bağlantı)', f)
        if re.search(r"""searchParams\.get\(['"]error_description['"]\)""", t):
            b('düşük', 'hata-yansitma', 'Kimlik sağlayıcının error_description metni sayfaya yazılıyor olabilir (sahte uyarı)', f)
        if 'innerHTML' in t or 'insertAdjacentHTML' in t:
            for m in re.finditer(r'\s(?:data-[\w-]+|id|value|href|src)="[^"$`<>]*\$\{(?!esc\(|escapeHtml\(|escAttr\(|encodeURIComponent\()([A-Za-z_$][\w$]*\.(?:id|at|key|raw|name|ad|url))\}', t):
                b('orta', 'oznitelik-kacis', f'Kayıttan gelen değer HTML özniteliğine kaçışsız yazılıyor: {m.group(1)} (içe aktarılan veriyle XSS)', f)
                break
    sunucu_kodu = [f for f in F if f.endswith(('.js', '.mjs', '.ts')) and not f.endswith(IKILI) and '.test.' not in f
                   and not f.startswith(('node_modules/', 'vendor/', 'dist/', 'tests/', 'test/', 'examples/'))
                   and re.search(r'(^|/)(server|lib|api|worker)/', f)]
    for f in sunucu_kodu:
        if re.search(r'''(password|parola|sifre|passwordHash)\(\s*["'][^"'\s]{6,}["']\s*\)''', oku(os.path.join(d, f))):
            b('orta', 'sabit-parola', 'Sabit başlangıç parolası koddan atanıyor; şirket kurulumunda gizli değerden gelmeli', f)
    for f in [f for f in F if f.endswith('.sh')]:
        t = oku(os.path.join(d, f))
        if re.search(r'pg_dump(all)?\b', t) and 'umask 0' not in t:
            b('orta', 'yedek-umask', 'Yedek betiği umask 077 kullanmıyor; döküm sunucuda herkesçe okunur', f)
        if re.search(r'pg_dump(all)?\b', t) and 'rclone copy' in t and 'crypt' not in t:
            b('orta', 'yedek-sifre', 'Yedek uzak depoya istemci tarafında şifrelenmeden gidiyor (rclone crypt)', f)

    # Sürüm bildirimi (Kesit): listedeki dosya özetleri tutmuyorsa CI düşer; göndermeden önce yakala.
    if 'release-manifest.json' in F:
        import hashlib
        try:
            man = json.loads(oku(os.path.join(d, 'release-manifest.json'))).get('files', {})
        except json.JSONDecodeError:
            man = {}
        for yol, ozet in man.items():
            p = os.path.join(d, yol)
            if os.path.exists(p) and hashlib.sha256(open(p, 'rb').read()).hexdigest() != ozet:
                b('orta', 'manifest-ozet', 'release-manifest.json özeti dosyayla tutmuyor (CI düşer)', yol)

    # --- Bağımlılık açıkları
    # npm audit okunamazsa (ağ, kayıt, bozuk çıktı, zaman aşımı) depo "temiz" sayılmaz: denetim tamamlanamadı olarak raporlanır.
    if audit:
        for lock in [f for f in F if f.endswith('package-lock.json') and not f.startswith(ATLA)]:
            kl = os.path.join(d, os.path.dirname(lock))
            try:
                r = subprocess.run(['npm', 'audit', '--omit=dev', '--json'], cwd=kl, capture_output=True, text=True, timeout=180)
                j = json.loads(r.stdout)
                if 'error' in j or 'metadata' not in j:
                    raise ValueError((j.get('error') or {}).get('summary') or 'npm audit çıktısında özet yok')
                v = j['metadata'].get('vulnerabilities', {})
            except (json.JSONDecodeError, ValueError, subprocess.TimeoutExpired, OSError) as e:
                EKSIK.append((depo, lock, str(e).splitlines()[0][:160] if str(e) else type(e).__name__))
                continue
            for sev, n in v.items():
                if n and sev in ('critical', 'high'):
                    b('YÜKSEK', 'npm-audit', f'npm audit: {n} {sev}', lock)
                elif n and sev == 'moderate':
                    b('orta', 'npm-audit', f'npm audit: {n} moderate', lock)
    return depo, B


def secenek(ad):
    """--ad=deger biçimindeki seçeneği döndürür."""
    for a in sys.argv[1:]:
        if a.startswith(f'--{ad}='):
            return a.split('=', 1)[1]
    return None


def liste(yol):
    if not yol or not os.path.exists(yol):
        return []
    return [x.strip() for x in open(yol, encoding='utf-8') if x.strip() and not x.startswith('#')]


def main():
    """Çıkış kodu: 0 temiz · 1 orta/YÜKSEK bulgu · 2 tarama tamamlanamadı (depo atlandı ya da denetim okunamadı)."""
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    audit = '--audit' in sys.argv
    beklenen = liste(secenek('beklenen'))
    atlanan = liste(secenek('atlanan'))
    toplam = Counter()
    satir = ['# Portföy güvenlik taraması', '', f'Kurallar ve gerekçeleri: `docs/GUVENLIK_TEMELI.md`. İstisnalar: `araclar/guvenlik/istisnalar.json`.', '']
    taranan = []
    for d in args:
        depo, B = tara(d, audit)
        taranan.append(depo)
        toplam.update(s for s, *_ in B)
        if not B:
            satir.append(f'- **{depo}**: temiz' + (' (bağımlılık denetimi tamamlanamadı, aşağıya bak)' if any(e[0] == depo for e in EKSIK) else ''))
            continue
        satir.append(f'- **{depo}**: {len(B)} bulgu')
        grup = Counter((s, m) for s, k, m, y in B)
        yerler = {}
        for s, k, m, y in B:
            yerler.setdefault((s, m), []).append(y)
        for (s, m), n in sorted(grup.items(), key=lambda x: SIRA.index(x[0][0])):
            ys = [y for y in yerler[(s, m)] if y][:3]
            satir.append(f'  - [{s}] {m}' + (f' ×{n}' if n > 1 else '') + (f' — `{"`, `".join(ys)}`' if ys else ''))
    eksik_depo = [x for x in beklenen if x not in taranan and x not in atlanan]
    satir += ['', '## Kapsam', '',
              f'- Beklenen: {len(beklenen)} depo' if beklenen else '- Beklenen: liste verilmedi',
              f'- Taranan: {len(taranan)} depo',
              f'- Atlanan (klonlanamadı): {len(atlanan)}' + (f' — {", ".join(atlanan)}' if atlanan else ''),
              ]
    if eksik_depo:
        satir.append(f'- Listede olup taranmayan: {", ".join(eksik_depo)}')
    if EKSIK:
        satir += ['', '## Denetim tamamlanamadı', '']
        satir += [f'- **{d}** `{y}`: {n}' for d, y, n in EKSIK]
    eksik = bool(atlanan or eksik_depo or EKSIK)
    satir += ['', 'Özet: ' + (', '.join(f'{k} {toplam[k]}' for k in SIRA if toplam[k]) if toplam else 'bulgu yok')
              + (' · DENETİM TAMAMLANAMADI: sonuç "temiz" sayılmaz' if eksik else '')]
    print('\n'.join(satir))
    sys.exit(2 if eksik else 1 if toplam['YÜKSEK'] or toplam['orta'] else 0)


if __name__ == '__main__':
    main()
