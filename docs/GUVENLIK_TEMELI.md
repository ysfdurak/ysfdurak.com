# Güvenlik temeli: her projede baştan

Bu liste, Kasım 2026'daki inceleme turlarında portföy projelerinde tek tek bulunup düzeltilen bütün güvenlik önlemlerinin toplamıdır. Yeni bir proje bu listeyle başlar; var olan projeler her pazartesi aynı kurallarla taranır (`araclar/guvenlik/tara.py`, `.github/workflows/guvenlik-taramasi.yml`). Bir kural bir projeye uymuyorsa `araclar/guvenlik/istisnalar.json` dosyasına **gerekçesiyle** yazılır.

## 1. Her depo

| Önlem | Neden |
| --- | --- |
| `LICENSE.md` (PolyForm Shield 1.0.0) ve README'de TR/EN lisans bölümü | Kullanım koşulları baştan belli |
| `.github/dependabot.yml` (npm/pip ve GitHub Actions, haftalık) | Açıklı bağımlılık birikmez |
| `.gitignore` içinde `.env`, `.env.*`, `node_modules/`, veri ve yedek klasörleri | Gizli bilgi ve kişisel veri depoya girmez |
| Gizli anahtar yok: anahtarlar yalnız `.env`'de (sunucuda `umask 077`) ya da Cloudflare/GitHub gizli değişkenlerinde | Depo herkese açık |
| Her iş akışında üst düzey `permissions:` (çoğunlukla `contents: read`); `pull_request_target` yok; kullanıcı metni `run:` içine doğrudan yazılmaz, `env:` ile verilir | Actions üzerinden yetki yükseltme ve komut enjeksiyonu |
| CI'da testler + önbellek sürümü kapısı (service worker varsa) | Güvenlik düzeltmesi kullanıcıya ulaşır |

## 2. Her web sayfası (statik, Cloudflare, GitHub Pages)

| Önlem | Neden |
| --- | --- |
| İçerik güvenlik politikası (CSP): `default-src 'self'`; `connect-src` yalnız gereken adresler; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`; mümkünse `frame-ancestors 'none'` | XSS olsa bile veri dışarı gönderilemez, sayfa başka sitede çerçevelenemez |
| Betik çalıştırmayan statik sayfalar: `default-src 'none'` | En sıkı politika |
| Dış CDN, Google Fonts, analitik yok; yazı tipleri ve kitaplıklar depoda (`vendor/`, `fonts/`) | Ziyaretçi IP'si üçüncü tarafa gitmez (KVKK), tedarik zinciri riski yok. Kaçınılmazsa (Pyodide, Office.js) yalnız o adres izinli ve istisnada gerekçeli |
| Başlıklar (`_headers`, Worker ya da sunucu): `X-Content-Type-Options: nosniff`, `Strict-Transport-Security: max-age=31536000`, `Referrer-Policy`, `Permissions-Policy` (kamera/mikrofon/konum kapalı), `X-Frame-Options: DENY`, `Cross-Origin-Opener-Policy: same-origin` | Tarayıcı korumaları açık |
| Cloudflare Worker yanıtları başlıkları kodda da alır (`_headers` yalnız statik dosyalara uygulanır) | Dinamik sayfalar korumasız kalmaz |
| Depo kökü yayımlanıyorsa `.assetsignore`: `.git`, `.github`, `node_modules`, `tools`, `tests`, `docs` | Kaynak ve araçlar yayımlanmaz |
| Kullanıcı metni ekrana yalnız kaçışlanarak (`esc`) ya da `textContent` ile yazılır; `innerHTML`'e ham metin girmez | XSS |
| HTML özniteliğine giden **her** değer `esc()`'ten geçer (`data-id="${esc(x.id)}"`), kimlikler dahil; içe aktarılan kayıtta kimlik biçimi denetlenir, bozuksa yenisi verilir | Yedek dosyası, taşıma bağlantısı ya da yapıştırılan liste kimliğe `"><img onerror=…>` koyup betik çalıştırabilir (İngilizce ve Duruş'ta bulundu, Kasım 2026) |
| İçe aktarma (yedek, JSON yapıştırma) güven sınırıdır: şema, tür, aralık ve kimlik denetimi; etkin HTML (`on…=`, `<script`, `javascript:`) içeren yedek reddedilir | Başkasından gelen dosya o kişinin içeriğini çalıştırmasın |
| Adresin `#`/`?` kısmıyla gelen veri tarayıcı kaydına sorgusuz yazılmaz; yalnız bilinen kaynaktan (`document.referrer`) gelindiyse, yoksa uyarıyla sorulur | Hazırlanmış bağlantı ziyaretçinin kaydını değiştiremesin |
| CSV dışa aktarımında `=`, `+`, `-`, `@`, sekme, satır başıyla başlayan metne `'` eklenir; sayılar (`-5`, `1.250,75`) olduğu gibi kalır | Excel'de formül enjeksiyonu (CSV injection) |
| `target="_blank"` bağlantılarda `rel="noopener"` | Sekme ele geçirme |
| Dosya yükleme: boyut sınırı dosya okunmadan önce; zip/Office/PDF'te açılmış boyut ve parça sayısı **açılırken sayılarak** sınırlanır (beyana güvenilmez) | Zip bombası, sekmenin kilitlenmesi |
| Tarayıcıda zip/deflate açarken çıktı akışla okunur ve sınır aşılınca durur (`DecompressionStream(...).arrayBuffer()` yok) | Bildirilen boyut sahte olabilir: 200 KB'lık dosya 200 MB'a açılır |
| `postMessage` hedefi `*` değil; `message` dinleyicisi `event.origin`/`source` denetler | Başka sitenin mesajı |
| Ziyaretçi demosu: her ziyaretçiye ayrı alan (çerez kimliği), günlük ve IP başına sınır, gece temizliği; ortak tablolar salt okunur | Ziyaretçiler birbirinin verisini görmez, depolama dolmaz |
| Kişisel veri ve gizlilik sayfası: ne toplanır, nerede durur, ne zaman silinir | KVKK |

