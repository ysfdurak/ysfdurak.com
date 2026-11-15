// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { PROJECTS } from './src/data/projects.ts';

// Tek site haritası: Search Console'a yalnızca https://ysfdurak.com/sitemap-index.xml verilir.
// - Sitenin kendi sayfaları (sitemap-0.xml)
// - Alt alan adlarında çalışan uygulamaların giriş adresleri (projects.ts'teki url alanından otomatik)
// - Kendi site haritası olan uygulamalar (aşağıdaki liste) dizine ek harita olarak bağlanır
// Not: başka alan adındaki adresler (ör. ysfdurak.github.io) Google kuralı gereği buraya girmez.
const KENDI_HARITASI = ['https://ingilizce-atolyesi.ysfdurak.com/sitemap.xml'];
const uygulamaAdresleri = PROJECTS.map((p) => p.url)
  .filter((u) => u && /^https:\/\/[a-z0-9-]+\.ysfdurak\.com\//.test(u))
  .filter((u) => !KENDI_HARITASI.some((h) => h.startsWith(new URL(u).origin)));

// Site tamamen statik üretilir (dist/). Cloudflare Workers bu klasörü yayınlar.
export default defineConfig({
  site: 'https://ysfdurak.com',
  trailingSlash: 'always',
  i18n: {
    locales: ['tr', 'en'],
    defaultLocale: 'tr',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'tr', locales: { tr: 'tr-TR', en: 'en-US' } },
      filter: (page) => page !== 'https://ysfdurak.com/',
      customPages: uygulamaAdresleri,
      customSitemaps: KENDI_HARITASI,
      lastmod: new Date(),
    }),
  ],
});
