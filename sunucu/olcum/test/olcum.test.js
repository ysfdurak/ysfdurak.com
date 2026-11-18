// Servis testleri: gerçek Postgres yerine aynı SQL'i çalıştıran PGlite (tarayıcıda/Node'da çalışan Postgres).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { kur, temizle } from '../src/depo.js';
import { uygulamaOlustur, kokenUyar } from '../src/uygulama.js';

const projeler = JSON.parse(readFileSync(new URL('../projeler.json', import.meta.url), 'utf8'));
const KOKEN = 'https://ivme.ysfdurak.com';
const SIFRE = 'test-sifresi-uzun-12';
let db, sunucu, adres;

before(async () => {
  db = new PGlite();
  const tuz = await kur(db);
  const isle = uygulamaOlustur({
    db, tuz, projeler, kokenler: ['https://ysfdurak.com', 'https://*.ysfdurak.com'],
    yonetim: { kullanici: 'yusuf', sifre: SIFRE }, dakikaSiniri: 1000,
  });
  sunucu = createServer(isle);
  await new Promise((r) => sunucu.listen(0, r));
  adres = `http://127.0.0.1:${sunucu.address().port}`;
});
after(async () => { sunucu.close(); await db.close(); });

const gonder = (yol, govde, koken = KOKEN) =>
  fetch(adres + yol, { method: 'POST', headers: { 'Content-Type': 'text/plain', ...(koken ? { Origin: koken } : {}) }, body: JSON.stringify(govde) });
const yonetim = (yol, ek = {}) =>
  fetch(adres + yol, { ...ek, headers: { Authorization: 'Basic ' + Buffer.from('yusuf:' + SIFRE).toString('base64'), ...(ek.headers || {}) } });
const Z1 = 'ziyaretci-bir-0001', Z2 = 'ziyaretci-iki-0002';

test('köken kalıpları', () => {
  assert.ok(kokenUyar('https://ivme.ysfdurak.com', ['https://*.ysfdurak.com']));
  assert.ok(!kokenUyar('https://ivme.ysfdurak.com.kotu.com', ['https://*.ysfdurak.com']));
  assert.ok(!kokenUyar('https://kotuysfdurak.com', ['https://*.ysfdurak.com']));
  assert.ok(!kokenUyar(undefined, ['https://*.ysfdurak.com']));
});

test('olaylar yazılır; ham kimlik, IP ve içerik saklanmaz', async () => {
  const r = await gonder('/v1/olay', {
    p: 'ivme', z: Z1, o: 'oturum-bir-0001', d: 'tr', c: 'masaustu', k: 'linkedin.com',
    e: [
      { a: 'oturum:basla' }, { a: 'oturum:giris', s: 'giris' }, { a: 'ekran', s: 'overview' },
      { a: 'sure', s: 'overview', t: 45000 }, { a: 'ekran', s: 'new' }, { a: 'sure', s: 'new', t: 30000 },
      { a: 'islem:create', s: 'new' }, { a: 'Kötü Ad!<script>', s: 'new' },
    ],
  });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('access-control-allow-origin'), KOKEN);
  assert.equal((await r.json()).adet, 8);
  const { rows } = await db.query('SELECT * FROM olay');
  assert.ok(rows.every((x) => x.ziyaretci !== Z1 && x.ziyaretci.length === 22), 'ham kimlik yok');
  assert.ok(rows.some((x) => x.ad === 'k_t__ad__script_'), 'ad temizlenir');
  assert.equal(rows.filter((x) => x.kaynak).length, 1, 'kaynak yalnızca oturum başında');
  assert.ok(!JSON.stringify(rows).includes('127.0.0.1'));
});

