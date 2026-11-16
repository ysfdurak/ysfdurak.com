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
  /** İngilizce arayüzle çekilmiş görüntü (EN sayfada gösterilir). Yoksa src kullanılır. */
  srcEn?: string;
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
  /** İngilizce sayfada "Dene" düğmesinin gideceği ayrı canlı adres (ör. İngilizce örnek verili demo). Yoksa url kullanılır. */
  urlEn?: string;
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
  /** İngilizce paylaşım görseli (EN sayfada). Yoksa og kullanılır. */
  ogEn?: string;
  /** Projenin MCP adresi varsa "Claude'a bağla" bölümü gösterilir. */
  mcp?: { url: string; tools: number; prompts: { tr: string[]; en: string[] } };
  /** Ziyaretçi demosu varsa kısa açıklaması. */
  demo?: { tr: string; en: string };
  /** İndirilebilir masaüstü sürümü varsa "Windows için indir" düğmesi gösterilir. */
  download?: string;
  /** Uygulama TR/EN destekliyorsa "Dene" bağlantısına sayfanın dili ?lang=tr|en olarak eklenir. */
  langParam?: boolean;
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
  desktop: { tr: 'Tarayıcı + Windows masaüstü', en: 'Browser + Windows desktop' },
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
    featured: true,
    hosting: 'desktop',
    url: 'https://zaman-etudu.ysfdurak.com/',
    langParam: true,
    repo: GH + 'video-zaman-etudu',
    download: GH + 'video-zaman-etudu/releases/latest',
    tech: ['JavaScript', 'IndexedDB', 'C#', 'WPF', '.NET 8', 'SQLite', 'Excel (OpenXML)', 'Cloudflare Workers', 'GitHub Actions'],
    shots: [
      { src: '/img/video-zaman-etudu/olcum.webp', srcEn: '/img/video-zaman-etudu/olcum-en.webp', w: 1440, h: 900, alt: { tr: 'Video ve ölçüm ekranı: ölçüm video zamanından alınır, her Ölç bir sonraki adımın başlangıcı olur', en: 'Video and measurement screen: times come from the video position, each Measure starts the next step' } },
      { src: '/img/video-zaman-etudu/analiz.webp', srcEn: '/img/video-zaman-etudu/analiz-en.webp', w: 1440, h: 900, alt: { tr: 'Analiz: adım bazında gözlem yeterliliği, baz, normal ve standart süre, çevrimlerin geçen süresi ve iş yükü', en: 'Analysis: per-step sample sufficiency, base, normal and standard time, cycle elapsed time and workload' } },
      { src: '/img/video-zaman-etudu/calismalar.webp', srcEn: '/img/video-zaman-etudu/calismalar-en.webp', w: 1440, h: 900, alt: { tr: 'Çalışmalar: etütler tarayıcıda saklanır; .vzetud paketiyle içe ve dışa aktarılır', en: 'Studies: kept in the browser; imported and exported as .vzetud packages' } },
    ],
    og: '/img/video-zaman-etudu/og.jpg',
    ogEn: '/img/video-zaman-etudu/og-en.jpg',
    demo: {
      tr: 'Hesap ve kurulum gerekmez. Uygulamayı açıp “Demo etüdü aç” bağlantısına tıklayın: üç çevrimlik sentetik depo videosu ve hazır ölçümler yüklenir, analiz ekranında sonuçlar görünür. Kendi videonuzla yeni etüt de başlatabilirsiniz; etütler yalnızca tarayıcınızda saklanır, video hiçbir sunucuya yüklenmez. Windows sürümü aynı etüt paketini (.vzetud) açar.',
      en: 'No account or install needed. The app opens in English from this page: click “Open demo study” and a three-cycle synthetic warehouse video with ready measurements loads; the analysis screen shows the results. You can also start a study with your own video; studies stay in your browser and the video is never uploaded. The Windows version (Turkish interface) opens the same study packages (.vzetud).',
    },
    tr: {
      tagline: 'Videodan iş adımlarını ölçen, standart süreyi hesaplayan ve Excel’e aktaran zaman etüdü aracı. Tarayıcıda ve Windows’ta çalışır.',
      problem:
        'Kronometreyle yapılan zaman etüdünde kaçan bir an tekrar izlenemez; paralel işler ve beklemeler ayrıştırılamaz, kaç gözlemin yeterli olduğu çoğu zaman tahminle söylenir. Sonuçlar elle Excel’e geçirilirken hata da eklenir.',
      solution: [
        'Ölçüm video zamanından alınır: Başla → Ölç → Ölç. Duraklatma ve yavaş oynatma süreyi bozmaz; adım sınırı kare kare ince konumlamayla bulunur',
        'Adımlar VA / SVA / NVA olarak sınıflanır; beklemeler “kapsam dışı” işaretlenir, ham listede kalır ama hesaba girmez',
        'Student-t ile adım bazında gözlem yeterliliği (varsayılan %95 güven, ±%5 hata); baz süre ortalamadan veya en sık tekrar eden süreden',
        'Tempo ve toleransla normal ve standart süre; her N çevrimde bir yapılan işlerin çevrime katkısı',
        'Paralel işlerde çevrimin geçen süresi ile toplam iş yükü ayrı hesaplanır',
        'Beş sayfalık Excel raporu ve etüdü başka bilgisayara taşıyan .vzetud paketi; video ve klasör yolu paylaşılmaz',
        'İki sürüm, tek kural seti: sunucusuz tarayıcı sürümü ve Windows masaüstü. Ortak test dosyası (61 hesap örneği, 86 paket senaryosu) her gönderimde iki sürümün aynı sonucu verdiğini doğrular',
        'Tarayıcı sürümü Türkçe ve İngilizce; Excel raporu da seçilen dilde üretilir',
      ],
    },
    en: {
      tagline: 'A time-study tool that measures work steps from video, calculates standard time and exports to Excel. Runs in the browser and on Windows.',
      problem:
        'In stopwatch time studies a missed moment cannot be replayed, parallel work and waiting cannot be separated, and whether there are enough observations is usually a guess. Copying results into Excel by hand adds errors.',
      solution: [
        'Times come from the video position: Start → Measure → Measure. Pausing and slow playback do not distort durations; step boundaries are found with frame-level nudging',
        'Steps are classified VA / SVA / NVA; waiting is marked “out of scope”, kept in the raw list but excluded from calculations',
        'Per-step sample sufficiency with Student-t (default 95% confidence, ±5% error); base time from the mean or the most frequent duration',
        'Normal and standard time with pace rating and allowance; contribution of tasks done once every N cycles',
        'For parallel work, a cycle’s elapsed time and total workload are calculated separately',
        'Five-sheet Excel report and a .vzetud package to move a study to another computer; the video and folder paths are never shared',
        'Two versions, one rule set: a serverless browser version and a Windows desktop app. A shared test file (61 calculation cases, 86 package scenarios) checks on every push that both give the same results',
        'The browser version is in English and Turkish; the Excel report follows the chosen language',
      ],
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
    urlEn: 'https://ivme-en.ysfdurak.com/',
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
      en: 'Pick a role (employee, reviewer, manager, HR or admin) and enter without a password. A sample company with 120 suggestions in English is loaded and you can change anything. Data resets nightly and no email is sent.',
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
    hosting: 'vps',
    url: 'https://aday.ysfdurak.com/',
    repo: GH + 'aday_atolyesi',
    tech: ['JavaScript', 'Cloudflare Workers', 'D1 (SQLite)', 'R2'],
    og: '/img/aday-atolyesi/og.jpg',
    shots: [
      { src: '/img/aday-atolyesi/vaka-calismasi.webp', w: 1440, h: 900, alt: { tr: 'Vaka çalışması: solda kurgusal şirket belgeleri, sağda çıktı bazında cevap alanları, kelime sayacı ve süre tutucu', en: 'Case exercise: fictional company documents on the left, answer fields per output on the right with word count and timer' } },
      { src: '/img/aday-atolyesi/hazirlik-plani.webp', w: 1440, h: 900, alt: { tr: 'Hazırlık planı: hedef pozisyona göre bugün yapılacak tek adım ve günün bütün adımları', en: 'Preparation plan: the one next step for today and the full day plan for the target role' } },
      { src: '/img/aday-atolyesi/olcutlu-degerlendirme.webp', w: 1440, h: 900, alt: { tr: 'İK değerlendirme formu: her ölçüt için 0–3 seviye ve seviye tanımı', en: 'HR review form: a 0–3 level per criterion with the level description' } },
      { src: '/img/aday-atolyesi/giris.webp', w: 1440, h: 900, alt: { tr: 'Canlı demo girişi: aday, İK değerlendiricisi ya da pilot yöneticisi olarak şifresiz deneme', en: 'Live demo sign-in: try as candidate, HR reviewer or pilot admin, no password' } },
    ],
    demo: {
      tr: 'Hesap ve ayarlar → Giriş yap ile bir rol seç (aday, İK değerlendiricisi ya da pilot yöneticisi), şifre yok. Örnek teslimler yüklü; aday olarak dosya teslim edebilir, değerlendirici olarak ölçütlü geri bildirim yazabilirsin. Gerçek kişisel bilgi içeren dosya yükleme: dosyalar ortak değerlendirici hesabında görünür ve her gece silinir.',
      en: 'Go to Account and settings → Sign in and pick a role (candidate, HR reviewer or pilot admin), no password. Sample submissions are loaded: submit a file as a candidate or write criteria-based feedback as a reviewer. Do not upload files with real personal data: files are visible to the shared reviewer account and are deleted every night.',
    },
    tr: {
      tagline: 'İş adaylarının hedef pozisyona göre sınav, vaka ve mülakata hazırlandığı; İK’nın teslimleri ölçütle değerlendirdiği çalışma alanı.',
      problem:
        'Adaylar sınav pratiği, vaka çalışması ve mülakat hazırlığını dağınık kaynaklarla yapıyor; geri bildirim ya hiç gelmiyor ya da “iyi/kötü” düzeyinde kalıyor. İK tarafında vaka teslimleri e-postayla dolaşıyor, değerlendirme kişiden kişiye değişiyor ve kimin dosyasının ne kadar beklediği görünmüyor.',
      solution: [
        'Hedef pozisyon ve tarihe göre günlük hazırlık planı; her gün tek bir sonraki adım',
        'Üç atölye: sayısal/sözel/şekil sınav pratiği, mizaç tercihleri (üç kısa oturum) ve role özgü karar soruları',
        'Kurgusal şirket vakaları: belgeler ve cevaplar yan yana, Word/Excel çalışma dosyaları, referans çözümle karşılaştırma',
        'Deneyim örnekleri, mülakat dosyası ve prova; CV ile ilan karşılaştırması',
        'İK değerlendirmesi: her ölçüt için 0–3 seviye, çıktı bazında dayanaklı not; seviyeler tek puana dönüştürülmez',
        'Teslim dosyası ekranda açılır; kör değerlendirme, bekleme süresi ve hedef süre uyarısı, toplu atama',
        'Yapay zekâ çağrısı yok; çalışmalar tarayıcıda, istenirse hesaba otomatik kaydedilir',
      ],
    },
    en: {
      tagline: 'A workspace where job candidates prepare for tests, case exercises and interviews for a target role, and HR reviews submissions against criteria.',
      problem:
        'Candidates prepare for aptitude tests, case exercises and interviews with scattered resources, and feedback either never comes or stops at “good/bad”. On the HR side, case submissions circulate by email, reviews vary from person to person and nobody sees how long a file has been waiting.',
      solution: [
        'Daily preparation plan based on the target role and date, with one clear next step each day',
        'Three workshops: numerical/verbal/abstract test practice, work-style preferences (three short sessions) and role-specific decision questions',
        'Fictional company cases: documents and answers side by side, Word/Excel working files, comparison with a reference solution',
        'Experience examples, interview file and rehearsal; CV vs. job posting comparison',
        'HR review: a 0–3 level per criterion and evidence-based notes per output; levels are never turned into a single score',
        'Submissions open on screen; blind review, waiting time and target-time alerts, bulk assignment',
        'No AI calls; work stays in the browser and can be saved to an account automatically',
      ],
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
    tech: ['JavaScript', 'SQLite (sql.js)', 'Pyodide', 'DAX benzetim motoru', 'PWA'],
    og: '/img/kesit/og.jpg',
    shots: [
      { src: '/img/kesit/sql-alistirma.webp', w: 1280, h: 800, alt: { tr: 'Kesit SQL: tarayıcıdaki veritabanında yazılan sorgu anında denetlenir; görev, örnek tablo ve sonuç yan yana', en: 'Kesit SQL: a query written against the in-browser database is checked instantly; task, sample table and result side by side' } },
      { src: '/img/kesit/powerbi-rapor.webp', w: 1280, h: 760, alt: { tr: 'Kesit Power BI: adım adım anlatılan örnek finansal performans raporu, yer işaretleri ve alan parametreleriyle', en: 'Kesit Power BI: a sample financial performance report explained step by step, with bookmarks and field parameters' } },
      { src: '/img/kesit/python-kod.webp', w: 1280, h: 800, alt: { tr: 'Kesit Python: tarayıcıda çalışan gerçek Python ile kod editörü ve çıktı', en: 'Kesit Python: code editor and output running real Python in the browser' } },
      { src: '/img/kesit/istatistik-vaka.webp', w: 1366, h: 860, alt: { tr: 'Kesit İstatistik: ortak kurgusal veriyle vaka; sonucu okuma ve iş kararına çevirme adımları', en: 'Kesit Statistics: a case on the shared fictional data; reading the result and turning it into a business decision' } },
    ],
    demo: {
      tr: 'Hesap ve kurulum yok: Kesit sayfasından bir uygulama seç, seviye testini çöz ya da rolüne uygun öğrenme yolundan başla. İlerleme yalnızca tarayıcında saklanır, Profil’den dosyaya yedeklenip başka cihazda yüklenebilir; site bir kez açıldıktan sonra internetsiz de çalışır.',
      en: 'No account or setup: pick an app on the Kesit page, take the placement test or start the learning path for your role. Progress stays in your browser and can be backed up to a file and loaded on another device; after the first visit the apps also work offline. The interface is in Turkish.',
    },
    tr: {
      tagline: 'Veri işinin dört temel becerisini (SQL, Power BI, Python, istatistik) Türkçe ve yaparak öğreten, tarayıcıda çalışan eğitim paketi.',
      problem:
        'Veri alanına geçmek isteyenler araçları dağınık, çoğu İngilizce kaynaklardan öğreniyor; kurulum ve hesap engeline takılıyor, yazdıkları kodun doğru olup olmadığını göremiyor. Dört aracı aynı iş senaryosu üzerinde birbirine bağlayan bir çalışma alanı da yok.',
      solution: [
        'Kesit SQL: 295 ders ve 1.944 alıştırma; tarayıcıda çalışan veritabanı, altı SQL türünün yazımı (SQL Server, PostgreSQL, MySQL, Oracle, BigQuery, SQLite), SQL Arena ve dedektif vakaları',
        'Kesit Power BI: 150 ders ve 1.250 alıştırma; DAX’ı benzeten 206 fonksiyonlu motor, adım adım anlatılan 24 örnek rapor, PL-300 ve DP-600 hazırlığı',
        'Kesit Python: 156 ders ve 3.240 alıştırma; tarayıcıda gerçek Python (Pyodide), otomasyondan makine öğrenmesine ve LLM uygulamalarına, 250 Arena problemi',
        'Kesit İstatistik: 30 modülde 120 ders; formülden önce veri, sonucu iş kararına çevirme, her açılışta yeni sayı üreten alıştırma atölyesi',
        'Dört uygulamada ortak kurgusal veri setleri (Anadolu Market, Ilgaz Bank, Kanat Havayolları, Lezzet Kurye, Pusula İK, Pedal İzmir); aynı soru farklı araçlarla çözülür',
        'Role göre öğrenme yolları, seviye testi, aralıklı tekrar, sınavlar ve mülakat soruları',
        'Sunucu ve hesap yok: ilerleme tarayıcıda, dosyaya yedeklenir; çevrimdışı çalışır. Alıştırma çözümleri otomatik denetimlerle doğrulanır',
      ],
    },
    en: {
      tagline: 'A browser-based training suite that teaches the four core data skills (SQL, Power BI, Python, statistics) hands-on, in Turkish.',
      problem:
        'People moving into data roles learn the tools from scattered, mostly English sources, get stuck on setup and sign-ups, and cannot tell whether their code is right. There is also no workspace that ties the four tools together on the same business scenario.',
      solution: [
        'Kesit SQL: 295 lessons and 1,944 exercises; an in-browser database, six SQL dialects (SQL Server, PostgreSQL, MySQL, Oracle, BigQuery, SQLite), SQL Arena and detective cases',
        'Kesit Power BI: 150 lessons and 1,250 exercises; a DAX-emulating engine with 206 functions, 24 sample reports explained step by step, PL-300 and DP-600 prep',
        'Kesit Python: 156 lessons and 3,240 exercises; real Python in the browser (Pyodide), from automation to machine learning and LLM apps, 250 Arena problems',
        'Kesit Statistics: 120 lessons in 30 modules; data before formulas, turning results into business decisions, a practice workshop that generates new numbers each time',
        'Shared fictional datasets across all four apps (Anadolu Market, Ilgaz Bank, Kanat Airlines, Lezzet Kurye, Pusula HR, Pedal İzmir); the same question is solved with different tools',
        'Role-based learning paths, placement tests, spaced review, exams and interview questions',
        'No server or account: progress stays in the browser, backs up to a file and works offline. Exercise solutions are verified by automated checks',
      ],
    },
  },
  {
    slug: 'ingilizce-atolyesi',
    name: 'İngilizce Atölyesi',
    category: 'ogrenme',
    hosting: 'static',
    url: 'https://ingilizce-atolyesi.ysfdurak.com/',
    repo: GH + 'ingilizce-ogrenme-atolyesi',
    tech: ['HTML', 'CSS', 'JavaScript', 'PWA'],
    og: '/img/ingilizce-atolyesi/og.jpg',
    shots: [
      { src: '/img/ingilizce-atolyesi/bugunku-plan.webp', w: 1440, h: 900, alt: { tr: 'Bugün ekranı: seviyeye ve hedefe göre hazırlanan günlük plan, kelime dersi, ünite adımı ve sınav hazırlığı', en: 'Today screen: a daily plan built from level and goal, with a vocabulary lesson, a unit step and exam prep' } },
      { src: '/img/ingilizce-atolyesi/dilbilgisi-dersi.webp', w: 1440, h: 900, alt: { tr: 'Dilbilgisi dersi: Türkçe konu anlatımı, tablo ve sesli örnek cümleler', en: 'Grammar lesson: explanation in Turkish, a table and example sentences with audio' } },
      { src: '/img/ingilizce-atolyesi/aralikli-tekrar.webp', w: 1440, h: 900, alt: { tr: 'Tekrar ekranı: yanlış yapılan sorular ve öğrenilen kelimeler 10 dakika, 1, 3, 7 ve 21 gün sonra yeniden sorulur', en: 'Review screen: missed questions and learned words come back after 10 minutes, then 1, 3, 7 and 21 days' } },
      { src: '/img/ingilizce-atolyesi/kesfet.webp', w: 1440, h: 900, alt: { tr: 'Keşfet ekranı: kelimeler, kalıplar, kelime aileleri, deyimler, dilbilgisi ve sık hatalar', en: 'Explore screen: words, collocations, word families, idioms, grammar and common mistakes' } },
    ],
    demo: {
      tr: 'Hesap gerekmez: aç, bir dakikalık tanışmada hedefini (genel, sınav, iş, seyahat, okul), günlük süreni ve seviyeni seç; günlük plan hemen hazırlanır. İlerleme yalnızca tarayıcında saklanır, Profil’den dosyaya yedeklenebilir.',
      en: 'No account needed: open it, pick your goal (general, exam, work, travel, school), daily time and level in a one-minute intro, and the daily plan is ready. Progress stays in your browser and can be backed up to a file from Profile. The interface is in Turkish.',
    },
    tr: {
      tagline: 'Türkçe konuşanlar için A1–C2 İngilizce öğrenme ve YDS, e-YDS, YÖKDİL hazırlık uygulaması.',
      problem:
        'İngilizce öğrenenler seviyelerine uygun içeriği dağınık kaynaklarda arıyor, kelimeleri bağlamsız ezberleyip unutuyor ve ilerlemelerini göremiyor. Hataların neden yapıldığı da çoğu zaman Türkçe açıklanmıyor.',
      solution: [
        'Hedefe, günlük süreye ve seviyeye göre her gün hazırlanan kısa plan; tek düğmeyle derse başlama',
        'A1–C2 müfredatı: 75 tema ünitesi ve 193 dilbilgisi konusu, Türkçe konu anlatımı ve alıştırmalar',
        '15.000’den fazla kelime ve kalıp; 155 hikâye, 175 diyalog ve dinleme etkinlikleri ile bağlam içinde çalışma',
        'Aralıklı tekrar: yanlışlar ve öğrenilen kelimeler 10 dakika, 1, 3, 7 ve 21 gün sonra yeniden sorulur',
        'Türklerin en sık yaptığı hatalar, deyimler ve kelime aileleri için ayrı bölümler',
        'YDS, e-YDS ve YÖKDİL için özgün denemeler ve 4.702 kayıtlı sınav sözlüğü',
        'Hesap ve sunucu yok: ilerleme tarayıcıda saklanır, dosyaya yedeklenir; telefona uygulama gibi kurulabilir (PWA)',
      ],
    },
    en: {
      tagline: 'An A1–C2 English learning and YDS, e-YDS, YÖKDİL exam prep app for Turkish speakers.',
      problem:
        'English learners hunt for level-appropriate material across scattered sources, memorise words without context and forget them, and cannot see their progress. Why a mistake was made is rarely explained in Turkish.',
      solution: [
        'A short plan built each day from goal, daily time and level; start the lesson with one button',
        'A1–C2 curriculum: 75 themed units and 193 grammar topics, explained in Turkish with exercises',
        'Over 15,000 words and collocations; learning in context with 155 stories, 175 dialogues and listening activities',
        'Spaced review: mistakes and learned words return after 10 minutes, then 1, 3, 7 and 21 days',
        'Separate sections for the mistakes Turkish speakers make most, idioms and word families',
        'Original practice tests for YDS, e-YDS and YÖKDİL, plus a 4,702-entry exam glossary',
        'No account or server: progress stays in the browser and backs up to a file; installable on a phone (PWA)',
      ],
    },
  },
];

export const featured = () => PROJECTS.filter((p) => p.featured);
export const byCategory = (c: Category) => PROJECTS.filter((p) => p.category === c);
export const projectPath = (p: Project, lang: Lang) =>
  lang === 'tr' ? `/tr/projeler/${p.slug}/` : `/en/projects/${p.slug}/`;
