// HTTP katmanı: tarayıcıdan gelen olay/geri bildirim istekleri ve şifreli yönetim sayfaları.
// Sunucu (src/sunucu.js) ve testler aynı işleyiciyi kullanır.
import { readFile } from 'node:fs/promises';
import { timingSafeEqual } from 'node:crypto';
import * as depo from './depo.js';
import { anaSayfa, projeSayfasi } from './yonetim.js';

const KIMLIK = /^[A-Za-z0-9_-]{8,64}$/;
const GUNLER = [7, 30, 90, 180];

/** "https://*.ysfdurak.com" gibi kalıpları kökenle eşleştirir. */
export function kokenUyar(koken, kaliplar) {
  if (!koken) return false;
  return kaliplar.some((k) => {
    if (k === koken) return true;
    if (!k.includes('*')) return false;
    const re = new RegExp('^' + k.split('*').map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[a-z0-9-]+') + '$');
    return re.test(koken);
  });
}

function projeAyari(projeler, ad) {
  const a = projeler[ad];
  if (!a || ad.startsWith('_')) return null;
  return a.kopya ? { ...projeler[a.kopya], ...a, kopya: undefined } : a;
}

async function govdeOku(req, sinir = 16 * 1024) {
  let boyut = 0;
  const parcalar = [];
  for await (const p of req) {
    boyut += p.length;
    if (boyut > sinir) throw Object.assign(Error('İstek çok büyük.'), { kod: 413 });
    parcalar.push(p);
  }
  return Buffer.concat(parcalar).toString('utf8');
}

/**
 * @param {object} o
 * @param {{query: Function}} o.db
 * @param {string} o.tuz                 takma kimlik anahtarı (depo.kur dönüşü)
 * @param {object} o.projeler            projeler.json içeriği
 * @param {string[]} o.kokenler          izinli kökenler (ör. https://*.ysfdurak.com)
 * @param {boolean} [o.adresDenetimi]    true: proje yalnızca projeler.json'daki kendi adresinden olay gönderebilir
 * @param {{kullanici: string, sifre: string}} o.yonetim
 * @param {number} [o.dakikaSiniri]      IP başına dakikada en çok istek (IP saklanmaz, yalnızca bellekte sayılır)
 */
export function uygulamaOlustur({ db, tuz, projeler, kokenler, adresDenetimi = true, yonetim, dakikaSiniri = 120 }) {
  const sayac = new Map();
  let istemciKodu = null;

  function sinirli(ip) {
    const simdi = Date.now();
    const s = sayac.get(ip);
    if (!s || s.bitis < simdi) {
      sayac.set(ip, { adet: 1, bitis: simdi + 60e3 });
      if (sayac.size > 10000) for (const [k, v] of sayac) if (v.bitis < simdi) sayac.delete(k);
      return false;
    }
    return ++s.adet > dakikaSiniri;
  }

  function yanit(res, kod, govde, basliklar = {}) {
    const metin = typeof govde === 'string' ? govde : JSON.stringify(govde);
    res.writeHead(kod, {
      'Content-Type': typeof govde === 'string' ? 'text/html; charset=utf-8' : 'application/json; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      ...basliklar,
    });
    res.end(metin);
  }

  function yonetimDenetle(req, res) {
    const [tur, deger] = String(req.headers.authorization || '').split(' ');
    if (tur === 'Basic' && deger) {
      const [k, ...s] = Buffer.from(deger, 'base64').toString('utf8').split(':');
      const bekle = Buffer.from(`${yonetim.kullanici}:${yonetim.sifre}`);
      const gelen = Buffer.from(`${k}:${s.join(':')}`);
      if (yonetim.sifre && gelen.length === bekle.length && timingSafeEqual(gelen, bekle)) return true;
    }
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Olcum", charset="UTF-8"', 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Giriş gerekli.');
    return false;
  }

  return async function isle(req, res) {
    const url = new URL(req.url, 'http://yerel');
    const yol = url.pathname;
    const koken = req.headers.origin;
    const cors = kokenUyar(koken, kokenler)
      ? { 'Access-Control-Allow-Origin': koken, Vary: 'Origin', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }
      : {};
    try {
      if (yol === '/saglik') return yanit(res, 200, { ok: true });

      if (yol === '/olcum.js' && req.method === 'GET') {
        istemciKodu ??= await readFile(new URL('../public/olcum.js', import.meta.url), 'utf8');
        res.writeHead(200, {
          'Content-Type': 'text/javascript; charset=utf-8',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin',
          'X-Content-Type-Options': 'nosniff',
        });
        return res.end(istemciKodu);
      }

      if (yol.startsWith('/v1/')) {
        if (req.method === 'OPTIONS') return yanit(res, cors['Access-Control-Allow-Origin'] ? 204 : 403, '', cors);
        if (req.method !== 'POST') return yanit(res, 405, { hata: 'Yalnızca POST.' }, cors);
        if (!cors['Access-Control-Allow-Origin']) return yanit(res, 403, { hata: 'Bu adresten kabul edilmiyor.' });
        const ip = String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        if (sinirli(ip)) return yanit(res, 429, { hata: 'Çok fazla istek.' }, cors);
        let b;
        try {
          b = JSON.parse(await govdeOku(req));
        } catch (e) {
          return yanit(res, e.kod || 400, { hata: e.kod ? e.message : 'Geçersiz istek.' }, cors);
        }
        const ayar = typeof b?.p === 'string' ? projeAyari(projeler, b.p) : null;
        if (!ayar) return yanit(res, 400, { hata: 'Tanınmayan proje.' }, cors);
        if (adresDenetimi && ayar.adres && new URL(ayar.adres).origin !== koken) return yanit(res, 403, { hata: 'Proje bu adresten ölçülmez.' }, cors);
        if (!KIMLIK.test(String(b.z))) return yanit(res, 400, { hata: 'Geçersiz kimlik.' }, cors);

        if (yol === '/v1/olay') {
          if (!KIMLIK.test(String(b.o)) || !Array.isArray(b.e)) return yanit(res, 400, { hata: 'Geçersiz istek.' }, cors);
          const adet = await depo.olaylariYaz(db, tuz, b);
          return yanit(res, 200, { ok: true, adet }, cors);
        }
        if (yol === '/v1/geri-bildirim') {
          try {
            await depo.geriBildirimYaz(db, tuz, b);
          } catch (e) {
            return yanit(res, 400, { hata: e.message }, cors);
          }
          return yanit(res, 200, { ok: true }, cors);
        }
        return yanit(res, 404, { hata: 'Bulunamadı.' }, cors);
      }

      if (yol === '/yonetim' || yol.startsWith('/yonetim/')) {
        if (!yonetimDenetle(req, res)) return;
        const gun = GUNLER.includes(Number(url.searchParams.get('gun'))) ? Number(url.searchParams.get('gun')) : 30;
        const ozelBaslik = { 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'" };

        const fbYol = yol.match(/^\/yonetim\/geri-bildirim\/(\d+)$/);
        if (fbYol && req.method === 'POST') {
          // Başka siteden form gönderimini reddet (CSRF): tarayıcı kendi sayfamızdan gönderirken Origin bizim adresimizdir.
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          if (koken && new URL(koken).host !== host) return yanit(res, 403, 'Reddedildi.', ozelBaslik);
          const f = new URLSearchParams(await govdeOku(req));
          try {
            await depo.geriBildirimGuncelle(db, Number(fbYol[1]), { durum: f.get('durum'), not: f.get('not') });
          } catch (e) {
            return yanit(res, 400, kacisli(e.message), ozelBaslik);
          }
          const don = f.get('don') || '/yonetim';
          res.writeHead(303, { Location: don.startsWith('/yonetim') ? don : '/yonetim' });
          return res.end();
        }
        if (req.method !== 'GET') return yanit(res, 405, 'Desteklenmiyor.', ozelBaslik);

        if (yol === '/yonetim' || yol === '/yonetim/') return yanit(res, 200, anaSayfa(projeler, await depo.genelOzet(db, gun), gun), ozelBaslik);
        if (yol === '/yonetim/ozet.json') return yanit(res, 200, await depo.genelOzet(db, gun), ozelBaslik);
        const p = yol.match(/^\/yonetim\/p\/([a-z0-9_-]+)(\.json)?$/);
        if (p) {
          const ayar = projeAyari(projeler, p[1]);
          if (!ayar) return yanit(res, 404, 'Proje yok.', ozelBaslik);
          const s = await depo.projeOzeti(db, p[1], gun, ayar);
          return p[2] ? yanit(res, 200, s, ozelBaslik) : yanit(res, 200, projeSayfasi(ayar.ad || p[1], s), ozelBaslik);
        }
        return yanit(res, 404, 'Bulunamadı.', ozelBaslik);
      }

      return yanit(res, 404, { hata: 'Bulunamadı.' });
    } catch (e) {
      console.error(e);
      if (!res.headersSent) yanit(res, 500, { hata: 'Sunucu hatası.' }, cors);
    }
  };
}

const kacisli = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