test('izinsiz köken, tanınmayan proje, başka projenin adresi ve bozuk istek reddedilir', async () => {
  assert.equal((await gonder('/v1/olay', { p: 'ivme', z: Z1, o: 'oturum-bir-0001', e: [] }, 'https://kotu.com')).status, 403);
  assert.equal((await gonder('/v1/olay', { p: 'ivme', z: Z1, o: 'oturum-bir-0001', e: [] }, null)).status, 403);
  assert.equal((await gonder('/v1/olay', { p: 'yok', z: Z1, o: 'oturum-bir-0001', e: [] })).status, 400);
  assert.equal((await gonder('/v1/olay', { p: 'ivme-en', z: Z1, o: 'oturum-bir-0001', e: [] })).status, 403, 'ivme-en yalnızca kendi adresinden');
  assert.equal((await gonder('/v1/olay', { p: 'ivme', z: 'kısa', o: 'oturum-bir-0001', e: [] })).status, 400);
  const buyuk = await fetch(adres + '/v1/olay', { method: 'POST', headers: { Origin: KOKEN }, body: 'x'.repeat(20000) });
  assert.equal(buyuk.status, 413);
  const on = await fetch(adres + '/v1/olay', { method: 'OPTIONS', headers: { Origin: KOKEN } });
  assert.equal(on.status, 204);
});

test('geri bildirim: doğrulama, e-posta yalnızca izinle', async () => {
  assert.equal((await gonder('/v1/geri-bildirim', { p: 'ivme', z: Z2, o: 'oturum-iki-0002' })).status, 400, 'boş');
  assert.equal((await gonder('/v1/geri-bildirim', { p: 'ivme', z: Z2, r: 7 })).status, 400, 'puan 1-5');
  assert.equal((await gonder('/v1/geri-bildirim', { p: 'ivme', z: Z2, r: 4, m: 'x', i: 'eposta-degil' })).status, 400);
  assert.equal((await gonder('/v1/geri-bildirim', { p: 'ivme', z: Z2, o: 'oturum-iki-0002', d: 'tr', s: 'list', r: 4, m: 'Filtreler güzel <b>ama</b>' })).status, 200);
  assert.equal((await gonder('/v1/geri-bildirim', { p: 'ivme', z: Z1, o: 'oturum-bir-0001', r: 5, m: '', i: 'a@b.co' })).status, 200);
  const { rows } = await db.query('SELECT * FROM geri_bildirim ORDER BY id');
  assert.equal(rows.length, 2);
  assert.equal(rows[0].iletisim, null);
  assert.equal(rows[1].iletisim, 'a@b.co');
});

test('yönetim şifresiz açılmaz', async () => {
  assert.equal((await fetch(adres + '/yonetim')).status, 401);
  const yanlis = await fetch(adres + '/yonetim', { headers: { Authorization: 'Basic ' + Buffer.from('yusuf:yanlis').toString('base64') } });
  assert.equal(yanlis.status, 401);
});

test('proje özeti: ekran süreleri, huni, kaynak, geri bildirim', async () => {
  await gonder('/v1/olay', { p: 'ivme', z: Z2, o: 'oturum-iki-0002', d: 'en', c: 'mobil', e: [{ a: 'oturum:basla' }, { a: 'ekran', s: 'overview' }, { a: 'sure', s: 'overview', t: 15000 }] });
  const s = await (await yonetim('/yonetim/p/ivme.json?gun=30')).json();
  assert.equal(s.ziyaretci, 2);
  assert.equal(s.oturum, 2);
  const ob = s.ekranlar.find((e) => e.ekran === 'overview');
  assert.equal(ob.ad, 'Genel bakış');
  assert.equal(ob.goruntulenme, 2);
  assert.equal(ob.kisi, 2);
  assert.equal(ob.ortSn, 30);
  assert.equal(s.ortOturumDk, Math.round((90000 / 2 / 60000) * 10) / 10);
  assert.deepEqual(s.huni.map((h) => h.kisi), [1, 1, 1, 0, 0, 2]);
  assert.equal(s.olaylar.find((o) => o.olay === 'islem:create').ad, 'Öneri gönderdi');
  assert.ok(!s.olaylar.some((o) => ['ekran', 'sure', 'oturum:basla'].includes(o.olay)));
  assert.deepEqual(s.kaynaklar.map((k) => k.kaynak).sort(), ['doğrudan', 'linkedin.com']);
  assert.equal(s.geriBildirim.adet, 2);
  assert.equal(s.geriBildirim.ortPuan, 4.5);
  assert.equal(s.gunluk.length, 30);
  assert.equal(s.gunluk.at(-1).ziyaretci, 2);
});

