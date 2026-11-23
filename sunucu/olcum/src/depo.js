// Veri katmanı: tablolar, olay ve geri bildirim kaydı, yönetim özetleri.
// `db` yalnızca query(sql, params) → { rows } bekler: sunucuda node-postgres (pg.Pool), testte PGlite.
import { createHmac, randomBytes, randomUUID } from 'node:crypto';

export const AD = /^[a-z0-9_:-]{1,48}$/;
const TZ = 'Europe/Istanbul';
const gunSql = (kolon) => `to_char(${kolon} AT TIME ZONE '${TZ}', 'YYYY-MM-DD')`;

export async function kur(db) {
  const sema = `
    CREATE TABLE IF NOT EXISTS ayar (anahtar TEXT PRIMARY KEY, deger TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS olay (
      id BIGSERIAL PRIMARY KEY,
      at TIMESTAMPTZ NOT NULL DEFAULT now(),
      proje TEXT NOT NULL,
      ziyaretci TEXT NOT NULL,
      oturum TEXT NOT NULL,
      ad TEXT NOT NULL,
      ekran TEXT,
      sure_ms INTEGER,
      kaynak TEXT,
      cihaz TEXT,
      dil TEXT
    );
    CREATE INDEX IF NOT EXISTS olay_proje_at ON olay (proje, at);
    CREATE TABLE IF NOT EXISTS geri_bildirim (
      id BIGSERIAL PRIMARY KEY,
      at TIMESTAMPTZ NOT NULL DEFAULT now(),
      proje TEXT NOT NULL,
      ziyaretci TEXT NOT NULL,
      puan SMALLINT,
      metin TEXT NOT NULL DEFAULT '',
      ekran TEXT,
      iletisim TEXT,
      dil TEXT,
      durum TEXT NOT NULL DEFAULT 'yeni',
      not_metni TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS geri_bildirim_proje_at ON geri_bildirim (proje, at);
  `;
  // Komutlar tek tek çalıştırılır (bazı sürücüler tek istekte birden çok komutu kabul etmez).
  for (const komut of sema.split(';').map((k) => k.trim()).filter(Boolean)) await db.query(komut);
  // Takma kimlik anahtarı: sunucuya özel, ilk açılışta üretilir, veritabanıyla birlikte yedeklenir.
  let tuz = (await db.query("SELECT deger FROM ayar WHERE anahtar = 'tuz'")).rows[0]?.deger;
  if (!tuz) {
    tuz = randomBytes(32).toString('base64url');
    await db.query("INSERT INTO ayar (anahtar, deger) VALUES ('tuz', $1) ON CONFLICT DO NOTHING", [tuz]);
    tuz = (await db.query("SELECT deger FROM ayar WHERE anahtar = 'tuz'")).rows[0].deger;
  }
  return tuz;
}

/** Tarayıcının ürettiği rastgele kimlik, sunucuya özel anahtarla bir kez daha karıştırılır: veritabanında ham kimlik durmaz. */
export const takmaAd = (tuz, ham) => createHmac('sha256', tuz).update(String(ham)).digest('base64url').slice(0, 22);

const kisalt = (s, n) => (s == null ? null : String(s).slice(0, n));
/** Olay adı küçük harfe çevrilir, izin verilmeyen karakterler "_" olur (ör. "addAction" → "addaction"). */
export const temizAd = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9_:-]/g, '_').slice(0, 48);

/**
 * Bir tarayıcı paketindeki olayları yazar.
 * paket = { p: proje, z: ziyaretçi, o: oturum, d: dil, c: cihaz, k: kaynak, e: [{ a: ad, s: ekran, t: süre_ms }] }
 */
