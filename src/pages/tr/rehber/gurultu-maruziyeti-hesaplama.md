---
layout: ../../../layouts/Guide.astro
title: "Gürültü maruziyeti nasıl hesaplanır? Günlük maruziyet (LEX,8h) örneği"
description: "Günlük gürültü maruziyeti LEX,8h hesabı, Gürültü Yönetmeliği'ndeki 80, 85 ve 87 dB(A) değerleri, 3 dB kuralı ve depo örneğiyle önlem etkisi."
updated: "2026-11-16"
image: "/img/durus/og.jpg"
tool:
  name: "Duruş – Ergonomi Analizi"
  cta: "Gün içindeki ses düzeylerini ve süreleri girin; LEX,8h, eylem değerleri ve en büyük katkı otomatik hesaplansın."
  url: "https://durus.ysfdurak.com/"
  project: "/tr/projeler/durus-ergonomi-analizi/"
  shot: "/img/durus/formlar-niosh.webp"
---

**Kısa cevap:** Bir çalışanın gün içinde farklı gürültü düzeylerinde geçirdiği süreler tek bir sayıya çevrilir: **günlük kişisel gürültü maruziyeti, LEX,8h**. Bu değer, 8 saat boyunca aynı enerjiyi verecek sabit ses düzeyidir. Gürültü Yönetmeliği'ndeki değerlerle karşılaştırılır: **80 dB(A) alt eylem değeri, 85 dB(A) üst eylem değeri, 87 dB(A) maruziyet sınır değeri**.

<figure class="rehber-gorsel rehber-foto">
  <img src="/img/rehber/gurultu/kulak-koruyucu.webp" width="1200" height="800" alt="Koruyucu gözlük ve kulaklık takmış bir çalışan" loading="lazy" decoding="async" />
  <figcaption>Kulak koruyucu son çaredir; önce kaynakta azaltma gelir. <span class="kredi">Fotoğraf: <a href="https://unsplash.com/photos/8WmS1_XWdKg" rel="nofollow">Jimmy Nilsson Masth / Unsplash</a></span></figcaption>
</figure>

> LEX,8h = 10 × log₁₀ [ Σ (Tᵢ ÷ 8) × 10^(Lᵢ ÷ 10) ]

Lᵢ her ortamda ölçülen eşdeğer ses düzeyi (LAeq, dB(A)), Tᵢ o ortamda geçen süredir (saat).

## Desibel neden toplanmaz?

Desibel logaritmik bir ölçektir. **Her 3 dB'lik artış, ses enerjisinin iki katına çıkması demektir.** Bu yüzden:

- 85 dB(A)'da 8 saat ≈ 88 dB(A)'da 4 saat ≈ 91 dB(A)'da 2 saat. Üçü de aynı günlük maruziyeti verir.
- Gürültülü bir alandaki süreyi yarıya indirmek, o kaynağın katkısını 3 dB azaltır.
- Gürültünün büyük kısmı genellikle en yüksek düzeydeki kısa süreden gelir.

## Yönetmelikteki değerler

| Değer | LEX,8h | Tepe (LpC,peak) | Ne gerekir? |
| --- | --- | --- | --- |
| Alt eylem değeri | 80 dB(A) | 135 dB(C) | Kulak koruyucu sağlanır; bilgilendirme ve eğitim, isteyene işitme testi |
| Üst eylem değeri | 85 dB(A) | 137 dB(C) | Teknik ve organizasyonel önlem programı; kulak koruyucu kullanımı zorunlu, alan işaretlenir |
| Maruziyet sınır değeri | 87 dB(A) | 140 dB(C) | Kulak koruyucunun etkisiyle birlikte bile aşılmamalı; hemen önlem |

Tepe değer; pres, çekiç, havalı alet gibi ani ve darbeli gürültüler için ayrıca ölçülür.

## Örnek: sorter alanında çalışan

Ses düzeyleri kalibre bir ses düzeyi ölçerle ölçüldü:

