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

/** Vaka sayfası: projenin sahadaki karşılığı. Her alan isteğe bağlı; boş olan bölüm sayfada görünmez. */
export interface CaseStudy {
  /** Benim rolüm ve yapım süreci: problemi kim tanımladı, kararları kim verdi, yapay zekâ neyi yaptı. */
  role?: string;
  /** Ölçülebilir sonuçlar (ör. { value: '5 dk', label: 'aylık rapor süresi (önce 2-3 saat)' }). */
  results?: { value: string; label: string }[];
  /** Gerçek geri bildirim → yapılan değişiklik. who: kim (ör. "Depo vardiya amiri"), when: "Kasım 2026". */
  feedback?: { said: string; done: string; who?: string; when?: string }[];
  /** Öğrendiklerim / bir dahakine farklı yapacaklarım. */
  lessons?: string[];
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
  /** "Dene" düğmesinin gideceği girişsiz deneme adresi (ör. tarayıcı demosu). Verilirse url ikinci düğme olur
   *  ("Sunucu sürümü"); hesapla giriş gerektiren canlı sürümün önüne girişsiz yol koymak için. */
  tryUrl?: string;
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
  /** Uygulama yalnızca Türkçe konuşanlar için (arayüz ve içerik Türkçe). EN sayfada etiket ve bu açıklama gösterilir. */
  turkishOnly?: { en: string };
  /** Sunucudaki sağlık adresi (ör. '/healthz'). Kesinti izleme bu adresi de kontrol eder. */
  health?: string;
  /** Kesinti izleme: canlı sayfanın <title> etiketinde aranacak metin (ör. 'Pusula'). Yanlış sayfaya
   *  yönlendirme ya da boş/hata sayfası 200 dönse bile yakalanır. url'i olan her projede zorunlu
   *  (PR kontrolü eksikse uyarır). */
  isaret?: string;
  /** Bu projeyle ilgili rehber yazıları (yalnız Türkçe sayfada gösterilir). */
  guides?: { title: string; url: string }[];
  /** Vaka sayfası bölümleri (rol, sonuçlar, geri bildirim → değişiklik, öğrendiklerim). */
  caseStudy?: { tr: CaseStudy; en: CaseStudy };
  /** Tasarım kararları ve nedenleri (sayfada ayrı bölüm). */
  decisions?: { tr: string[]; en: string[] };
  /** Kısa tanıtım videosu (altyazısı videoya işlenmiş). `lang` verilirse yalnız o dildeki sayfada gösterilir.
   *  srcEn/posterEn: İngilizce sayfada gösterilen İngilizce sürüm. loop: sayfanın üstünde ilk ekran görüntüsünün
   *  yerine kendiliğinden, sessiz ve döngüyle oynayan kısa video (hareket azaltma tercihinde oynamaz). */
  video?: {
    src: string;
    poster: string;
    srcEn?: string;
    posterEn?: string;
    w: number;
    h: number;
    lang?: Lang;
    caption: { tr: string; en: string };
    loop?: { src: string; poster: string; srcEn?: string; posterEn?: string; w: number; h: number; alt: { tr: string; en: string } };
  };
  /** Yöntem ve gizlilik sayfası (varsa demo bölümünde bağlantı gösterilir). */
  method?: { tr: string; en: string };
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
// Toplama Rotası, İşbaşı, Pit Duvarı, Bütçe Sapma, Ölçü Eleği, Otopano, Örtü (Sırdaş olarak 18 Kasım'da geri döndü), Sunum Atölyesi,
// Ünite Atölyesi, Kıvılcım) 12 Kasım 2026'da çıkarıldı; eski metinleri 847188b commit'inde duruyor.
export const PROJECTS: Project[] = [
  // ── Operasyon ve depo ────────────────────────────────────────────
  {
    slug: 'video-zaman-etudu',
    method: { tr: '/tr/projeler/video-zaman-etudu/yontem-ve-gizlilik/', en: '/en/projects/video-zaman-etudu/method-and-privacy/' },
    name: 'Video Zaman Etüdü',
    category: 'operasyon',
    featured: true,
    hosting: 'desktop',
    url: 'https://zaman-etudu.ysfdurak.com/',
    isaret: 'Zaman Etüdü',
    langParam: true,
    repo: GH + 'video-zaman-etudu',
    download: GH + 'video-zaman-etudu/releases/latest',
    guides: [
      { title: 'Zaman etüdü nasıl yapılır? Standart süre hesaplama (örnekli)', url: '/tr/rehber/zaman-etudu-nasil-yapilir/' },
      { title: 'Takt zamanı nedir, nasıl hesaplanır?', url: '/tr/rehber/takt-zamani-nedir/' },
      { title: 'İş örneklemesi nedir? Gözlem sayısı ve güven aralığı', url: '/tr/rehber/is-orneklemesi-nedir/' },
      { title: 'Hat dengeleme nedir? Yamazumi grafiği ve denge verimi', url: '/tr/rehber/hat-dengeleme-yamazumi/' },
      { title: 'Standart iş kombinasyon tablosu nedir?', url: '/tr/rehber/standart-is-kombinasyon-tablosu/' },
      { title: '7 israf nedir? Yalın üretimde israf türleri', url: '/tr/rehber/7-israf-nedir/' },
      { title: 'Zaman etüdü için video çekimi ve çalışan bilgilendirme şablonu', url: '/tr/rehber/zaman-etudu-video-cekimi-calisan-bilgilendirme/' },
    ],
    tech: ['JavaScript', 'IndexedDB', 'C#', 'WPF', '.NET 8', 'SQLite', 'Excel (OpenXML)', 'Cloudflare Workers', 'GitHub Actions'],
    shots: [
      { src: '/img/video-zaman-etudu/olcum.webp', srcEn: '/img/video-zaman-etudu/olcum-en.webp', w: 1440, h: 900, alt: { tr: 'Ölçüm sekmesi: ölçüm video zamanından alınır, her Ölç bir sonraki adımın başlangıcı olur; birden çok kayıt birlikte düzeltilebilir', en: 'Measure tab: times come from the video position, each Measure starts the next step; several records can be fixed together' } },
      { src: '/img/video-zaman-etudu/analiz.webp', srcEn: '/img/video-zaman-etudu/analiz-en.webp', w: 1440, h: 900, alt: { tr: 'Analiz sekmesi: etüt onayı, tek Çıktı al menüsü, katlı ayar özeti ve Özet, Adım tablosu, Çevrimler, Dağılım alt sekmeleri', en: 'Analysis tab: study approval, a single Export menu, a folded settings summary and Summary, Step table, Cycles, Distribution sub-tabs' } },
      { src: '/img/video-zaman-etudu/calismalar.webp', srcEn: '/img/video-zaman-etudu/calismalar-en.webp', w: 1440, h: 900, alt: { tr: 'Çalışmalar: yeni etütte kullanılacak yalın araçlar seçilir; listede yeterlilik ve onay durumu görünür', en: 'Studies: choose the lean tools a new study will use; the list shows sufficiency and approval status' } },
    ],
    og: '/img/video-zaman-etudu/og.jpg',
    ogEn: '/img/video-zaman-etudu/og-en.jpg',
    demo: {
      tr: 'Hesap ve kurulum gerekmez. Uygulamayı açıp “Demo etüdü aç” bağlantısına tıklayın: üç çevrimlik sentetik depo videosu ve hazır ölçümler yüklenir, analiz ekranında sonuçlar görünür. Kendi videonuzla yeni etüt de başlatabilirsiniz; etütler yalnızca tarayıcınızda saklanır, video hiçbir sunucuya yüklenmez. Windows sürümü de Türkçe ve İngilizce; aynı etüt paketini (.vzetud) ve toplu yedeği açar.',
      en: 'No account or install needed. The app opens in English from this page: click “Open demo study” and a three-cycle synthetic warehouse video with ready measurements loads; the analysis screen shows the results. You can also start a study with your own video; studies stay in your browser and the video is never uploaded. The Windows version is also in English and Turkish and opens the same study packages (.vzetud) and backups.',
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
        'Adım listesiyle akışlı ölçüm: Ölç’ten sonra sıradaki adım ve çevrim kendiliğinden gelir, kapsam dışı ara kayıt sırayı bozmaz, Ctrl+Z son kaydı geri alır; etüt kaldığı yerden açılır',
        'Kayıt başına tempo puanı, adıma özel tempo, kalemlere ayrılmış tolerans ve takt süresine göre doluluk ve gereken operatör sayısı',
        'Dağılım grafiği ve aykırı kayıt tespiti (IQR); aykırılar silinmeden kapsam dışı bırakılır',
        'Yalın araçlar: hat dengeleme (Yamazumi) ve takta göre otomatik dağıtım, standart iş kombinasyon tablosu, 7 israfa göre iyileştirme fikirleri, video kareli adım kartları (görsel iş talimatı)',
        'İş örneklemesi: videoda rastgele anlarda gözlem, kategori payları, güven aralığı ve hedef hata için gereken gözlem sayısı',
        'Önce / sonra karşılaştırması ve iki videoyu yan yana, adım adım izleme',
        'Özet sayfalı Excel raporu, yazdır / PDF ve etüdü başka bilgisayara taşıyan .vzetud paketi; bütün etütler tek .zip ile yedeklenir. Video ve klasör yolu paylaşılmaz',
        'İşin sırasını izleyen beş sekme: Çalışmalar → Hazırlık → Ölçüm → Analiz → İyileştirme. Yalın araçlar etüde göre seçilir; seçilmezse ekranlar sade kalır. Adım listesi başka etütten alınır, kayıtlar toplu düzeltilir, etüt onaylanır; ilk açılışta kısa tur yol gösterir',
        'İki sürüm, tek kural seti: sunucusuz tarayıcı sürümü ve Windows masaüstü, ikisi de Türkçe ve İngilizce. Ortak test dosyaları (61 hesap örneği, 86 paket senaryosu ve ileri analizler) her gönderimde iki sürümün aynı sonucu ve aynı paketi ürettiğini doğrular',
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
        'Guided measuring with a step list: after Measure the next step and cycle come up automatically, an out-of-scope interruption does not break the sequence, Ctrl+Z undoes the last record; a study reopens where you left off',
        'Per-record performance rating, step-specific pace, allowance split into parts, and takt time with load and required operators',
        'Distribution chart and outlier detection (IQR); outliers are excluded without being deleted',
        'Lean tools: line balancing (Yamazumi) with automatic distribution by takt, standard work combination sheet, improvement ideas by the 7 wastes, step cards with video frames (visual work instruction)',
        'Work sampling: observations at random moments in the video, category shares, confidence interval and the observations needed for a target error',
        'Before / after comparison and side-by-side, step-by-step video playback',
        'Excel report with a summary sheet, print / PDF and a .vzetud package to move a study to another computer; all studies back up into one .zip. The video and folder paths are never shared',
        'Five tabs that follow the job: Studies → Setup → Measure → Analysis → Improve. Lean tools are chosen per study; without them the screens stay simple. Steps can be copied from another study, records fixed in bulk and the study approved; a short tour guides first-time users',
        'Two versions, one rule set: a serverless browser version and a Windows desktop app, both in English and Turkish. Shared test files (61 calculation cases, 86 package scenarios and the advanced analyses) check on every push that both give the same results and write the same package',
      ],
    },
  },
  {
    slug: 'durus-ergonomi-analizi',
    method: { tr: '/tr/projeler/durus-ergonomi-analizi/yontem-ve-gizlilik/', en: '/en/projects/durus-ergonomi-analizi/method-and-privacy/' },
    name: 'Duruş – Ergonomi Analizi',
    category: 'operasyon',
    hosting: 'desktop',
    url: 'https://durus.ysfdurak.com/',
    isaret: 'Duruş',
    langParam: true,
    repo: GH + 'durus-ergonomi',
    download: GH + 'durus-ergonomi/releases/latest',
    guides: [
      { title: 'REBA nedir, nasıl hesaplanır? Adım adım örnek', url: '/tr/rehber/reba-nasil-hesaplanir/' },
      { title: 'RULA nedir? REBA ile farkı ve hangisi seçilmeli', url: '/tr/rehber/rula-nedir-reba-farki/' },
      { title: 'NIOSH kaldırma denklemi nasıl hesaplanır?', url: '/tr/rehber/niosh-kaldirma-denklemi/' },
      { title: 'OWAS nedir? Duruş kodları ve eylem kategorileri', url: '/tr/rehber/owas-nedir/' },
      { title: 'Ofis ergonomisi ve ROSA yöntemi', url: '/tr/rehber/ofis-ergonomisi-rosa/' },
      { title: 'Fine-Kinney risk analizi nasıl yapılır?', url: '/tr/rehber/fine-kinney-risk-analizi/' },
      { title: 'Gürültü maruziyeti nasıl hesaplanır?', url: '/tr/rehber/gurultu-maruziyeti-hesaplama/' },
      { title: 'Isı stresi ve WBGT nasıl hesaplanır?', url: '/tr/rehber/isi-stresi-wbgt/' },
    ],
    tech: ['HTML', 'CSS', 'JavaScript', 'Electron', 'ExcelJS', 'pdfmake'],
    og: '/img/durus/og.jpg',
    shots: [
      { src: '/img/durus/durus-analizi.webp', srcEn: '/img/durus/durus-analizi-en.webp', w: 1440, h: 900, alt: { tr: 'Duruş analizi: örnek karede eklemler işaretlenmiş, açılar hesaplanmış; REBA, RULA ve OWAS aynı anda puanlanmış', en: 'Posture analysis: joints marked on a sample frame, angles calculated, REBA, RULA and OWAS scored together' } },
      { src: '/img/durus/formlar-niosh.webp', srcEn: '/img/durus/formlar-niosh-en.webp', w: 1440, h: 900, alt: { tr: 'Formlar: NIOSH kaldırma denklemi, çarpanlar ve kaldırma indeksi ile ne yapılabileceği', en: 'Forms: the NIOSH lifting equation with multipliers, lifting index and what can be done' } },
      { src: '/img/durus/rehber.webp', srcEn: '/img/durus/rehber-en.webp', w: 1440, h: 900, alt: { tr: 'Rehber: evet/hayır sorularıyla riskli alanları bulma ve önerilen yöntem', en: 'Guide: find risk areas with yes/no questions and get a recommended method' } },
      { src: '/img/durus/baslangic.webp', srcEn: '/img/durus/baslangic-en.webp', w: 1440, h: 900, alt: { tr: 'Başlangıç: duruma göre dört giriş yolu ve son kayıtlar', en: 'Start: four entry points by situation and recent records' } },
    ],
    demo: {
      tr: 'Hesap gerekmez: Duruş analizi sekmesinde “Örnek kareyle dene”yi seç, eklemleri işaretle; REBA, RULA ve OWAS anında hesaplanır. Ya da Formlar’dan NIOSH’u açıp ölçümlerini gir. Kayıtlar yalnızca tarayıcında kalır; video ve fotoğraflar hiçbir sunucuya gönderilmez.',
      en: 'No account needed. The app opens in English from this page: in Posture analysis choose “Try with a sample frame” and mark the joints; REBA, RULA and OWAS are calculated instantly. Or open NIOSH under Forms and enter your measurements. Records stay in your browser; videos and photos are never uploaded.',
    },
    tr: {
      tagline: 'Bir iş istasyonunu videodan, fotoğraftan ya da ölçümden ergonomik olarak değerlendiren, yöntem seçiminde yol gösteren uygulama.',
      problem:
        'Ergonomi riskleri çoğu zaman gözle ve geç fark ediliyor. Değerlendirme yapılacaksa yöntemler farklı kaynaklarda, formlar kâğıtta ya da Excel’de duruyor; hangi işte hangi yöntemin kullanılacağı belirsiz, sonuçlar da somut bir önleme bağlanmıyor.',
      solution: [
        'Sahada en yaygın 11 yöntem tek yerde: REBA, RULA, OWAS, QEC hızlı maruziyet kontrolü, NIOSH, KIM kaldırma ve itme-çekme (BAuA), Liberty Mutual (Snook), OCRA, ROSA ve Nordik anketi',
        'Videodan ya da fotoğraftan kare seçip eklemleri otomatik bulma (MediaPipe, görüntü cihazdan çıkmaz) ya da elle işaretleme; açılar hesaplanır, REBA, RULA ve OWAS birlikte puanlanır, mesafe ölçümü yapılabilir',
        'Rehber: evet/hayır sorularıyla riskli alanları bulur, her alan için tek bir yöntem önerir',
        'Saha modu: fotoğraf ve kareyle tehlikeyi yerinde işaretle, analizi sonra yap',
        'İleri düzey yöntemler: LiFFT, DUET, HAL, Revize Strain Index; gürültü, titreşim, ısı stresi (WBGT) ve aydınlatma',
        'İstasyon ve görev yapısı, Fine-Kinney ya da 5×5 risk tablosu, önlem takibi ve önlem sonrası yeniden ölçüm',
        'Videonun tamamını aralıklarla otomatik tarama; vardiyadaki yüksek riskli süre payı',
        'Vücut bölgesi profili ve aynı bölgeyi art arda zorlamayan iş rotasyonu planı; önlemler için maliyet ve geri ödeme hesabı',
        '“Senaryo dene”: değerleri değiştirip sonucu mevcut durumla karşılaştırma, senaryoyu önleme dönüştürme ve yeniden ölçümde beklenenle kıyaslama',
        'Excel ve PDF rapor, CSV ve JSON aktarma; sunucu ve hesap yok, kayıtlar cihazda kalır',
        'Tarayıcıda ya da internetsiz çalışan Windows masaüstü uygulaması olarak kullanılır; iki sürüm aynı kaynaktan üretilir',
        'Türkçe ve İngilizce arayüz; İngilizce sürüm Türkçe kaynaktan otomatik üretilir, raporlar seçilen dilde çıkar',
      ],
    },
    en: {
      tagline: 'An app that assesses a workstation ergonomically from video, photo or measurements, and guides the choice of method.',
      problem:
        'Ergonomic risks are usually spotted by eye, and late. When an assessment is done, the methods live in different sources and the forms on paper or in Excel; it is unclear which method fits which job, and results are not tied to concrete measures.',
      solution: [
        'The 11 most common field methods in one place: REBA, RULA, OWAS, the QEC quick exposure check, NIOSH, KIM lifting and pushing-pulling (BAuA), Liberty Mutual (Snook), OCRA, ROSA and the Nordic questionnaire',
        'Pick a frame from video or photo and find the joints automatically (MediaPipe; the image never leaves the device) or mark them by hand; angles are calculated, REBA, RULA and OWAS are scored together, distances can be measured',
        'Guide: finds risk areas with yes/no questions and recommends one method per area',
        'Field mode: mark hazards on site with photos and frames, analyse later',
        'Advanced methods: LiFFT, DUET, HAL, Revised Strain Index; noise, vibration, heat stress (WBGT) and lighting',
        'Workstation and task structure, Fine-Kinney or 5×5 risk table, action tracking and re-measurement after actions',
        'Automatic scanning of the whole video at set intervals; share of high-risk time in the shift',
        'Body region profile and a job rotation plan that avoids loading the same region twice in a row; cost and payback calculation for actions',
        '“Try a scenario”: change values and compare with the current state, turn the scenario into an action and compare the re-measurement with the expected result',
        'Excel and PDF reports, CSV and JSON export; no server or account, records stay on the device',
        'Runs in the browser or as a Windows desktop app that works offline; both are built from the same source',
        'English and Turkish interface; the English version is generated automatically from the Turkish source, reports follow the chosen language',
      ],
    },
  },
  {
    slug: 'destek-merkezi',
    name: 'Destek Merkezi',
    category: 'operasyon',
    featured: true,
    hosting: 'vps',
    url: 'https://destek.ysfdurak.com/',
    isaret: 'Destek Merkezi',
    health: '/healthz',
    langParam: true,
    repo: GH + 'destek-merkezi',
    og: '/img/destek-merkezi/og.jpg',
    tech: ['React', 'Node.js', 'SQLite', 'Excel (SheetJS)', 'Access istemcisi', 'Docker', 'Caddy'],
    video: {
      src: '/video/destek-tanitim-tr.mp4',
      poster: '/video/destek-tanitim-tr.webp',
      srcEn: '/video/destek-promo-en.mp4',
      posterEn: '/video/destek-promo-en.webp',
      w: 1920,
      h: 1080,
      caption: {
        tr: '40 saniyede Destek Merkezi: B vardiyası için planlanan destek kaydı, karşı bölümün onayı, puantajla uyuşmayan kayıt ve kim kime destek verdi matrisi. Görüntüler kurgusal depo organizasyonunun örnek verisinden.',
        en: 'Destek Merkezi in 40 seconds: a planned support record for shift B, the receiving unit’s approval, a record that clashes with the timesheet and the who-supported-whom matrix. Footage uses the sample warehouse organisation’s data.',
      },
      loop: {
        src: '/video/destek-dongu-tr.mp4',
        poster: '/video/destek-dongu-tr.webp',
        srcEn: '/video/destek-loop-en.mp4',
        posterEn: '/video/destek-loop-en.webp',
        w: 1280,
        h: 720,
        alt: {
          tr: 'Destek Merkezi kısa döngü: destek kaydı, onay kutusu, uyumsuz destekler ve dashboard',
          en: 'Destek Merkezi short loop: support entry, approval inbox, mismatched supports and dashboard',
        },
      },
    },
    shots: [
      { src: '/img/destek-merkezi/genel-bakis.webp', srcEn: '/img/destek-merkezi/genel-bakis-en.webp', w: 1400, h: 950, alt: { tr: 'Destek Merkezi genel bakış: kesinleşen ve onay bekleyen destekler, bölümler arası dağılım', en: 'Destek Merkezi overview: finalised and pending supports, distribution between departments' } },
      { src: '/img/destek-merkezi/dashboard.webp', srcEn: '/img/destek-merkezi/dashboard-en.webp', w: 1440, h: 1000, alt: { tr: 'Destek Merkezi dashboard: 50 bölümlük işletmede kim kime destek verdi, gün ve bölüm takvimi', en: 'Destek Merkezi dashboard: filters by period, location, shift and hierarchy, totals and a daily chart of support records' } },
      { src: '/img/destek-merkezi/toplu-giris.webp', srcEn: '/img/destek-merkezi/toplu-giris-en.webp', w: 1400, h: 950, alt: { tr: 'Toplu giriş: kişileri sabitle, birkaç günü vardiyayla tek seferde gir', en: 'Bulk entry: pin people and enter several days at once by shift' } },
      { src: '/img/destek-merkezi/hiyerarsi.webp', srcEn: '/img/destek-merkezi/hiyerarsi-en.webp', w: 1110, h: 1110, alt: { tr: 'Hiyerarşi tanımı: düzey adlarını ve derinliği işletme belirler', en: 'Hierarchy setup: the business names its own levels and depth' } },
    ],
    demo: {
      tr: 'Giriş gerekmez: kurgusal bir depo organizasyonuyla dolu, yalnızca sana ait bir alan açılır. Üstteki seçiciyle yönetici, bölüm yetkilisi ve izleyici rollerini deneyebilirsin. Alan son kullanımdan 3 gün sonra silinir.',
      en: 'No sign-in. The app opens in English from this page: you get your own workspace with a fictional warehouse organisation, with English sample data. Use the selector at the top to try the admin, department manager and viewer roles. It is deleted 3 days after last use.',
    },
    tr: {
      tagline: 'Bölümler arası işgücü desteğini kaydeden, karşı bölüme onaylatan ve puantajla karşılaştıran sistem.',
      problem:
        'Vardiyalı operasyonlarda bir bölüm diğerine personel verir; talep WhatsApp\'tan gelir, kayıt ertesi gün ya da sonraki hafta girilir. Kim kime ne kadar destek verdi belirsiz kalır, puantajla çelişen kayıtlar fark edilmez.',
      solution: [
        'Vardiyadan gelen sabit süreler, toplu ve geriye dönük giriş, aynı gün tekrar giriş engeli',
        'Karşı bölüm onayı, geri çekme ve puantajla çelişen desteklerin takibi',
        'İşletmenin belirlediği hiyerarşiye göre dashboard ve Excel/PDF raporları',
        'Türkçe ve İngilizce arayüz; raporlar ve demo verisi de seçilen dilde',
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
        'English and Turkish interface; reports and demo data follow the chosen language',
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
    isaret: 'İvme',
    urlEn: 'https://ivme-en.ysfdurak.com/',
    repo: GH + 'ivme-oneri-kaizen',
    guides: [
      { title: 'Kaizen nedir? Çalışan öneri sistemi nasıl kurulur?', url: '/tr/rehber/kaizen-oneri-sistemi-nasil-kurulur/' },
      { title: '5S nedir? Adımları, depo örneği ve kontrol listesi', url: '/tr/rehber/5s-nedir/' },
      { title: '7 israf nedir? Yalın üretimde israf türleri', url: '/tr/rehber/7-israf-nedir/' },
    ],
    tech: ['React', 'TypeScript', 'Cloudflare Workers', 'D1 (SQLite)', 'MCP'],
    og: '/img/ivme/og.jpg',
    video: {
      src: '/video/ivme-tanitim-tr.mp4',
      poster: '/video/ivme-tanitim-tr.webp',
      srcEn: '/video/ivme-promo-en.mp4',
      posterEn: '/video/ivme-promo-en.webp',
      w: 1920,
      h: 1080,
      caption: {
        tr: '40 saniyede İvme: çalışan önerisini telefondan verir, öneri değerlendirme, aksiyon ve kazanç onayından geçer, panoda ve raporda izlenir. Görüntüler canlı demonun örnek verisinden.',
        en: 'İvme in 40 seconds: an employee submits an idea from their phone, it moves through review, action and savings approval, and shows up on the board and in reports. Footage uses the live demo’s sample data.',
      },
      loop: {
        src: '/video/ivme-dongu-tr.mp4',
        poster: '/video/ivme-dongu-tr.webp',
        srcEn: '/video/ivme-loop-en.mp4',
        posterEn: '/video/ivme-loop-en.webp',
        w: 1280,
        h: 720,
        alt: {
          tr: 'İvme kısa döngü: telefondan öneri girişi, çalışma merkezi, durum panosu ve kazanç raporu',
          en: 'İvme short loop: submitting an idea on a phone, the work centre, the status board and the savings report',
        },
      },
    },
    shots: [
      { src: '/img/ivme/calisma-merkezi.webp', srcEn: '/img/ivme/calisma-merkezi-en.webp', w: 1440, h: 900, alt: { tr: 'İvme çalışma merkezi: toplam öneri, beni bekleyenler, tamamlananlar, onaylı kazanç ve geciken işler', en: 'İvme work centre: total suggestions, items waiting on me, completed work, approved savings and overdue items' } },
      { src: '/img/ivme/durum-panosu.webp', srcEn: '/img/ivme/durum-panosu-en.webp', w: 1440, h: 900, alt: { tr: 'Durum panosu: önerilerin aşamalara dağılımı ve en çok öneri bekleyen kişiler, gecikmelerle birlikte', en: 'Status board: suggestions by stage and the people with the most open items, with overdue counts' } },
      { src: '/img/ivme/oneri-detayi.webp', srcEn: '/img/ivme/oneri-detayi-en.webp', w: 1440, h: 900, alt: { tr: 'Öneri detayı: sıradaki adım, sorumlu, hedef süre, problem ve çözüm önerisi', en: 'Suggestion detail: next step, owner, target time, problem and proposed solution' } },
      { src: '/img/ivme/giris.webp', srcEn: '/img/ivme/giris-en.webp', w: 1440, h: 900, alt: { tr: 'Canlı demo girişi: rol seçerek şifresiz deneme', en: 'Live demo sign-in: pick a role, no password' } },
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
        'Öneri sınıfları, nedenler, puan kriterleri, hedef süreler ve para birimi (TL, Euro, Dolar, Sterlin) Tanımlar ekranından değişir. Kullanıcılar ve eski öneriler Excel ile aktarılır, aktarım geri alınabilir',
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
        'Items waiting on support units such as IT or Technical Services are tracked with ticket numbers. Handovers work one by one or in bulk and can be undone',
        'Net savings (after implementation cost), weighted scoring criteria, automatic reward proposals by score and HR approval',
        'Participation statistics and a report builder with year/month filters. Anonymous ideas, campaigns, before/after photos, similar-idea warnings',
        'Categories, reasons, scoring criteria, target times and currency (lira, euro, dollar, pound) are set in the admin screens. Users and past suggestions import from Excel, and imports can be undone',
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
    tryUrl: 'https://ysfdurak.github.io/pusula-is-takip/',
    isaret: 'Pusula',
    health: '/healthz',
    langParam: true,
    repo: GH + 'pusula-is-takip',
    tech: ['React', 'Node.js', 'SQLite', 'Google OAuth', 'MCP', 'MCP Apps', 'Docker', 'Caddy'],
    og: '/img/pusula/og.jpg',
    video: {
      src: '/video/pusula-tanitim-tr.mp4',
      poster: '/video/pusula-tanitim-tr.webp',
      srcEn: '/video/pusula-promo-en.mp4',
      posterEn: '/video/pusula-promo-en.webp',
      w: 1920,
      h: 1080,
      caption: {
        tr: '40 saniyede Pusula: hızlı iş ekleme, ekip panosu, statü panosunda işi başlatma ve ilk termini kaybetmeyen iş ayrıntısı. Görüntüler kurgusal depo ekibinin örnek verisinden.',
        en: 'Pusula in 40 seconds: quick task entry, the team board, starting work on the status board and a task detail that keeps the first due date. Footage uses the sample warehouse team’s data.',
      },
      loop: {
        src: '/video/pusula-dongu-tr.mp4',
        poster: '/video/pusula-dongu-tr.webp',
        srcEn: '/video/pusula-loop-en.mp4',
        posterEn: '/video/pusula-loop-en.webp',
        w: 1280,
        h: 720,
        alt: {
          tr: 'Pusula kısa döngü: hızlı iş ekleme, ekip panosu, statü panosu ve iş ayrıntısı',
          en: 'Pusula short loop: quick task entry, team board, status board and task detail',
        },
      },
    },
    shots: [
      { src: '/img/pusula/ekip-panosu.webp', srcEn: '/img/pusula/ekip-panosu-en.webp', w: 1440, h: 900, alt: { tr: 'Pusula ekip panosu: açık, geciken, bugün teslim ve tamamlanan işler', en: 'Pusula team board: open, overdue, due today and completed tasks' } },
      { src: '/img/pusula/claude-panom.webp', w: 1392, h: 1100, alt: { tr: "Claude sohbetinin içinde açılan Pusula panosu: Başla, Tamamla ve Ayrıntı düğmeleri", en: 'Pusula board opened inside a Claude chat, with Start, Complete and Details buttons' } },
      { src: '/img/pusula/benim-panom.webp', srcEn: '/img/pusula/benim-panom-en.webp', w: 1440, h: 900, alt: { tr: 'Benim panom: kişinin bugünkü gündemi ve hızlı iş ekleme', en: 'My board: personal agenda for today and quick task entry' } },
    ],
    demo: {
      tr: 'Google hesabınla gir; sana ait, kurgusal bir depo ekibiyle dolu bir çalışma alanı açılır. Alan 7 gün sonra tümüyle silinir; gerçek kimseye e-posta gitmez.',
      en: 'Sign in with Google and you get your own workspace with a fictional warehouse team; from this page the app and its sample data open in English. It is deleted entirely after 7 days and no email is sent to anyone.',
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
        'Türkçe ve İngilizce web arayüzü; demo alanı seçilen dilde açılır',
      ],
    },
    en: {
      tagline: 'A task and team tracker for operations teams, usable from the web and from inside a Claude chat. English and Turkish.',
      problem:
        "In operations teams, work is scattered across email, chat and Excel; nobody sees who is busy with what or what is running late. Off-the-shelf tools are either too complex or not suited to Turkish-speaking teams.",
      solution: [
        'Personal board, team board and task list: overdue, due-today and open work at a glance',
        'Deadline changes are kept: the original target date and every revision stay visible',
        'One core, two doors: the web UI and an MCP server share the same rules and permissions',
        'Connected to Claude, 13 tools create and update tasks, and the board opens as a clickable UI inside the chat',
        'Google sign-in and OAuth 2.1 for Claude; member management, deletion and attachments are deliberately not exposed to AI',
        'Visitors get a personal, time-limited demo workspace; usage is measured under a pseudonym and without content',
        'English and Turkish web interface; the demo workspace opens in the chosen language (Claude tools are in Turkish)',
      ],
    },
  },
  {
    slug: 'aday-atolyesi',
    name: 'Aday Atölyesi',
    category: 'ekip',
    turkishOnly: {
      en: 'Built for candidates applying to jobs in Turkey: the aptitude tests (including verbal reasoning in Turkish), 20 company cases with Word/Excel files and the HR review are in Turkish, so the app stays in Turkish. “Try it” opens an English guide that explains every screen, and one sample case (Koru Distribution) is fully in English.',
    },
    hosting: 'vps',
    url: 'https://aday.ysfdurak.com/',
    isaret: 'Aday Atölyesi',
    langParam: true,
    repo: GH + 'aday_atolyesi',
    guides: [{ title: 'STAR tekniği ve yetkinlik bazlı mülakat soruları', url: '/tr/rehber/star-teknigi-yetkinlik-mulakati/' }],
    tech: ['JavaScript', 'Cloudflare Workers', 'D1 (SQLite)', 'R2'],
    og: '/img/aday-atolyesi/og.jpg',
    shots: [
      { src: '/img/aday-atolyesi/vaka-calismasi.webp', srcEn: '/img/aday-atolyesi/vaka-calismasi-en.webp', w: 1440, h: 900, alt: { tr: 'Vaka çalışması: solda kurgusal şirket belgeleri, sağda çıktı bazında cevap alanları, kelime sayacı ve süre tutucu', en: 'The English sample case (Koru Distribution) with the English guide open: company file on the left, numbered outputs on the right; English labels sit under the Turkish menus and headings' } },
      { src: '/img/aday-atolyesi/hazirlik-plani.webp', srcEn: '/img/aday-atolyesi/hazirlik-plani-en.webp', w: 1440, h: 900, alt: { tr: 'Hazırlık planı: hedef pozisyona göre bugün yapılacak tek adım ve günün bütün adımları', en: 'Preparation plan for a warehouse operations role: one next step for today, then the full day plan; the guide explains how the plan is built' } },
      { src: '/img/aday-atolyesi/olcutlu-degerlendirme.webp', srcEn: '/img/aday-atolyesi/olcutlu-degerlendirme-en.webp', w: 1440, h: 900, alt: { tr: 'İK değerlendirme formu: her ölçüt için 0–3 seviye ve seviye tanımı', en: 'HR review form with the English guide open: each criterion gets a level from 0 (Not yet) to 3 (Evidenced) and an optional evidence note' } },
      { src: '/img/aday-atolyesi/giris.webp', srcEn: '/img/aday-atolyesi/giris-en.webp', w: 1440, h: 900, alt: { tr: 'Canlı demo girişi: aday, İK değerlendiricisi ya da pilot yöneticisi olarak şifresiz deneme', en: 'Live demo sign-in: pick candidate, HR reviewer or pilot admin, no password; the guide says what each role can try' } },
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
    decisions: {
      tr: [
        'Arayüz Türkçe kaldı: sözel sorular Türkçe dil bilgisine, vakalar Türkiye’deki işe alım bağlamına dayanır. İngilizce okuyan ziyaretçi için ekranları anlatan bir rehber ve tamamen İngilizce bir örnek vaka eklendi.',
        'Tek puan yok: sınav performansı, kendi beyanına dayalı tercihler ve senaryo seçimleri farklı türde kanıttır. Birleştirmek, verinin taşımadığı bir kesinlik iddia eder. İK da her ölçütü 0–3 düzeyle ve yazılı dayanakla değerlendirir.',
        'Referans çözüm teslimden sonra açılır ve tek “doğru” cevap yerine savunulabilir alternatifleri gösterir. Vakalar akıl yürütmeyi ölçer: Koru Dağıtım’da toplam dakika yeter görünür, darboğaz paketlemededir.',
        'Her belgenin kodu var (D01, D02…): aday cevabını belgeye dayandırır, değerlendirici dayanağı kontrol eder.',
        'Yapay zekâ çağrısı yok, kayıt önce tarayıcıda: hesap açmadan çalışılır, aday metni bir modele gönderilmez, kullanıcı başına maliyet yoktur.',
        'İK’nın iki sorunu önyargı ve geciken geri bildirimdi: kör değerlendirme kimliği gizler; kuyruk en eskiden başlar, bekleme süresini ve hedef süre aşımını gösterir.',
        'Doğrulanmamış içerik etiketlenir: Rol Atölyesi’ndeki 187 senaryonun puan anahtarları “uzman incelemesi bekleyen taslak” olarak gösterilir.',
      ],
      en: [
        'The interface stays in Turkish: verbal items rely on Turkish grammar and the cases follow the Turkish hiring context. For English-speaking visitors there is a guide that explains each screen and one sample case that is fully in English.',
        'No single score: test performance, self-reported preferences and scenario choices are different kinds of evidence. Combining them would claim a precision the data does not have. HR also rates each criterion on a 0–3 level with a written, evidence-based note.',
        'The reference solution opens only after submission and shows defensible alternatives rather than one “right” answer. The cases test reasoning: at Koru Distribution total person-minutes look sufficient, but packing is the bottleneck.',
        'Every document has a code (D01, D02 …), so candidates tie their answers to evidence and reviewers can check it.',
        'No AI calls, and work is saved in the browser first: no account needed to start, candidate text is never sent to a model, and there is no per-user cost.',
        'HR’s two problems were bias and slow feedback: blind review hides the candidate’s identity; the queue starts with the oldest file and shows waiting time and target-time overruns.',
        'Unvalidated content is labelled: the scoring keys of the 187 scenarios in the role workshop are shown as drafts awaiting expert review.',
      ],
    },
    video: {
      src: '/video/aday-atolyesi-en.mp4',
      poster: '/video/aday-atolyesi-en.webp',
      w: 1280,
      h: 800,
      lang: 'en',
      caption: {
        tr: 'Yaklaşık 1,5 dakikalık tur (İngilizce altyazılı): aday İngilizce örnek vakayı çözer ve dosyasını teslim eder, İK değerlendiricisi ölçütle inceler.',
        en: 'An 84-second walkthrough with English captions: a candidate solves the English sample case and submits the workbook, then an HR reviewer rates it criterion by criterion.',
      },
    },
  },


  // ── Veri ve raporlama ────────────────────────────────────────────
  {
    slug: 'sirdas-veri-maskeleme',
    name: 'Sırdaş – Veri Maskeleme',
    category: 'veri',
    hosting: 'static',
    url: 'https://sirdas.ysfdurak.com/',
    isaret: 'Sırdaş',
    langParam: true,
    repo: GH + 'sirdas',
    tech: ['JavaScript', 'Web Worker', 'SheetJS', 'ExcelJS', 'Office.js', 'MCP', 'Node.js'],
    og: '/img/sirdas/og.jpg',
    ogEn: '/img/sirdas/og-en.jpg',
    shots: [
      { src: '/img/sirdas/tablo.webp', srcEn: '/img/sirdas/tablo-en.webp', w: 1440, h: 900, alt: { tr: 'Tablo: Operasyon ve Sorumlu sütunları etiketlenmiş, maliyet gizli katsayıyla ölçeklenmiş, tarihler tam hafta kaydırılmış; not hücresinde geçen operasyon adı da gizlenmiş', en: 'Table: Operation and Owner columns tagged, cost scaled by a hidden factor, dates shifted by whole weeks; the project name inside a note is hidden too' } },
      { src: '/img/sirdas/kontrol.webp', srcEn: '/img/sirdas/kontrol-en.webp', w: 1440, h: 900, alt: { tr: 'Göndermeden kontrol: gidecek satır ve hücre sayısı, gizlenen değerler, ölçeklenen sayılar ve açık kalan gizli değer uyarısı', en: 'Check before you send: rows and cells to be sent, hidden values, scaled numbers and the warning for hidden values left visible' } },
      { src: '/img/sirdas/alanlar.webp', srcEn: '/img/sirdas/alanlar-en.webp', w: 1440, h: 900, alt: { tr: 'Alanlar: JSON kayıtlarında alan yoluyla seçim; yapı aynen kalıyor, tutar ölçekleniyor, tarih kaydırılıyor', en: 'Fields: pick JSON fields by path; the structure stays the same, the cost is scaled and the date shifted' } },
      { src: '/img/sirdas/word.webp', srcEn: '/img/sirdas/word-en.webp', w: 1440, h: 900, alt: { tr: 'Word belgesi: seçilen ifadeler belgenin her yerinde gizleniyor, belge biçimiyle indiriliyor', en: 'Word document: chosen phrases are hidden everywhere in the document, which downloads with its formatting' } },
    ],
    demo: {
      tr: 'Hesap gerekmez, veri bilgisayarından çıkmaz. Sayfa örnek bir operasyon tablosuyla açılır: sütun harfine tıklayıp gizle, “Göndermeden kontrol et” bölümünde ne gideceğini gör, aşağıdaki örnek yanıtta etiketlerin, ölçeklenen tutarların ve kaydırılan tarihlerin geri açıldığını izle. Kendi Excel, Word, PowerPoint, JSON, XML ya da PDF dosyanı da açabilirsin.',
      en: 'No account, and your data never leaves your computer. The page opens with a sample project table: click a column letter to hide it, see what will be sent under “Check before you send”, and watch the sample answer below get its labels, scaled costs and shifted dates put back. You can also open your own Excel, Word, PowerPoint, JSON, XML or PDF file.',
    },
    tr: {
      tagline: 'Excel, Word, PowerPoint, JSON, XML ya da PDF’teki seçtiğin değerleri yapay zekâya göndermeden maskeleyen, yanıtı geri açan araç; veri bilgisayardan çıkmaz.',
      problem:
        'Yapay zekâya bir tablo ya da rapor verip analiz istemek hızlı, ama içinde operasyon adları, müşteri kodları, maliyetler ve kişiler var. Elle silmek hem zaman alıyor hem de analizi bozuyor: adı silinen satırlar birbirine karışıyor, silinen sayılarla hesap yapılamıyor. Hassas olan her zaman kişisel veri de değil; bir operasyonun adı ya da maliyeti de dışarı çıkmamalı.',
      solution: [
        'Gizleneceğini kullanıcı seçer: sütun, satır, hücre ya da alan. Aynı değer her yerde ve her mesajda aynı etiketi alır ([OPERASYON_1]), böylece yapay zekâ ilişkileri takip edebilir',
        'Sayılar gizli bir katsayıyla ölçeklenir: toplam, ortalama ve oranlar doğru kalır, yanıttaki sonuçlar geri çevrilir. Tarihler tam hafta kayar; süreler ve haftanın günü korunur',
        'Sütun çıkarma, aralığa çevirme (“400 bin–500 bin”) ve kendi gruplama eşlemen',
        'Göndermeden kontrol: açık kalan gizli değer, adı değer ele veren etiket, seçim yapılmamış ve gizli sayfalar',
        'Biçimi koruyan Excel çıktısı; formül, not, açılır liste, tablo tanımı ve belge özellikleri temizlenir',
        'Word ve PowerPoint biçimiyle: gövde, tablo, üst bilgi, dipnot, konuşmacı notu ve grafik etiketleri; parçalara bölünmüş değerler de yakalanır',
        'JSON ve XML’de alan yoluyla seçim; PDF’ten metin çıkarma',
        'Şablonlar: seçimi başlık adıyla kaydet, her hafta aynı rapora tek tıkla uygula',
        'Parolayla şifreli anahtar dosyası (PBKDF2 + AES-GCM); ertesi gün aynı etiketlerle devam',
        'Üç yüz, tek çekirdek: tarayıcı sürümü, Excel eklentisi ve yapay zekâ asistanları için yerel MCP sunucusu. MCP’de asistan yalnızca maskeli veriyi görür',
        'Büyük tablolar arka planda işlenir; 40.000 satır yaklaşık 1 saniyede maskelenir',
        'Türkçe ve İngilizce arayüz; internet olmadan da çalışır',
      ],
    },
    en: {
      tagline: 'A tool that masks the values you choose in Excel, Word, PowerPoint, JSON, XML or PDF before they reach an AI, and unmasks the answer; your data never leaves your computer.',
      problem:
        'Handing a table or report to an AI for analysis is fast, but it carries project names, customer codes, costs and people. Deleting them by hand takes time and breaks the analysis: rows without names get mixed up, and removed numbers cannot be calculated with. What is sensitive is not always personal data either; a project’s name or cost should not leave the company.',
      solution: [
        'You choose what to hide: column, row, cell or field. The same value gets the same label everywhere and in every message ([OPERATION_1]), so the AI can still follow relationships',
        'Numbers are scaled by a hidden factor: totals, averages and ratios stay right, and results in the answer are converted back. Dates move by whole weeks; durations and weekdays are kept',
        'Remove columns, convert numbers to ranges (“400k–500k”) or apply your own grouping',
        'Check before you send: hidden values left visible, labels that give a value away, sheets with nothing hidden and hidden sheets',
        'Excel output keeps its formatting; formulas, notes, drop-down lists, table definitions and document properties are cleaned',
        'Word and PowerPoint with their formatting: body, tables, headers, footnotes, speaker notes and chart labels; values split across formatting runs are caught too',
        'JSON and XML masked by field path; text extracted from PDF',
        'Templates: save a selection by header name and apply it to the same weekly report with one click',
        'Password-encrypted key file (PBKDF2 + AES-GCM) to continue with the same labels the next day',
        'Three front ends, one core: the browser app, an Excel add-in and a local MCP server for AI assistants; through MCP the assistant only ever sees masked data',
        'Large tables are processed in the background; 40,000 rows are masked in about a second',
        'English and Turkish interface; also works offline',
      ],
    },
    decisions: {
      tr: [
        'Yapay zekâya kendisi göndermez: gönderen kullanıcıdır. Araç bir yapay zekâya bağlansaydı “veri bilgisayardan çıkmaz” sözü bozulurdu',
        'Sahte gerçekçi değer yerine köşeli parantezli etiket: yapay zekâ “Ayla Kurt”u gerçek sanıp değiştirebilir, [AD_1] ise yanıtta her zaman geri bulunur',
        'Sayıyı etiketlemek yerine ölçeklemek: [MALIYET_1] ile toplama yapılamaz; aynı katsayıyla çarpılan sayılarla yapılır. Sınırı açıkça yazılı: tek bir gerçek değeri bilen katsayıyı bulabilir, hassas rakam için aralık ya da çıkarma önerilir',
        'Tarih kaydırma tam hafta: depo ve operasyon verisinde pazartesi yükü önemli; rastgele gün sayısı haftanın gününü bozardı',
        'Excel çıktısında formül yok: bir formül gizli hücreye başvurarak ya da içindeki sabit metinle değeri ele verebilir',
        'Sunucu yok: her şey tarayıcıda ve yerelde çalışıyor; güvenin temeli bu. Bu yüzden VPS gerekmedi',
      ],
      en: [
        'It never sends data to an AI itself; the user does. If the tool connected to an AI, “your data never leaves your computer” would no longer hold',
        'Bracketed labels instead of realistic fake values: an AI may take “Ayla Kurt” for real and change it, while [NAME_1] can always be found again in the answer',
        'Scaling numbers instead of tagging them: you cannot add up [COST_1], but you can add numbers multiplied by the same factor. The limit is stated openly: someone who knows one real value can work out the factor, so ranges or removal are suggested for very sensitive figures',
        'Dates move by whole weeks: in warehouse and operations data the Monday peak matters, and a random number of days would change the weekday',
        'No formulas in the Excel output: a formula can give a value away through a reference to a hidden cell or a literal inside it',
        'No server: everything runs in the browser or locally, which is what the trust rests on; so no VPS was needed',
      ],
    },
    caseStudy: {
      tr: { role: 'Problemi ve kapsamı ben tanımladım: kişisel olmayan ama hassas operasyon verisini de seçerek gizleyebilmek. Biçim sırası, sınırlar ve hangi kararın neden alındığı benden; kod yapay zekâ (Claude) ile yazıldı. İlk sürüm “Örtü” adıyla bir claude.ai sayfası olarak başladı, sonra şablonlar, sayı ve tarih koruma, Office biçimleri, Excel eklentisi ve MCP eklendi.' },
      en: { role: 'I defined the problem and scope: being able to hide operational data that is sensitive without being personal. The order of formats, the limits and the reasons behind each decision are mine; the code was written with AI (Claude). The first version started as a claude.ai page called “Örtü”; templates, number and date protection, Office formats, the Excel add-in and MCP came after.' },
    },
  },
  // ── Öğrenme ──────────────────────────────────────────────────────
  {
    slug: 'kesit',
    name: 'Kesit (SQL, Power BI, Python, İstatistik)',
    category: 'ogrenme',
    turkishOnly: {
      en: 'Built for Turkish speakers: Kesit’s whole point is teaching data skills in Turkish, so the apps, lessons and exercises stay in Turkish. “Try it” opens an English guide that explains each app and screen; it stays on across all four apps.',
    },
    featured: true,
    hosting: 'external',
    url: 'https://ysfdurak.github.io/',
    isaret: 'Kesit',
    langParam: true,
    repos: [
      { label: 'SQL', url: GH + 'kesit-sql' },
      { label: 'Power BI', url: GH + 'kesit-powerbi' },
      { label: 'Python', url: GH + 'kesit-python' },
      { label: 'İstatistik', url: GH + 'kesit-istatistik' },
    ],
    tech: ['JavaScript', 'SQLite (sql.js)', 'Pyodide', 'DAX benzetim motoru', 'PWA'],
    og: '/img/kesit/og.jpg',
    shots: [
      { src: '/img/kesit/sql-alistirma.webp', srcEn: '/img/kesit/sql-alistirma-en.webp', w: 1280, h: 800, alt: { tr: 'Kesit SQL: tarayıcıdaki veritabanında yazılan sorgu anında denetlenir; görev, örnek tablo ve sonuç yan yana', en: 'Kesit SQL with the English guide: a GROUP BY exercise checked instantly against the in-browser database; English labels sit under the Turkish menu' } },
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
    turkishOnly: {
      en: 'Built for Turkish speakers learning English: explanations, feedback and the exam prep (YDS, e-YDS, YÖKDİL) are in Turkish, so the app stays in Turkish. “Try it” opens an English guide that explains each section, with small English labels under the menus.',
    },
    hosting: 'static',
    url: 'https://ingilizce-atolyesi.ysfdurak.com/',
    isaret: 'İngilizce Öğrenme Atölyesi',
    langParam: true,
    repo: GH + 'ingilizce-ogrenme-atolyesi',
    tech: ['HTML', 'CSS', 'JavaScript', 'PWA'],
    og: '/img/ingilizce-atolyesi/og.jpg',
    shots: [
      { src: '/img/ingilizce-atolyesi/bugunku-plan.webp', srcEn: '/img/ingilizce-atolyesi/bugunku-plan-en.webp', w: 1440, h: 900, alt: { tr: 'Bugün ekranı: seviyeye ve hedefe göre hazırlanan günlük plan, kelime dersi, ünite adımı ve sınav hazırlığı', en: 'Today screen with the English guide open: the daily plan with a vocabulary lesson, a unit step and a business English task' } },
      { src: '/img/ingilizce-atolyesi/dilbilgisi-dersi.webp', w: 1440, h: 900, alt: { tr: 'Dilbilgisi dersi: Türkçe konu anlatımı, tablo ve sesli örnek cümleler', en: 'Grammar lesson: explanation in Turkish, a table and example sentences with audio' } },
      { src: '/img/ingilizce-atolyesi/aralikli-tekrar.webp', srcEn: '/img/ingilizce-atolyesi/aralikli-tekrar-en.webp', w: 1440, h: 900, alt: { tr: 'Tekrar ekranı: yanlış yapılan sorular ve öğrenilen kelimeler 10 dakika, 1, 3, 7 ve 21 gün sonra yeniden sorulur', en: 'Review screen with the English guide: missed questions and learned words come back after 10 minutes, then 1, 3, 7 and 21 days' } },
      { src: '/img/ingilizce-atolyesi/kesfet.webp', srcEn: '/img/ingilizce-atolyesi/kesfet-en.webp', w: 1440, h: 900, alt: { tr: 'Keşfet ekranı: kelimeler, kalıplar, kelime aileleri, deyimler, dilbilgisi ve sık hatalar', en: 'Explore screen with English labels under each section: words, collocations, word families, idioms, grammar and common mistakes' } },
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

const withLang = (url: string, p: Project, lang: Lang) => (p.langParam ? `${url}${url.includes('?') ? '&' : '?'}lang=${lang}` : url);
/** Canlı (sunucu) sürüm adresi, sayfanın diline göre. */
export const liveHref = (p: Project, lang: Lang) => (lang === 'en' && p.urlEn ? p.urlEn : withLang(p.url ?? '', p, lang));
/** "Dene" düğmesi: girişsiz deneme adresi varsa o, yoksa canlı sürüm. */
export const tryHref = (p: Project, lang: Lang) => (p.tryUrl ? withLang(p.tryUrl, p, lang) : liveHref(p, lang));
/** Vaka sayfasında sahadan gelen ölçülebilir sonuç var mı (yoksa demo sentetik veriyle etiketlenir). */
export const hasFieldResult = (p: Project) => (p.caseStudy?.tr.results?.length ?? 0) > 0;
