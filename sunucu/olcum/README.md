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
| Ölçüm kapalıyken (DNT, GPC, `?olcum=kapat`) tarayıcıya kimlik yazılmaz; kapatınca var olan kimlik silinir. Geri bildirim kimliksiz gider, her kayıt tek kullanımlık takma ad alır ve huniye girmez | Kapalı demek gerçekten kapalı: tarayıcıda izlenebilir bir iz kalmaz (denetim D09) |
| IP adresi saklanmaz | Yalnızca hız sınırları için bellekte sayılır (olay: 1 dk, geri bildirim: 10 dk, hatalı giriş: 15 dk) |
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
Testler gerçek PostgreSQL yerine aynı SQL'i çalıştıran PGlite kullanır: köken ve proje denetimi, ham kimliğin saklanmaması, geri bildirim doğrulaması, şifreli yönetim, hatalı giriş sınırı, CSRF (Origin'siz, `Origin: null`, çapraz site) ve dış yönlendirme koruması, özet hesapları, saklama süresi, olay ve geri bildirim hız sınırları.

## Güvenlik

| Tehdit | Önlem |
|---|---|
| Sahte IP ile hız sınırını atlatma | Caddy (`import uygulama`) `CF-Connecting-IP`'ye yalnızca Cloudflare'den gelen istekte güvenir, servise her zaman doğrulanmış IP'yi iletir |
| Olay seli | IP başına dakikada 120 istek, istekte en çok 50 olay, gövde en çok 16 KB |
| Geri bildirim spam'i | IP başına 10 dakikada 10 geri bildirim (olay sınırından ayrı) |
| Yönetim şifresine deneme-yanılma | IP başına 15 dakikada 10 hatalı giriş; sonra o IP 15 dakika bekler (doğru şifre de) |
| Başka siteden form gönderimi (CSRF) | Basic Auth bilgisi başka siteden gelen isteğe de eklendiği için durum kaydı yalnızca Origin'i bizim adresimiz olan, `Sec-Fetch-Site` başka site demeyen istekte kabul edilir. Yönetim sayfası `Referrer-Policy: same-origin` gönderir; `no-referrer` olsa tarayıcı kendi formumuzda `Origin: null` yollardı |
| Yönetim sayfasında betik (XSS) | Tüm metin kaçışlanır; CSP `default-src 'none'` betiği tamamen kapatır; çerçeveye alınamaz |
| Dış adrese yönlendirme | Kayıttan sonra yalnızca `/yonetim` altına dönülür |
| SQL enjeksiyonu | Tüm sorgular parametreli |

## Mülakatta sorulabilecekler

- **Neden Google Analytics değil?** Çerez onayı ve veri paylaşımı gerektirir; ayrıca uygulama içi olayları (ör. "öneri gönderdi") ve geri bildirimi aynı yerde tutmak istedim.
- **Aynı kişiyi nasıl tanıyorsun, bu kişisel veri değil mi?** Tarayıcı rastgele bir kimlik üretir, sunucu bunu gizli bir anahtarla karıştırır. Kimlik kişiyle eşleştirilemez; yine de takma ad olduğu için gizlilik sayfasında açıklanır ve 180 günde silinir.
- **Süreyi nasıl ölçüyorsun?** Sekme açık kalınca süre şişer; bu yüzden yalnızca sekme görünürken ve son 60 saniyede etkileşim varken sayıyorum.
- **Yönetim sayfasını nasıl korudun?** HTTPS üzerinde Basic Auth, hatalı girişe IP başına sınır, CSRF denetimi ve betiği tamamen kapatan CSP. İlk sürümde `Referrer-Policy: no-referrer` yüzünden tarayıcı kendi formumda `Origin: null` gönderiyordu ve kayıt çalışmıyordu; tarayıcıyla uçtan uca denerken bulundu, `same-origin` ile düzeldi.
- **Biri sahte olay gönderirse?** Köken ve proje-adres eşleşmesi, IP başına hız sınırı ve istek boyutu sınırı var. Tarayıcıdan gelen veri her zaman taklit edilebileceği için bu sayılar "kanıt" değil "eğilim" olarak okunmalı.
- **Neden vitrin demolarında açık, şirket kurulumunda kapalı?** Amaç ürünü geliştirmek; çalışanları izlemek değil.

## Bağlı projeler (23 Kasım 2026)

| Proje | Adres | Nasıl bağlı |
| --- | --- | --- |
| İvme / İvme EN | ivme.ysfdurak.com, ivme-en.ysfdurak.com | `app/olcum.ts`; yalnız `IVME_VITRIN=1` iken, CSP de yalnız o zaman açılır |
| Diyalog Atölyesi | diyalog.ysfdurak.com | `web/olcum.js` yükleyicisi, yalnız bu adreste |
| Video İş Etüdü (tarayıcı) | zaman-etudu.ysfdurak.com | `Web/js/olcum.js`, yalnız bu adreste |
| Kıvılcım | ysfdurak.github.io/kivilcim-zihin-oyunlari | `olcum.js`; `navigate()` geçişleri ekran olarak bildirilir |
| Aday Atölyesi | aday.ysfdurak.com | `web/olcum.js`, yalnız bu adreste; ekran = `#` sonrasının ilk parçası; düğme yerine menüde ve altbilgide "Geri bildirim ver" bağlantısı |
| Destek Merkezi (demo) | destek.ysfdurak.com | Sunucu `public/olcum.js`'i yalnız `DEMO_MODE` iken sayfaya ekler ve CSP'yi o zaman açar; ekran = uygulamanın `page` değeri |

Bilerek bağlanmayanlar: **Sırdaş** ve **Duruş** "veri cihazından çıkmaz" sözü verir; dış adrese bağlantı bu sözü zayıflatır. **İngilizce Atölyesi**'nin kendi izinli ölçümü var. Kesit uygulamaları "dış bağımlılık yok" ilkesiyle yayımlanıyor; eklenmesi ayrı karar.

Yeni bir proje bağlamak: `projeler.json`'a ad ve adres ekle; projede yalnız resmî adreste çalışan küçük bir yükleyici koy (`location.hostname` denetimi), CSP'de `script-src` ve `connect-src`'ye `https://olcum.ysfdurak.com` ekle. Betik stillerini `adoptedStyleSheets` ile verdiği için `style-src 'unsafe-inline'` gerekmez.

## Geri bildirim penceresi erişilebilirliği (olcum.js 2, 23 Kasım 2026)

- Puan tek seçimli **radyo grubu**dur (`role=radiogroup`, her yıldız `role=radio` + `aria-checked`); ekran okuyucu "3 yıldız (3/5), seçili" der. Ok tuşları, Home/End ile değişir; sekme tuşuyla grupta tek durak vardır.
- Seçim yalnız renkle gösterilmez: dolu ★ / boş ☆ biçimi ve yanında "3/5" yazısı. Renklerin zemine kontrastı en az 3:1 (açık temada seçili 5,9:1, boş 4,8:1; koyu temada 9,4:1 ve 5,4:1). Önceki gri/altın renkler beyaz zeminde 1,6:1 ve 2,2:1 idi (denetim D08).