test('yönetim sayfaları HTML üretir, içerik kaçışlıdır; geri bildirim durumu güncellenir', async () => {
  const ana = await yonetim('/yonetim?gun=7');
  assert.equal(ana.status, 200);
  const h = await ana.text();
  assert.match(h, /İvme \(TR\)/);
  assert.match(h, /İvme \(EN\)/);
  const p = await (await yonetim('/yonetim/p/ivme')).text();
  assert.match(p, /&lt;b&gt;ama&lt;\/b&gt;/);
  assert.ok(!p.includes('<b>ama</b>'));
  const id = (await db.query("SELECT id FROM geri_bildirim WHERE metin LIKE 'Filtre%'")).rows[0].id;
  const kotu = await yonetim(`/yonetim/geri-bildirim/${id}`, { method: 'POST', redirect: 'manual', headers: { Origin: 'https://kotu.com', Host: '127.0.0.1', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'durum=uygulandi' });
  assert.equal(kotu.status, 403, 'başka siteden form reddedilir');
  const r = await yonetim(`/yonetim/geri-bildirim/${id}`, {
    method: 'POST', redirect: 'manual', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ durum: 'uygulandi', not: 'Filtre çubuğu sadeleşti (v1.5)', don: 'https://kotu.com' }).toString(),
  });
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/yonetim', 'dış yönlendirme yapılmaz');
  const row = (await db.query('SELECT durum, not_metni FROM geri_bildirim WHERE id = $1', [id])).rows[0];
  assert.deepEqual(row, { durum: 'uygulandi', not_metni: 'Filtre çubuğu sadeleşti (v1.5)' });
  const ozet = await (await yonetim('/yonetim/ozet.json')).json();
  assert.equal(ozet.find((x) => x.proje === 'ivme').geriBildirim, 2);
});

test('istemci kodu sunulur', async () => {
  const r = await fetch(adres + '/olcum.js');
  assert.equal(r.status, 200);
  assert.match(r.headers.get('content-type'), /javascript/);
  assert.match(await r.text(), /window\.olcum/);
});

test('saklama süresi dolan kayıtlar silinir', async () => {
  await db.query("UPDATE olay SET at = now() - interval '200 days' WHERE ad = 'oturum:giris'");
  await temizle(db, 180);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM olay WHERE ad = 'oturum:giris'")).rows[0].n, 0);
  assert.ok((await db.query('SELECT count(*)::int AS n FROM olay')).rows[0].n > 0);
});

test('hız sınırı', async () => {
  const tuz = await kur(db);
  const isle = uygulamaOlustur({ db, tuz, projeler, kokenler: ['https://*.ysfdurak.com'], yonetim: { kullanici: 'y', sifre: SIFRE }, dakikaSiniri: 3 });
  const s = createServer(isle);
  await new Promise((r) => s.listen(0, r));
  const a = `http://127.0.0.1:${s.address().port}`;
  const kodlar = [];
  for (let i = 0; i < 5; i++)
    kodlar.push((await fetch(a + '/v1/olay', { method: 'POST', headers: { Origin: KOKEN }, body: JSON.stringify({ p: 'ivme', z: Z1, o: 'oturum-bir-0001', e: [] }) })).status);
  s.close();
  assert.deepEqual(kodlar, [200, 200, 200, 429, 429]);
});
