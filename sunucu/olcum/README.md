# Ortak ölçüm ve geri bildirim (olcum.ysfdurak.com)

Tüm uygulamalar için tek bir servis: kaç kişinin denediği, hangi ekranlarda ne kadar vakit geçirildiği, hangi işlemlerin yapıldığı, nereden gelindiği ve kullanıcıların geri bildirimleri. Pusula'daki ölçüm yapısının (pusula-is-takip → `server/analytics.js`) bütün projeler için ortak hâlidir.

## Nasıl çalışır?

```
Uygulama (ivme.ysfdurak.com, durus…)                 Sunucu (VPS)
 ┌──────────────────────────────┐   POST /v1/olay    ┌───────────┐   ┌──────────────┐
 │ olcum.js                     │ ─────────────────▶ │ Caddy     │──▶│ olcum (Node) │──▶ PostgreSQL "olcum"
 │  · ekran("new"), olay("x")   │   POST /v1/geri-   │ (HTTPS)   │   │  depo.js     │     (gece R2 yedeği)
 │  · aktif süre sayacı          │   bildirim         └───────────┘   │  yonetim.js  │
 │  · "Geri bildirim" penceresi  │                                    └──────────────┘
 └──────────────────────────────┘                     https://olcum.ysfdurak.com/yonetim (şifreli)
```

1. **Tarayıcı tarafı (`public/olcum.js`):** Uygulama tek bir `<script>` ile yükler ya da (React gibi) kendisi ekler. Kod olayları biriktirir, 20 saniyede bir ve sekme kapanırken toplu gönderir.
2. **Olay türleri:**
   - `oturum:basla`: yeni oturum, kişinin geldiği site (ör. linkedin.com) bu olayla gelir.
   - `ekran`: bir ekran açıldı (görüntülenme sayısı).
   - `sure`: o ekranda geçen **aktif** süre (sekme görünür ve kişi son 60 sn içinde dokunmuş/yazmış/kaydırmış).
   - Diğer her şey işlemdir (`islem:create`, `analiz_basladi`…). Yalnızca **adı** gelir, içerik gelmez.
3. **Sunucu (`src/uygulama.js`):** Köken (Origin) izinli mi, proje `projeler.json`'da var mı ve olay kendi adresinden mi geliyor diye bakar; IP başına dakikada 120 istekle sınırlar; sonra `depo.js` ile yazar.
4. **Yönetim (`/yonetim`):** Tüm projelerin özeti; proje sayfasında günlük ziyaretçi, huni, ekran süreleri, işlemler, kaynak/cihaz/dil ve geri bildirimler. Geri bildirime durum ("Uygulandı") ve "ne yaptım" notu girilir: sitedeki "geri bildirimden değişikliğe" bölümünün kaynağı budur.

## Gizlilik kararları (neden böyle?)

| Karar | Neden |
|---|---|
| Google Analytics yok, kendi servisimiz | Üçüncü taraf çerez ve çerez onayı gerekmez, veri başka şirkete gitmez |
| Çerez yok; tarayıcıda rastgele kimlik, sunucuda bir kez daha karıştırılır (HMAC) | Aynı kişinin geri dönüşü sayılır ama veritabanından kim olduğu çıkarılamaz |
| IP adresi saklanmaz | Yalnızca hız sınırı için bellekte, bir dakika boyunca sayılır |
| İçerik yok | "Öneri gönderdi" yazılır, önerinin metni yazılmaz. Duruş ve Zaman Etüdü'nde video hiçbir zaman gönderilmez |
| Do Not Track / Global Privacy Control açıksa ölçüm yok | Kişinin tarayıcıdaki tercihine uyulur; geri bildirim yine çalışır |
| Geri bildirimde e-posta yalnızca "bana dönebilirsiniz" işaretlenirse | Varsayılan anonimdir |
| 180 gün sonra silinir (`SAKLAMA_GUN`) | Veri süresiz tutulmaz |
| Yalnızca vitrin demolarında açık | Şirket kurulumlarında servis hiç yüklenmez, çalışan takibi yapılmaz |

**Kendi denemelerin sayılmasın:** uygulama adresinin sonuna `?olcum=kapat` ekleyip bir kez aç. O tarayıcıda ölçüm kapanır; `?olcum=ac` geri açar.

## Yeni bir projeyi bağlamak

1. `projeler.json` dosyasına bir kayıt ekle: `ad`, `adres` (uygulamanın kökeni), isteğe bağlı `huni`, `ekranlar`, `olaylar`.
2. Uygulamaya ekle:
   ```html
   <script src="https://olcum.ysfdurak.com/olcum.js" data-proje="durus" data-ekran="otomatik" defer></script>
   ```
   - `data-ekran="otomatik"`: adres ya da `#` değiştikçe ekran kendiliğinden sayılır. Tek sayfalı uygulamada bunun yerine `olcum.ekran("ad")` çağrılır.
   - `data-dugme="yok"`: köşedeki "Geri bildirim" düğmesi çıkmaz; uygulama kendi menüsünden `olcum.geriBildirimAc()` çağırır.
   - `data-konum="sol"`: düğme sol altta durur.
   - Dil `<html lang>` ya da `data-dil` ile seçilir (tr/en).
3. Sunucuda `bash ~/ysfdurak.com/sunucu/kurulum-olcum.sh` (projeler.json değiştiği için yeniden derlenir).

## Kurulum

1. Cloudflare DNS: `olcum` için A kaydı, sunucu IP'si, proxy açık.
2. `ssh ysf` → `bash ~/ysfdurak.com/sunucu/kurulum-olcum.sh`. Betik veritabanını açar, yönetim şifresini üretip bir kez gösterir.

## Test

```bash
cd sunucu/olcum && npm install && npm test
```
Testler gerçek PostgreSQL yerine aynı SQL'i çalıştıran PGlite kullanır: köken ve proje denetimi, ham kimliğin saklanmaması, geri bildirim doğrulaması, şifreli yönetim, CSRF ve dış yönlendirme koruması, özet hesapları, saklama süresi, hız sınırı.

## Mülakatta sorulabilecekler

- **Neden Google Analytics değil?** Çerez onayı ve veri paylaşımı gerektirir; ayrıca uygulama içi olayları (ör. "öneri gönderdi") ve geri bildirimi aynı yerde tutmak istedim.
- **Aynı kişiyi nasıl tanıyorsun, bu kişisel veri değil mi?** Tarayıcı rastgele bir kimlik üretir, sunucu bunu gizli bir anahtarla karıştırır. Kimlik kişiyle eşleştirilemez; yine de takma ad olduğu için gizlilik sayfasında açıklanır ve 180 günde silinir.
- **Süreyi nasıl ölçüyorsun?** Sekme açık kalınca süre şişer; bu yüzden yalnızca sekme görünürken ve son 60 saniyede etkileşim varken sayıyorum.
- **Biri sahte olay gönderirse?** Köken ve proje-adres eşleşmesi, IP başına hız sınırı ve istek boyutu sınırı var. Tarayıcıdan gelen veri her zaman taklit edilebileceği için bu sayılar "kanıt" değil "eğilim" olarak okunmalı.
- **Neden vitrin demolarında açık, şirket kurulumunda kapalı?** Amaç ürünü geliştirmek; çalışanları izlemek değil.
