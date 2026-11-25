// Dış kaynaklı projeler: kendi ölçümü olan bir uygulamanın özetini iç ağdan okur (ör. Pusula'nın sunucu tarafı ölçümü).
// projeler.json kaydında "dis": { "url": "http://pusula:8080/ic/istatistik.json", "anahtar": "ORTAM_DEGISKENI", "sayfa": "..." }.
// Anahtar ortam değişkeninden okunur (dosyada durmaz). Okunamazsa sayfa "ulaşılamadı" der, servis çalışmaya devam eder.

/** @returns {(ayar: object, gun: number) => Promise<object|null>} */
export function disOkuyucu(ortam = process.env, { zamanAsimi = 3000, fetchFn = fetch } = {}) {
  return async (ayar, gun) => {
    const d = ayar?.dis;
    const anahtar = d?.anahtar ? ortam[d.anahtar] : '';
    if (!d?.url || !anahtar) return null;
    try {
      const u = new URL(d.url);
      u.searchParams.set('gun', String(gun));
      const r = await fetchFn(u, { headers: { Authorization: `Bearer ${anahtar}` }, signal: AbortSignal.timeout(zamanAsimi) });
      if (!r.ok) return null;
      return await r.json();
    } catch {
      return null;
    }
  };
}

/** Dış özet → ana tablo satırı (genelOzet ile aynı alanlar). */
export function disSatir(proje, s) {
  return {
    proje,
    dis: true,
    ulasilamadi: !s,
    ziyaretci: s?.ziyaretci ?? 0,
    oturum: null,
    geriDonen: s?.geriDonen ?? 0,
    ortOturumDk: null,
    geriBildirim: s?.geriBildirim?.adet ?? 0,
    yeniGeriBildirim: 0,
    ortPuan: s?.geriBildirim?.ortalamaPuan ?? null,
  };
}