export async function olaylariYaz(db, tuz, paket) {
  const ziyaretci = takmaAd(tuz, paket.z);
  const oturum = takmaAd(tuz, 'o:' + paket.o);
  const dil = ['tr', 'en'].includes(paket.d) ? paket.d : null;
  const cihaz = ['mobil', 'masaustu'].includes(paket.c) ? paket.c : null;
  const kaynak = kisalt(paket.k, 64);
  let yazilan = 0;
  for (const e of paket.e.slice(0, 50)) {
    const ad = temizAd(e.a);
    if (!AD.test(ad)) continue;
    const ekran = e.s == null || e.s === '' ? null : temizAd(e.s);
    const sure = Number.isFinite(e.t) ? Math.max(0, Math.min(Math.round(e.t), 6 * 3600e3)) : null;
    await db.query(
      'INSERT INTO olay (proje, ziyaretci, oturum, ad, ekran, sure_ms, kaynak, cihaz, dil) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [paket.p, ziyaretci, oturum, ad, ekran, sure, ad === 'oturum:basla' ? kaynak : null, cihaz, dil],
    );
    yazilan++;
  }
  return yazilan;
}

export function geriBildirimDogrula(g) {
  const metin = String(g.m ?? '').trim();
  const puan = g.r === undefined || g.r === null || g.r === '' ? null : Number(g.r);
  if (!metin && puan === null) throw Error('Bir puan ver ya da birkaç kelime yaz.');
  if (metin.length > 2000) throw Error('Geri bildirim en fazla 2.000 karakter olabilir.');
  if (puan !== null && !(Number.isInteger(puan) && puan >= 1 && puan <= 5)) throw Error('Puan 1 ile 5 arasında olmalı.');
  const iletisim = g.i ? String(g.i).trim().slice(0, 200) : '';
  if (iletisim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(iletisim)) throw Error('E-posta adresi geçerli görünmüyor.');
  return { metin, puan, iletisim: iletisim || null };
}

export async function geriBildirimYaz(db, tuz, g) {
  const { metin, puan, iletisim } = geriBildirimDogrula(g);
  // Kimliksiz (ölçüm kapalı) geri bildirim: her kayda tek kullanımlık takma ad; ziyaret olaylarına bağlanmaz, huniye girmez.
  const kimliksiz = g.z === '' || g.z == null;
  const ziyaretci = takmaAd(tuz, kimliksiz ? 'anon:' + randomUUID() : g.z);
  await db.query(
    'INSERT INTO geri_bildirim (proje, ziyaretci, puan, metin, ekran, iletisim, dil) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [g.p, ziyaretci, puan, metin, g.s ? temizAd(g.s) : null, iletisim, ['tr', 'en'].includes(g.d) ? g.d : null],
  );
  if (kimliksiz) return;
  // Huniye "geri bildirim verdi" adımı olarak da girer.
  await db.query("INSERT INTO olay (proje, ziyaretci, oturum, ad, dil) VALUES ($1,$2,$3,'geri_bildirim',$4)", [
    g.p, ziyaretci, takmaAd(tuz, 'o:' + (g.o || '')), ['tr', 'en'].includes(g.d) ? g.d : null,
  ]);
}

export const DURUMLAR = { yeni: 'Yeni', inceleniyor: 'İnceleniyor', uygulandi: 'Uygulandı', uygulanmayacak: 'Uygulanmayacak' };

export async function geriBildirimGuncelle(db, id, { durum, not }) {
  if (!DURUMLAR[durum]) throw Error('Geçersiz durum.');
  await db.query('UPDATE geri_bildirim SET durum = $2, not_metni = $3 WHERE id = $1', [id, durum, String(not ?? '').slice(0, 1000)]);
}

export async function temizle(db, gun) {
  await db.query(`DELETE FROM olay WHERE at < now() - ($1 || ' days')::interval`, [String(gun)]);
  await db.query(`DELETE FROM geri_bildirim WHERE at < now() - ($1 || ' days')::interval`, [String(gun)]);
}

const sayi = (v) => Number(v ?? 0);

