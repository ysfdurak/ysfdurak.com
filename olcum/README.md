# Ölçüm (olcum.ysfdurak.com)

Projelerin gerçekten kullanılıp kullanılmadığını ve kullanıcıların ne düşündüğünü görmek için küçük, gizlilik öncelikli bir sayaç ve geri bildirim servisi. Google Analytics gibi bir araç değil; bilerek az şey ölçer.

## Neyi ölçer, neyi ölçmez?

| Tutulan | Tutulmayan |
| --- | --- |
| Gün × proje × olay × sayfa yolu × dil için **sayı** (ör. "20 Kasım, ivme, gorunum, /, tr → 37") | IP adresi, çerez, tarayıcı/cihaz bilgisi, kullanıcı kimliği |
| Geri bildirim: 1-5 puan ve en fazla 500 karakter not (e-posta ve telefon otomatik maskelenir) | Ham olay kaydı (kim, ne zaman, hangi sırayla) |
| | Sorgu dizesi ve # sonrası; yoldaki kimlik gibi görünen parçalar `:id` olur |

- Tarayıcıda **Do Not Track** ya da **Global Privacy Control** açıksa istemci hiçbir şey göndermez.
- Tek ziyaretçi sayısı yoktur (bunun için kimlik gerekir). "Görüntülenme" ve "olay" sayılır.
- Hız sınırı için IP yalnızca bellekte, her gün değişen bir tuzla özetlenip bir dakika tutulur; diske yazılmaz.
- Saklama: geri bildirim 1 yıl, sayaçlar 2 yıl; sonra kendiliğinden silinir.
- Çerez ve kişisel veri olmadığı için çerez onay bandı gerekmez. Gizlilik sayfasında bir cümleyle belirtmek yeterli: "Kullanım sayıları anonim olarak, çerezsiz sayılır."

## Bir projeye bağlamak

```html
<script defer src="https://olcum.ysfdurak.com/o.js" data-proje="durus"></script>
```

- Sayfa açılınca bir `gorunum` sayılır. Tek sayfalık uygulamalarda ekran değişince `olcum("gorunum", "/raporlar")` çağrılır; otomatik saymayı kapatmak için etikete `data-elle` eklenir.
- Önemli bir iş bitti: `olcum("oneri_gonderildi")` (olay adı küçük harf, rakam, `_ . -`, en fazla 40 karakter).
- Geri bildirim: `olcum.geriBildirim(5, "Çok işime yaradı")` → `Promise<boolean>`.
- Sitenin CSP'sine eklenecekler: `script-src https://olcum.ysfdurak.com` ve `connect-src https://olcum.ysfdurak.com`. Betik yerine `fetch` ile doğrudan gönderilecekse yalnız `connect-src` yeter (İvme böyle yapar).
- Proje kısa adı `PROJELER` listesinde olmalı (varsayılan: ivme, durus, diyalog, zaman-etudu, kesit-sql, kesit-python, kesit-powerbi, kesit-istatistik, ingilizce, aday, kivilcim, pusula, destek, site).
- **Şirket kurulumları ölçülmez.** İvme, Pusula gibi şirkete kurulabilen projelerde ölçüm yalnızca vitrin/demo adresinde açıktır; kurum kendi sunucusuna kurduğunda dışarıya istek gitmez.

## API

| İstek | Gövde | Yanıt |
| --- | --- | --- |
| `POST /e` | `{"p":"ivme","e":"gorunum","s":"/yol","d":"tr"}` | 204 |
| `POST /g` | `{"p":"ivme","r":4,"t":"not","s":"/yol"}` | 204 |
| `GET /o.js` | | istemci betiği |
| `GET /panel?gun=30` | Basic auth (kullanıcı `panel`) | HTML panel |
| `GET /healthz` | | `ok` |

İstek yalnızca `https://*.ysfdurak.com` (ve `ysfdurak.github.io`) kökeninden kabul edilir; Origin başlığı olmayan (tarayıcı dışı) istek sayılmaz. Gövde sınırı olayda 1 KB, geri bildirimde 4 KB. Panelde 15 dakikada 10 hatalı şifre denemesi kilitler.

## Kurulum (sunucuda bir kez)

1. Cloudflare DNS: `olcum` için A kaydı, sunucu IP'si, proxy açık (turuncu bulut).
2. `ssh ysf` → `bash ~/ysfdurak.com/sunucu/kurulum-olcum.sh`
3. Betik panel şifresini **bir kez** gösterir; parola yöneticine kaydet. Panel: https://olcum.ysfdurak.com/panel

Güncelleme: aynı betiği yeniden çalıştır. Gece yedeği (`ysf-yedek`) ölçüm veritabanını da şifreli R2'ye gönderir.

## Güvenlik özeti

Bağımlılık yok (Node 24, yerleşik `node:sqlite`), konteyner: salt okunur kök, `cap_drop: ALL`, `no-new-privileges`, 128 MB bellek, 64 süreç, dışarıya port yok (yalnız Caddy `web` ağı). Panel sıkı CSP (`default-src 'none'`), çerçeveye konamaz, çıktılar HTML kaçışlı. SQL'ler hazır ifade (prepared statement).

## Test

```bash
cd olcum && node --test test.mjs
```
7 test: sayfa temizleme, köken/proje/olay adı reddi, büyük gövde, maskeleme ve kaçış, panel şifresi ve kilit, hız sınırı, veritabanında IP/tarayıcı sütunu olmaması, CORS.

## Neden böyle?

Bir öneri sisteminin ya da eğitim aracının değeri "kaç kişi açtı, kaç kişi işini bitirdi, ne dedi" sorularıyla görünür. Bunu ölçerken ziyaretçiyi izlemek gerekmez; sayılar yeter. Bu tasarım KVKK açısından kişisel veri işlemediği için aydınlatma ve onay yükü getirmez ve mülakatta "neden Google Analytics değil?" sorusuna cevap verir.
