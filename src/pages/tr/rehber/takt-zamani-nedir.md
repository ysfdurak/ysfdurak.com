---
layout: ../../../layouts/Guide.astro
title: "Takt zamanı nedir, nasıl hesaplanır? Örnekli anlatım"
description: "Takt zamanı = kullanılabilir çalışma süresi ÷ müşteri talebi. Hesaplama, çevrim süresiyle farkı, gereken operatör sayısı ve depo örneği."
updated: "2026-11-16"
image: "/img/video-zaman-etudu/og.jpg"
tool:
  name: "Video İş Etüdü"
  cta: "Adım sürelerini videodan ölçün, takta göre doluluk ve gereken kişi sayısını hesaplayın."
  url: "https://zaman-etudu.ysfdurak.com/"
  project: "/tr/projeler/video-zaman-etudu/"
  shot: "/img/video-zaman-etudu/analiz.webp"
---

**Kısa cevap:** Takt zamanı, talebi karşılamak için **her kaç saniyede bir** bir birim çıkarmanız gerektiğini gösterir.

<figure class="rehber-gorsel rehber-foto">
  <img src="/img/rehber/takt-zamani/depo-koli-tasima.webp" width="1200" height="800" alt="Depoda raflar arasında koli taşıyan iki çalışan" loading="lazy" decoding="async" />
  <figcaption>Takt, depodaki işin talebe göre hangi hızda akması gerektiğini söyler.</figcaption>
</figure>


> Takt zamanı = Kullanılabilir çalışma süresi ÷ Talep

Vardiyada 25.200 saniye çalışılabiliyor ve 1.800 koli çıkması gerekiyorsa takt **14 saniyedir**. İşi 14 saniyeden uzun süren bir istasyon talebe yetişemez.

## Kullanılabilir süre nasıl bulunur?

Vardiya süresinden planlı duruşlar düşülür: molalar, toplantılar, planlı temizlik ve bakım.

| | Süre |
| --- | --- |
| Vardiya | 8 saat = 28.800 sn |
| Yemek ve çay molaları | −45 dk = −2.700 sn |
| Vardiya başı toplantı ve 5S | −15 dk = −900 sn |
| **Kullanılabilir süre** | **25.200 sn** |

Talep 1.800 koli ise:

> 25.200 ÷ 1.800 = **14 sn / koli**

Arızalar ve beklemeler kullanılabilir süreden **düşülmez**. Onlar kayıptır ve takt hesabında saklanmamalıdır.

<figure class="rehber-gorsel">
  <a href="/img/rehber/takt-zamani/takt-hesabi.svg" title="Büyük boyutta aç"><img src="/img/rehber/takt-zamani/takt-hesabi.svg" width="680" height="400" alt="28.800 saniyelik vardiyadan molalar ve toplantı düşülünce 25.200 saniye kalır; 1.800 koli için takt 14 saniyedir. 50 saniyelik iş içeriği 14 saniyelik dilimlere bölününce 3,6 kişi eder, yani 4 kişi gerekir." loading="lazy" /></a>
  <figcaption>Takt, kullanılabilir süreden çıkar; gereken kişi sayısı, iş içeriğinin takt dilimlerine bölünmesiyle bulunur.</figcaption>
</figure>

## Takt zamanı ile çevrim süresinin farkı

| | Takt zamanı | Çevrim süresi |
| --- | --- | --- |
| Neyi gösterir? | Talebin istediği hız | Sürecin gerçek hızı |
| Nereden gelir? | Talep ve kullanılabilir süre | Ölçüm (zaman etüdü) |
| Kim değiştirir? | Müşteri ve plan | Yöntem ve iyileştirme |

- Çevrim süresi **taktın üstündeyse** talebe yetişemezsiniz: fazla mesai veya birikmiş iş oluşur.
- Çevrim süresi **taktın çok altındaysa** kapasite fazlası vardır: bekleme veya gereğinden fazla üretim (bir israf türü) ortaya çıkar.
- Hedef, çevrim süresini takta yakın ve dengeli tutmaktır.

## Kaç kişi gerekir?

Bir koli için tüm adımların toplam standart süresi 50 saniye olsun (koli kurma, yerleştirme, bantlama, etiketleme).

> Gereken kişi = Toplam iş içeriği ÷ Takt = 50 ÷ 14 ≈ **3,6 → 4 kişi**

3,6 sonucu, dört kişiden birinin tam dolu çalışmayacağını gösterir. İşi yeniden dağıtarak üç kişiyle yapılabilir mi, yoksa dördüncü kişiye başka bir iş mi verilmeli, karar buradan çıkar. İşin istasyonlara takta göre dağıtılmasına **hat dengeleme** denir. Sık kullanılan bir görsel araç, her kişinin iş yükünü takt çizgisiyle karşılaştıran **Yamazumi** grafiğidir.

## Sık yapılan hatalar

- **Kapasiteyi takt sanmak.** Takt "ne kadar hızlı yapabiliyoruz?" değil, "ne kadar hızlı yapmamız gerekiyor?" sorusunun cevabıdır.
- **Talep değişse de taktı sabit tutmak.** Sezonluk ya da haftalık dalgalanan talepte takt da yeniden hesaplanmalıdır.
- **Toplam iş içeriğini tahminle almak.** Gereken kişi sayısı, ölçülmüş standart sürelere dayanmalıdır. Bunun için [zaman etüdü](/tr/rehber/zaman-etudu-nasil-yapilir/) yapılır.

## Takt hesabını ölçümle birleştirmek

[Video İş Etüdü](https://zaman-etudu.ysfdurak.com/) adım sürelerini videodan ölçer, standart süreyi hesaplar ve takt süresini girdiğinizde istasyonun doluluk oranını ve gereken operatör sayısını gösterir. Yamazumi grafiğiyle işi takta göre otomatik dağıtabilirsiniz. Uygulama ücretsizdir, kurulum gerektirmez.
