// Ölçüm servisi: https://olcum.ysfdurak.com
// Ayarlar ortam değişkenlerinden okunur (.env.example). Kurulum: sunucu/kurulum-olcum.sh
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { kur, temizle } from './depo.js';
import { uygulamaOlustur } from './uygulama.js';
import { disOkuyucu } from './dis.js';

const ortam = process.env;
if (!ortam.DATABASE_URL) throw Error('DATABASE_URL tanımlı değil (.env).');
if (!ortam.YONETIM_SIFRE || ortam.YONETIM_SIFRE.length < 12) throw Error('YONETIM_SIFRE en az 12 karakter olmalı (.env).');

const db = new pg.Pool({ connectionString: ortam.DATABASE_URL, max: 5 });
const tuz = await kur(db);
const projeler = JSON.parse(await readFile(new URL('../projeler.json', import.meta.url), 'utf8'));
const saklamaGun = Math.min(730, Math.max(7, Number(ortam.SAKLAMA_GUN) || 180));

const isle = uygulamaOlustur({
  db,
  tuz,
  projeler,
  kokenler: (ortam.IZINLI_KOKENLER || 'https://ysfdurak.com,https://*.ysfdurak.com').split(',').map((s) => s.trim()).filter(Boolean),
  adresDenetimi: ortam.ADRES_DENETIMI !== '0',
  yonetim: { kullanici: ortam.YONETIM_KULLANICI || 'yusuf', sifre: ortam.YONETIM_SIFRE },
  disOku: disOkuyucu(ortam),
});

// Saklama süresi dolan olay ve geri bildirimler günde iki kez silinir.
const temizlik = () => temizle(db, saklamaGun).catch((e) => console.error('Temizlik hatası:', e.message));
temizlik();
setInterval(temizlik, 12 * 3600e3).unref();

const port = Number(ortam.PORT) || 8080;
createServer(isle).listen(port, () => console.log(`Ölçüm servisi çalışıyor: :${port} · saklama ${saklamaGun} gün · ${Object.keys(projeler).filter((k) => !k.startsWith('_')).length} proje`));

for (const s of ['SIGTERM', 'SIGINT']) process.on(s, () => db.end().finally(() => process.exit(0)));
