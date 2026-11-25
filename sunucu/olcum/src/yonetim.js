// Yönetim sayfaları: sunucuda üretilen sade HTML, dış kaynak ve betik yok.
import { DURUMLAR } from './depo.js';

const kac = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const STIL = `body{font-family:Segoe UI,system-ui,Arial,sans-serif;background:#f6f7f4;color:#1f2d27;margin:0}
main{max-width:980px;margin:0 auto;padding:24px 16px 48px}h1{font-size:22px;margin:4px 0 2px}h2{font-size:15px;margin:28px 0 10px}
.alt{color:#5d6b64;font-size:13px}a{color:#2c6549}table{width:100%;border-collapse:collapse;background:#fff;border:1px solid #e3e7df;border-radius:10px;font-size:13px}
td,th{padding:8px 10px;border-top:1px solid #eef0ea;text-align:left;vertical-align:top}th{color:#5d6b64;font-weight:600;border-top:0}
.sag{text-align:right}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.kart{background:#fff;border:1px solid #e3e7df;border-radius:10px;padding:12px 14px}.kart b{display:block;font-size:24px}.kart span{color:#5d6b64;font-size:12px}
.cubuk{background:#d3e9c4;height:10px;border-radius:5px}.donem a{margin-right:10px}.donem a.secili{font-weight:700;color:#1f2d27;text-decoration:none}
.etiket{display:inline-block;font-size:11px;padding:2px 7px;border-radius:9px;background:#eef0ea}.etiket.yeni{background:#fde7c7}.etiket.uygulandi{background:#d3e9c4}
.tablo-kaydir{overflow-x:auto}form.fb{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}form.fb input{flex:1;min-width:160px}
@media (prefers-color-scheme:dark){body{background:#151a17;color:#e4ebe6}table,.kart{background:#1d2420;border-color:#2c352f}td,th{border-color:#2c352f}.alt,th,.kart span{color:#9aa8a0}a{color:#9fd3b0}.etiket{background:#2c352f}.etiket.yeni{background:#5b4520}.etiket.uygulandi{background:#2f4a2c}.donem a.secili{color:#e4ebe6}}`;

const sayfa = (baslik, govde) => `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${kac(baslik)} · Ölçüm</title><style>${STIL}</style></head><body><main>${govde}</main></body></html>`;

const donemSec = (yol, gun) =>
  `<p class="donem alt">Dönem: ${[7, 30, 90, 180].map((g) => `<a href="${yol}?gun=${g}"${g === gun ? ' class="secili"' : ''}>${g} gün</a>`).join('')}</p>`;

const kart = (deger, metin) => `<div class="kart"><b>${kac(deger)}</b><span>${kac(metin)}</span></div>`;

export function anaSayfa(projeler, ozet, gun) {
  const satirlar = Object.entries(projeler)
    .filter(([k]) => !k.startsWith('_'))
    .map(([k, a]) => {
      const o = ozet.find((x) => x.proje === k) || {};
      const notu = a.dis ? ` <span class="etiket">${o.ulasilamadi ? 'ulaşılamadı' : 'kendi ölçümü'}</span>` : '';
      return `<tr><td><a href="/yonetim/p/${encodeURIComponent(k)}?gun=${gun}">${kac(a.ad || k)}</a>${notu}</td>
<td class="sag">${o.ziyaretci ?? 0}</td><td class="sag">${o.geriDonen ?? 0}</td><td class="sag">${o.ortOturumDk ?? '–'}</td>
<td class="sag">${o.geriBildirim ?? 0}${o.yeniGeriBildirim ? ` <span class="etiket yeni">${o.yeniGeriBildirim} yeni</span>` : ''}</td>
<td class="sag">${o.ortPuan ?? '–'}</td></tr>`;
    })
    .join('');
  return sayfa(
    'Projeler',
    `<p class="alt"><b>ysfdurak.com</b> · ortak ölçüm</p><h1>Projeler</h1>${donemSec('/yonetim', gun)}
<div class="tablo-kaydir"><table><tr><th>Proje</th><th class="sag">Ziyaretçi</th><th class="sag">Geri dönen</th><th class="sag">Ort. oturum (dk)</th><th class="sag">Geri bildirim</th><th class="sag">Ort. puan</th></tr>${satirlar}</table></div>
<p class="alt">Kişiler tarayıcıda üretilen rastgele bir kimliğin sunucuda yeniden karıştırılmış hâliyle sayılır; ad, e-posta, IP ya da girilen içerik tutulmaz. <a href="/yonetim/ozet.json?gun=${gun}">JSON</a></p>`,
  );
}

