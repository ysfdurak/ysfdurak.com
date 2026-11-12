// Tüm projeler bu tek listede durur. Yeni proje eklemek = bu listeye bir kayıt eklemek.
// Proje sayfaları (/tr/projeler/<slug>/ ve /en/projects/<slug>/) otomatik üretilir.

export type Lang = 'tr' | 'en';
export type Category = 'operasyon' | 'ekip' | 'veri' | 'ogrenme';
export type Hosting = 'static' | 'vps' | 'desktop' | 'repo' | 'external';

export interface ProjectText {
  tagline: string; // tek cümle: kime, hangi problem
  problem: string; // sahada ne oluyordu
  solution: string[]; // temel kararlar / özellikler
}

export interface Project {
  slug: string;
  name: string;
  category: Category;
  featured?: boolean;
  hosting: Hosting;
  /** Canlı uygulama adresi. Boşsa "Dene" butonu "Yakında" yazar. */
  url?: string;
  repo?: string;
  tech: string[];
  tr: ProjectText;
  en: ProjectText;
}

export const CATEGORIES: Record<Category, { tr: string; en: string; trSlug: string; enSlug: string }> = {
  operasyon: { tr: 'Operasyon ve depo', en: 'Operations and warehouse', trSlug: 'operasyon', enSlug: 'operations' },
  ekip: { tr: 'İş ve ekip', en: 'Work and teams', trSlug: 'is-ve-ekip', enSlug: 'work-and-teams' },
  veri: { tr: 'Veri ve raporlama', en: 'Data and reporting', trSlug: 'veri', enSlug: 'data' },
  ogrenme: { tr: 'Öğrenme', en: 'Learning', trSlug: 'ogrenme', enSlug: 'learning' },
};

export const HOSTING_LABEL: Record<Hosting, { tr: string; en: string }> = {
  static: { tr: 'Tarayıcıda çalışır', en: 'Runs in the browser' },
  vps: { tr: 'Sunucuda çalışır', en: 'Runs on a server' },
  desktop: { tr: 'Masaüstü + tarayıcı demosu', en: 'Desktop app + browser demo' },
  repo: { tr: 'Kaynak kod ve vaka', en: 'Source code and case study' },
  external: { tr: 'Ayrı sitede', en: 'Separate site' },
};

const GH = 'https://github.com/ysfdurak/';

