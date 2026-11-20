---
layout: ../../../layouts/Guide.astro
title: "Zaman etüdü nasıl yapılır? Standart süre hesaplama (örnekli)"
description: "Zaman etüdü adım adım: işi adımlara bölme, gözlem sayısını t dağılımıyla belirleme, tempo ve toleransla normal ve standart süreyi hesaplama. Örnek hesaplı."
updated: "2026-11-16"
image: "/img/video-zaman-etudu/og.jpg"
tool:
  name: "Video İş Etüdü"
  cta: "Bu yazıdaki hesapları videodan, kurulumsuz yapın. Video cihazınızdan çıkmaz."
  url: "https://zaman-etudu.ysfdurak.com/"
  project: "/tr/projeler/video-zaman-etudu/"
  shot: "/img/video-zaman-etudu/olcum.webp"
---

**Kısa cevap:** İşi başlangıç ve bitiş noktası belli adımlara bölün. Her adımı yeterli sayıda gözlemleyin ve ortalama süreyi bulun. Ortalamayı tempo puanıyla çarparak **normal süreyi**, normal süreye tolerans ekleyerek **standart süreyi** hesaplayın. Kaç gözlemin yeterli olduğunu tahminle değil, t dağılımıyla belirleyin.

<figure class="rehber-gorsel rehber-foto">
  <img src="/img/rehber/zaman-etudu/kronometre.webp" width="1200" height="900" alt="Siyah zemin üzerinde mekanik bir kronometre" loading="lazy" decoding="async" />
  <figcaption>Kronometreyle kaçan an geri gelmez; videoyla ölçüm adım sınırlarını kare kare bulmayı sağlar.</figcaption>
</figure>


Aşağıda her adımı, bir depo işi üzerinden gerçek sayılarla anlatıyorum.

## Zaman etüdü ne işe yarar?

Zaman etüdü, eğitimli bir çalışanın bir işi normal temposunda, kabul edilen yöntemle ne kadar sürede yaptığını ölçer. Çıkan **standart süre** şunların temelidir:

- Kapasite: "Bir kişi saatte kaç koli hazırlar?"
- Personel planı: "Bu hacim için kaç kişi gerekir?"
- Hat dengeleme: "İstasyonlar arasında iş eşit dağılmış mı?"
- İyileştirme: "Yeni yöntem süreyi gerçekten kısalttı mı?"

## 1. İşi adımlara bölün

Ölçmeden önce işi, her birinin **net bir başlangıç ve bitiş anı** olan adımlara ayırın. Örnek, koli hazırlama istasyonu:

| Adım | Başlangıç anı | Bitiş anı |
| --- | --- | --- |
| Koli kurma | Kartonu eline aldığı an | Kartonu masaya bıraktığı an |
| Ürün yerleştirme | İlk ürüne uzandığı an | Son ürünü koliye koyduğu an |
| Koli bantlama | Bandı eline aldığı an | Bandı kestiği an |
| Etiketleme | Etikete uzandığı an | Koliyi bantlı alana ittiği an |

Sınırlar net değilse iki ölçüm aynı adımı farklı yerden başlatır ve sonuçlar karşılaştırılamaz. Bekleme, arıza veya başka bir işe geçiş gibi anları ayrı işaretleyin ve hesaba katmayın.

## 2. Gözlem yapın ve ortalamayı bulun

Her adımı birçok çevrim boyunca ölçün. Örnekte "Koli bantlama" adımı için 10 gözlem yapıldı (saniye):

`12,4 · 11,8 · 13,1 · 12,0 · 12,7 · 11,5 · 12,9 · 13,4 · 12,2 · 11,9`

- Ortalama: **12,39 sn**
- Standart sapma: **0,62 sn**

## 3. Gözlem sayısı yeterli mi? (t dağılımıyla)

"10 gözlem yeter" gibi sabit kurallar işin değişkenliğini hesaba katmaz. Değişken bir işte 10 gözlem az, çok düzenli bir işte fazla olabilir. Doğru soru şudur: **Bu gözlemlerle bulduğum ortalama, gerçek ortalamadan en fazla yüzde kaç sapabilir?**

Bağıl hata şöyle hesaplanır:

> Bağıl hata (%) = t × s ÷ (√n × ortalama) × 100

Burada `t`, seçilen güven düzeyi ve `n − 1` serbestlik derecesi için Student-t değeridir. `s` standart sapma, `n` gözlem sayısıdır.

Örnekte %95 güven ve 9 serbestlik derecesi için t ≈ 2,262:

> 2,262 × 0,62 ÷ (√10 × 12,39) × 100 ≈ **%3,6**

Hedef hata ±%5 ise 10 gözlem **yeterli**. Hedef ±%2 olsaydı yaklaşık **27 gözlem** gerekirdi.

