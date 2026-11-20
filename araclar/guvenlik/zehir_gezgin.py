"""Genel içe aktarma XSS gezgini (araclar/guvenlik). Gerekenler: pip install playwright; Chrome (/usr/bin/google-chrome).
1) Uygulamayı temiz gezer (tarayıcı belleği dolar).
2) localStorage'daki her JSON değerinin metinlerini betikli değerle değiştirir (kötü niyetli yedek dosyası gibi).
   Kip 'oznitelik': her metin  "'><img onerror=...>  olur (kimlik/öznitelik kırma).
   Kip 'metin': yalnız kimliğe benzemeyen metinler <img onerror=...> eklenmiş olur (enum/kimlikler korunur, kapsama artar).
3) Yeniden gezer; tetiklenen alanların yolunu yazar.
Kullanım: python3 zehir_gezgin.py <klasör> <başlangıç-yolu> <kip> [adım]"""
import functools, http.server, random, socketserver, sys, threading
from playwright.sync_api import sync_playwright

KLASOR, YOL, KIP = sys.argv[1], sys.argv[2], sys.argv[3]
ADIM = int(sys.argv[4]) if len(sys.argv) > 4 else 500


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


socketserver.TCPServer.allow_reuse_address = True
s = socketserver.TCPServer(('127.0.0.1', 0), functools.partial(Q, directory=KLASOR))
threading.Thread(target=s.serve_forever, daemon=True).start()
URL = f'http://localhost:{s.server_address[1]}/{YOL.lstrip("/")}'

ZEHIR = r"""(kip) => {
  let n = 0; const yollar = [];
  const kimlik = v => /^[A-Za-z0-9_.:-]{1,40}$/.test(v);
  const z = (v, yol) => {
    n++; const id = (n % 997).toString(36); yollar.push(id + '=' + yol.slice(0, 80));
    const b = `<img src=x onerror="__x('${id}')">`;
    return kip === 'oznitelik' ? `"'>` + b : (kimlik(v) ? v : v + b);
  };
  const gez = (x, yol) => {
    if (typeof x === 'string') return z(x, yol);
    if (Array.isArray(x)) return x.map((v, i) => gez(v, yol + '[' + i + ']'));
    if (x && typeof x === 'object') { const o = {}; for (const [k, v] of Object.entries(x)) o[k] = gez(v, yol + '.' + k); return o; }
    return x;
  };
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i), v = localStorage.getItem(k);
    try { const j = JSON.parse(v); if (j && typeof j === 'object') localStorage.setItem(k, JSON.stringify(gez(j, k))); } catch (e) {}
  }
  return yollar;
}"""

random.seed(11)


def gezin(pg, adim, izle):
    vurulan = []
    for i in range(adim):
        try:
            if izle:
                for f in pg.evaluate('window.__xh || []'):
                    if f not in vurulan:
                        vurulan.append(f)
            el = pg.query_selector_all('button:visible, [role=tab]:visible, a[href^="#"]:visible, [data-go]:visible, .opt:visible, summary:visible, [onclick]:visible')
            for inp in pg.query_selector_all('input[type=text]:visible, textarea:visible')[:2]:
                try:
                    inp.fill(random.choice(['x', 'select 1', 'elma', '42', '']))
                except Exception:
                    pass
            if not el or random.random() < 0.04:
                pg.goto(URL); pg.wait_for_timeout(400); continue
            random.choice(el).click(timeout=1200); pg.wait_for_timeout(100)
        except Exception:
            try:
                pg.goto(URL); pg.wait_for_timeout(400)
            except Exception:
                pass
    return vurulan


with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    c = b.new_context(accept_downloads=False)
    c.add_init_script("window.__xh=[];window.__x=f=>{window.__xh.push(f)};window.alert=()=>{};window.confirm=()=>true;window.prompt=()=>'x';window.print=()=>{}")
    pg = c.new_page()
    pg.on('dialog', lambda d: d.accept())
    pg.goto(URL); pg.wait_for_timeout(1500)
    gezin(pg, ADIM // 2, False)
    yollar = pg.evaluate(ZEHIR, KIP)
    anahtarlar = pg.evaluate('Object.keys(localStorage)')
    print(f'  bellek anahtarları: {anahtarlar} · zehirlenen metin: {len(yollar)}', flush=True)
    pg.goto(URL); pg.wait_for_timeout(1500)
    v = gezin(pg, ADIM, True)
    harita = dict(y.split('=', 1) for y in yollar)
    print('SONUÇ:', 'tetiklenen yok' if not v else 'XSS: ' + '; '.join(f'{x} → {harita.get(x, "?")}' for x in v))
    b.close()
s.shutdown()
