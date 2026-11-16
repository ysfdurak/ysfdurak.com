// Rota: projelerin güncel durumu. Veri src/data/rota.json dosyasındadır.
// "durumları güncelle" becerisi yalnızca o JSON dosyasını değiştirir.
// Derleme sırasında dosya kontrol edilir; hatalı kayıt varsa site yayınlanmaz.
import data from './rota.json';
import { PROJECTS, type Lang } from './projects';

export type Durum = 'canli' | 'gelistiriliyor' | 'beklemede' | 'fikir';
export const DURUMLAR: Durum[] = ['canli', 'gelistiriliyor', 'beklemede', 'fikir'];

export const DURUM_ETIKET: Record<Durum, { tr: string; en: string }> = {
  canli: { tr: 'Canlı', en: 'Live' },
  gelistiriliyor: { tr: 'Geliştiriliyor', en: 'In development' },
  beklemede: { tr: 'Beklemede', en: 'On hold' },
  fikir: { tr: 'Fikir', en: 'Idea' },
};

type Metin = { tr: string; en: string };
export interface RotaKaydi {
  id: string;
  /** projects.ts'teki slug. Varsa ad, proje sayfasına bağlanır. */
  proje?: string;
  ad: Metin;
  aciklama: Metin;
  durum: Durum;
  /** false ise kayıt dosyada durur ama sayfada görünmez. */
  yayinda: boolean;
  canli_url?: string;
  repo?: string;
  son_guncelleme: string;
  durum_notu: Metin;
  /** Yalnız kişisel not; sayfada asla gösterilmez. */
  ozel_not?: string;
}

const tarih = /^\d{4}-\d{2}-\d{2}$/;
const slugs = new Set(PROJECTS.map((p) => p.slug));
const ids = new Set<string>();

for (const k of data.projeler as RotaKaydi[]) {
  const hata = (m: string) => { throw new Error(`rota.json → ${k.id ?? '?'}: ${m}`); };
  if (!k.id) hata('id boş');
  if (ids.has(k.id)) hata('id iki kez kullanılmış');
  ids.add(k.id);
  if (!DURUMLAR.includes(k.durum)) hata(`geçersiz durum "${k.durum}"`);
  if (typeof k.yayinda !== 'boolean') hata('yayinda true/false olmalı');
  if (!tarih.test(k.son_guncelleme)) hata('son_guncelleme YYYY-AA-GG olmalı');
  for (const alan of ['ad', 'aciklama'] as const) {
    if (!k[alan]?.tr || !k[alan]?.en) hata(`${alan} için TR ve EN dolu olmalı`);
  }
  if (k.proje && !slugs.has(k.proje)) hata(`proje "${k.proje}" projects.ts içinde yok`);
}
if (!tarih.test(data.son_tarama)) throw new Error('rota.json → son_tarama YYYY-AA-GG olmalı');

export const SON_TARAMA: string = data.son_tarama;

/** Sayfada gösterilecek kayıtlar, durum grubuna göre; grup içinde en yeni güncelleme önce. */
export function rotaGruplari() {
  const gorunur = (data.projeler as RotaKaydi[]).filter((k) => k.yayinda);
  return DURUMLAR.map((d) => ({
    durum: d,
    kayitlar: gorunur
      .filter((k) => k.durum === d)
      .sort((a, b) => b.son_guncelleme.localeCompare(a.son_guncelleme) || a.ad.tr.localeCompare(b.ad.tr, 'tr')),
  })).filter((g) => g.kayitlar.length > 0);
}

export function tarihYaz(iso: string, lang: Lang) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