Değişken bir işte tablo bambaşka olur. Aynı adımın yalnızca 4 gözlemle ölçüldüğünü ve sürelerin 12,4, 15,8, 10,1 ve 13,0 saniye olduğunu düşünün. Bağıl hata **%29**'a çıkar. ±%5 hedefi için yaklaşık **54 gözlem** gerekir. Önce sürelerin neden bu kadar dağıldığını (yöntem farkı, malzeme sorunu, kesintiler) anlamak, sonra ölçmeye devam etmek gerekir.

## 4. Tempo puanı ile normal süre

Gözlemlenen kişi her zaman "normal" tempoda çalışmaz. Gözlemci, kişinin hızını normal tempoya göre puanlar. %100 normal tempo demektir, %110 normalden %10 hızlı demektir.

> Normal süre = Ortalama süre × Tempo puanı ÷ 100

Örnekte çalışanın temposu %105 puanlandı:

> 12,39 × 1,05 ≈ **13,01 sn**

Tempo puanı öznel bir değerlendirmedir. Aynı işi iki gözlemcinin bağımsız puanlaması ve farkları konuşması, hatayı belirgin biçimde azaltır.

## 5. Tolerans ile standart süre

Kimse 8 saat boyunca kesintisiz çalışamaz. Kişisel ihtiyaçlar, yorgunluk ve kaçınılmaz küçük gecikmeler için süreye tolerans eklenir. Örnekte tolerans **%12** (kişisel ihtiyaç %5, yorgunluk %4, kaçınılmaz gecikme %3).

> Standart süre = Normal süre ÷ (1 − Tolerans)

> 13,01 ÷ (1 − 0,12) ≈ **14,78 sn**

Bazı kaynaklar toleransı `Normal × (1 + Tolerans)` biçiminde ekler. Bu yöntem aynı oranla biraz daha kısa süre verir (örnekte 14,57 sn). İkisi de kullanılır. Önemli olan, şirket içinde tek bir yöntemde anlaşıp hep onu kullanmaktır.

## 6. Sonucu kullanın

| | Değer |
| --- | --- |
| Ortalama gözlem süresi | 12,39 sn |
| Normal süre (tempo %105) | 13,01 sn |
| Standart süre (tolerans %12) | 14,78 sn |
| Saatlik kapasite (3.600 ÷ 14,78) | yaklaşık 243 koli |

Bu yalnızca bantlama adımıdır. İstasyonun toplam standart süresi, adımların standart sürelerinin toplamıdır. Takt süresiyle (müsait çalışma süresi ÷ talep) karşılaştırarak kaç kişiye ihtiyaç olduğunu bulabilirsiniz.

<figure class="rehber-gorsel">
  <a href="/img/rehber/zaman-etudu/standart-sure.svg" title="Büyük boyutta aç"><img src="/img/rehber/zaman-etudu/standart-sure.svg" width="680" height="380" alt="On gözlemin ortalaması 12,39 saniye. Yüzde 105 tempo ile normal süre 13,01, yüzde 12 tolerans ile standart süre 14,78 saniye. Saatlik kapasite yaklaşık 243 koli." loading="lazy" /></a>
  <figcaption>Noktalar on gözlemi gösteriyor. Tempo ve tolerans ortalamayı standart süreye, standart süre kapasiteye dönüşüyor.</figcaption>
</figure>

## Sık yapılan hatalar

- **Beklemeleri ortalamaya katmak.** Forklift beklemesi bir iş adımı değildir. Ayrı kaydedin ve kendi sorunu olarak ele alın.
- **Aykırı değerleri sessizce silmek.** Uzun bir gözlemin nedeni gerçek bir sorun olabilir. Silmek yerine nedenini not edip hesap dışı bırakın.
- **Gözlem sayısını tahminle belirlemek.** Değişkenliği yüksek bir işte az gözlem, ortalamayı yanıltıcı yapar.
- **Kronometreyle ölçüp anı kaçırmak.** Kaçan bir an geri gelmez. Videoyla ölçüm, adım sınırını kare kare bulup tekrar izlemeye izin verir.
- **Sonucu tek kişiden genellemek.** Mümkünse farklı kişileri ve vardiyaları gözlemleyin.

## Videodan zaman etüdü

Kronometreyle yapılan etütte gözlemci aynı anda izler, ölçer ve not alır. Videoyla yapılan etütte ise işi bir kez kaydedip istediğiniz kadar izleyebilirsiniz:

- Duraklatma ve yavaş oynatma süreyi bozmaz.
- Adım sınırlarını kare kare bulursunuz.
- Paralel işleri ve beklemeleri ayırabilirsiniz.
- Sonucu, videoyla birlikte ekibe gösterebilirsiniz.

Yukarıdaki hesapların hepsini (gözlem yeterliliği, tempo, tolerans, standart süre, Excel çıktısı) [Video İş Etüdü](https://zaman-etudu.ysfdurak.com/) ile tarayıcıda yapabilirsiniz. Uygulama ücretsiz, kurulum ve hesap gerektirmiyor; video bilgisayarınızdan çıkmıyor.