## 3. Sunucu uygulaması (Node, VPS)

| Önlem | Neden |
| --- | --- |
| Oturum çerezi `HttpOnly; Secure; SameSite=Lax/Strict; Path`, süreli | Çerez çalınması, CSRF |
| Durum değiştiren her istekte `Origin` denetimi (yoksa `Sec-Fetch-Site`) | CSRF |
| İstek gövdesi sınırı (413), giriş denemesi ve API hız sınırı (429), hesap kilidi | Kaba kuvvet, kaynak tüketimi |
| İstemci IP'si yalnız güvenilen vekilden: `X-Forwarded-For` yalnız özel ağdan, `CF-Connecting-IP` yalnız Cloudflare aralıklarından | Sahte başlıkla sınırları atlatma |
| SQL yalnız parametreli; dosya yolu kullanıcıdan gelirse normalize edilip kök klasörde mi diye bakılır | Enjeksiyon, dizin gezme |
| Beklenmeyen hatada kullanıcıya genel ileti, ayrıntı yalnız sunucu kaydında | Bilgi sızıntısı |
| Kimlik sağlayıcıdan dönen `error_description` gibi adres metinleri sayfaya yazılmaz; sabit ileti ve biçimi denetlenmiş kod gösterilir | Uygulamanın adresinde sahte uyarı (içerik sahteciliği) |
| Herkesçe bilinen başlangıç parolası yalnız demoda; şirket kurulumunda ilk yönetici parolası gizli değerden (ör. `wrangler secret put`), tanımsızsa uygulama açılmaz | Varsayılan parolayla ilk giren yönetimi ele geçirir |
| Her HTML yanıtında CSP ve güvenlik başlıkları; API yanıtlarında `Cache-Control: no-store` | Tarayıcı korumaları |
| OAuth/MCP: PKCE zorunlu, kodlar tek kullanımlık, anahtarlar özetle saklanır, yenilemede eski anahtar kapanır, kaldırılan bağlantı hemen geçersiz; istemci kaydı sınırı kalıcı doldurulamaz | Anahtar çalınması, kötüye kullanım |
| Yapay zekâ çağıran uygulama: ziyaretçi, site ve kanal başına günlük sınır; harcama tavanı (Anthropic konsolu) | Maliyet saldırısı |
| Yazma işlemleri denetim kaydına (kim, ne, ne zaman); argümanlarda kişisel veri tutulmaz | İz sürme, KVKK |

