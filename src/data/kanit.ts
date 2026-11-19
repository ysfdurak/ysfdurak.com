// Ana sayfadaki "Üç projede kanıt" kartları: işe alım yöneticisinin tek bakışta görmesi gerekenler.
// Problem → benim verdiğim ürün kararı → çalışan örnek → doğrulanan sonuç (nasıl doğrulandığı ve bağlantısı).
// Her doğrulama bağlantısı herkese açık bir test ya da belgeye gider; iddia yalnız orada gösterilen kadardır.
import type { Lang } from './projects';

export interface Kanit {
  id: string;
  name: { tr: string; en: string };
  /** Proje sayfası slug'ı (sitede sayfası varsa). */
  slug?: string;
  problem: { tr: string; en: string };
  decision: { tr: string; en: string };
  example: { url: string; label: { tr: string; en: string } };
  verified: { tr: string; en: string };
  proof: { url: string; label: { tr: string; en: string } };
  /** Henüz doğrulanmayan kısım (dürüstlük notu). */
  open?: { tr: string; en: string };
  skill: { tr: string; en: string };
}

const GH = 'https://github.com/ysfdurak/';

export const KANITLAR: Kanit[] = [
  {
    id: 'butce',
    name: { tr: 'Bütçe Sapması ve Aylık Kapanış', en: 'Budget Variance and Monthly Close' },
    problem: {
      tr: 'Gider dosyaları her ay farklı biçimde gelir, rakamlar elle toplanır. Yönetici “hangi bütçeye göre, ne kadar aştık?” sorusuna kaynağıyla birlikte cevap alamaz.',
      en: 'Cost files arrive in a different shape every month and figures are added up by hand. A manager cannot get a sourced answer to “against which budget, and by how much, did we overspend?”.',
    },
    decision: {
      tr: 'Karşılaştırma bazı (ilk ya da güncel bütçe) tek ayarda seçilir ve her raporda yazılır. Her rakam kaynak dosya ve hücreye kadar izlenir. Python, Excel Power Query ve makro aynı kuralı aynı sentetik veride uygular.',
      en: 'The comparison basis (original or current budget) is one setting and is stated on every report. Every figure traces back to its source file and cell. Python, Excel Power Query and the macro apply the same rule to the same synthetic data.',
    },
    example: { url: 'https://ysfdurak.github.io/butce-sapmasi-rapor-otomasyonu/demo/', label: { tr: 'Tarayıcı demosu (sentetik veri)', en: 'Browser demo (synthetic data)' } },
    verified: {
      tr: 'Tek gider kaleminin hesap izi (gerçekleşen, seçili bütçe, kaynak dosya ve dönem, fark, %) Python ve Excel çıktısında yan yana: fark 0. Her gönderimde 121 test ve bu karşılaştırma çalışır.',
      en: 'The calculation trail of a single cost line (actual, selected budget, source file and period, difference, %) side by side in the Python and Excel outputs: zero difference. 121 tests and this comparison run on every push.',
    },
    proof: { url: GH + 'butce-sapmasi-rapor-otomasyonu/blob/main/docs/KALEM_IZI.md', label: { tr: 'Hesap izi: Python ve Excel yan yana', en: 'Calculation trail: Python and Excel side by side' } },
    open: { tr: 'Makro sürümü Windows Excel’de henüz çalıştırılmadı; kurum pilotu yapılmadı.', en: 'The macro version has not yet been run in Windows Excel; no company pilot yet.' },
    skill: { tr: 'Finansal raporlama, iş kuralı tasarımı, izlenebilirlik', en: 'Financial reporting, business-rule design, traceability' },
  },
  {
    id: 'destek',
    name: { tr: 'Destek Merkezi', en: 'Destek Merkezi – Workforce Support' },
    slug: 'destek-merkezi',
    problem: {
      tr: 'Bölümler arası işgücü desteği WhatsApp’tan istenir, kayıt günler sonra girilir. Kimin kime destek verdiği ve puantajla çelişen kayıtlar görünmez; operasyon ve İK farklı sayılar konuşur.',
      en: 'Cross-department workforce support is requested over WhatsApp and recorded days later. Who supported whom, and records that contradict the timesheet, stay invisible; operations and HR quote different numbers.',
    },
    decision: {
      tr: 'Karşı bölüm onayı zorunlu; ret gerekçeli ve silinmez. Puantaj uyumsuzluğu ayrı izlenir, otomatik onayı bekletir. Gözetim algısı yaratmamak için bilerek adam-saat ve verimlilik hesaplanmaz.',
      en: 'Approval by the receiving department is mandatory; rejections need a reason and are never deleted. Timesheet mismatches are tracked separately and hold automatic approval. Man-hours and productivity are deliberately not calculated, to avoid a sense of surveillance.',
    },
    example: { url: 'https://destek.ysfdurak.com/', label: { tr: 'Canlı demo', en: 'Live demo' } },
    verified: {
      tr: 'Uçtan uca kabul testi: tek kayıt gece yarısını geçen vardiyada girilir, reddedilir, düzeltilir, puantajla çelişir, puantaj düzeltilip onaylanır. Her adımda beş rapor (özet, birim, uyumsuz, personel, liste) aynı kayıt, kişi ve gün sayısını verir.',
      en: 'End-to-end acceptance test: one record crosses midnight, is rejected, corrected, contradicts the timesheet, and is approved after the timesheet is fixed. At every step five reports (summary, unit, mismatch, staff, list) give the same record, person and day counts.',
    },
    proof: { url: GH + 'destek-merkezi/blob/main/tests/kabul.test.mjs', label: { tr: 'Kabul testi', en: 'Acceptance test' } },
    open: { tr: 'Sahada bağımsız bir vardiya amiriyle kullanılabilirlik testi henüz yapılmadı.', en: 'No independent usability test with a shift supervisor yet.' },
    skill: { tr: 'Operasyon süreci, iş kuralı tasarımı, veri tutarlılığı', en: 'Operations process, business-rule design, data consistency' },
  },
  {
    id: 'kesit',
    name: { tr: 'Kesit: depo vakası', en: 'Kesit: warehouse case' },
    slug: 'kesit',
    problem: {
      tr: 'SQL, Python, Power BI ve istatistik ayrı ayrı öğrenilir; bir iş kararında birlikte nasıl kullanıldıkları ve “fark var” ile “karar için yeterli” arasındaki boşluk görünmez.',
      en: 'SQL, Python, Power BI and statistics are learned separately; how they combine in one business decision, and the gap between “there is a difference” and “enough to decide”, stays hidden.',
    },
    decision: {
      tr: 'Tek depo sorusu dört araçtan geçer: SQL ile temizlik, Python ile adillik denetimi, Power BI ölçüleri, istatistikle karar sınırı. İstatistiksel fark ile operasyonel yeterlilik ve nedensellik ayrı sorulur; öğrenci kararını uzman yorumundan önce yazar.',
      en: 'One warehouse question runs through four tools: cleaning in SQL, a fairness check in Python, Power BI measures, a decision boundary in statistics. Statistical difference, operational sufficiency and causation are asked separately; the learner writes a decision before seeing the expert view.',
    },
    example: { url: 'https://ysfdurak.github.io/#vaka', label: { tr: 'Vakayı çöz (yaklaşık 40 dk)', en: 'Solve the case (about 40 min)' } },
    verified: {
      tr: 'Beklenen sonuçlar SQLite, pandas ve SciPy ile bağımsız hesaplanır; tarayıcıdaki motorlar bunlarla 1e-11 düzeyinde aynı. İkinci örnekte (İzmir) aynı kazanç vardiya karışımından gelir: toplam fark anlamlı, vardiya içinde fark yok.',
      en: 'Expected results are computed independently with SQLite, pandas and SciPy; the in-browser engines match them to about 1e-11. In a second example (İzmir) the same gain comes from the shift mix: the overall difference is significant, within shifts there is none.',
    },
    proof: { url: GH + 'ysfdurak.github.io/tree/main/vaka/depo-kaynak', label: { tr: 'Vaka üreteci ve doğrulama', en: 'Case generator and verification' } },
    open: { tr: 'İlk kez gelen bir öğrenciyle yardımsız tamamlama testi henüz yapılmadı.', en: 'No unassisted completion test with a first-time learner yet.' },
    skill: { tr: 'Veriyle karar verme, analitik araçlar, eğitim tasarımı', en: 'Data-driven decisions, analytics tools, learning design' },
  },
];

export const kanitlar = (_lang: Lang) => KANITLAR;