export function projeSayfasi(ad, s) {
  const yol = `/yonetim/p/${encodeURIComponent(s.proje)}`;
  const max = Math.max(1, ...s.gunluk.map((d) => d.ziyaretci));
  const cubuklar = s.gunluk
    .map(
      (d) => `<div title="${d.gun}: ${d.ziyaretci} ziyaretçi" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:110px">
<div style="background:#2c6549;border-radius:3px 3px 0 0;height:${Math.round((d.ziyaretci / max) * 100)}%;min-height:${d.ziyaretci ? 2 : 0}px"></div></div>`,
    )
    .join('');
  const ilk = s.huni[0]?.kisi || 1;
  const huni = s.huni
    .map((h) => `<tr><td>${kac(h.adim)}</td><td class="sag">${h.kisi}</td><td style="width:40%"><div class="cubuk" style="width:${Math.round((h.kisi / ilk) * 100)}%"></div></td></tr>`)
    .join('');
  const bos = (n, m) => `<tr><td colspan="${n}" class="alt">${m}</td></tr>`;
  const ekranlar = s.ekranlar.length
    ? s.ekranlar.map((e) => `<tr><td>${kac(e.ad)}</td><td class="sag">${e.kisi}</td><td class="sag">${e.goruntulenme}</td><td class="sag">${e.ortSn}</td><td class="sag">${e.toplamDk}</td></tr>`).join('')
    : bos(5, 'Henüz ekran verisi yok.');
  const olaylar = s.olaylar.length
    ? s.olaylar.map((o) => `<tr><td>${kac(o.ad)}</td><td class="sag">${o.kisi}</td><td class="sag">${o.adet}</td></tr>`).join('')
    : bos(3, 'Henüz işlem yok.');
  const ADLAR = { masaustu: 'masaüstü', mobil: 'mobil', tr: 'Türkçe', en: 'İngilizce' };
  const liste = (arr, k) => (arr.length ? arr.map((x) => `${kac(ADLAR[x[k]] ?? x[k])} <b>${x.kisi ?? x.oturum}</b>`).join(' · ') : '–');
  const durumSec = (f) =>
    `<select name="durum">${Object.entries(DURUMLAR).map(([k, v]) => `<option value="${k}"${k === f.durum ? ' selected' : ''}>${v}</option>`).join('')}</select>`;
  const fb = s.geriBildirim.liste.length
    ? s.geriBildirim.liste
        .map(
          (f) => `<tr><td style="white-space:nowrap">${kac(f.tarih)}<br><span class="etiket ${kac(f.durum)}">${kac(DURUMLAR[f.durum] || f.durum)}</span></td>
<td>${f.puan ? '★'.repeat(f.puan) + '☆'.repeat(5 - f.puan) + '<br>' : ''}${f.metin ? `<div style="white-space:pre-wrap">${kac(f.metin)}</div>` : ''}
<div class="alt">${f.ekranAdi ? 'Ekran: ' + kac(f.ekranAdi) : ''}${f.dil ? ' · ' + kac(f.dil.toUpperCase()) : ''}${f.iletisim ? ' · Dönüş: <b>' + kac(f.iletisim) + '</b>' : ''}</div>
<form class="fb" method="post" action="/yonetim/geri-bildirim/${f.id}">${durumSec(f)}<input name="not" maxlength="1000" placeholder="Ne yaptım? (ör. sürüm 1.4'te düzeltildi)" value="${kac(f.not_metni)}"><input type="hidden" name="don" value="${kac(yol + '?gun=' + s.gun)}"><button>Kaydet</button></form></td></tr>`,
        )
        .join('')
    : bos(2, 'Henüz geri bildirim yok.');
  return sayfa(
    ad,
    `<p class="alt"><a href="/yonetim?gun=${s.gun}">← Projeler</a></p><h1>${kac(ad)}</h1>${donemSec(yol, s.gun)}
<div class="grid">${kart(s.ziyaretci, 'ziyaretçi')}${kart(s.oturum, 'oturum')}${kart(s.geriDonen, 'farklı günde geri dönen')}${kart(s.ortOturumDk + ' dk', 'ortalama aktif süre / oturum')}${kart(s.geriBildirim.ortPuan ?? '–', `ortalama puan (${s.geriBildirim.adet} geri bildirim)`)}</div>
<h2>Günlük ziyaretçi</h2><div class="kart" style="display:flex;gap:2px;align-items:flex-end">${cubuklar}</div>
<h2>Huni: ziyaretçiler nereye kadar geldi?</h2><table>${huni}</table>
<h2>Ekranlar: nerede vakit geçirildi?</h2><div class="tablo-kaydir"><table><tr><th>Ekran</th><th class="sag">Kişi</th><th class="sag">Görüntülenme</th><th class="sag">Ort. sn</th><th class="sag">Toplam dk</th></tr>${ekranlar}</table></div>
<p class="alt">Süre yalnızca sekme açıkken ve kişi son 60 saniyede sayfayla etkileşimdeyken sayılır.</p>
<h2>İşlemler: neleri denediler?</h2><table><tr><th>İşlem</th><th class="sag">Kişi</th><th class="sag">Adet</th></tr>${olaylar}</table>
<h2>Nereden geldiler, nasıl açtılar?</h2><table><tr><td>Kaynak</td><td>${liste(s.kaynaklar, 'kaynak')}</td></tr><tr><td>Cihaz</td><td>${liste(s.cihazlar, 'cihaz')}</td></tr><tr><td>Dil</td><td>${liste(s.diller, 'dil')}</td></tr></table>
<h2>Geri bildirimler</h2><p class="alt">Durumu "Uygulandı" yapıp ne değiştirdiğini yazarsan, bu kayıt vaka sayfasındaki "geri bildirimden değişikliğe" bölümünün kaynağı olur.</p>
<div class="tablo-kaydir"><table>${fb}</table></div>
<p class="alt"><a href="${yol}.json?gun=${s.gun}">JSON</a></p>`,
  );
}

