---
layout: ../../../layouts/Guide.astro
title: "İş örneklemesi nedir? Gözlem sayısı ve güven aralığı (örnekli)"
description: "İş örneklemesi (work sampling) adım adım: rastgele anlarda gözlem, kategori payları, güven aralığı ve gereken gözlem sayısı. Forklift operatörü örneğiyle hesap."
updated: "2026-11-16"
image: "/img/video-zaman-etudu/og.jpg"
tool:
  name: "Video İş Etüdü"
  cta: "İş örneklemesini videodan yapın: rastgele anlar, kategori payları ve gereken gözlem sayısı otomatik."
  url: "https://zaman-etudu.ysfdurak.com/"
  project: "/tr/projeler/video-zaman-etudu/"
  shot: "/img/video-zaman-etudu/olcum.webp"
---

**Kısa cevap:** İş örneklemesi, bir kişinin ya da makinenin zamanını **nelere harcadığını** bulmak için kullanılır. Gün boyunca **rastgele anlarda** kısa gözlemler yapılır ve her gözlemde ne yapıldığı bir kategoriye yazılır. Bir kategorinin gözlemlerdeki payı, o işe ayrılan zamanın payının tahminidir. Gözlem sayısı arttıkça tahmin daralır. Kaç gözlem gerektiği önceden hesaplanabilir.

<figure class="rehber-gorsel rehber-foto">
  <img src="/img/rehber/is-orneklemesi/forklift-depo.webp" width="1200" height="900" alt="Büyük bir depoda sarı forklift" loading="lazy" decoding="async" />
  <figcaption>Forklift operatörü gibi işi her an değişen rollerde zamanın nereye gittiğini iş örneklemesi gösterir.</figcaption>
</figure>


## Zaman etüdünden farkı

| | Zaman etüdü | İş örneklemesi |
| --- | --- | --- |
| Soru | "Bu iş kaç saniye sürüyor?" | "Zamanın yüzde kaçı neye gidiyor?" |
| Uygun iş | Tekrarlı, kısa çevrimli işler | Düzensiz, uzun ya da çok çeşitli işler |
| Gözlem | Her çevrimi baştan sona ölçmek | Rastgele anlarda kısa bakış |
| Sonuç | Standart süre | Kategori payları ve güven aralığı |

Forklift operatörü, bakım teknisyeni, sevkiyat sorumlusu gibi işi her an değişen roller için zaman etüdü pratik değildir. İş örneklemesi bu işlerde bekleme ve boşta geçen zamanı görünür kılar.

## 1. Kategorileri tanımlayın

Kategoriler net, birbirini dışlayan ve her anı kapsayan bir liste olmalı. Örnek, forklift operatörü:

- Yükleme ve boşaltma (katma değerli iş)
- Boş sürüş ve yürüme
- Bekleme (rampa, sipariş, onay)
- Diğer (mola, sohbet, şarj vb.)

## 2. Gözlem anlarını rastgele seçin

Gözlem anları önceden bilinmemelidir. Her saat başı gözlem yaparsanız çalışan bunu fark eder ve davranışı değişebilir. Ayrıca düzenli aralıklar işin kendi döngüsüyle çakışırsa (ör. her saat başı gelen kamyon) sonuç sistematik olarak yanlı çıkar.

## 3. Payları ve güven aralığını hesaplayın

Bir vardiya boyunca 400 rastgele anda gözlem yapıldı:

| Kategori | Gözlem | Pay | %95 güven aralığı |
| --- | --- | --- | --- |
| Yükleme ve boşaltma | 172 | %43,0 | %38,1 – %47,9 |
| Boş sürüş ve yürüme | 108 | %27,0 | %22,6 – %31,4 |
| Bekleme | 76 | %19,0 | %15,2 – %22,8 |
| Diğer | 44 | %11,0 | %7,9 – %14,1 |

