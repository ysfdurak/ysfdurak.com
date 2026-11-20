---
layout: ../../../layouts/Guide.astro
title: "Standart iş kombinasyon tablosu nedir? İnsan ve makine işini birlikte planlamak"
description: "Standart iş kombinasyon tablosu: el işi, yürüme, makine işi ve beklemenin zaman çizelgesinde gösterilmesi. Streç sarma örneğiyle 95 saniyelik çevrimin 60 saniyeye inmesi."
updated: "2026-11-16"
image: "/img/video-zaman-etudu/og.jpg"
tool:
  name: "Video İş Etüdü"
  cta: "Adımları el işi, yürüme, makine ve bekleme olarak işaretleyin; kombinasyon tablosu otomatik çizilsin."
  url: "https://zaman-etudu.ysfdurak.com/"
  project: "/tr/projeler/video-zaman-etudu/"
  shot: "/img/video-zaman-etudu/analiz.webp"
---

**Kısa cevap:** Standart iş kombinasyon tablosu, bir çevrimdeki **insan işini ve makine işini aynı zaman çizelgesinde** gösterir. Her adım türüne göre çizilir: el işi, yürüme, makine işi ve bekleme. Makine çalışırken operatör başka bir iş yapabiliyorsa bu tabloda hemen görülür. Amaç, operatörün makineyi izleyerek beklediği süreyi ortadan kaldırmak ve çevrimi [takt zamanına](/tr/rehber/takt-zamani-nedir/) sığdırmaktır.

<figure class="rehber-gorsel rehber-foto">
  <img src="/img/rehber/standart-is/strecli-paletler.webp" width="1200" height="800" alt="Depoda streç filmle sarılmış paletler ve raflar" loading="lazy" decoding="async" />
  <figcaption>Streç sarma gibi makine işlerinde operatörün beklediği süre kombinasyon tablosunda görünür olur.</figcaption>
</figure>


## Tablo nasıl okunur?

| Çizgi türü | Anlamı |
| --- | --- |
| Düz çizgi | Operatörün el işi |
| Dalgalı çizgi | Yürüme |
| Kesikli çizgi | Makinenin kendi başına çalıştığı süre |
| Boşluk | Operatörün beklemesi |

Kurallar:
- El işi, yürüme ve bekleme **arka arkaya** gelir. Operatör aynı anda iki iş yapamaz.
- Makine işi, makine başlatıldığı andan itibaren **paralel** ilerler. Operatör o sırada başka bir işe geçebilir.
- Çevrim süresi, operatörün işi ile makinenin işinden **hangisi daha geç bitiyorsa** odur.

## Örnek: streç sarma istasyonu

Operatör paleti streç makinesine getiriyor, makineyi başlatıyor ve makine sararken başında bekliyor. Sarma bitince etiketi yazdırıp yapıştırıyor, sonra bir sonraki paleti hazırlıyor.

**Mevcut durum**

| Adım | Tür | Başlangıç | Bitiş |
| --- | --- | --- | --- |
| Paleti makineye sürme | Yürüme | 0 | 12 |
| Makineyi başlatma | El işi | 12 | 15 |
| Streç sarma | Makine | 15 | 60 |
| Makineyi izleme | Bekleme | 15 | 60 |
| Etiket yazdırma ve yapıştırma | El işi | 60 | 80 |
| Sonraki paleti hazırlama | El işi | 80 | 95 |

> Çevrim süresi = **95 sn**. Operatör 45 saniye makineyi izleyerek bekliyor.

**Yeni düzen:** etiketleme ve sonraki paleti hazırlama, makine sararken yapılıyor.

| Adım | Tür | Başlangıç | Bitiş |
| --- | --- | --- | --- |
| Paleti makineye sürme | Yürüme | 0 | 12 |
| Makineyi başlatma | El işi | 12 | 15 |
| Streç sarma | Makine | 15 | 60 |
| Etiket yazdırma ve yapıştırma | El işi | 15 | 35 |
| Sonraki paleti hazırlama | El işi | 35 | 50 |

> Operatörün işi 50 sn, makine 60 sn'de bitiyor. Çevrim süresi = **60 sn**.

Aynı kişi ve aynı makineyle çevrim **95 saniyeden 60 saniyeye** iniyor: saatte yaklaşık 38 yerine **60 palet**. Artık çevrimi makine belirliyor. Operatörün 10 saniyelik boşluğu, makine sararken yapılabilecek başka bir iş için kullanılabilir.

<figure class="rehber-gorsel">
  <a href="/img/rehber/standart-is/kombinasyon-tablosu.svg" title="Büyük boyutta aç"><img src="/img/rehber/standart-is/kombinasyon-tablosu.svg" width="680" height="430" alt="Mevcut düzende operatör makine sararken 45 saniye bekliyor, çevrim 95 saniye. Yeni düzende etiketleme ve sonraki paleti hazırlama makine sararken yapılıyor; operatörün işi 50 saniyede bitiyor, çevrimi makine belirliyor: 60 saniye." loading="lazy" /></a>
  <figcaption>Makine sararken operatörün beklediği 45 saniye, etiketleme ve sonraki palet için kullanılınca çevrim 95 saniyeden 60 saniyeye iniyor.</figcaption>
</figure>

## Ne zaman kullanılır?

- İnsanın ve makinenin birlikte çalıştığı istasyonlarda: streç makinesi, otomatik bantlama, sorter besleme, CNC, pres.
- Bir operatörün birden fazla makineye baktığı durumlarda (çoklu makine kullanımı).
- [Hat dengeleme](/tr/rehber/hat-dengeleme-yamazumi/) sonrasında, bir istasyonun takta neden sığmadığını adım adım görmek için.

## Standart iş belgesinin üç parçası

Yalın üretimde standart iş genellikle üç belgeyle tanımlanır:

1. **Standart iş kombinasyon tablosu:** adımların sırası ve süreleri, insan ve makine birlikte.
2. **Standart iş akış şeması:** yerleşim planı üzerinde operatörün yolu.
3. **İş talimatı:** her adımın nasıl yapılacağı, kritik noktalar ve görseller.

## Sık yapılan hatalar

- **Makine süresini tahmin etmek.** Makine süresi de ölçülmelidir. Ayar ve hıza göre değişebilir.
- **Bekleme süresini tabloya koymamak.** Bekleme görünmezse kaldırılamaz.
- **Güvenliği gözden kaçırmak.** Makine çalışırken yapılacak iş, operatörü makinenin tehlikeli alanına sokmamalıdır.

## Tabloyu ölçümden çizmek

[Video İş Etüdü](https://zaman-etudu.ysfdurak.com/) adımları videodan ölçer. Her adımı el işi, makine, yürüme veya bekleme olarak işaretlediğinizde standart iş kombinasyon tablosunu otomatik çizer: makine işi paralel, diğerleri arka arkaya. Adım kartlarıyla görsel iş talimatı da hazırlayabilirsiniz. Bu yazıdaki zamanlama, uygulamanın standart iş kuralıyla hesaplandı.
