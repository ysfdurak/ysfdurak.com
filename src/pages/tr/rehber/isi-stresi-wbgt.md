---
layout: ../../../layouts/Guide.astro
title: "Isı stresi ve WBGT nasıl hesaplanır? İş yüküne göre referans değerler"
description: "WBGT ile ısı stresi değerlendirmesi: iç ve dış ortam formülleri, iş yüküne ve ısıya alışmaya göre referans değerler, yükleme rampası örneği ve önlemler."
updated: "2026-11-16"
image: "/img/durus/og.jpg"
tool:
  name: "Duruş – Ergonomi Analizi"
  cta: "Sıcaklık ölçümlerini ve iş yükünü girin; WBGT ve referans değerle karşılaştırma otomatik hesaplansın."
  url: "https://durus.ysfdurak.com/"
  project: "/tr/projeler/durus-ergonomi-analizi/"
---

**Kısa cevap:** Sıcak ortamda çalışmanın riski yalnızca hava sıcaklığına bağlı değildir: nem, ışınım (sıcak yüzeyler, güneş) ve iş yükü de belirleyicidir. **WBGT (Wet Bulb Globe Temperature)** bu etkileri tek bir sıcaklık değerinde toplar. Hesaplanan WBGT, işin ağırlığına ve çalışanın ısıya alışık olup olmadığına göre değişen **referans değerle** karşılaştırılır. Aşılıyorsa iş-dinlenme düzeni, teknik önlem ve ayrıntılı değerlendirme gerekir. Yöntem ISO 7243 standardına dayanır.

## WBGT nasıl hesaplanır?

Üç ölçüm kullanılır:
- **Doğal yaş termometre (tnw):** ıslak fitilli, doğal hava akımında. Nemi ve hava hareketini yansıtır.
- **Glob termometre (tg):** 150 mm'lik siyah küre içinde. Işınımı yansıtır.
- **Kuru termometre (ta):** güneşten korunmuş hava sıcaklığı. Yalnızca güneş altında gerekir.

> İç ortam veya güneş almayan dış ortam: **WBGT = 0,7 × tnw + 0,3 × tg**
>
> Güneş altında dış ortam: **WBGT = 0,7 × tnw + 0,2 × tg + 0,1 × ta**

Formülde en büyük ağırlığın yaş termometrede olduğuna dikkat edin: nemli ortamda ter buharlaşamadığı için vücut serinleyemez.

## Referans değerler

Referans değer iş yükü arttıkça düşer. Isıya alışık olmayanlar (yeni başlayanlar, izinden dönenler) için daha da düşüktür.

| İş yükü | Örnek | Isıya alışık | Alışık değil |
| --- | --- | --- | --- |
| Dinlenme | Oturarak | 33,0 °C | 30,8 °C |
| Hafif | Oturarak el işi, yavaş yürüme | 30,8 °C | 28,1 °C |
| Orta | Sürekli kol-bacak işi, el arabası | 28,2 °C | 25,0 °C |
| Ağır | Yoğun kol-gövde işi, ağır malzeme taşıma | 26,6 °C | 23,0 °C |
| Çok ağır | Merdiven, maksimuma yakın tempo | 25,5 °C | 21,6 °C |

Değerler standart iş kıyafeti içindir. Koruyucu tulum gibi kıyafetlerde düzeltme gerekir.

## Örnek: yazın yükleme rampası

Temmuz öğleden sonra, kapalı rampada elle yükleme. Rampa kapıları güneşe bakıyor, metal yüzeyler ısınmış.

- Doğal yaş termometre: 26 °C
- Glob termometre: 38 °C
- İş yükü: ağır (koli taşıma), çalışanlar ısıya alışık

> WBGT = 0,7 × 26 + 0,3 × 38 = **29,6 °C**
>
> Referans (ağır iş, alışık) = **26,6 °C** → **3 °C aşım**

Referans değer belirgin biçimde aşıldı. Isıya alışık olmayan yeni bir çalışan için referans 23,0 °C olduğundan aşım 6,6 °C'ye çıkar.

**Önlemler:**
- Rampa kapısına ışınım perdesi ve büyük fanlar: glob sıcaklığı 38'den 32 °C'ye iner.
- Yükleme için transpalet ve makaralı konveyör: iş yükü "ağır"dan "orta"ya iner.

> Yeni WBGT = 0,7 × 26 + 0,3 × 32 = **27,8 °C**
>
> Yeni referans (orta iş, alışık) = **28,2 °C** → referansın 0,4 °C altında

Sonuç referansa çok yakın. Su, gölgeli dinlenme alanı ve izleme yine gerekir. En sıcak saatlerde iş-dinlenme döngüsü planlanmalıdır.

## Önlem türleri

1. **Ortam:** havalandırma, fan (hava hızı), ışınım kaynaklarını perdeleme, gölgelik, lokal soğutma.
2. **İş yükü:** mekanik yardım, tempo düzenlemesi. İş yükünü bir sınıf düşürmek referansı yükseltir.
3. **Organizasyon:** iş-dinlenme döngüsü, serin dinlenme alanı, ağır işleri günün serin saatlerine kaydırma.
4. **Kişi:** su ve tuz takviyesi, açık renkli ve hava geçiren kıyafet. Yeni başlayanlar ve izinden dönenler için 1–2 haftalık kademeli alışma.

## Sık yapılan hatalar

- **Yalnızca hava sıcaklığına bakmak.** 30 °C kuru ve rüzgârlı bir ortam, 30 °C nemli ve ışınımlı bir ortamdan çok daha az risklidir.
- **Isıya alışmayı hesaba katmamak.** Yeni başlayanlar ve izinden dönenler ısı stresi açısından en riskli gruptur; referans değerleri de bu yüzden daha düşüktür.
- **Sınıra yakın sonucu güvenli saymak.** WBGT bir tarama yöntemidir. Referansa yakın veya üstündeki sonuçlarda ayrıntılı değerlendirme (ISO 7933) gerekir.

## Hesabı uygulamada yapmak

[Duruş](https://durus.ysfdurak.com/) iç ve dış ortam için WBGT'yi hesaplar, iş yükü ve ısıya alışma durumuna göre referans değerle karşılaştırır ve önlem önerir. Gürültü, titreşim ve aydınlatma hesaplayıcıları da aynı yerde. Bu yazıdaki hesaplar Duruş'un WBGT hesabıyla aynı formül ve referans değerlerle yapıldı.
