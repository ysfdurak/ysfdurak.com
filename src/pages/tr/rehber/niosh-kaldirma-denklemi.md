---
layout: ../../../layouts/Guide.astro
title: "NIOSH kaldırma denklemi nasıl hesaplanır? RWL ve LI örneği"
description: "Revize NIOSH kaldırma denklemi: önerilen ağırlık sınırı (RWL), kaldırma indeksi (LI), altı çarpan ve depo örneğiyle adım adım hesap."
updated: "2026-11-16"
image: "/img/durus/og.jpg"
tool:
  name: "Duruş – Ergonomi Analizi"
  cta: "NIOSH kaldırma denklemini ölçüleri girerek hesaplayın; hangi çarpanın riski artırdığını görün."
  url: "https://durus.ysfdurak.com/"
  project: "/tr/projeler/durus-ergonomi-analizi/"
---

**Kısa cevap:** NIOSH kaldırma denklemi, iki elle yapılan bir kaldırma işi için **önerilen ağırlık sınırını (RWL)** hesaplar. 23 kg'lık bir sabit, kaldırmanın koşullarını yansıtan altı çarpanla küçültülür. Kaldırılan yükün RWL'ye oranı **kaldırma indeksidir (LI)**. LI 1'in altındaysa iş çoğu çalışan için güvenli kabul edilir. 1'in üstündeki her değer riskin arttığını gösterir.

> RWL = 23 kg × HM × VM × DM × AM × FM × CM
>
> LI = Yük ÷ RWL

## Ne zaman kullanılır?

- İki elle, gövdenin önünde, düzgün ve dengeli yapılan kaldırma ve indirme işlerinde.
- Bir kaldırma işinin "çok mu ağır?" sorusunu ağırlık tek başına değil, koşullarıyla birlikte cevaplamak için.

Tek elle kaldırma, oturarak kaldırma, itme-çekme ve taşıma (yürüyerek uzun mesafe) için uygun değildir. Bu durumlarda KIM veya Liberty Mutual (Snook) tabloları kullanılır.

## Altı çarpan

Her çarpan 0 ile 1 arasındadır. Koşul ideal olduğunda 1'dir; koşul kötüleştikçe küçülür.

| Çarpan | Ölçü | Hesap (cm) | İdeal değer |
| --- | --- | --- | --- |
| HM · Yatay | Ayak bileklerinin ortası ile ellerin ortası arası yatay mesafe (H) | 25 ÷ H | H ≤ 25 cm |
| VM · Dikey | Ellerin yerden yüksekliği (V) | 1 − 0,003 × \|V − 75\| | V = 75 cm (bel hizası) |
| DM · Mesafe | Başlangıç ile varış yüksekliği arasındaki fark (D) | 0,82 + 4,5 ÷ D | D ≤ 25 cm |
| AM · Dönme | Gövdenin dönme açısı (A, derece) | 1 − 0,0032 × A | 0° |
| FM · Sıklık | Dakikadaki kaldırma sayısı ve toplam iş süresi | NIOSH sıklık tablosundan | Seyrek, kısa süreli |
| CM · Kavrama | Tutamak ve nesnenin şekli | İyi 1,00 · Orta 0,95 (V ≥ 75 cm ise 1,00) · Kötü 0,90 | Tutamaklı kasa |

Sınırlar: H 63 cm'yi, V 175 cm'yi veya A 135°'yi aşarsa ilgili çarpan sıfır olur. Bu, işin denklemin kabul ettiği sınırların dışında olduğu anlamına gelir.

## Örnek: alçak paletten konveyöre koli

Çalışan, yerden 15 cm yükseklikteki paletten 12 kg'lık tutamaksız koliyi alıp 75 cm yükseklikteki konveyöre koyuyor. Koli gövdesinden 40 cm uzakta, alırken 30° dönüyor. Dakikada 4 kaldırma, işin toplam süresi 1–2 saat.

| Çarpan | Hesap | Değer |
| --- | --- | --- |
| HM | 25 ÷ 40 | 0,63 |
| VM | 1 − 0,003 × \|15 − 75\| | 0,82 |
| DM | 0,82 + 4,5 ÷ 60 | 0,90 |
| AM | 1 − 0,0032 × 30 | 0,90 |
| FM | 4/dk, 1–2 saat, V < 75 | 0,72 |
| CM | Orta kavrama, V < 75 | 0,95 |

> RWL = 23 × 0,63 × 0,82 × 0,90 × 0,90 × 0,72 × 0,95 ≈ **6,5 kg**
>
> LI = 12 ÷ 6,5 ≈ **1,84**

Bu koşullarda önerilen sınır 6,5 kg, kaldırılan yük bunun yaklaşık iki katı. **Risk artmış durumda, iyileştirme gerekli.**

## LI nasıl yorumlanır?

| Kaldırma indeksi | Yorum |
| --- | --- |
| LI ≤ 1 | Çoğu çalışan için güvenli kabul edilir |
| 1 < LI ≤ 2 | Risk artmış; iyileştirme önerilir |
| 2 < LI ≤ 3 | Risk artmış; iyileştirme gerekli |
| LI > 3 | Yüksek risk; iş yeniden tasarlanmalı |

## Hangi çarpanı düzeltmeli?

En küçük çarpan, riski en çok artıran koşuldur. Örnekte en düşük değerler **HM (0,63)**, **FM (0,72)** ve **VM (0,82)**. Paletin yükseltici üzerine konması üçünü birden etkiler:

- Koli bel hizasına (70 cm) gelir → VM 0,99
- Çalışan yüke yaklaşır (H = 30 cm) → HM 0,83
- Başlangıç ve varış yükseklikleri yaklaşır (D < 25 cm) → DM 1,00
- Dönme ortadan kalkar → AM 1,00

> Yeni RWL ≈ **12,9 kg**, LI = 12 ÷ 12,9 ≈ **0,93**

Tek bir önlemle iş "kabul edilebilir" sınırın altına iner. Tutamaklı kasaya geçilirse LI 0,88'e düşer.

## Sık yapılan hatalar

- **Ölçüleri varış noktasında almak.** Ölçüler kaldırmanın başlangıcında alınır. İndirme sırasında da kontrol gerekiyorsa varış noktası ayrıca hesaplanır.
- **Farklı ağırlık ve yükseklikleri tek hesaba sıkıştırmak.** Bir kişi farklı yükleri farklı yüksekliklerden alıyorsa her görev ayrı hesaplanıp bileşik indeks (CLI) bulunur.
- **LI'yı "kişi bu yükü kaldıramaz" diye okumak.** LI bir risk göstergesidir. LI 1'in üstündeki işlerde zaman içinde bel yaralanması riski artar.

## Hesabı uygulamada yapmak

[Duruş](https://durus.ysfdurak.com/) NIOSH kaldırma denklemini ve karışık görevler için bileşik indeksi (CLI) hesaplar. En düşük çarpanları sıralayıp her biri için önlem önerir. Sonucu Excel veya PDF rapor olarak verir. Bu yazıdaki örnek, Duruş'un NIOSH hesabıyla doğrulandı.
