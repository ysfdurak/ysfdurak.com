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
  /** Kartta büyük gösterilen tek sonuç. */
  metric: { value: { tr: string; en: string }; label: { tr: string; en: string } };
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
      tr: 'Gider dosyaları her ay farklı biçimde gelir; bütçe sapması elle ve kaynağı gösterilmeden hesaplanır.',
      en: 'Cost files arrive in a different shape every month; budget variance is worked out by hand, without its sources.',
    },
    decision: {
      tr: 'Karşılaştırma bazı (ilk ya da güncel bütçe) tek ayarda seçilir ve her raporda yazılır. Her rakam kaynak dosya ve hücreye kadar izlenir. Python, Excel Power Query ve makro aynı kuralı aynı sentetik veride uygular.',
      en: 'The comparison basis (original or current budget) is one setting and is stated on every report. Every figure traces back to its source file and cell. Python, Excel Power Query and the macro apply the same rule to the same synthetic data.',
    },
    example: { url: 'https://ysfdurak.github.io/butce-sapmasi-rapor-otomasyonu/demo/', label: { tr: 'Tarayıcı demosu (sentetik veri)', en: 'Browser demo (synthetic data)' } },
    metric: {
      value: { tr: '0 kuruş fark', en: '0.00 difference' },
      label: { tr: 'Python, Power Query ve Excel makrosu arasında, Windows’ta gerçek Excel’de', en: 'between Python, Power Query and the Excel macro, in real Excel on Windows' },
    },
    verified: {
      tr: 'Üç sürüm Windows’ta gerçek Excel’de (Microsoft 365) aynı örnek veriyle çalıştırıldı; toplamlar kuruşu kuruşuna tuttu. Makronun kendi testi 188/188 geçti, Python tarafında her gönderimde 125 test çalışır.',
      en: 'All three versions were run in real Excel (Microsoft 365) on Windows with the same sample data; totals matched to the cent. The macro’s own test passed 188/188, and 125 Python tests run on every push.',
    },
    proof: { url: GH + 'butce-sapmasi-rapor-otomasyonu/blob/main/docs/SURUM_NOTLARI.md', label: { tr: 'Windows Excel deneme kayıtları', en: 'Windows Excel test records' } },
    open: { tr: 'Gerçek kurum verisiyle pilot henüz yapılmadı.', en: 'No pilot with real company data yet.' },
    skill: { tr: 'Finansal raporlama, iş kuralı tasarımı, izlenebilirlik', en: 'Financial reporting, business-rule design, traceability' },
  },
  {
    id: 'pusula',
    name: { tr: 'Pusula', en: 'Pusula – Work and Team Tracking' },
    slug: 'pusula',
    problem: {
      tr: 'Vardiyalı ekiplerde işler ve terminler WhatsApp, e-posta ve Excel’e dağılır; kimin neyi ne zamana yapacağı görünmez.',
      en: 'In shift teams, tasks and deadlines are scattered across WhatsApp, email and Excel; who does what by when stays invisible.',
    },
    example: { url: 'https://pusula.ysfdurak.com/', label: { tr: 'Canlı demo (örnek depo ekibi)', en: 'Live demo (sample warehouse team)' } },
    metric: {
      value: { tr: '89 test', en: '89 tests' },
      label: { tr: 'her gönderimde; Claude (MCP) ile uçtan uca senaryo dahil', en: 'on every push, including an end-to-end scenario through Claude (MCP)' },
    },
    verified: {
      tr: 'Claude üzerinden iş açılır ve atanır; gerekçesiz termin değişikliği reddedilir. Web arayüzü aynı işi aynı durumda görür, her değişiklik denetim kaydına düşer.',
      en: 'A task is created and assigned through Claude; a deadline change without a reason is rejected. The web interface sees the same task in the same state, and every change lands in the audit log.',
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
      tr: 'Kullanılmayan measure’lar Power BI modelini şişirir; elle silmek başka bir formülü bozabilir.',
      en: 'Unused measures bloat a Power BI model; deleting them by hand can break another formula.',
    },
    example: { url: 'https://measure-sieve.ysfdurak.com/', label: { tr: 'Canlı demo (örnek satış raporu)', en: 'Live demo (sample sales report)' } },
    metric: {
      value: { tr: '10/10 adım', en: '10/10 steps' },
      label: { tr: 'gerçek Power BI Desktop’ta otomatik uçtan uca testte geçti', en: 'passed in an automated end-to-end test in real Power BI Desktop' },
    },
    verified: {
      tr: 'Okunan measure listesi Desktop’ınkiyle aynı; adaylar silindikten sonra rakamlar değişmiyor; temizlenmiş kopyalar Desktop’ta açılıyor. Her gönderimde 22 test çalışır.',
      en: 'The measure list it reads matches Desktop’s; figures stay the same after the candidates are removed; cleaned copies open in Desktop. 22 tests run on every push.',
    },
    proof: { url: GH + 'measure-sieve/blob/main/RELEASE_NOTES.md', label: { tr: 'Windows test kayıtları', en: 'Windows test records' } },
    open: { tr: 'Gerçek bir kurum raporuyla pilot henüz yapılmadı.', en: 'No pilot with a real company report yet.' },
    skill: { tr: 'Power BI modelleme, DAX, veri kalitesi', en: 'Power BI modelling, DAX, data quality' },
  },
];

export const kanitlar = (_lang: Lang) => KANITLAR;
