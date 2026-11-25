// HTTP katmanı: tarayıcıdan gelen olay/geri bildirim istekleri ve şifreli yönetim sayfaları.
// Sunucu (src/sunucu.js) ve testler aynı işleyiciyi kullanır.
import { readFile } from 'node:fs/promises';
import { timingSafeEqual } from 'node:crypto';
import * as depo from './depo.js';
import { anaSayfa, projeSayfasi, disProjeSayfasi } from './yonetim.js';
import { disSatir } from './dis.js';

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
 * @param {number} [o.dakikaSiniri]      IP başına dakikada en çok olay isteği (IP saklanmaz, yalnızca bellekte sayılır)
 * @param {number} [o.geriBildirimSiniri] IP başına 10 dakikada en çok geri bildirim
 * @param {number} [o.girisDenemeSiniri]  IP başına 15 dakikada en çok hatalı yönetim girişi; aşılınca o IP 15 dakika bekler
 * @param {(ayar: object, gun: number) => Promise<object|null>} [o.disOku]  kendi ölçümü olan projelerin özetini okur (dis.js)
 */
export function uygulamaOlustur({ db, tuz, projeler, kokenler, adresDenetimi = true, yonetim, dakikaSiniri = 120, geriBildirimSiniri = 10, girisDenemeSiniri = 10, disOku = async () => null }) {
  let istemciKodu = null;

  /** Bellekte kayan pencere sayacı: anahtar başına `sure` ms içinde en çok `sinir` sayım. */
  function pencere(sure, sinir) {
    const sayac = new Map();
    const bak = (anahtar) => {
      const simdi = Date.now();
      let s = sayac.get(anahtar);
      if (!s || s.bitis < simdi) {
        s = { adet: 0, bitis: simdi + sure };
        sayac.set(anahtar, s);
        if (sayac.size > 10000) for (const [k, v] of sayac) if (v.bitis < simdi) sayac.delete(k);
      }
      return s;
    };
    return {
      say: (anahtar) => ++bak(anahtar).adet > sinir,
      doldu: (anahtar) => bak(anahtar).adet >= sinir,
      sifirla: (anahtar) => sayac.delete(anahtar),
    };
  }
  const olaySiniri = pencere(60e3, dakikaSiniri);
  const fbSiniri = pencere(10 * 60e3, geriBildirimSiniri);
  // Yönetim şifresine deneme-yanılma saldırısı: hatalı girişler IP başına sayılır.
  const girisSiniri = pencere(15 * 60e3, girisDenemeSiniri);
  // Caddy, CF-Connecting-IP'yi yalnızca Cloudflare'den gelen isteklerde korur, diğerlerinde gerçek IP ile yeniden yazar.
  const ipBul = (req) => String(req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

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
    const ip = ipBul(req);
    if (girisSiniri.doldu(ip)) {
      res.writeHead(429, { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '900', 'Cache-Control': 'no-store' });
      res.end('Çok fazla hatalı giriş denemesi. 15 dakika sonra tekrar dene.');
      return false;
    }
    const [tur, deger] = String(req.headers.authorization || '').split(' ');
    if (tur === 'Basic' && deger) {
      const [k, ...s] = Buffer.from(deger, 'base64').toString('utf8').split(':');
      const bekle = Buffer.from(`${yonetim.kullanici}:${yonetim.sifre}`);
      const gelen = Buffer.from(`${k}:${s.join(':')}`);
      if (yonetim.sifre && gelen.length === bekle.length && timingSafeEqual(gelen, bekle)) return true;
      girisSiniri.say(ip); // yalnızca bilgi gönderilip yanlış çıkan denemeler sayılır; ilk "giriş gerekli" yanıtı sayılmaz
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
          // Bütün projeler bu betiği yükler; değişiklik en geç 5 dakikada yayılsın. stale-while-revalidate:
          // süre dolunca eski kopya hemen sunulur, yenisi arka planda alınır (sayfa açılışı yavaşlamaz).
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
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
        const ip = ipBul(req);
        if (olaySiniri.say(ip)) return yanit(res, 429, { hata: 'Çok fazla istek.' }, cors);
        if (yol === '/v1/geri-bildirim' && fbSiniri.say(ip)) return yanit(res, 429, { hata: 'Çok fazla geri bildirim. Biraz sonra tekrar dene.' }, cors);
        let b;
        try {
          b = JSON.parse(await govdeOku(req));
        } catch (e) {
          return yanit(res, e.kod || 400, { hata: e.kod ? e.message : 'Geçersiz istek.' }, cors);
        }
        const ayar = typeof b?.p === 'string' ? projeAyari(projeler, b.p) : null;
        if (!ayar) return yanit(res, 400, { hata: 'Tanınmayan proje.' }, cors);
        if (ayar.dis) return yanit(res, 400, { hata: 'Bu proje kendi ölçümünü kullanır.' }, cors);
        if (adresDenetimi && ayar.adres && new URL(ayar.adres).origin !== koken) return yanit(res, 403, { hata: 'Proje bu adresten ölçülmez.' }, cors);
        // Geri bildirimde boş kimlik kabul edilir: ölçüm kapalı tarayıcı kimlik üretmez (olcum.js 2).
        const kimliksiz = yol === '/v1/geri-bildirim' && (b.z === '' || b.z == null);
        if (!kimliksiz && !KIMLIK.test(String(b.z))) return yanit(res, 400, { hata: 'Geçersiz kimlik.' }, cors);

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
        // Referrer-Policy: same-origin. "no-referrer" olsaydı tarayıcı kendi formumuzun gönderiminde Origin: null yollar,
        // aşağıdaki CSRF denetimi de gerçek kaydı reddederdi. same-origin dış sitelere adres sızdırmaz.
        const ozelBaslik = { 'Cache-Control': 'no-store', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'" };

        const fbYol = yol.match(/^\/yonetim\/geri-bildirim\/(\d+)$/);
        if (fbYol && req.method === 'POST') {
          // Başka siteden form gönderimini reddet (CSRF). Tarayıcı Basic Auth bilgisini başka siteden gelen isteğe de ekler;
          // bu yüzden yalnızca kendi sayfamızdan geldiği kanıtlanan gönderim kabul edilir: Sec-Fetch-Site varsa same-origin
          // olmalı, Origin olmalı ve bizim adresimiz olmalı. Origin'siz gönderim (eski/alışılmadık istemci) reddedilir.
          const host = req.headers['x-forwarded-host'] || req.headers.host;
          const site = req.headers['sec-fetch-site'];
          let kokenHost = null;
          try { kokenHost = koken ? new URL(koken).host : null; } catch { kokenHost = null; }
          if ((site && site !== 'same-origin') || !kokenHost || kokenHost !== host) return yanit(res, 403, 'Reddedildi.', ozelBaslik);
          const f = new URLSearchParams(await govdeOku(req));
          try {
            await depo.geriBildirimGuncelle(db, Number(fbYol[1]), { durum: f.get('durum'), not: f.get('not') });
          } catch (e) {
            return yanit(res, 400, kacisli(e.message), ozelBaslik);
          }
          const don = f.get('don') || '/yonetim';
          res.writeHead(303, { Location: /^\/yonetim(?:[/?]|$)/.test(don) ? don : '/yonetim', 'Cache-Control': 'no-store' });
          return res.end();
        }
        if (req.method !== 'GET') return yanit(res, 405, 'Desteklenmiyor.', ozelBaslik);

        // Ana tablo: kendi olaylarımız + kendi ölçümü olan projelerin iç ağdan okunan özeti (paralel, 3 sn sınırlı).
        const genel = async () => {
          const disler = Object.keys(projeler).filter((k) => !k.startsWith('_') && projeler[k].dis);
          const [ic, ...dis] = await Promise.all([depo.genelOzet(db, gun), ...disler.map((k) => disOku(projeler[k], gun))]);
          return [...ic.filter((r) => !disler.includes(r.proje)), ...disler.map((k, i) => disSatir(k, dis[i]))];
        };
        if (yol === '/yonetim' || yol === '/yonetim/') return yanit(res, 200, anaSayfa(projeler, await genel(), gun), ozelBaslik);
        if (yol === '/yonetim/ozet.json') return yanit(res, 200, await genel(), ozelBaslik);
        const p = yol.match(/^\/yonetim\/p\/([a-z0-9_-]+)(\.json)?$/);
        if (p) {
          const ayar = projeAyari(projeler, p[1]);
          if (!ayar) return yanit(res, 404, 'Proje yok.', ozelBaslik);
          if (ayar.dis) {
            const s = await disOku(ayar, gun);
            return p[2] ? yanit(res, s ? 200 : 502, s || { hata: 'Ulaşılamadı.' }, ozelBaslik) : yanit(res, 200, disProjeSayfasi(ayar, p[1], s, gun), ozelBaslik);
          }
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