export const PROJECTS: Project[] = [
  // ── Operasyon ve depo ────────────────────────────────────────────
  {
    slug: 'wdl-warehouse-decision-lab',
    name: 'WDL – Warehouse Decision Lab',
    category: 'operasyon',
    featured: true,
    hosting: 'static',
    tech: ['TypeScript', 'Çevrimdışı tarayıcı uygulaması'],
    tr: {
      tagline: 'Depo yerleşimini çizip adresleme ve toplama senaryolarını deneyen karar laboratuvarı.',
      problem:
        'Adresleme kuralları ve toplama yöntemleri genelde sahada deneme-yanılmayla belirlenir. Bir değişikliğin etkisini önceden görmek için elde basit bir araç yoktur.',
      solution: [
        'Fiziksel depo editörü: koridor, raf, minirack ve palet alanları',
        'Parametrik adresleme: alan genişlikleri, karşılıklı raf numaralandırma modelleri, bölgeye özel kural setleri',
        'Toplama simülasyonu: tanımlı toplama yolu, toplayıcı sayısı ve vardiya performansı girdileri',
        'Senaryolar kaydedilir, karşılaştırılır ve onaylanabilir',
      ],
    },
    en: {
      tagline: 'A decision lab to draw a warehouse layout and test addressing and picking scenarios.',
      problem:
        'Addressing rules and picking methods are usually settled by trial and error on the floor. There is rarely a simple tool to see the effect of a change in advance.',
      solution: [
        'Physical warehouse editor: aisles, racks, minirack and pallet areas',
        'Parametric addressing: field widths, opposite-face numbering models, per-zone rule sets',
        'Picking simulation: defined pick path, picker count and per-shift performance inputs',
        'Scenarios can be saved, compared and approved',
      ],
    },
  },
  {
    slug: 'sorter-studio',
    name: 'Sorter Studio',
    category: 'operasyon',
    featured: true,
    hosting: 'static',
    tech: ['HTML', 'JavaScript', 'Çevrimdışı'],
    tr: {
      tagline: 'Henüz kurulmamış bir operasyon için sorter seçimi ve boyutlandırma karar desteği.',
      problem:
        'Sorter yatırımı kararı çoğu zaman ölçüm verisi olmadan, tedarikçi tekliflerine bakarak verilir. Operasyon yöneticisinin birkaç parametreyle kapasiteyi kendisi görebileceği bir araç yoktur.',
      solution: [
        'Günlük hacim, lot büyüklüğü ve mağaza sayısı gibi birkaç girdiyle çalışır',
        'Şut sayısı ve dağılımı için ısı haritası',
        'İstasyon başına personel, besleme ve kapatma noktaları',
        'Sunum özeti ve ayrıntılı çalışma ekranı',
      ],
    },
    en: {
      tagline: 'Sorter selection and sizing decision support for an operation that does not exist yet.',
      problem:
        'Sorter investments are often decided without measured data, mainly from vendor offers. Operations managers lack a tool to check capacity themselves with a few parameters.',
      solution: [
        'Works from a few inputs such as daily volume, lot size and store count',
        'Heatmap of chute count and distribution',
        'Staff per station, feed and closing points',
        'A presentation summary plus a detailed working screen',
      ],
    },
  },
  {
    slug: 'shiftflow-data-studio',
    name: 'ShiftFlow Data Studio',
    category: 'operasyon',
    featured: true,
    hosting: 'desktop',
    tech: ['Python', 'PySide6', 'pandas', 'openpyxl'],
    tr: {
      tagline: 'WMS raporlarından tekrarlayan Excel raporlarını tek tuşla üreten masaüstü uygulaması.',
      problem:
        'Vardiya raporları her gün WMS çıktısına elle formül sütunları, referans eşleştirmeleri ve kurallar eklenerek hazırlanır. Veritabanı veya API erişimi olmadığı için otomasyon zordur.',
      solution: [
        'Açık WMS raporlarını bir kez yapılan tanımlarla tanır, format değişikliğini yakalar',
        'Kayıtlı senaryodan "Rapor oluştur" ile raporu otomatik kurar',
        'Günlük arşiv, geçmiş raporlama ve önceki vardiya karşılaştırması',
        'Vardiya sonu raporunu birden çok alıcıya e-postayla gönderir',
      ],
    },
    en: {
      tagline: 'A desktop app that builds recurring Excel reports from WMS exports in one click.',
      problem:
        'Shift reports are prepared daily by hand-adding formula columns, lookups and rules to WMS exports. With no database or API access, automation is hard.',
      solution: [
        'Recognises open WMS reports from one-time definitions and catches format changes',
        'Builds the report automatically from a saved scenario with "Create report"',
        'Daily archive, historical reporting and previous-shift comparison',
        'Emails the end-of-shift report to multiple recipients',
      ],
    },
  },
  {
    slug: 'mal-kabul-rezervasyon',
    name: 'Mal Kabul Rezervasyon',
    category: 'operasyon',
    hosting: 'vps',
    tech: ['Web uygulaması'],
    tr: {
      tagline: 'Depo mal kabul randevuları ve kapasite yönetimi sistemi.',
      problem: 'Araç gelişleri planlanmadığında mal kabul rampalarında yığılma ve bekleme oluşur.',
      solution: ['Tedarikçi randevu talepleri', 'Rampa ve kapasite planlama', 'Günlük kabul görünümü'],
    },
    en: {
      tagline: 'Goods-receipt appointment and capacity management for warehouses.',
      problem: 'When truck arrivals are not planned, receiving docks get congested and trucks wait.',
      solution: ['Supplier appointment requests', 'Dock and capacity planning', 'Daily receiving view'],
    },
  },
  {
    slug: 'toplama-rotasi-secimi',
    name: 'Toplama Rotası Seçimi',
    category: 'operasyon',
    hosting: 'static',
    tech: ['Python', 'JavaScript'],
    tr: {
      tagline: 'Gelen her sipariş partisi için en avantajlı toplama rotası algoritmasını seçen sistem.',
      problem: 'Tek bir toplama yöntemi her sipariş profiline uymaz; partiye göre en iyi yöntem değişir.',
      solution: ['Partiyi birden çok rota algoritmasıyla hesaplar', 'Mesafe ve süreyi karşılaştırır', 'En avantajlı yöntemi seçer'],
    },
    en: {
      tagline: 'Picks the most efficient order-picking routing algorithm for each incoming batch.',
      problem: 'No single picking method fits every order profile; the best method changes per batch.',
      solution: ['Runs the batch through several routing algorithms', 'Compares distance and time', 'Selects the best method'],
    },
  },
  {
    slug: 'video-zaman-etudu',
    name: 'Video Zaman Etüdü',
    category: 'operasyon',
    hosting: 'desktop',
    tech: ['C#', 'WPF'],
    tr: {
      tagline: 'Video üzerinden zaman etüdü yapan Windows uygulaması.',
      problem: 'Kronometreyle zaman etüdü yavaştır ve tekrar izlenemez.',
      solution: ['Video üzerinde adım işaretleme', 'Çevrim süresi analizi', 'Raporlama'],
    },
    en: {
      tagline: 'A Windows app for video-based time studies.',
      problem: 'Stopwatch time studies are slow and cannot be replayed.',
      solution: ['Mark steps on the video', 'Cycle-time analysis', 'Reporting'],
    },
  },
  {
    slug: 'durus-ergonomi-analizi',
    name: 'Duruş – Ergonomi Analizi',
    category: 'operasyon',
    hosting: 'vps',
    tech: ['Görüntü analizi'],
    tr: {
      tagline: 'Videodan çalışan duruşunu analiz eden ergonomi aracı.',
      problem: 'Ergonomi riskleri genelde gözle ve sonradan fark edilir.',
      solution: ['Videodan duruş tespiti', 'Riskli pozisyonların işaretlenmesi', 'Özet rapor'],
    },
    en: {
      tagline: 'An ergonomics tool that analyses worker posture from video.',
      problem: 'Ergonomic risks are usually spotted by eye, and late.',
      solution: ['Posture detection from video', 'Flags risky positions', 'Summary report'],
    },
  },
  {
    slug: 'destek-merkezi',
    name: 'Destek Merkezi',
    category: 'operasyon',
    hosting: 'vps',
    tech: ['Node.js', 'Access istemcisi'],
    tr: {
      tagline: 'Departmanlar arası işgücü desteğini kaydeden ve adam-saat verimliliğini gösteren sistem.',
      problem: 'Departmanlar arası personel desteği kayıt dışı kalınca adam-saat ve verimlilik hesapları bozulur.',
      solution: ['Destek kayıtları ve geri alma', 'Uyumsuz kayıtların takibi', 'Verimlilik ve adam-saat paneli'],
    },
    en: {
      tagline: 'Tracks inter-department workforce support and shows man-hour productivity.',
      problem: 'When staff support between departments goes unrecorded, man-hour and productivity figures break.',
      solution: ['Support records with withdrawal', 'Mismatch tracking', 'Productivity and man-hour dashboard'],
    },
  },
  {
    slug: 'ivme-oneri-kaizen',
    name: 'İvme – Öneri ve Kaizen Merkezi',
    category: 'operasyon',
    hosting: 'vps',
    tech: ['Web uygulaması'],
    tr: {
      tagline: 'Çalışan önerilerini ve kaizen çalışmalarını toplayan, değerlendiren sistem.',
      problem: 'Öneriler kâğıtta veya e-postada kaybolur; değerlendirme süreci görünmez kalır.',
      solution: ['Çalışan ve değerlendirici rolleri', 'Öneri yaşam döngüsü takibi', 'Kaizen kayıtları'],
    },
    en: {
      tagline: 'Collects and evaluates employee suggestions and kaizen work.',
      problem: 'Suggestions get lost on paper or in email, and evaluation stays invisible.',
      solution: ['Employee and evaluator roles', 'Suggestion lifecycle tracking', 'Kaizen records'],
    },
  },

  // ── İş ve ekip ───────────────────────────────────────────────────
  {
    slug: 'pusula',
    name: 'Pusula',
    category: 'ekip',
    featured: true,
    hosting: 'vps',
    url: 'https://pusula.ysfdurak.com/',
    repo: GH + 'pusula-is-takip',
    tech: ['React', 'MCP'],
    tr: {
      tagline: 'Türkçe iş ve ekip takip uygulaması; web arayüzü ve MCP ile yapay zekâdan da kullanılabilir.',
      problem: 'Küçük ekipler için kurulan görev takip araçları ya çok karmaşık ya da Türkçe kullanıma uygun değil.',
      solution: [
        'Görev, ekip ve durum takibi',
        'Atama, durum değişikliği ve yorumlarda e-posta bildirimi',
        'Google ve Microsoft girişi',
        'Aynı çekirdek üzerinde MCP sunucusu: görevler yapay zekâ asistanından yönetilebilir',
      ],
    },
    en: {
      tagline: 'A Turkish work and team tracker, usable from the web and from AI assistants via MCP.',
      problem: 'Task trackers for small teams are either too complex or not suited to Turkish-speaking teams.',
      solution: [
        'Task, team and status tracking',
        'Email notifications on assignment, status changes and comments',
        'Google and Microsoft sign-in',
        'MCP server on the same core: manage tasks from an AI assistant',
      ],
    },
  },
  {
    slug: 'isbasi-simulasyonu',
    name: 'İşbaşı Simülasyonu',
    category: 'ekip',
    hosting: 'static',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Stajyerler ve ilk işine başlayanlar için iş hayatı simülasyonu.',
      problem: 'İlk işe başlayanlar gerçek iş durumlarıyla ilk kez işte karşılaşır.',
      solution: ['Senaryo tabanlı görevler', 'Kararlara göre geri bildirim', 'Gerçekçi şirket ortamı'],
    },
    en: {
      tagline: 'A workplace simulation for interns and first-job starters.',
      problem: 'New starters meet real work situations for the first time on the job.',
      solution: ['Scenario-based tasks', 'Feedback on decisions', 'A realistic company setting'],
    },
  },
  {
    slug: 'aday-atolyesi',
    name: 'Aday Atölyesi',
    category: 'ekip',
    hosting: 'static',
    repo: GH + 'aday_atolyesi',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'İş adaylarının başvuru hazırlığına yardımcı olan çalışma alanı.',
      problem: 'Adaylar başvuru materyallerini dağınık araçlarla hazırlıyor.',
      solution: ['Başvuru hazırlık adımları', 'Tek yerde çalışma alanı'],
    },
    en: {
      tagline: 'A workspace that helps job candidates prepare applications.',
      problem: 'Candidates prepare application materials across scattered tools.',
      solution: ['Application preparation steps', 'One workspace'],
    },
  },

  // ── Veri ve raporlama ────────────────────────────────────────────
  {
    slug: 'pit-duvari',
    name: 'Pit Duvarı',
    category: 'veri',
    hosting: 'vps',
    tech: ['Python', 'FastF1', 'Streamlit'],
    tr: {
      tagline: 'FastF1 verisiyle Formula 1 pist, lastik-strateji ve sıralama analizi.',
      problem: 'Yarış verisi zengin ama görselleştirilmeden anlam çıkarmak zor.',
      solution: ['Pist analizi', 'Lastik ve strateji analizi', 'İki pilot sıralama karşılaştırması'],
    },
    en: {
      tagline: 'Formula 1 track, tyre-strategy and qualifying analysis with FastF1 data.',
      problem: 'Race data is rich but hard to read without visualisation.',
      solution: ['Track analysis', 'Tyre and strategy analysis', 'Two-driver qualifying comparison'],
    },
  },
  {
    slug: 'butce-sapma-otomasyonu',
    name: 'Bütçe Sapma Raporlama Otomasyonu',
    category: 'veri',
    hosting: 'repo',
    repo: GH + 'butce-sapmasi-rapor-otomasyonu',
    tech: ['Python', 'Excel VBA'],
    tr: {
      tagline: 'Bütçe sapması ve ay sonu kapanış raporlamasını otomatikleştiren araç.',
      problem: 'Ay sonu bütçe-gerçekleşen karşılaştırması elle hazırlanınca uzun sürer ve hataya açıktır.',
      solution: ['Python ve Excel VBA sürümleri', 'Sapma hesapları ve raporu', 'Tekrarlanabilir kapanış akışı'],
    },
    en: {
      tagline: 'Automates budget-variance and month-end closing reports.',
      problem: 'Month-end budget vs actual reports take long and are error-prone when built by hand.',
      solution: ['Python and Excel VBA versions', 'Variance calculations and report', 'Repeatable closing flow'],
    },
  },
  {
    slug: 'olcu-elegi',
    name: 'Ölçü Eleği',
    category: 'veri',
    hosting: 'static',
    tech: ['Power BI', 'Tarayıcı uygulaması'],
    tr: {
      tagline: 'Power BI modellerindeki kullanılmayan ölçüleri bulup temizlemeye yardım eder.',
      problem: 'Büyüyen Power BI modellerinde kimsenin kullanmadığı ölçüler birikir ve bakımı zorlaştırır.',
      solution: ['Modeldeki ölçüleri tarar', 'Kullanılmayanları listeler', 'Temizlik için öneri sunar'],
    },
    en: {
      tagline: 'Finds unused measures in Power BI models so they can be removed.',
      problem: 'Growing Power BI models collect measures nobody uses, making maintenance harder.',
      solution: ['Scans model measures', 'Lists unused ones', 'Suggests cleanup'],
    },
  },
  {
    slug: 'otopano',
    name: 'Otopano',
    category: 'veri',
    hosting: 'static',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Verilen veriden hazır dashboard ve grafikler oluşturur.',
      problem: 'Basit bir veri seti için bile dashboard kurmak zaman alır.',
      solution: ['Veriyi yükle', 'Uygun grafikleri otomatik öner', 'Hazır pano'],
    },
    en: {
      tagline: 'Builds ready-made dashboards and charts from your data.',
      problem: 'Even a simple dataset takes time to turn into a dashboard.',
      solution: ['Load data', 'Suggests suitable charts automatically', 'A ready dashboard'],
    },
  },
  {
    slug: 'ortu-veri-maskeleme',
    name: 'Örtü – Veri Maskeleme',
    category: 'veri',
    hosting: 'static',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Veriyi yapay zekâya göndermeden önce maskeler, sonra isteğe bağlı geri açar.',
      problem: 'Şirket verisini yapay zekâ araçlarına olduğu gibi göndermek risklidir.',
      solution: ['Hassas alanları maskeler', 'Sonucu geri çözer', 'Veri tarayıcıdan çıkmaz'],
    },
    en: {
      tagline: 'Masks data before sending it to AI and can restore it afterwards.',
      problem: 'Sending company data to AI tools as-is is risky.',
      solution: ['Masks sensitive fields', 'Restores the result', 'Data never leaves the browser'],
    },
  },
  {
    slug: 'sunum-atolyesi',
    name: 'Sunum Atölyesi',
    category: 'veri',
    hosting: 'static',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Elindeki Excel veya Word dosyasından sunum hazırlar.',
      problem: 'Rapordan sunuma geçiş çoğu zaman kopyala-yapıştırla saatler alır.',
      solution: ['Excel/Word dosyasını okur', 'Slayt yapısını kurar', 'Düzenlenebilir sunum'],
    },
    en: {
      tagline: 'Builds a presentation from an Excel or Word file.',
      problem: 'Turning a report into slides often takes hours of copy and paste.',
      solution: ['Reads the Excel/Word file', 'Builds the slide structure', 'Editable presentation'],
    },
  },

  // ── Öğrenme ──────────────────────────────────────────────────────
  {
    slug: 'kesit',
    name: 'Kesit (SQL, Power BI, Python, İstatistik)',
    category: 'ogrenme',
    hosting: 'external',
    url: 'https://ysfdurak.github.io/',
    repo: GH + 'kesit-istatistik',
    tech: ['SQL', 'Power BI', 'Python', 'İstatistik'],
    tr: {
      tagline: 'SQL, Power BI, Python ve istatistiği uygulamalı öğreten uygulama paketi.',
      problem: 'Veri becerileri pratik yapılmadan oturmaz; kurulum gerektirmeyen bir çalışma alanı gerekir.',
      solution: ['Tarayıcıda çalışan alıştırmalar', 'Kendi veri setleri', 'Konu konu ilerleme'],
    },
    en: {
      tagline: 'A suite that teaches SQL, Power BI, Python and statistics hands-on.',
      problem: 'Data skills only stick with practice, and learners need a workspace with no setup.',
      solution: ['Exercises that run in the browser', 'Built-in datasets', 'Topic-by-topic progress'],
    },
  },
  {
    slug: 'ingilizce-atolyesi',
    name: 'İngilizce Atölyesi',
    category: 'ogrenme',
    hosting: 'static',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Kelime ve kullanım odaklı İngilizce öğrenme uygulaması.',
      problem: 'Kelime ezberi bağlam olmadan kalıcı olmuyor.',
      solution: ['Bağlam içinde kelime çalışması', 'Tekrar sistemi', 'İlerleme takibi'],
    },
    en: {
      tagline: 'An English learning app focused on vocabulary and usage.',
      problem: 'Vocabulary does not stick without context.',
      solution: ['Vocabulary in context', 'Spaced review', 'Progress tracking'],
    },
  },
  {
    slug: 'unite-atolyesi',
    name: 'Ünite Atölyesi',
    category: 'ogrenme',
    hosting: 'static',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Ünite notlarından çalışma materyali ve deneme üreten çalışma uygulaması.',
      problem: 'Notlardan soru ve özet çıkarmak öğrencinin zamanını alır.',
      solution: ['Ünite bazlı çalışma', 'Deneme soruları', 'Özetler'],
    },
    en: {
      tagline: 'A study app that turns unit notes into study material and practice tests.',
      problem: 'Turning notes into questions and summaries eats study time.',
      solution: ['Unit-based study', 'Practice questions', 'Summaries'],
    },
  },
  {
    slug: 'kivilcim',
    name: 'Kıvılcım',
    category: 'ogrenme',
    hosting: 'static',
    repo: GH + 'kivilcim-zihin-oyunlari',
    tech: ['Tarayıcı uygulaması'],
    tr: {
      tagline: 'Seviyeli zihin oyunları uygulaması.',
      problem: 'Kısa ve düzenli zihin egzersizleri için sade bir araç az.',
      solution: ['Farklı oyun türleri', 'Seviye sistemi', 'Tarayıcıda, kurulumsuz'],
    },
    en: {
      tagline: 'A levelled mind-games app.',
      problem: 'There are few simple tools for short, regular brain exercises.',
      solution: ['Several game types', 'Levelling system', 'In the browser, no install'],
    },
  },
];

export const featured = () => PROJECTS.filter((p) => p.featured);
export const byCategory = (c: Category) => PROJECTS.filter((p) => p.category === c);
export const projectPath = (p: Project, lang: Lang) =>
  lang === 'tr' ? `/tr/projeler/${p.slug}/` : `/en/projects/${p.slug}/`;
