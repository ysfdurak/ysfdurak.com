# Kesinti izleme nasıl çalışıyor?

## Kısaca

GitHub her 10 dakikada bir `scripts/saglik-kontrolu.mjs` dosyasını çalıştırır. Betik sitedeki bütün canlı adresleri dışarıdan açmayı dener:

- Sitenin kendisi (TR, EN, site haritası)
- Sunucunun test adresi `app.ysfdurak.com`
- `projects.ts` içindeki her projenin `url` ve `urlEn` adresi
- Sunucuda çalışan projelerin `health` adresi (Pusula ve Destek Merkezi için `/healthz`)

Bir adres sorunluysa GitHub'da **"🔴 Kesinti: <proje>"** başlıklı, `kesinti` etiketli bir issue açılır. GitHub bunu sana e-postayla bildirir. Adres yeniden çalışınca issue'ya "Düzeldi, kesinti süresi ~X dakika" yorumu düşer ve kayıt kendiliğinden kapanır.

## Neden bu yöntem?

| Seçenek | Neden seçilmedi / seçildi |
| --- | --- |
| Sunucuya Uptime Kuma kurmak | Sunucu çökerse izleyen de çöker; tam da haber almak istediğin anda sessiz kalır |
| UptimeRobot vb. dış servis | Çalışır ama ayrı hesap, ayrı panel; ayarlar kodda durmaz |
| **GitHub Actions (seçilen)** | Sunucunun dışında çalışır, açık depoda ücretsiz, ayarlar kodda durur; yeni proje `projects.ts`'e eklenince kendiliğinden izlenir |

## Yanlış alarmı önleyen kurallar

- Bir adres **3 kez** (15 sn arayla) denenir; tek seferlik ağ dalgalanması alarm üretmez.
- 15 saniyede cevap vermeyen adres "sorunlu" sayılır. 5 saniyeden uzun süren cevap 🟡 "yavaş" olarak raporda görünür ama alarm üretmez.
- Bazı adreslerde sayfanın içinde belirli bir kelime aranır: sayfa açılıp boş ya da hata sayfası gelirse de yakalanır.

## Nereden bakarım?

- **Anlık durum:** GitHub → depo → **Actions** → "Sağlık kontrolü" → son çalıştırma. Özet sayfasında tüm adreslerin tablosu ve cevap süreleri var.
- **Geçmiş kesintiler:** **Issues** → `kesinti` etiketi (kapalılar dahil). Her kayıt başlangıç zamanını ve süreyi gösterir.
- **Elle çalıştırmak:** Actions → "Sağlık kontrolü" → **Run workflow**.

## Bilmen gerekenler

- **60 gün kuralı:** Depoda 60 gün hiç değişiklik olmazsa GitHub zamanlanmış işleri durdurur ve e-postayla haber verir. O e-posta gelirse Actions sekmesinden tek tıkla yeniden aç.
- **Zamanlama kayabilir:** GitHub yoğun saatlerde 10 dakikalık işi birkaç dakika geciktirebilir. Portföy için yeterli; saniyelik izleme gerekmez.
- **Cloudflare bot koruması:** Bir gün tüm adresler aynı anda `HTTP 403` verirse bu genelde kesinti değil, Cloudflare'in GitHub sunucularını bot sanmasıdır. Cloudflare → Security → WAF'ta `ysfdurak-saglik-kontrolu` kullanıcı ajanına izin kuralı eklenir.
- **E-posta gelmiyorsa:** GitHub → Settings → Notifications → "Issues" bildirimlerinin e-postaya açık olduğunu ve depoyu "Watch" ettiğini kontrol et.

## Kesinti olunca ilk bakılacaklar

```bash
ssh ysf
sudo docker ps                       # konteyner çalışıyor mu, "unhealthy" mi?
sudo docker logs --tail 50 pusula    # son hata satırları (pusula yerine ilgili konteyner)
cd ~/ysfdurak.com/sunucu/altyapi && sudo docker compose up -d   # altyapıyı yeniden kaldır
```

Cloudflare'de çalışan uygulamalar (Zaman Etüdü, Duruş, İvme, Aday, İngilizce Atölyesi) sunucuya bağlı değildir. Onlarda sorun varsa Cloudflare → Workers & Pages → ilgili proje → son dağıtımın durumuna bakılır.

## Mülakatta nasıl anlatırım?

"Sitedeki tüm uygulamaları sunucunun dışından, 10 dakikada bir izleyen bir kontrol kurdum. Kesinti olursa otomatik kayıt açılıyor, düzelince süresiyle kapanıyor. Böylece hangi uygulamanın ne kadar ayakta kaldığını da kayıt altında tutuyorum."
