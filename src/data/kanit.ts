// Ana sayfadaki "Üç projede kanıt" kartları: işe alım yöneticisinin tek bakışta görmesi gerekenler.
// Problem → çalışan örnek → doğrulanan sonuç (nasıl doğrulandığı ve bağlantısı).
// Her doğrulama bağlantısı herkese açık bir test ya da belgeye gider; iddia yalnız orada gösterilen kadardır.
import type { Lang } from './projects';

export interface Kanit {
  id: string;
  name: { tr: string; en: string };
  /** Proje sayfası slug'ı (sitede sayfası varsa). */
  slug?: string;
  problem: { tr: string; en: string };
  /** Artık gösterilmiyor (26 Kasım 2026). */
  decision?: { tr: string; en: string };
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
    slug: 'butce-sapmasi',
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
    id: 'pusula',
    name: { tr: 'Pusula', en: 'Pusula – Work and Team Tracking' },
    slug: 'pusula',
    problem: {
      tr: 'Vardiyalı ekiplerde işler WhatsApp, e-posta ve Excel’e dağılır. Kimin neyi ne zamana yapacağı, terminin kaç kez kaydığı ve neden kaydığı görünmez.',
      en: 'In shift-based teams, work is scattered across WhatsApp, email and Excel. Who does what by when, how often a deadline slipped and why, stays invisible.',
    },
    example: { url: 'https://pusula.ysfdurak.com/', label: { tr: 'Canlı demo (örnek depo ekibi)', en: 'Live demo (sample warehouse team)' } },
    verified: {
      tr: 'Uçtan uca test: Claude üzerinden (MCP) iş açılır, atanır; gerekçesiz termin değişikliği reddedilir, gerekçeyle ertelenince ilk termin korunur; iş tamamlanır. Web arayüzü aynı işi aynı durumda görür, her yazma denetim kaydına düşer. Her gönderimde 89 test çalışır.',
      en: 'End-to-end test: through Claude (MCP) a task is created and assigned; a deadline change without a reason is rejected, and when postponed with a reason the original deadline is kept; the task is completed. The web interface sees the same task in the same state, and every write lands in the audit log. 89 tests run on every push.',
    },
    proof: { url: GH + 'pusula-is-takip/blob/main/tests/server/mcp.test.js', label: { tr: 'Uçtan uca MCP testi', en: 'End-to-end MCP test' } },
    open: { tr: 'Gerçek bir ekiple pilot kullanım henüz yapılmadı.', en: 'No pilot with a real team yet.' },
    skill: { tr: 'Ürün geliştirme, yetki ve iş kuralları, yapay zekâ entegrasyonu (MCP)', en: 'Product development, permissions and business rules, AI integration (MCP)' },
  },
  {
    id: 'measure-sieve',
    name: { tr: 'Measure Sieve', en: 'Measure Sieve' },
    slug: 'measure-sieve',
    problem: {
      tr: 'Power BI modelinde kimsenin kullanmadığı measure’lar birikir ve kafa karıştırır. Elle silmek riskli: bir measure başka bir formülün ya da gizli bir sayfanın içinde kullanılıyor olabilir.',
      en: 'Measures nobody uses pile up in a Power BI model and confuse people. Deleting them by hand is risky: a measure may be used inside another formula or on a hidden page.',
    },
    example: { url: 'https://measure-sieve.ysfdurak.com/', label: { tr: 'Canlı demo (örnek satış raporu)', en: 'Live demo (sample sales report)' } },
    verified: {
      tr: 'Örnek raporda beklenen sonuç testte sabit: Ciro, Toplam Satış ile aynı formül ve kullanılmıyor; Eski Hedef yalnız kullanılmayan bir measure’ın içinde. Temizlenmiş kopya yeniden taranıp doğrulamadan geçer; kalan bir öğeyi bozacak silme yapılmaz. Her gönderimde 22 test çalışır.',
      en: 'The expected result on the sample report is fixed in tests: Revenue has the same formula as Total Sales and is unused; Old Target is only used inside an unused measure. The cleaned copy is scanned again and passes verification; no removal that would break a remaining item is made. 22 tests run on every push.',
    },
    proof: { url: GH + 'measure-sieve/blob/main/tests/pbix-clean.test.mjs', label: { tr: 'Temizlenmiş kopya testi', en: 'Cleaned copy test' } },
    open: { tr: 'Gerçek bir kurum raporuyla pilot henüz yapılmadı; sayısal doğrulama otomatik testte sahte bir Power BI motoruyla denenir.', en: 'No pilot with a real company report yet; numeric verification is exercised in automated tests with a fake Power BI engine.' },
    skill: { tr: 'Power BI modelleme, DAX, veri kalitesi', en: 'Power BI modelling, DAX, data quality' },
  },
];

export const kanitlar = (_lang: Lang) => KANITLAR;