Pay basit bir orandır: `p = gözlem ÷ toplam gözlem`. Güven aralığı ise şu formülle bulunur:

> p ± z × √( p × (1 − p) ÷ n )

%95 güven için z ≈ 1,96. Bekleme için:

> 0,19 ± 1,96 × √( 0,19 × 0,81 ÷ 400 ) = 0,19 ± 0,038 → **%15,2 – %22,8**

Yorum: operatörün zamanının yaklaşık beşte biri beklemeyle geçiyor. Bu oran büyük olasılıkla %15 ile %23 arasında.

<figure class="rehber-gorsel">
  <a href="/img/rehber/is-orneklemesi/paylar-guven-araligi.svg" title="Büyük boyutta aç"><img src="/img/rehber/is-orneklemesi/paylar-guven-araligi.svg" width="680" height="400" alt="Vardiya boyunca rastgele anlarda yapılan 400 gözlem: yükleme ve boşaltma yüzde 43, boş sürüş ve yürüme yüzde 27, bekleme yüzde 19, diğer yüzde 11; her payın yüzde 95 güven aralığı çizgiyle gösterilmiş." loading="lazy" /></a>
  <figcaption>Gözlem anları rastgele seçilir. Her payın etrafındaki çizgi %95 güven aralığıdır; aralıklar örtüşüyorsa fark anlamlı olmayabilir.</figcaption>
</figure>

## 4. Kaç gözlem gerekir?

Hedef hata payını önceden belirleyin, örneğin **±5 puan**. Gereken gözlem sayısı:

> n = z² × p × (1 − p) ÷ e²

En kalabalık kategori olan yükleme ve boşaltma için (p = 0,43, e = 0,05):

> 1,96² × 0,43 × 0,57 ÷ 0,05² ≈ **377 gözlem**

400 gözlem bütün kategoriler için ±5 puan hedefini karşılıyor. Hedef ±3 puan olsaydı yaklaşık **1.047 gözlem** gerekirdi. Hassasiyeti iki katına çıkarmak gözlem sayısını yaklaşık dört katına çıkarır.

İlk payı bilmiyorsanız p = 0,5 alın. Bu en kötü durumdur ve gereken en fazla gözlem sayısını verir (±5 puan için 385).

## 5. Sonucu kullanın

Örnekte **zamanın %46'sı** (boş sürüş %27 + bekleme %19) katma değer üretmiyor. Sıradaki sorular:

- Bekleme en çok hangi saatlerde? Rampa planı ya da sipariş akışı mı neden oluyor?
- Boş sürüş, depo yerleşimi veya görev atama yöntemiyle mi ilgili?
- Bu oranlar vardiyalar ve günler arasında aynı mı?

İyileştirmeden sonra aynı kategorilerle yeniden örnekleme yaparak farkı ölçün.

## Sık yapılan hatalar

- **Düzenli aralıklarla gözlem yapmak.** İşin döngüsüyle çakışabilir ve sonuç yanlı çıkar.
- **Kategorileri belirsiz bırakmak.** "Çalışıyor" ile "bekliyor" arasındaki çizgi gözlemciye göre değişirse oranlar da değişir.
- **Tek bir günden genellemek.** Haftanın farklı günlerini ve vardiyalarını kapsayın.
- **Az gözlemle küçük farkları yorumlamak.** %19 ile %22 arasındaki fark, güven aralığı ±4 puansa anlamlı değildir.

## Videodan iş örneklemesi

Sahada gün boyunca rastgele anlarda bulunmak zordur. Videodan yapılan iş örneklemesinde gözlem anları videonun içinden rastgele seçilir ve her an bir tuşla sınıflandırılır. [Video İş Etüdü](https://zaman-etudu.ysfdurak.com/) payları, güven aralıklarını ve hedef hata için gereken gözlem sayısını otomatik hesaplar. Bu yazıdaki örnek de uygulamanın iş örneklemesi hesabıyla doğrulandı.