| Ortam | LAeq | Süre | Günlük enerjideki payı |
| --- | --- | --- | --- |
| Sorter besleme | 90 dB(A) | 3 saat | %86 |
| Paketleme | 82 dB(A) | 3 saat | %14 |
| Mola ve ofis | 70 dB(A) | 2 saat | %1 |

> LEX,8h = 10 × log₁₀ [ (3/8)·10⁹ + (3/8)·10^8,2 + (2/8)·10⁷ ] ≈ **86,4 dB(A)**

Sonuç **üst eylem değerinin üzerinde**, sınır değere yakın. Günlük enerjinin %86'sı sorterdaki 3 saatten geliyor. Önlemler oradan başlamalı.

## Önlemlerin etkisi

| Seçenek | LEX,8h | Sonuç |
| --- | --- | --- |
| Mevcut durum | 86,4 dB(A) | Üst eylem değeri aşıldı |
| Rotasyon: sorterda 1,5 saat, paketlemede 4,5 saat | 84,5 dB(A) | Alt eylem değeri aşıldı |
| Kaynakta azaltma: sorter kapsülü ile 90 → 84 dB(A) | 81,9 dB(A) | Alt eylem değeri aşıldı |
| İkisi birlikte | 81,4 dB(A) | Alt eylem değeri aşıldı |

Kaynakta azaltma, rotasyondan daha etkili. Önlem sırası genel olarak şöyledir:

1. **Kaynakta azaltma:** kapsül, susturucu, titreşim yalıtımı, bakım, daha sessiz ekipman.
2. **Yayılmayı engelleme:** bariyer, mesafe, ses yutucu yüzeyler.
3. **Organizasyon:** rotasyon, sessiz dinlenme alanı, gürültülü işleri ayrı saatlere toplama.
4. **Kulak koruyucu:** diğer önlemlerden sonra, son çare olarak. Doğru takılması ve sürekli kullanılması şarttır.

<figure class="rehber-gorsel">
  <a href="/img/rehber/gurultu/maruziyet-olcek.svg" title="Büyük boyutta aç"><img src="/img/rehber/gurultu/maruziyet-olcek.svg" width="680" height="400" alt="Günlük ses enerjisinin yüzde 86'sı sorterdaki 3 saatten geliyor. LEX,8h mevcut durumda 86,4 dB(A), rotasyonla 84,5, kaynakta azaltmayla 81,9, ikisi birlikte 81,4; yönetmelik değerleri 80, 85 ve 87 dB(A)." loading="lazy" /></a>
  <figcaption>Desibel logaritmik olduğu için enerjinin büyük kısmı en gürültülü ortamdan gelir; kaynakta azaltma rotasyondan daha etkili.</figcaption>
</figure>

## Sık yapılan hatalar

- **Desibelleri aritmetik ortalamak.** 90 ve 70 dB(A)'nın ortalaması 80 değildir; enerji ortalaması 87'ye yakındır.
- **Telefon uygulamasıyla yasal değerlendirme yapmak.** Yasal değerlendirme için kalibre ölçüm cihazı gerekir.
- **Yalnızca en gürültülü noktayı ölçmek.** Maruziyet, kişinin gün içinde bulunduğu tüm ortamlardan oluşur.
- **Kulak koruyucuyu ilk çözüm saymak.** Koruyucu, kaynak azaltılmadan önce başvurulacak bir önlem değildir.

## Hesabı uygulamada yapmak

[Duruş](https://durus.ysfdurak.com/) gün içindeki maruziyetleri satır satır girmenizi sağlar, LEX,8h'yi hesaplar, yönetmelik değerleriyle karşılaştırır ve en büyük katkıyı yapan ortamı gösterir. Darbeli gürültü için tepe değerini de değerlendirir. Titreşim, ısı stresi ve aydınlatma için de ayrı hesaplayıcılar vardır. Bu yazıdaki hesaplar Duruş'un gürültü hesabıyla aynı formülle yapıldı.