## 4. Konteyner ve VPS

| Önlem | Neden |
| --- | --- |
| Dockerfile: sabit sürümlü taban imaj, çok aşamalı derleme, `npm ci --omit=dev`, `USER node` (root değil), `HEALTHCHECK` | Saldırı yüzeyi küçük |
| Compose: `name:` açık (aynı klasördeki başka uygulamayla çakışmasın), `read_only: true` + `tmpfs: /tmp`, `cap_drop: [ALL]`, `security_opt: [no-new-privileges:true]`, `mem_limit`, `pids_limit`, kayıt boyutu sınırı | Bir konteynerdeki sorun ötekileri ve sunucuyu etkilemez |
| Uygulama portu dışarı açılmaz; yalnız Caddy 80/443 dinler, uygulamalar `web` ağında | Doğrudan erişim yok |
| Caddy: otomatik HTTPS (DNS doğrulaması), HSTS, `-Server`, Cloudflare `trusted_proxies`, istemci IP başlıklarını kendisi yazar | |
| 80/443 yalnız Cloudflare'den (`sunucu/cloudflare-kaynak.sh`, Docker'ın `DOCKER-USER` zinciri; ufw Docker portlarını süzmez) | Cloudflare'i atlayan doğrudan saldırı |
| Sunucu: yalnız anahtarla SSH, root girişi kapalı, ufw, fail2ban, otomatik güvenlik güncellemeleri, swap, Docker kayıt sınırı | Temel sertleştirme (`sunucu/ilk-kurulum.sh`) |
| Gece yedeği: veritabanı ve SQLite yedekleri R2'ye, bütünlük ve boyut denetimiyle; 7 gün sunucu, 30 gün R2. R2'ye **şifreli** gider (rclone crypt, `yedek-sifrele.sh`), sunucuda yalnız root okur (`umask 077`); şifreler parola yöneticisinde | Veri kaybı; R2 anahtarı sızsa da dökümdeki kişisel veri ve parola özetleri okunamaz |
| Kesinti izleme (10 dakikada bir) ve haftalık güvenlik taraması | Sorun fark edilmeden kalmaz |

## 5. Masaüstü (Electron, Windows)

| Önlem | Neden |
| --- | --- |
| `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`; yalnız uygulamanın kendi adresi açılır, dış bağlantılar varsayılan tarayıcıda | Uzaktan kod çalıştırma |
| `session.setPermissionRequestHandler` ve `setPermissionCheckHandler`: yalnız gereken izinler (ör. pano, tam ekran), yalnız uygulamanın kendi adresine | Electron varsayılanı her izni (bildirim, konum, mikrofon) sorgusuz verir |
| Paketteki kitaplıklar (SQLite vb.) yayından önce sürüm kapısıyla denetlenir | Açıklı sürüm yayımlanmaz |
| Güncelleme yalnız bildirim; uygulama kendini değiştirmez | Tedarik zinciri |

## Yeni projede sıra

1. Depoyu bu listeyle aç: lisans, dependabot, `.gitignore`, iş akışı izinleri, CSP ve başlıklar.
2. Sunucu gerekiyorsa (kalıcı veri, giriş, sürekli çalışma) bunu baştan söyle; 3. ve 4. bölümü uygula, `sunucu/kurulum-<proje>.sh` ve Caddy bloğunu ekle.
3. İlk gönderimden önce `python3 araclar/guvenlik/tara.py ../<proje>` temiz çıkmalı; depo adını `araclar/guvenlik/depolar.txt`'ye ekle.
   Tarayıcıda kayıt tutan ve yedek içe aktaran projede ayrıca: `python3 araclar/guvenlik/zehir_gezgin.py ../<proje> index.html oznitelik` ve `… metin` → "tetiklenen yok" çıkmalı. Araç uygulamayı gezer, tarayıcı kaydındaki her metni betikli değerle değiştirir (kötü niyetli yedek gibi) ve yeniden gezer.
