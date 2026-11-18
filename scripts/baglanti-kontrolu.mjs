// Derlenmiş sitede (dist/) iç bağlantıları kontrol eder: her href/src="/..." bir dosyaya ya da
// _redirects kuralına karşılık gelmeli; sayfa içi #bağlantının hedef id'si de bulunmalı.
// Dış adreslere istek atmaz (onları sağlık kontrolü izler).
//
// Kullanım: npm run build && node scripts/baglanti-kontrolu.mjs
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
if (!existsSync(DIST)) {
  console.error('dist/ yok: önce npm run build');
  process.exit(1);
}

const sayfalar = [];
(function gez(d) {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) gez(p);
    else if (f.endsWith('.html')) sayfalar.push(p);
  }
})(DIST);

const yonlendirmeler = existsSync(join(DIST, '_redirects'))
  ? readFileSync(join(DIST, '_redirects'), 'utf8').split('\n').map((l) => l.trim().split(/\s+/)[0]).filter((k) => k && !k.startsWith('#'))
  : [];
const yonlendirmeVar = (yol) =>
  yonlendirmeler.some((k) => (k.endsWith('*') ? yol.startsWith(k.slice(0, -1)) : k === yol || k === yol.replace(/\/$/, '')));

const idOnbellek = new Map();
const idler = (dosya) => {
  if (!idOnbellek.has(dosya)) {
    const html = readFileSync(dosya, 'utf8');
    idOnbellek.set(dosya, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idOnbellek.get(dosya);
};

function dosyaBul(yol) {
  const temiz = decodeURIComponent(yol).replace(/^\//, '');
  for (const aday of [temiz, join(temiz, 'index.html'), temiz + '.html']) {
    const p = join(DIST, aday);
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const hatalar = [];
let sayac = 0;
for (const sayfa of sayfalar) {
  const html = readFileSync(sayfa, 'utf8');
  for (const m of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const deger = m[1].replace(/&amp;/g, '&');
    if (!deger.startsWith('/') || deger.startsWith('//')) {
      // Aynı sayfa içi çapa
      if (deger.startsWith('#') && deger.length > 1 && !idler(sayfa).has(decodeURIComponent(deger.slice(1)))) {
        hatalar.push(`${relative(DIST, sayfa)} → ${deger} (sayfada bu id yok)`);
      }
      continue;
    }
    sayac++;
    const [yolSorgu, capa] = deger.split('#');
    const yol = yolSorgu.split('?')[0];
    const hedef = dosyaBul(yol);
    if (!hedef) {
      if (!yonlendirmeVar(yol)) hatalar.push(`${relative(DIST, sayfa)} → ${deger} (dosya yok)`);
      continue;
    }
    if (capa && hedef.endsWith('.html') && !idler(hedef).has(decodeURIComponent(capa))) {
      hatalar.push(`${relative(DIST, sayfa)} → ${deger} (hedef sayfada #${capa} yok)`);
    }
  }
}

if (hatalar.length) {
  console.error(`${hatalar.length} kırık iç bağlantı:\n` + [...new Set(hatalar)].map((h) => '  ' + h).join('\n'));
  process.exit(1);
}
console.log(`${sayfalar.length} sayfada ${sayac} iç bağlantı kontrol edildi, kırık yok.`);
