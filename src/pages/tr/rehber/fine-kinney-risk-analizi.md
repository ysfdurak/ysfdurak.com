---
layout: ../../../layouts/Guide.astro
title: "Fine-Kinney risk analizi nasıl yapılır? Puan tabloları ve depo örneği"
description: "Fine-Kinney yöntemi: Risk = Olasılık × Frekans × Şiddet. Puan tabloları, risk sınıfları, 5×5 matrisle farkı ve depodan iki örnekle adım adım hesap."
updated: "2026-11-16"
image: "/img/durus/og.jpg"
tool:
  name: "Duruş – Ergonomi Analizi"
  cta: "Ergonomi analizlerinizi Fine-Kinney veya 5×5 risk tablosuna dönüştürün, önlemleri takip edin."
  url: "https://durus.ysfdurak.com/"
  project: "/tr/projeler/durus-ergonomi-analizi/"
  shot: "/img/durus/baslangic.webp"
---

**Kısa cevap:** Fine-Kinney, bir tehlikenin riskini üç puanın çarpımıyla hesaplar:

<figure class="rehber-gorsel rehber-foto">
  <img src="/img/rehber/fine-kinney/forklift-raflar.webp" width="1200" height="900" alt="Yüksek raflar arasında forklift kullanan bir çalışan" loading="lazy" decoding="async" />
  <figcaption>Forkliftle yayanın aynı koridoru kullanması, Fine-Kinney ile puanlanan tipik bir depo tehlikesidir. <span class="kredi">Fotoğraf: <a href="https://www.pexels.com/photo/13532504/" rel="nofollow">Jimmy Nilsson Masth / Pexels</a></span></figcaption>
</figure>

> Risk = Olasılık × Frekans × Şiddet

Olasılık zararın ne kadar muhtemel olduğunu, frekans çalışanın tehlikeye ne sıklıkla maruz kaldığını, şiddet zarar gerçekleşirse sonucun ne kadar ağır olacağını gösterir. Sonuç 20'nin altındaysa risk kabul edilebilir, **400 ve üzerindeyse tolerans gösterilemez**: önlem hemen alınmalıdır, gerekirse iş durdurulur. Türkiye'de iş sağlığı ve güvenliği risk değerlendirmesinde en yaygın kullanılan yöntemlerden biridir.

## Puan tabloları

**Olasılık (O)**

| Puan | Anlamı |
| --- | --- |
| 0,2 | Hemen hemen imkânsız |
| 0,5 | Zayıf ihtimal |
| 1 | Oldukça düşük ihtimal |
| 3 | Nadir ama olabilir |
| 6 | Kuvvetle muhtemel |
| 10 | Çok kuvvetli ihtimal, beklenir |

**Frekans (F)**

| Puan | Anlamı |
| --- | --- |
| 0,5 | Çok nadir (yılda bir veya daha az) |
| 1 | Oldukça nadir (yılda birkaç kez) |
| 2 | Nadir (ayda bir) |
| 3 | Ara sıra (haftada bir) |
| 6 | Sıklıkla (günde bir veya birkaç kez) |
| 10 | Sürekli (saatte birden fazla) |

**Şiddet (Ş)**

| Puan | Anlamı |
| --- | --- |
| 1 | Önemsiz: ilk yardım, iş saati kaybı yok |
| 3 | Hafif: ilk yardım, iş günü kaybı yok |
| 7 | Önemli: iş günü kaybı, ayakta tedavi |
| 15 | Ciddi: uzun tedavi, meslek hastalığı |
| 40 | Çok ciddi: ölüm |
| 100 | Felaket: birden fazla ölüm |

## Risk sınıfları

| Risk puanı | Sınıf | Ne yapılmalı? |
| --- | --- | --- |
| 20'den az | Önemsiz | Önlem öncelikli değil; mevcut kontroller sürdürülür |
| 20 – 70 | Olası | Gözetim altında tutulmalı, önlemler planlanmalı |
| 70 – 200 | Önemli | Planlı önlem alınmalı |
| 200 – 400 | Yüksek | Kısa sürede önlem alınmalı |
| 400 ve üzeri | Tolerans gösterilemez | Hemen önlem alınmalı, gerekirse iş durdurulmalı |

## Örnek 1: forklift ile yaya çarpışması

Depoda forkliftler ve yayalar aynı koridoru kullanıyor. Ayrılmış yaya yolu yok.

- Olasılık: nadir ama olabilir → **3**
- Frekans: yayalar koridordan günde birkaç kez geçiyor → **6**
- Şiddet: ölümle sonuçlanabilir → **40**

> Risk = 3 × 6 × 40 = **720 → Tolerans gösterilemez**

