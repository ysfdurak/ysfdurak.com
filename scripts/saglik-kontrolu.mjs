// Kesinti izleme: canlı adresleri kontrol eder, sorun varsa GitHub'da issue açar, düzelince kapatır.
// GitHub Actions her 10 dakikada bir çalıştırır (.github/workflows/saglik-kontrolu.yml).
// Kontrol listesi projects.ts'ten otomatik çıkar: yeni proje eklenince ayrıca bir şey yapmak gerekmez.
//
// Yerelde deneme (issue açmaz):  node scripts/saglik-kontrolu.mjs
import { PROJECTS } from '../src/data/projects.ts';

// ── Kontrol edilecek adresler ────────────────────────────────────────
const SABIT = [
  { ad: 'ysfdurak.com (TR)', url: 'https://ysfdurak.com/tr/', icerik: 'ysfdurak' },
  { ad: 'ysfdurak.com (EN)', url: 'https://ysfdurak.com/en/', icerik: 'ysfdurak' },
  { ad: 'Site haritası', url: 'https://ysfdurak.com/sitemap-index.xml', icerik: '<sitemap' },
  { ad: 'Sunucu (VPS)', url: 'https://app.ysfdurak.com/', icerik: 'çalışıyor' },
];

const hedefler = [...SABIT];
for (const p of PROJECTS) {
  if (p.url) hedefler.push({ ad: p.name, url: p.url });
  if (p.urlEn && p.urlEn !== p.url) hedefler.push({ ad: `${p.name} (EN)`, url: p.urlEn });
  // Sunucuda çalışan uygulamalarda /healthz: uygulama ayakta ve isteğe cevap veriyor mu?
  if (p.health) hedefler.push({ ad: `${p.name} · sağlık`, url: new URL(p.health, p.url).href });
}

// ── Kontrol ──────────────────────────────────────────────────────────
const DENEME = 3; // tek seferlik ağ dalgalanması alarm üretmesin
const BEKLE_MS = 15_000;
const ZAMAN_ASIMI_MS = 15_000;
const YAVAS_MS = 5_000;
const uyu = (ms) => new Promise((r) => setTimeout(r, ms));

async function tekKontrol(h) {
  const t0 = Date.now();
  try {
    const r = await fetch(h.url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(ZAMAN_ASIMI_MS),
      headers: { 'user-agent': 'ysfdurak-saglik-kontrolu/1.0 (+https://github.com/ysfdurak/ysfdurak.com)' },
    });
    const ms = Date.now() - t0;
    if (r.status >= 400) return { ok: false, ms, neden: `HTTP ${r.status}` };
    if (h.icerik) {
      const govde = await r.text();
      if (!govde.includes(h.icerik)) return { ok: false, ms, neden: `Sayfa açıldı ama beklenen içerik yok (“${h.icerik}”)` };
    }
    return { ok: true, ms, neden: `HTTP ${r.status}` };
  } catch (e) {
    const ms = Date.now() - t0;
    const neden = e?.name === 'TimeoutError' ? `${ZAMAN_ASIMI_MS / 1000} sn içinde cevap yok` : `Bağlanılamadı (${e?.cause?.code || e?.message || e})`;
    return { ok: false, ms, neden };
  }
}

async function kontrol(h) {
  let son;
  for (let i = 1; i <= DENEME; i++) {
    son = await tekKontrol(h);
    if (son.ok) return { ...h, ...son, deneme: i };
    if (i < DENEME) await uyu(BEKLE_MS);
  }
  return { ...h, ...son, deneme: DENEME };
}

const sonuclar = await Promise.all(hedefler.map(kontrol));
const sorunlu = sonuclar.filter((s) => !s.ok);

// ── Rapor (Actions özet sayfası + konsol) ────────────────────────────
const satirlar = sonuclar.map((s) => {
  const durum = s.ok ? (s.ms > YAVAS_MS ? '🟡 Yavaş' : '🟢 Çalışıyor') : '🔴 Sorun';
  return `| ${durum} | ${s.ad} | ${s.url} | ${s.ms} ms | ${s.neden}${s.deneme > 1 && s.ok ? ` (${s.deneme}. denemede)` : ''} |`;
});
const rapor = [
  `### Sağlık kontrolü · ${new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}`,
  '',
  `${sonuclar.length - sorunlu.length} / ${sonuclar.length} adres çalışıyor.`,
  '',
  '| Durum | Ad | Adres | Süre | Not |',
  '| --- | --- | --- | --- | --- |',
  ...satirlar,
].join('\n');
console.log(rapor);
if (process.env.GITHUB_STEP_SUMMARY) {
  const { appendFileSync } = await import('node:fs');
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, rapor + '\n');
}

// ── Issue aç / kapat ─────────────────────────────────────────────────
const TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
if (!TOKEN || !REPO) {
  console.log('\n(GITHUB_TOKEN yok: yerel deneme, issue işlemi yapılmadı.)');
  process.exit(0);
}

const ETIKET = 'kesinti';
const api = async (yol, secenek = {}) => {
  const r = await fetch(`https://api.github.com/repos/${REPO}${yol}`, {
    ...secenek,
    headers: { authorization: `Bearer ${TOKEN}`, accept: 'application/vnd.github+json', 'content-type': 'application/json' },
  });
  if (!r.ok && r.status !== 422) throw new Error(`GitHub API ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json();
};
const isaret = (url) => `<!-- saglik:${url} -->`;

await api('/labels', { method: 'POST', body: JSON.stringify({ name: ETIKET, color: 'd73a4a', description: 'Otomatik kesinti kaydı' }) });
const acik = await api(`/issues?state=open&labels=${ETIKET}&per_page=100`);

for (const s of sonuclar) {
  const issue = acik.find((i) => i.body?.includes(isaret(s.url)));
  if (!s.ok && !issue) {
    await api('/issues', {
      method: 'POST',
      body: JSON.stringify({
        title: `🔴 Kesinti: ${s.ad}`,
        labels: [ETIKET],
        body: `${isaret(s.url)}\n**Adres:** ${s.url}\n**Neden:** ${s.neden}\n**Başlangıç:** ${new Date().toISOString()}\n\n${DENEME} deneme yapıldı. Düzelince bu kayıt kendiliğinden kapanır.\n\nİlk bakılacaklar: \`ssh ysf\` → \`sudo docker ps\` → \`sudo docker logs --tail 50 <konteyner>\``,
      }),
    });
    console.log(`Issue açıldı: ${s.ad}`);
  } else if (s.ok && issue) {
    const dk = Math.round((Date.now() - new Date(issue.created_at).getTime()) / 60000);
    await api(`/issues/${issue.number}/comments`, { method: 'POST', body: JSON.stringify({ body: `🟢 Düzeldi (${s.neden}, ${s.ms} ms). Kesinti süresi yaklaşık **${dk} dakika**.` }) });
    await api(`/issues/${issue.number}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed', state_reason: 'completed' }) });
    console.log(`Issue kapandı: ${s.ad} (${dk} dk)`);
  }
}

// Sorun varsa iş kırmızı görünsün (Actions sekmesinde hemen fark edilir).
process.exit(sorunlu.length ? 1 : 0);
