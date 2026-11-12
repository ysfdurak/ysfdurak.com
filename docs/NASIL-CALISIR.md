# Site nasıl çalışıyor?

Bu doküman, siteyi kendi başına güncelleyebilmen ve "nasıl kurdun?" sorusuna cevap verebilmen için.

## Büyük resim

1. Kod GitHub'da durur (`ysfdurak/ysfdurak.com`).
2. `main` dalına bir değişiklik gönderilince Cloudflare bunu fark eder, `npm run build` çalıştırır.
3. Astro tüm sayfaları düz HTML dosyalarına çevirir ve `dist/` klasörüne yazar.
4. Cloudflare Workers bu klasörü dünyadaki sunucularından yayınlar (`wrangler.jsonc` bunu tarif eder).

Sunucu, veritabanı veya giriş yok. Bu yüzden ücretsiz, hızlı ve bakım gerektirmiyor. Google sayfaları düz HTML olarak okuduğu için SEO açısından da en iyi durum bu.

## Dosyalar

| Dosya / klasör | Ne işe yarar |
| --- | --- |
| `src/data/site.ts` | İsim, e-posta, GitHub/LinkedIn, ana başlık ve açıklama |
| `src/data/projects.ts` | **Tüm projeler.** Yeni proje = bu listeye bir kayıt. Sayfası otomatik oluşur. |
| `src/i18n/ui.ts` | Menü ve buton metinleri (TR/EN) |
| `src/layouts/Base.astro` | Her sayfanın ortak iskeleti; SEO etiketleri burada |
| `src/components/` | Sayfa şablonları (ana sayfa, proje sayfası, kart vb.) |
| `src/pages/` | Adresler. Dosya yolu = URL (ör. `pages/tr/hakkimda.astro` → `/tr/hakkimda/`) |
| `src/styles/global.css` | Renkler ve tasarım |
| `public/` | Olduğu gibi kopyalanan dosyalar: `robots.txt`, `_redirects`, favicon |

## Sık yapılacak işler

- **Proje eklemek:** `projects.ts` içine bir kayıt ekle (`slug`, `name`, `category`, `hosting`, TR ve EN metinleri). Canlı adresi olunca `url` alanını doldur; "Dene" butonu kendiliğinden açılır.
- **Vitrine almak:** Kayda `featured: true` ekle.
- **Metin değiştirmek:** İlgili dosyayı GitHub'da açıp kalem simgesiyle düzenleyebilirsin; kaydedince site birkaç dakikada güncellenir.

## SEO'da ne yapıldı

- Her sayfanın kendi `title`, `description` ve `canonical` etiketi var.
- TR ve EN sayfaları `hreflang` ile birbirine bağlı; Google doğru dili doğru kişiye gösterir.
- `sitemap-index.xml` her derlemede otomatik üretilir.
- Ana sayfada `Person`, proje sayfalarında `SoftwareApplication` yapılandırılmış verisi var.
- `robots.txt` siteyi açar, ileride gelecek `/app/` demo ekranlarını kapatır.

## Analitik

Cloudflare Web Analytics, Cloudflare panelinden açılır ve koda bir şey eklemeden çalışır (çerezsiz).
