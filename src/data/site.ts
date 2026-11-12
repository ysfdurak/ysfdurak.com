// Sitenin genel bilgileri. İsim, unvan ve bağlantıları buradan değiştir;
// tüm sayfalar bu dosyayı okur.
export const SITE = {
  url: 'https://ysfdurak.com',
  name: 'Yusuf Durak',
  // Türkçe sayfalarda iletisim@, İngilizce sayfalarda contact@ görünür (ikisi de aynı Gmail'e yönlenir).
  email: { tr: 'iletisim@ysfdurak.com', en: 'contact@ysfdurak.com' },
  github: 'https://github.com/ysfdurak',
  linkedin: 'https://www.linkedin.com/in/yusuf-durak',
  kesit: 'https://ysfdurak.github.io/',
  title: {
    tr: 'Operasyon, veri ve karar destek uygulamaları',
    en: 'Operations, data and decision-support tools',
  },
  description: {
    tr: 'Depo ve operasyon sahasından gelen problemler için veri ve yazılımla karar destek uygulamaları. Canlı projeleri tarayıcıda deneyin.',
    en: 'Decision-support tools built with data and software for real warehouse and operations problems. Try the live ones in your browser.',
  },
} as const;