/** Tüm projelerin kısa özeti (yönetim ana sayfası). */
export async function genelOzet(db, gun) {
  const { rows } = await db.query(
    `SELECT proje,
       count(DISTINCT ziyaretci) AS ziyaretci,
       count(DISTINCT oturum) FILTER (WHERE ad <> 'geri_bildirim') AS oturum,
       COALESCE(sum(sure_ms) FILTER (WHERE ad = 'sure'), 0) AS sure,
       max(at) AS son
     FROM olay WHERE at > now() - ($1 || ' days')::interval GROUP BY proje`,
    [String(gun)],
  );
  const fb = await db.query(
    `SELECT proje, count(*) AS adet, avg(puan) AS puan, count(*) FILTER (WHERE durum = 'yeni') AS yeni
     FROM geri_bildirim WHERE at > now() - ($1 || ' days')::interval GROUP BY proje`,
    [String(gun)],
  );
  const geriDonen = await db.query(
    `SELECT proje, count(*) AS adet FROM (
       SELECT proje, ziyaretci FROM olay WHERE at > now() - ($1 || ' days')::interval
       GROUP BY proje, ziyaretci HAVING count(DISTINCT ${gunSql('at')}) >= 2) x GROUP BY proje`,
    [String(gun)],
  );
  const fbMap = new Map(fb.rows.map((r) => [r.proje, r]));
  const gdMap = new Map(geriDonen.rows.map((r) => [r.proje, sayi(r.adet)]));
  return rows.map((r) => {
    const f = fbMap.get(r.proje);
    return {
      proje: r.proje,
      ziyaretci: sayi(r.ziyaretci),
      oturum: sayi(r.oturum),
      geriDonen: gdMap.get(r.proje) ?? 0,
      ortOturumDk: sayi(r.oturum) ? Math.round((sayi(r.sure) / sayi(r.oturum) / 60000) * 10) / 10 : 0,
      geriBildirim: f ? sayi(f.adet) : 0,
      yeniGeriBildirim: f ? sayi(f.yeni) : 0,
      ortPuan: f && f.puan != null ? Math.round(Number(f.puan) * 10) / 10 : null,
      son: r.son,
    };
  });
}

