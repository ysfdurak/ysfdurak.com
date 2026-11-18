// Kesinti izleme: canlı adresleri kontrol eder, sorun varsa GitHub'da issue açar, düzelince kapatır.
// GitHub Actions her 10 dakikada bir çalıştırır (.github/workflows/saglik-kontrolu.yml).
// Kontrol listesi projects.ts'ten otomatik çıkar: yeni proje eklenince ayrıca bir şey yapmak gerekmez.
//
// Yerelde deneme (issue açmaz):  node scripts/saglik-kontrolu.mjs
// Hedef listesini doğrula:        node scripts/saglik-kontrolu.mjs --liste
import { PROJECTS } from '../src/data/projects.ts';

// ── Kontrol edilecek adresler ────────────────────────────────────────
// Her hedef için:
//   host     yönlendirmelerden sonra varılması gereken alan adı (varsayılan: url'in kendi alan adı).
//            Başka bir siteye yönlendirme 200 dönse bile sorun sayılır.
//   baslik   sayfanın <title> etiketinde aranacak metin (proje için projects.ts → isaret).
//   icerik   sayfa gövdesinde aranacak metin (başlığı olmayan adresler için: site haritası, /healthz).
const SABIT = [
  { ad: 'ysfdurak.com (TR)', url: 'https://ysfdurak.com/tr/', baslik: 'Yusuf Durak' },
  { ad: 'ysfdurak.com (EN)', url: 'https://ysfdurak.com/en/', baslik: 'Yusuf Durak' },
  { ad: 'Site haritası', url: 'https://ysfdurak.com/sitemap-index.xml', icerik: '<sitemap' },
  { ad: 'Sunucu (VPS)', url: 'https://app.ysfdurak.com/', icerik: 'çalışıyor' },
  // Canlı olup henüz projects.ts'te kartı olmayan uygulamalar
  { ad: 'Diyalog Atölyesi', url: 'https://diyalog.ysfdurak.com/', baslik: 'Diyalog' },
  { ad: 'Diyalog Atölyesi · sağlık', url: 'https://diyalog.ysfdurak.com/healthz', icerik: '"ok":true' },
  { ad: 'Kıvılcım', url: 'https://ysfdurak.github.io/kivilcim-zihin-oyunlari/', baslik: 'Kıvılcım' },
];

const hedefler = [...SABIT];
for (const p of PROJECTS) {
  if (p.url) hedefler.push({ ad: p.name, url: p.url, baslik: p.isaret });
  if (p.urlEn && p.urlEn !== p.url) hedefler.push({ ad: `${p.name} (EN)`, url: p.urlEn, baslik: p.isaret });
  // Sunucuda çalışan uygulamalarda /healthz: uygulama ayakta ve isteğe cevap veriyor mu? (gövde "ok" içermeli)
  if (p.health) hedefler.push({ ad: `${p.name} · sağlık`, url: new URL(p.health, p.url).href, icerik: 'ok' });
}
for (const h of hedefler) h.host ??= new URL(h.url).host;

// Yalnızca listeyi doğrula (PR kontrolü): url'i olan her projenin isaret'i olmalı, adresler geçerli olmalı.
if (process.argv.includes('--liste')) {
  const eksik = PROJECTS.filter((p) => p.url && !p.isaret).map((p) => p.name);
  if (eksik.length) {
    console.error(`projects.ts: canlı adresi olan ama "isaret" alanı olmayan projeler: ${eksik.join(', ')}`);
    process.exit(1);
  }
  for (const h of hedefler) console.log(`${h.ad} → ${h.url} [host=${h.host}${h.baslik ? `, başlık~"${h.baslik}"` : ''}${h.icerik ? `, içerik~"${h.icerik}"` : ''}]`);
  console.log(`\n${hedefler.length} hedef tanımlı, eksik yok.`);
  process.exit(0);
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
    const varis = new URL(r.url);
    if (varis.host !== h.host) {
      return { ok: false, ms, neden: `Başka adrese yönlendirildi: ${varis.host}${varis.pathname} (beklenen ${h.host})` };
    }
    const govde = h.baslik || h.icerik ? await r.text() : '';
    if (h.baslik) {
      const baslik = (govde.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
      if (!baslik.includes(h.baslik)) {
        return { ok: false, ms, neden: `Sayfa açıldı ama başlık beklenen gibi değil (“${baslik.slice(0, 80) || 'başlık yok'}”, aranan “${h.baslik}”)` };
      }
    }
    if (h.icerik && !govde.includes(h.icerik)) return { ok: false, ms, neden: `Sayfa açıldı ama beklenen içerik yok (“${h.icerik}”)` };
    return { ok: true, ms, neden: `HTTP ${r.status}${r.redirected ? ` → ${varis.pathname}` : ''}` };
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
if (!TOKEN || !REPO || process.env.ISSUE_AC === 'false') {
  console.log(`\n(${!TOKEN || !REPO ? 'GITHUB_TOKEN yok: yerel deneme' : 'Deneme çalıştırması'}, issue işlemi yapılmadı.)`);
  process.exit(sorunlu.length ? 1 : 0);
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
