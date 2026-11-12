// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
    }),
  ],
});
