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

export interface Shot {
  src: string;
  w: number;
  h: number;
  alt: { tr: string; en: string };
}

export interface Project {
  slug: string;
  name: string;
  category: Category;
  featured?: boolean;
  hosting: Hosting;
  /** Canlı uygulama adresi. Boşsa "Dene" butonu "Canlı sürüm yakında" yazar. */
  url?: string;
  repo?: string;
  tech: string[];
  tr: ProjectText;
  en: ProjectText;
  /** Ekran görüntüleri (public/ altında). İlki sayfanın en üstünde büyük gösterilir. */
  shots?: Shot[];
  /** Paylaşım önizlemesi (1200x630). LinkedIn/WhatsApp'ta görünür. */
  og?: string;
  /** Projenin MCP adresi varsa "Claude'a bağla" bölümü gösterilir. */
  mcp?: { url: string; tools: number; prompts: { tr: string[]; en: string[] } };
  /** Ziyaretçi demosu varsa kısa açıklaması. */
  demo?: { tr: string; en: string };
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

// Sitede yalnızca tamamlanmış ve yayına hazır projeler durur.
// Pilotu süren ya da üzerinde çalışılan projeler (WDL, Sorter Studio, ShiftFlow, Mal Kabul,
// Toplama Rotası, İşbaşı, Pit Duvarı, Bütçe Sapma, Ölçü Eleği, Otopano, Örtü, Sunum Atölyesi,
// Ünite Atölyesi, Kıvılcım) 12 Kasım 2026'da çıkarıldı; eski metinleri 847188b commit'inde duruyor.
export const PROJECTS: Project[] = [
  // ── Operasyon ve depo ────────────────────────────────────────────
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
    featured: true,
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
    featured: true,
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
    tech: ['React', 'Node.js', 'SQLite', 'Google OAuth', 'MCP', 'MCP Apps', 'Docker', 'Caddy'],
    og: '/img/pusula/og.jpg',
    shots: [
      { src: '/img/pusula/ekip-panosu.webp', w: 1440, h: 900, alt: { tr: 'Pusula ekip panosu: açık, geciken, bugün teslim ve tamamlanan işler', en: 'Pusula team board: open, overdue, due today and completed tasks' } },
      { src: '/img/pusula/claude-panom.webp', w: 1392, h: 1100, alt: { tr: "Claude sohbetinin içinde açılan Pusula panosu: Başla, Tamamla ve Ayrıntı düğmeleri", en: 'Pusula board opened inside a Claude chat, with Start, Complete and Details buttons' } },
      { src: '/img/pusula/benim-panom.webp', w: 1440, h: 900, alt: { tr: 'Benim panom: kişinin bugünkü gündemi ve hızlı iş ekleme', en: 'My board: personal agenda for today and quick task entry' } },
    ],
    demo: {
      tr: 'Google hesabınla gir; sana ait, kurgusal bir depo ekibiyle dolu bir çalışma alanı açılır. Alan 7 gün sonra tümüyle silinir; gerçek kimseye e-posta gitmez.',
      en: 'Sign in with Google and you get your own workspace with a fictional warehouse team. It is deleted entirely after 7 days and no email is sent to anyone.',
    },
    mcp: {
      url: 'https://pusula.ysfdurak.com/mcp',
      tools: 13,
      prompts: {
        tr: ['Pusula\'da panomu göster', 'Bu hafta geciken işler neler?', "Yarın termin tarihli 'Rampa kapasitesi raporu' diye bir iş aç", 'Ekibin durumunu özetle'],
        en: ['Show my board in Pusula', 'Which tasks are overdue this week?', "Create a task 'Dock capacity report' due tomorrow", "Summarise the team's status"],
      },
    },
    tr: {
      tagline: 'Türkçe iş ve ekip takip uygulaması; web arayüzünden ve Claude sohbetinin içinden kullanılabilir.',
      problem:
        'Operasyon ekiplerinde işler e-posta, mesaj ve Excel arasında dağılır; kimin neyle meşgul olduğu ve neyin geciktiği görünmez. Hazır araçlar ise ya fazla karmaşık ya da Türkçe çalışan ekiplere uygun değil.',
      solution: [
        'Kişisel pano, ekip panosu ve iş listesi: geciken, bugün teslim ve açık işler tek bakışta',
        'Termin değişiklikleri korunur: ilk hedef tarih ve tüm revizyonlar görünür kalır',
        'Aynı çekirdek iki kapıdan çalışır: web arayüzü ve MCP sunucusu. Kurallar ve yetkiler ikisinde de aynıdır',
        "Claude'a bağlanınca 13 araçla iş açılır, durum değiştirilir; pano sohbetin içinde tıklanabilir arayüz olarak açılır",
        'Google ile giriş, OAuth 2.1 ile Claude yetkilendirmesi; üye yönetimi, silme ve ekler bilerek yapay zekâya açılmadı',
        'Ziyaretçilere kişiye özel, süreli demo alanı; kullanım ölçümü takma kimlikle ve içerik olmadan',
      ],
    },
    en: {
      tagline: 'A Turkish task and team tracker, usable from the web and from inside a Claude chat.',
      problem:
        "In operations teams, work is scattered across email, chat and Excel; nobody sees who is busy with what or what is running late. Off-the-shelf tools are either too complex or not suited to Turkish-speaking teams.",
      solution: [
        'Personal board, team board and task list: overdue, due-today and open work at a glance',
        'Deadline changes are kept: the original target date and every revision stay visible',
        'One core, two doors: the web UI and an MCP server share the same rules and permissions',
        'Connected to Claude, 13 tools create and update tasks, and the board opens as a clickable UI inside the chat',
        'Google sign-in and OAuth 2.1 for Claude; member management, deletion and attachments are deliberately not exposed to AI',
        'Visitors get a personal, time-limited demo workspace; usage is measured under a pseudonym and without content',
      ],
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


  // ── Öğrenme ──────────────────────────────────────────────────────
  {
    slug: 'kesit',
    name: 'Kesit (SQL, Power BI, Python, İstatistik)',
    category: 'ogrenme',
    featured: true,
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
];

export const featured = () => PROJECTS.filter((p) => p.featured);
export const byCategory = (c: Category) => PROJECTS.filter((p) => p.category === c);
export const projectPath = (p: Project, lang: Lang) =>
  lang === 'tr' ? `/tr/projeler/${p.slug}/` : `/en/projects/${p.slug}/`;
