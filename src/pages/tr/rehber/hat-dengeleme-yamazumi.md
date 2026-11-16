---
layout: ../../../layouts/Guide.astro
title: "Hat dengeleme nedir? Yamazumi grafiği ve denge verimi (örnekli)"
description: "Hat dengeleme adım adım: takt zamanı, en az istasyon sayısı, denge verimi ve Yamazumi grafiği. Darboğazı olan bir paketleme hattının yeniden dengelenmesi örneği."
updated: "2026-11-16"
image: "/img/video-zaman-etudu/og.jpg"
tool:
  name: "Video Zaman Etüdü"
  cta: "Adım sürelerini videodan ölçün, Yamazumi grafiğini görün ve işi takta göre otomatik dağıtın."
  url: "https://zaman-etudu.ysfdurak.com/"
  project: "/tr/projeler/video-zaman-etudu/"
  shot: "/img/video-zaman-etudu/analiz.webp"
---

**Kısa cevap:** Hat dengeleme, bir işin adımlarını istasyonlara ya da kişilere, her birinin yükü [takt zamanını](/tr/rehber/takt-zamani-nedir/) aşmayacak ve yükler birbirine olabildiğince yakın olacak şekilde dağıtmaktır. Hattın hızını en yüklü istasyon belirler. Yükü takttan fazla olan istasyon **darboğazdır**: talebe yetişilemez. Yükleri takttan çok düşük olan istasyonlarda ise bekleme oluşur.

## Temel hesaplar

> En az istasyon sayısı = ⌈ Toplam iş içeriği ÷ Takt ⌉

> Denge verimi = Toplam iş içeriği ÷ (İstasyon sayısı × En büyük yük)

Denge verimi %100 olduğunda bütün istasyonlar eşit yüklüdür. Verim düştükçe bekleme artar.

## Örnek: dört kişilik paketleme hattı

Takt zamanı 14 saniye. Adımların standart süreleri [zaman etüdüyle](/tr/rehber/zaman-etudu-nasil-yapilir/) ölçüldü:

| Sıra | Adım | Süre (sn) |
| --- | --- | --- |
| 1 | Koli kurma | 6 |
| 2 | Ürün toplama | 7 |
| 3 | Yerleştirme | 8 |
| 4 | Kontrol | 5 |
| 5 | Bantlama | 9 |
| 6 | Etiketleme | 5 |
| 7 | Paletleme | 8 |
| | **Toplam** | **48** |

> En az istasyon = ⌈ 48 ÷ 14 ⌉ = ⌈ 3,43 ⌉ = **4**

### Mevcut dağılım

| Kişi | Adımlar | Yük (sn) |
| --- | --- | --- |
| 1 | Koli kurma, ürün toplama | 13 |
| 2 | Yerleştirme, kontrol, bantlama | **22** |
| 3 | Etiketleme | 5 |
| 4 | Paletleme | 8 |

İkinci kişinin yükü 22 saniye, takt ise 14. Hat 22 saniyede bir koli çıkarabiliyor: **saatte yaklaşık 164 koli**. Talep ise saatte yaklaşık 257 koli. Üçüncü ve dördüncü kişi zamanlarının büyük kısmında bekliyor.

> Denge verimi = 48 ÷ (4 × 22) ≈ **%55**

## Yamazumi grafiği

Yamazumi (Japonca "üst üste yığmak"), her kişinin ya da istasyonun adımlarını üst üste dizilmiş bloklar olarak gösteren bir çubuk grafiktir. Grafiğe yatay bir **takt çizgisi** çizilir. Çizgiyi aşan sütun darboğazdır, çizginin çok altında kalan sütunlar ise boş kapasitedir. Grafik, tablodaki dengesizliği bir bakışta gösterir. Ekiple birlikte "hangi adımı kime verelim?" konuşmasını kolaylaştırır.

Adımlar katma değerli (VA), gerekli ama katma değersiz (SVA) ve israf (NVA) olarak renklendirilirse grafik iyileştirme fırsatlarını da gösterir.

## Yeniden dengeleme

Adım sırası korunarak her kişiye takt dolana kadar adım verilir:

| Kişi | Adımlar | Yük (sn) |
| --- | --- | --- |
| 1 | Koli kurma, ürün toplama | 13 |
| 2 | Yerleştirme, kontrol | 13 |
| 3 | Bantlama, etiketleme | 14 |
| 4 | Paletleme | 8 |

- En yüklü istasyon artık 14 saniye: hat taktı yakalıyor, **saatte yaklaşık 257 koli**.
- Denge verimi = 48 ÷ (4 × 14) ≈ **%86**.
- Dördüncü kişinin 6 saniyelik boş kapasitesi var. Bu süre malzeme besleme, boş palet getirme gibi işlerle doldurulabilir.

Kişi sayısı değişmeden çıktı yaklaşık **%57 arttı**.

<figure class="rehber-gorsel">
  <a href="/img/rehber/hat-dengeleme/yamazumi.svg" title="Büyük boyutta aç"><img src="/img/rehber/hat-dengeleme/yamazumi.svg" width="680" height="410" alt="Önce ikinci kişinin yükü 22 saniye, takt 14 saniye; hat darboğazda, denge verimi yüzde 55. Bantlama üçüncü kişiye geçince yükler 13, 13, 14 ve 8 saniye oluyor; hat takta yetişiyor, denge verimi yüzde 86." loading="lazy" /></a>
  <figcaption>Bantlama ikinci kişiden üçüncü kişiye geçince darboğaz kalkıyor: aynı dört kişiyle hat takta yetişiyor.</figcaption>
</figure>

## Dengeleme yetmediğinde

- **Takttan uzun bir adım varsa** hiçbir dağılım onu takta sığdıramaz. O adım ya iyileştirilmeli (yöntem, alet, yerleşim) ya da paralel iki istasyona bölünmeli.
- **Adımların sırası her zaman değiştirilemez.** Kontrol, bantlamadan önce yapılmak zorundadır. Dengeleme bu öncelik kısıtlarına uymalıdır.
- **Kişiler arası hız farkı** varsa standart süreler gerçeği yansıtmaz. Önce eğitim ve standart iş gelir.

## Sık yapılan hatalar

- **Süreleri tahminle dağıtmak.** Dengeleme ancak ölçülmüş sürelerle doğru yapılır.
- **Seyrek işleri unutmak.** Her 10 kolide bir yapılan palet değişimi, çevrim başına 1/10 oranında yüke eklenmelidir.
- **Yalnızca ortalama yüke bakmak.** Hattın hızını ortalama değil, en yüklü istasyon belirler.

## Yamazumi'yi uygulamada çizmek

[Video Zaman Etüdü](https://zaman-etudu.ysfdurak.com/) adım sürelerini videodan ölçer, seyrek işlerin çevrim başına katkısını hesaplar, Yamazumi grafiğini takt çizgisiyle çizer ve işi takta göre otomatik dağıtır. Denge verimini ve gereken en az kişi sayısını da gösterir. Bu yazıdaki örnek, uygulamanın dengeleme kurallarıyla hesaplandı.