**Önlem:** zemine fiziksel bariyerli yaya yolu, kör noktalara ayna, forkliftlere mavi ışık ve sesli uyarı. Önlem sonrası olasılık **0,5**'e düşer:

> Risk = 0,5 × 6 × 40 = **120 → Önemli**

Risk hâlâ "önemli" sınıfında, çünkü şiddet değişmedi. Bir sonraki adım, forklift ile yayanın aynı koridorda olduğu süreyi azaltmak (frekans) olabilir: örneğin toplama saatlerinde koridoru yalnızca forkliftlere ayırmak.

## Örnek 2: ergonomik risk, alçak paletten koli alma

Çalışan vardiya boyunca alçak paletten 12 kg koli alıyor. [REBA](/tr/rehber/reba-nasil-hesaplanir/) skoru 10 (yüksek risk), [NIOSH](/tr/rehber/niosh-kaldirma-denklemi/) kaldırma indeksi 1,84.

- Olasılık: ergonomik analiz yüksek risk gösteriyor → **6**
- Frekans: iş vardiya boyunca, saatte birçok kez → **10**
- Şiddet: bel rahatsızlığı, iş günü kaybı → **7**

> Risk = 6 × 10 × 7 = **420 → Tolerans gösterilemez**

**Önlem:** palet yükseltici (REBA 10 → 5, NIOSH LI 1,84 → 0,93) ve saatlik iş rotasyonu. Olasılık **1**'e, frekans **6**'ya iner:

> Risk = 1 × 6 × 7 = **42 → Olası**

Bu örnek, ergonomik analizin (REBA, NIOSH) risk değerlendirmesine nasıl girdi olduğunu gösterir. Olasılık puanı tahminle değil, ölçülmüş bir analize dayanır.

<figure class="rehber-gorsel">
  <a href="/img/rehber/fine-kinney/risk-olcegi.svg" title="Büyük boyutta aç"><img src="/img/rehber/fine-kinney/risk-olcegi.svg" width="680" height="330" alt="Risk sınıfları: 20 altı önemsiz, 20–70 olası, 70–200 önemli, 200–400 yüksek, 400 ve üzeri tolerans gösterilemez. Forklift–yaya örneğinde risk 720'den 120'ye, alçak palet örneğinde 420'den 42'ye iniyor." loading="lazy" /></a>
  <figcaption>Önlemlerin çoğu olasılığı ve frekansı düşürür. Forklift örneğinde şiddet değişmediği için risk hâlâ "önemli" sınıfında kalıyor.</figcaption>
</figure>

## 5×5 matris ile farkı

5×5 matriste risk iki puanın çarpımıdır: **Olasılık (1–5) × Şiddet (1–5)**. Sonuç 1 ile 25 arasındadır.

| | Fine-Kinney | 5×5 matris |
| --- | --- | --- |
| Puanlar | Olasılık, frekans, şiddet | Olasılık, şiddet |
| Ölçek | 0,1 – 10.000 | 1 – 25 |
| Güçlü yanı | Maruziyet sıklığını ayrıca hesaba katar, sınıflar arası ayrım daha ince | Basit ve hızlı, anlatması kolay |
| Zayıf yanı | Puan seçimi daha fazla yargı ister | Sık ve nadir maruziyeti ayırmaz |

Sık tekrarlanan işlerde (ergonomi, gürültü, kimyasal maruziyet) frekans önemli olduğu için Fine-Kinney daha açıklayıcıdır.

## Sık yapılan hatalar

- **Önlem sonrası puanı iyimser vermek.** Önlem yalnızca uygulandığında ve etkisi kontrol edildiğinde puan düşürülür.
- **Şiddeti düşürmeye çalışmak.** Önlemlerin çoğu olasılığı ve frekansı düşürür. Şiddet ancak tehlikenin kendisi değişirse düşer (ör. daha hafif yük, daha düşük hız).
- **Puanları tek kişinin seçmesi.** Risk değerlendirmesi, işi yapan çalışanların da katıldığı bir ekip işidir.
- **Tabloyu bir kez yapıp bırakmak.** Süreç, ekipman veya yerleşim değiştiğinde değerlendirme güncellenmelidir.

## Ergonomik riskleri tabloya dönüştürmek

[Duruş](https://durus.ysfdurak.com/), istasyonlarda yaptığınız ergonomi analizlerinden (REBA, RULA, NIOSH, OCRA ve diğerleri) Fine-Kinney ya da 5×5 risk tablosu oluşturur. Olasılık analiz sonucundan, frekans görev süresinden, şiddet tehlike türünden başlangıç değeri olarak önerilir; uzman her satırı işyerine göre düzeltir. Önlemleri ve önlem sonrası yeniden ölçümü takip eder, tabloyu PDF rapora ekler.