/** Kendi ölçümü olan proje (ör. Pusula): özet iç ağdan okunur; geri bildirim durumu o uygulamanın kendi sayfasında yönetilir. */
export function disProjeSayfasi(ayar, proje, s, gun) {
  const ad = ayar.ad || proje;
  const yol = `/yonetim/p/${encodeURIComponent(proje)}`;
  const kendi = ayar.dis?.sayfa ? ` · <a href="${kac(ayar.dis.sayfa)}">Uygulamanın kendi sayfası</a>` : '';
  const ust = `<p class="alt"><a href="/yonetim?gun=${gun}">← Projeler</a>${kendi}</p><h1>${kac(ad)}</h1>${donemSec(yol, gun)}`;
  if (!s) return sayfa(ad, `${ust}<p>Özet okunamadı: uygulama kapalı olabilir ya da okuma anahtarı (${kac(ayar.dis?.anahtar || '')}) iki tarafta aynı değil.</p>`);
  const max = Math.max(1, ...s.gunluk.map((d) => d.ziyaretci));
  const cubuklar = s.gunluk
    .map((d) => `<div title="${kac(d.gun)}: ${d.ziyaretci} ziyaretçi" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:110px">
<div style="background:#2c6549;border-radius:3px 3px 0 0;height:${Math.round((d.ziyaretci / max) * 100)}%;min-height:${d.ziyaretci ? 2 : 0}px"></div></div>`)
    .join('');
  const ilk = s.huni[0]?.kisi || 1;
  const huni = s.huni.map((h) => `<tr><td>${kac(h.adim)}</td><td class="sag">${h.kisi}</td><td style="width:40%"><div class="cubuk" style="width:${Math.round((h.kisi / ilk) * 100)}%"></div></td></tr>`).join('');
  const bos = (n, m) => `<tr><td colspan="${n}" class="alt">${m}</td></tr>`;
  const oz = s.ozellikler.length
    ? s.ozellikler.map((o) => `<tr><td>${kac(o.ad)}</td><td>${o.kanal === 'claude' ? 'Claude' : 'Web'}</td><td class="sag">${o.kisi}</td><td class="sag">${o.kullanim}</td></tr>`).join('')
    : bos(4, 'Henüz kullanım yok.');
  const fb = s.geriBildirim.son.length
    ? s.geriBildirim.son.map((f) => `<tr><td style="white-space:nowrap">${kac(f.tarih)}</td><td>${f.puan ? '★'.repeat(f.puan) + '☆'.repeat(5 - f.puan) + '<br>' : ''}${f.metin ? `<div style="white-space:pre-wrap">${kac(f.metin)}</div>` : ''}<div class="alt">${f.ekran ? 'Ekran: ' + kac(f.ekran) : ''}${f.kanal === 'claude' ? ' · Claude' : ''}</div></td></tr>`).join('')
    : bos(2, 'Henüz geri bildirim yok.');
  return sayfa(
    ad,
    `${ust}<p class="alt">Bu projenin ölçümü kendi sunucusunda (giriş yapan demo kullanıcıları, takma kimlikle); burada iç ağdan okunan özeti görüyorsun.</p>
<div class="grid">${kart(s.ziyaretci, 'ziyaretçi')}${kart(s.yeniDemoAlani, 'yeni demo alanı')}${kart(s.geriDonen, 'farklı günde geri dönen')}${kart(s.claudeKullanan, "Claude'dan kullanan")}${kart(s.geriBildirim.ortalamaPuan ?? '–', `ortalama puan (${s.geriBildirim.adet} geri bildirim)`)}</div>
<h2>Günlük ziyaretçi</h2><div class="kart" style="display:flex;gap:2px;align-items:flex-end">${cubuklar}</div>
<h2>Huni</h2><table>${huni}</table>
<h2>Özellikler: neleri kullandılar?</h2><div class="tablo-kaydir"><table><tr><th>Özellik</th><th>Kanal</th><th class="sag">Kişi</th><th class="sag">Kullanım</th></tr>${oz}</table></div>
<h2>Geri bildirimler</h2><p class="alt">Durum ve not, uygulamanın kendi sayfasında tutulur.</p><div class="tablo-kaydir"><table>${fb}</table></div>
<p class="alt"><a href="${yol}.json?gun=${gun}">JSON</a></p>`,
  );
}