/** Tek projenin ayrıntılı özeti. `ayar`: projeler.json'daki kayıt (huni, ekran ve olay adları). */
export async function projeOzeti(db, proje, gun, ayar = {}) {
  const p = [proje, String(gun)];
  const aralik = `proje = $1 AND at > now() - ($2 || ' days')::interval`;
  const q = async (sql) => (await db.query(sql, p)).rows;

  const [genel] = await q(
    `SELECT count(DISTINCT ziyaretci) AS ziyaretci, count(DISTINCT oturum) FILTER (WHERE ad <> 'geri_bildirim') AS oturum,
       COALESCE(sum(sure_ms) FILTER (WHERE ad = 'sure'), 0) AS sure FROM olay WHERE ${aralik}`,
  );
  const [geriDonen] = await q(
    `SELECT count(*) AS adet FROM (SELECT ziyaretci FROM olay WHERE ${aralik} GROUP BY ziyaretci HAVING count(DISTINCT ${gunSql('at')}) >= 2) x`,
  );
  const gunlukRows = await q(
    `SELECT ${gunSql('at')} AS gun, count(DISTINCT ziyaretci) AS ziyaretci FROM olay WHERE ${aralik} GROUP BY 1`,
  );
  const ekranRows = await q(
    `SELECT ekran, count(*) FILTER (WHERE ad = 'ekran') AS goruntulenme, count(DISTINCT ziyaretci) AS kisi,
       COALESCE(sum(sure_ms) FILTER (WHERE ad = 'sure'), 0) AS sure
     FROM olay WHERE ${aralik} AND ad IN ('ekran', 'sure') AND ekran IS NOT NULL GROUP BY ekran
     ORDER BY 4 DESC, 2 DESC`,
  );
  const olayRows = await q(
    `SELECT ad, count(*) AS adet, count(DISTINCT ziyaretci) AS kisi FROM olay
     WHERE ${aralik} AND ad NOT IN ('ekran', 'sure', 'oturum:basla') GROUP BY ad ORDER BY count(DISTINCT ziyaretci) DESC, count(*) DESC`,
  );
  const kaynakRows = await q(
    `SELECT COALESCE(NULLIF(kaynak, ''), 'doğrudan') AS kaynak, count(DISTINCT oturum) AS oturum FROM olay
     WHERE ${aralik} AND ad = 'oturum:basla' GROUP BY 1 ORDER BY 2 DESC LIMIT 15`,
  );
  const cihazRows = await q(
    `SELECT cihaz, count(DISTINCT ziyaretci) AS kisi FROM olay WHERE ${aralik} AND cihaz IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`,
  );
  const dilRows = await q(
    `SELECT dil, count(DISTINCT ziyaretci) AS kisi FROM olay WHERE ${aralik} AND dil IS NOT NULL AND ad <> 'geri_bildirim' GROUP BY 1 ORDER BY 2 DESC`,
  );

  // Huni: her adım için o adıma ulaşan kişi sayısı. Bir adım "a|b" ile birden çok olayı kabul eder; "ekran:x" ekran ziyaretidir.
  const huniTanimi = ayar.huni?.length
    ? ayar.huni
    : [['Uygulamayı açtı', 'oturum:basla'], ['Bir işlem yaptı', '*islem'], ['Geri bildirim verdi', 'geri_bildirim']];
  const huni = [];
  for (const [etiket, ifade] of huniTanimi) {
    const kosullar = [];
    const params = [...p];
    for (const parca of ifade.split('|')) {
      if (parca === '*islem') kosullar.push(`ad NOT IN ('ekran','sure','oturum:basla','oturum:giris','geri_bildirim')`);
      else if (parca.startsWith('ekran:')) {
        params.push(parca.slice(6));
        kosullar.push(`(ad = 'ekran' AND ekran = $${params.length})`);
      } else {
        params.push(parca);
        kosullar.push(`ad = $${params.length}`);
      }
    }
    const { rows } = await db.query(`SELECT count(DISTINCT ziyaretci) AS kisi FROM olay WHERE ${aralik} AND (${kosullar.join(' OR ')})`, params);
    huni.push({ adim: etiket, kisi: sayi(rows[0].kisi) });
  }

  const fbRows = await q(
    `SELECT id, ${gunSql('at')} AS tarih, puan, metin, ekran, iletisim, dil, durum, not_metni FROM geri_bildirim WHERE ${aralik} ORDER BY at DESC LIMIT 200`,
  );
  const puanli = fbRows.filter((f) => f.puan != null);

  // Günlük seri: kayıt olmayan günler sıfır.
  const gunMap = new Map(gunlukRows.map((r) => [r.gun, sayi(r.ziyaretci)]));
  const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: TZ });
  const gunluk = Array.from({ length: gun }, (_, i) => {
    const g = fmt.format(new Date(Date.now() - (gun - 1 - i) * 864e5));
    return { gun: g, ziyaretci: gunMap.get(g) ?? 0 };
  });

  const ekranAdi = (e) => ayar.ekranlar?.[e] ?? e;
  const olayAdi = (a) => ayar.olaylar?.[a] ?? a;
  return {
    proje,
    gun,
    ziyaretci: sayi(genel.ziyaretci),
    oturum: sayi(genel.oturum),
    geriDonen: sayi(geriDonen.adet),
    ortOturumDk: sayi(genel.oturum) ? Math.round((sayi(genel.sure) / sayi(genel.oturum) / 60000) * 10) / 10 : 0,
    gunluk,
    ekranlar: ekranRows.map((r) => ({
      ekran: r.ekran,
      ad: ekranAdi(r.ekran),
      kisi: sayi(r.kisi),
      goruntulenme: sayi(r.goruntulenme),
      toplamDk: Math.round((sayi(r.sure) / 60000) * 10) / 10,
      ortSn: sayi(r.goruntulenme) ? Math.round(sayi(r.sure) / sayi(r.goruntulenme) / 1000) : 0,
    })),
    olaylar: olayRows.map((r) => ({ olay: r.ad, ad: olayAdi(r.ad), kisi: sayi(r.kisi), adet: sayi(r.adet) })),
    huni,
    kaynaklar: kaynakRows.map((r) => ({ kaynak: r.kaynak, oturum: sayi(r.oturum) })),
    cihazlar: cihazRows.map((r) => ({ cihaz: r.cihaz, kisi: sayi(r.kisi) })),
    diller: dilRows.map((r) => ({ dil: r.dil, kisi: sayi(r.kisi) })),
    geriBildirim: {
      adet: fbRows.length,
      ortPuan: puanli.length ? Math.round((puanli.reduce((s, f) => s + f.puan, 0) / puanli.length) * 10) / 10 : null,
      liste: fbRows.map((f) => ({ ...f, id: sayi(f.id), ekranAdi: f.ekran ? ekranAdi(f.ekran) : '' })),
    },
  };
}
