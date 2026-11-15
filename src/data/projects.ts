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
  /** Birden çok depo varsa (ör. Kesit paketi): her biri ayrı "Kaynak kod · <ad>" düğmesi olur. */
  repos?: { label: string; url: string }[];
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
    url: 'https://destek.ysfdurak.com/',
    repo: GH + 'destek-merkezi',
    tech: ['React', 'Node.js', 'SQLite', 'Excel (SheetJS)', 'Access istemcisi', 'Docker', 'Caddy'],
    shots: [
      { src: '/img/destek-merkezi/genel-bakis.webp', w: 1400, h: 950, alt: { tr: 'Destek Merkezi genel bakış: kesinleşen ve onay bekleyen destekler, bölümler arası dağılım', en: 'Destek Merkezi overview: finalised and pending supports, distribution between departments' } },
      { src: '/img/destek-merkezi/dashboard.webp', w: 1440, h: 1000, alt: { tr: 'Destek Merkezi dashboard: 50 bölümlük işletmede kim kime destek verdi, gün ve bölüm takvimi', en: 'Destek Merkezi dashboard: who supported whom and a day-by-department calendar for a 50-department site' } },
      { src: '/img/destek-merkezi/toplu-giris.webp', w: 1400, h: 950, alt: { tr: 'Toplu giriş: kişileri sabitle, birkaç günü vardiyayla tek seferde gir', en: 'Bulk entry: pin people and enter several days at once by shift' } },
      { src: '/img/destek-merkezi/hiyerarsi.webp', w: 1110, h: 1110, alt: { tr: 'Hiyerarşi tanımı: düzey adlarını ve derinliği işletme belirler', en: 'Hierarchy setup: the business names its own levels and depth' } },
    ],
    demo: {
      tr: 'Giriş gerekmez: kurgusal bir depo organizasyonuyla dolu, yalnızca sana ait bir alan açılır. Üstteki seçiciyle yönetici, bölüm yetkilisi ve izleyici rollerini deneyebilirsin. Alan son kullanımdan 3 gün sonra silinir.',
      en: 'No sign-in: you get your own workspace with a fictional warehouse organisation. Use the selector at the top to try the admin, department manager and viewer roles. It is deleted 3 days after last use.',
    },
    tr: {
      tagline: 'Bölümler arası işgücü desteğini kaydeden, karşı bölüme onaylatan ve puantajla karşılaştıran sistem.',
      problem:
        'Vardiyalı operasyonlarda bir bölüm diğerine personel verir; talep WhatsApp\'tan gelir, kayıt ertesi gün ya da sonraki hafta girilir. Kim kime ne kadar destek verdi belirsiz kalır, puantajla çelişen kayıtlar fark edilmez.',
      solution: [
        'Vardiyadan gelen sabit süreler, toplu ve geriye dönük giriş, aynı gün tekrar giriş engeli',
        'Karşı bölüm onayı, geri çekme ve puantajla çelişen desteklerin takibi',
        'İşletmenin belirlediği hiyerarşiye göre dashboard ve Excel/PDF raporları',
      ],
    },
    en: {
      tagline: 'Records inter-department workforce support, gets it approved by the receiving department and checks it against attendance.',
      problem:
        'In shift-based operations one department lends staff to another; the request comes over WhatsApp and the record is entered the next day or week. Who supported whom stays unclear and records that contradict attendance go unnoticed.',
      solution: [
        'Fixed durations from shifts, bulk and retroactive entry, same-day duplicate block',
        'Receiving-department approval, withdrawal and tracking of supports that contradict attendance',
        'Dashboard and Excel/PDF reports by the business\'s own hierarchy',
      ],
    },
  },
  {
    slug: 'ivme-oneri-kaizen',
    name: 'İvme – Öneri ve Kaizen Merkezi',
    category: 'operasyon',
    featured: true,
    hosting: 'vps',
    url: 'https://ivme.ysfdurak.com/',
    repo: GH + 'ivme-oneri-kaizen',
    tech: ['React', 'TypeScript', 'Cloudflare Workers', 'D1 (SQLite)', 'MCP'],
    og: '/img/ivme/og.jpg',
    shots: [
      { src: '/img/ivme/calisma-merkezi.webp', w: 1440, h: 900, alt: { tr: 'İvme çalışma merkezi: toplam öneri, beni bekleyenler, tamamlananlar, onaylı kazanç ve geciken işler', en: 'İvme work centre: total suggestions, items waiting on me, completed work, approved savings and overdue items' } },
      { src: '/img/ivme/durum-panosu.webp', w: 1440, h: 900, alt: { tr: 'Durum panosu: önerilerin aşamalara dağılımı ve en çok öneri bekleyen kişiler, gecikmelerle birlikte', en: 'Status board: suggestions by stage and the people with the most open items, with overdue counts' } },
      { src: '/img/ivme/oneri-detayi.webp', w: 1440, h: 900, alt: { tr: 'Öneri detayı: sıradaki adım, sorumlu, hedef süre, problem ve çözüm önerisi', en: 'Suggestion detail: next step, owner, target time, problem and proposed solution' } },
      { src: '/img/ivme/giris.webp', w: 1440, h: 900, alt: { tr: 'Canlı demo girişi: rol seçerek şifresiz deneme', en: 'Live demo sign-in: pick a role, no password' } },
    ],
    demo: {
      tr: 'Bir rol seç (çalışan, değerlendirici, müdür, İK ya da yönetici) ve şifresiz gir. Örnek bir şirketin 120 önerisi yüklü; her şeyi değiştirebilirsin. Veriler her gece sıfırlanır, kimseye e-posta gitmez.',
      en: 'Pick a role (employee, reviewer, manager, HR or admin) and enter without a password. A sample company with 120 suggestions is loaded and you can change anything. Data resets nightly and no email is sent.',
    },
    tr: {
      tagline: 'Çalışan önerisini değerlendirmeden aksiyona, kazanca, puana ve ödüle kadar tek akışta yöneten öneri sistemi.',
      problem:
        'Kâğıtta ya da e-posta zincirinde yürüyen öneri sistemlerinde öneri kaybolur, kimde beklediği bilinmez, kazanç ölçülmez, öneren geri bildirim alamaz. Bu yüzden katılım birkaç ayda söner.',
      solution: [
        'Uçtan uca akış: ön değerlendirme, bölüm değerlendirmesi, aksiyon, kazanç, müdür onayı, puanlama. Uygulanamayan öneri ayrı kapanır',
        'Her aşamanın sorumlusu ve hedef süresi var. Gecikmeler panoda görünür, değerlendiricilere günlük tek özet e-posta gider',
        'IT ve Teknik İşler gibi destek birimlerinde bekleyen işler talep numarasıyla izlenir. İş devri tek tek ya da toplu yapılır ve geri alınabilir',
        'Net kazanç (uygulama maliyeti düşülmüş), ağırlıklı puan kriterleri, puana göre otomatik ödül önerisi ve İK onayı',
        'Katılım istatistikleri ve yıl/ay filtreli rapor oluşturucu. Anonim öneri, kampanya, önce/sonra fotoğrafı, benzer öneri uyarısı',
        'Öneri sınıfları, nedenler, puan kriterleri ve hedef süreler Tanımlar ekranından değişir. Kullanıcılar ve eski öneriler Excel ile aktarılır, aktarım geri alınabilir',
        'İki sürüm, ortak çekirdek: yalnız süreç ya da kurum içi yapay zekâya bağlanan salt okuma MCP katmanı. Öneri içeriği dış yapay zekâya gitmez',
      ],
    },
    en: {
      tagline: 'A suggestion system that runs each employee idea through one workflow: review, action, savings, scoring and reward.',
      problem:
        'When suggestions run on paper or email threads they get lost: nobody knows who holds them, savings go unmeasured and the person who suggested never hears back. Participation fades within months.',
      solution: [
        'End-to-end workflow: screening, area review, action, savings, manager approval and scoring. Ideas that cannot be implemented close separately',
        'Every stage has an owner and a target time. Overdue work shows on the board, and reviewers get a single daily digest email',
        'Items waiting on support units such as IT or Maintenance are tracked with ticket numbers. Handovers work one by one or in bulk and can be undone',
        'Net savings (after implementation cost), weighted scoring criteria, automatic reward proposals by score and HR approval',
        'Participation statistics and a report builder with year/month filters. Anonymous ideas, campaigns, before/after photos, similar-idea warnings',
        'Categories, reasons, scoring criteria and target times are set in the admin screens. Users and past suggestions import from Excel, and imports can be undone',
        'Two editions on one core: process only, or with a read-only MCP layer for in-house AI. Suggestion content never goes to an external AI',
      ],
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
    repos: [
      { label: 'SQL', url: GH + 'kesit-sql' },
      { label: 'Power BI', url: GH + 'kesit-powerbi' },
      { label: 'Python', url: GH + 'kesit-python' },
      { label: 'İstatistik', url: GH + 'kesit-istatistik' },
    ],
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
    url: 'https://ysfdurak.github.io/ingilizce-ogrenme-atolyesi/',
    repo: GH + 'ingilizce-ogrenme-atolyesi',
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
