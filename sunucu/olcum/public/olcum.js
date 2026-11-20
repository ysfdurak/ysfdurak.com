/*! ysfdurak.com ortak ölçüm ve geri bildirim · https://olcum.ysfdurak.com/olcum.js
 *
 * Ayarlar (script etiketinde): data-proje, data-ekran="otomatik", data-dugme="yok", data-konum="sol", data-dil="en", data-renk="#6352d7"
 *
 * Kullanım (statik uygulama):
 *   <script src="https://olcum.ysfdurak.com/olcum.js" data-proje="duruş-adı" data-ekran="otomatik" defer></script>
 * Uygulama içinden:
 *   olcum.ekran("rapor")        // ekran değişti (süre ölçümü bu ekrana geçer)
 *   olcum.olay("analiz_basladi")// bir işlem yapıldı (içerik değil, yalnızca adı)
 *   olcum.geriBildirimAc()      // geri bildirim penceresini aç
 * Yüklenmeden önce yapılan çağrılar için: (window.olcumKuyruk ||= []).push(["olay", "ad"])
 *
 * Gizlilik:
 *   - Çerez yok. Tarayıcıda rastgele bir kimlik (localStorage) durur; sunucu onu bir kez daha karıştırarak saklar.
 *   - Girilen içerik, ad, e-posta, IP saklanmaz. Yalnızca ekran/işlem adları, aktif süre, cihaz türü, dil ve geldiği site.
 *   - Tarayıcıda "Do Not Track" ya da "Global Privacy Control" açıksa hiçbir olay gönderilmez (geri bildirim yine çalışır).
 *   - Adrese ?olcum=kapat eklenirse o tarayıcıda ölçüm kapanır (kendi denemelerin sayılmasın diye); ?olcum=ac açar.
 */
(function () {
  'use strict';
  if (window.olcum && window.olcum.surum) return;

  var betik = document.currentScript;
  var veri = function (ad) { return (betik && betik.getAttribute('data-' + ad)) || (window.olcumAyar && window.olcumAyar[ad]) || ''; };
  var PROJE = veri('proje');
  var ADRES = veri('adres') || (betik && betik.src ? new URL(betik.src).origin : 'https://olcum.ysfdurak.com');
  var DUGME = veri('dugme') !== 'yok';
  var KONUM = veri('konum') === 'sol' ? 'sol' : 'sag';
  var OTOMATIK = veri('ekran') === 'otomatik';
  // Düğme ve ana renk uygulamanın rengine uysun diye (ör. data-renk="#6352d7"); yalnızca #rrggbb kabul edilir.
  var RENK = /^#[0-9a-f]{6}$/i.test(veri('renk')) ? veri('renk') : '#24423a';
  if (!PROJE) return console.warn('[olcum] data-proje eksik');

  var dil = function () {
    var d = veri('dil') || document.documentElement.lang || navigator.language || 'tr';
    return /^en/i.test(d) ? 'en' : 'tr';
  };
  var METIN = {
    tr: { dugme: 'Geri bildirim', baslik: 'Uygulama hakkında ne düşünüyorsunuz?', puan: 'Puanınız', ipucu: 'Neyi beğendiniz, neyi eksik ya da kafa karıştırıcı buldunuz?',
      donus: 'Bana dönüş yapabilirsiniz', eposta: 'E-posta adresiniz', gonder: 'Gönder', kapat: 'Kapat', tesekkur: 'Teşekkürler! Geri bildiriminiz bana ulaştı.',
      not: 'Anonimdir. E-postanız yalnızca kutuyu işaretlerseniz saklanır.', hata: 'Gönderilemedi. Biraz sonra tekrar deneyin.', yildiz: ' yıldız' },
    en: { dugme: 'Feedback', baslik: 'What do you think of this app?', puan: 'Your rating', ipucu: 'What did you like? What was missing or confusing?',
      donus: 'You may contact me', eposta: 'Your email address', gonder: 'Send', kapat: 'Close', tesekkur: 'Thank you! Your feedback has reached me.',
      not: 'Anonymous. Your email is stored only if you tick the box.', hata: 'Could not send. Please try again shortly.', yildiz: ' star' },
  };

  // --- Ölçüm izni ---
  var depo = function (tur) { try { return window[tur]; } catch (e) { return null; } };
  var yerel = depo('localStorage'), oturumDepo = depo('sessionStorage');
  var oku = function (d, k) { try { return d && d.getItem(k); } catch (e) { return null; } };
  var yaz = function (d, k, v) { try { d && (v == null ? d.removeItem(k) : d.setItem(k, v)); } catch (e) {} };
  try {
    var q = new URLSearchParams(location.search).get('olcum');
    if (q === 'kapat') yaz(yerel, 'olcum_kapali', '1');
    if (q === 'ac') yaz(yerel, 'olcum_kapali', null);
  } catch (e) {}
  var izin = function () {
    return oku(yerel, 'olcum_kapali') !== '1' && navigator.globalPrivacyControl !== true && navigator.doNotTrack !== '1' && window.doNotTrack !== '1';
  };

  // --- Kimlikler: ziyaretçi (kalıcı, rastgele) ve oturum (sekme, 30 dk hareketsizlikte yenilenir) ---
  var rastgele = function () {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    var a = new Uint8Array(16); crypto.getRandomValues(a);
    return Array.prototype.map.call(a, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  };
  var ziyaretci = oku(yerel, 'olcum_z') || rastgele();
  yaz(yerel, 'olcum_z', ziyaretci);
  var oturum = oku(oturumDepo, 'olcum_o');
  var sonHareket = Number(oku(oturumDepo, 'olcum_sh')) || 0;
  var yeniOturum = !oturum || Date.now() - sonHareket > 30 * 60e3;
  if (yeniOturum) { oturum = rastgele(); yaz(oturumDepo, 'olcum_o', oturum); }

  // --- Kuyruk ve gönderim ---
  var kuyruk = [];
  var temiz = function (s) { return String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9_:-]/g, '_').slice(0, 48); };
  var paket = function (olaylar) {
    return JSON.stringify({ p: PROJE, z: ziyaretci, o: oturum, d: dil(), c: matchMedia('(max-width: 760px)').matches ? 'mobil' : 'masaustu', k: kaynak(), e: olaylar });
  };
  function kaynak() {
    try {
      var u = new URLSearchParams(location.search).get('utm_source');
      if (u) return temiz(u);
      if (!document.referrer) return '';
      var h = new URL(document.referrer).hostname.replace(/^www\./, '');
      return h === location.hostname ? '' : h;
    } catch (e) { return ''; }
  }
  function ekle(o) {
    if (!izin()) return;
    kuyruk.push(o);
    if (kuyruk.length >= 40) gonder(false);
  }
  function gonder(cikis) {
    if (!izin()) return void (kuyruk.length = 0);
    while (kuyruk.length) {
      var govde = paket(kuyruk.splice(0, 50));
      // text/plain: tarayıcı ön kontrol (preflight) isteği atmaz; sunucu yine Origin'e bakar.
      if (cikis && navigator.sendBeacon && navigator.sendBeacon(ADRES + '/v1/olay', new Blob([govde], { type: 'text/plain' }))) continue;
      try { fetch(ADRES + '/v1/olay', { method: 'POST', body: govde, headers: { 'Content-Type': 'text/plain' }, keepalive: true, credentials: 'omit' }).catch(function () {}); } catch (e) {}
    }
  }

  // --- Aktif süre: sekme görünürken ve kişi son 60 sn içinde etkileşimdeyken sayılır ---
  var ekranAdi = null, birikim = 0, sonTik = Date.now();
  var etkilesim = function () { sonHareket = Date.now(); yaz(oturumDepo, 'olcum_sh', String(sonHareket)); };
  ['pointerdown', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(function (t) { addEventListener(t, etkilesim, { passive: true, capture: true }); });
  etkilesim();
  function tik() {
    var simdi = Date.now();
    if (document.visibilityState === 'visible' && simdi - sonHareket < 60e3) birikim += Math.min(simdi - sonTik, 15e3);
    sonTik = simdi;
  }
  function sureyiYaz() {
    tik();
    if (ekranAdi && birikim >= 1000) ekle({ a: 'sure', s: ekranAdi, t: birikim });
    birikim = 0;
  }
  setInterval(tik, 5e3);
  setInterval(function () { sureyiYaz(); gonder(false); }, 20e3);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { sureyiYaz(); gonder(true); } else { sonTik = Date.now(); }
  });
  addEventListener('pagehide', function () { sureyiYaz(); gonder(true); });

  function ekran(ad) {
    ad = temiz(ad);
    if (!ad || ad === ekranAdi) return;
    sureyiYaz();
    ekranAdi = ad;
    ekle({ a: 'ekran', s: ad });
    // Ekran değişince kısa bir gecikmeyle gönder: sekme aniden kapanırsa çok az veri kaybolsun.
    clearTimeout(ekranZamanlayici);
    ekranZamanlayici = setTimeout(function () { gonder(false); }, 2000);
  }
  var ekranZamanlayici;
  function olay(ad) {
    ad = temiz(ad);
    if (ad) ekle({ a: ad, s: ekranAdi });
  }

  // --- Geri bildirim penceresi (Shadow DOM: uygulamanın stilleriyle çakışmaz) ---
  var kok, golge, pencere, sonOdak;
  var CSS = ':host{all:initial;--renk:' + RENK + '}*{box-sizing:border-box;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}' +
    '.dugme{position:fixed;bottom:16px;z-index:2147483000;border:0;border-radius:999px;padding:10px 16px;background:var(--renk);color:#fff;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.18)}' +
    '.dugme:focus-visible,button:focus-visible,textarea:focus-visible,input:focus-visible{outline:3px solid #7cc39b;outline-offset:2px}' +
    '.sag{right:16px}.sol{left:16px}.perde{position:fixed;inset:0;z-index:2147483001;background:rgba(15,20,18,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px}' +
    '@media(min-width:600px){.perde{align-items:center}}.kutu{background:#fff;color:#1f2d27;width:100%;max-width:420px;border-radius:14px;padding:20px;box-shadow:0 12px 40px rgba(0,0,0,.25)}' +
    'h2{margin:0 0 12px;font-size:17px}label{display:block;font-size:13px;color:#4d5c55;margin:12px 0 6px}.yildizlar{display:flex;gap:4px}' +
    '.yildizlar button{border:0;background:none;font-size:28px;line-height:1;color:#c9cfca;cursor:pointer;padding:2px}.yildizlar button[aria-pressed=true]{color:#e0a325}' +
    'textarea,input[type=email]{width:100%;border:1px solid #cfd6d1;border-radius:8px;padding:9px 10px;font-size:14px;color:inherit;background:#fff}textarea{min-height:96px;resize:vertical}' +
    '.satir{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:13px}.satir label{margin:0;color:inherit}.not{font-size:12px;color:#66746d;margin-top:10px}' +
    '.alt{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}.alt button{border-radius:8px;padding:9px 14px;font-size:14px;cursor:pointer;border:1px solid #cfd6d1;background:#fff;color:#1f2d27}' +
    '.alt .ana{background:var(--renk);color:#fff;border-color:var(--renk)}.alt .ana:disabled{opacity:.6}.hata{color:#b3261e;font-size:13px;margin-top:8px}' +
    '@media(prefers-color-scheme:dark){.kutu{background:#1d2420;color:#e4ebe6}label,.not{color:#a3b0a8}textarea,input[type=email],.alt button{background:#151a17;color:#e4ebe6;border-color:#36413a}.alt .ana{background:#7cc39b;color:#10201a;border-color:#7cc39b}}';

  function hazirla() {
    if (kok) return;
    kok = document.createElement('div');
    kok.setAttribute('data-olcum', '');
    golge = kok.attachShadow({ mode: 'open' });
    // Stil: mümkünse oluşturulmuş stil sayfası (adoptedStyleSheets). Bu yol sayfanın CSP'sinde 'unsafe-inline'
    // gerektirmez; sıkı politikalı uygulamalar (ör. Diyalog) gevşetmeden kullanabilir. Desteklemeyen tarayıcıda <style>.
    if ('adoptedStyleSheets' in golge && typeof CSSStyleSheet === 'function' && 'replaceSync' in CSSStyleSheet.prototype) {
      var sayfa = new CSSStyleSheet(); sayfa.replaceSync(CSS); golge.adoptedStyleSheets = [sayfa];
    } else {
      var stil = document.createElement('style');
      stil.textContent = CSS;
      golge.appendChild(stil);
    }
    if (DUGME) {
      var d = document.createElement('button');
      d.className = 'dugme ' + KONUM;
      d.type = 'button';
      d.textContent = METIN[dil()].dugme;
      d.addEventListener('click', function () { ac(); });
      golge.appendChild(d);
    }
    document.body.appendChild(kok);
  }

  function ac(ekranArg) {
    hazirla();
    if (pencere) return;
    var m = METIN[dil()];
    var puan = null;
    sonOdak = document.activeElement;
    pencere = document.createElement('div');
    pencere.className = 'perde';
    pencere.innerHTML =
      '<div class="kutu" role="dialog" aria-modal="true" aria-labelledby="ob"><h2 id="ob"></h2>' +
      '<label id="op"></label><div class="yildizlar" role="group" aria-labelledby="op"></div>' +
      '<label for="om"></label><textarea id="om" maxlength="2000"></textarea>' +
      '<div class="satir"><input type="checkbox" id="od"><label for="od"></label></div>' +
      '<div class="eposta" hidden><label for="oe"></label><input type="email" id="oe" maxlength="200" autocomplete="email"></div>' +
      '<p class="not"></p><p class="hata" role="alert" hidden></p>' +
      '<div class="alt"><button type="button" class="vazgec"></button><button type="button" class="ana"></button></div></div>';
    var $ = function (s) { return pencere.querySelector(s); };
    $('#ob').textContent = m.baslik;
    $('#op').textContent = m.puan;
    $('label[for=om]').textContent = m.ipucu;
    $('label[for=od]').textContent = m.donus;
    $('label[for=oe]').textContent = m.eposta;
    $('.not').textContent = m.not;
    $('.vazgec').textContent = m.kapat;
    $('.ana').textContent = m.gonder;
    var yildizlar = $('.yildizlar');
    for (var i = 1; i <= 5; i++) (function (n) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = '★';
      b.setAttribute('aria-label', n + m.yildiz);
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        puan = n;
        Array.prototype.forEach.call(yildizlar.children, function (c, j) { c.setAttribute('aria-pressed', String(j < n)); });
      });
      yildizlar.appendChild(b);
    })(i);
    $('#od').addEventListener('change', function (e) { $('.eposta').hidden = !e.target.checked; });
    $('.vazgec').addEventListener('click', kapat);
    pencere.addEventListener('click', function (e) { if (e.target === pencere) kapat(); });
    pencere.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') kapat();
      if (e.key === 'Tab') {
        var odak = pencere.querySelectorAll('button,textarea,input:not([hidden])');
        var gorunur = Array.prototype.filter.call(odak, function (x) { return x.offsetParent !== null; });
        var ilk = gorunur[0], son = gorunur[gorunur.length - 1];
        if (e.shiftKey && golge.activeElement === ilk) { son.focus(); e.preventDefault(); }
        else if (!e.shiftKey && golge.activeElement === son) { ilk.focus(); e.preventDefault(); }
      }
    });
    $('.ana').addEventListener('click', function () {
      var hata = $('.hata');
      var metin = $('#om').value.trim();
      var eposta = $('#od').checked ? $('#oe').value.trim() : '';
      if (!metin && !puan) { hata.textContent = dil() === 'en' ? 'Give a rating or write a few words.' : 'Bir puan verin ya da birkaç kelime yazın.'; hata.hidden = false; return; }
      this.disabled = true;
      var dugme = this;
      fetch(ADRES + '/v1/geri-bildirim', {
        method: 'POST', credentials: 'omit', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ p: PROJE, z: ziyaretci, o: oturum, d: dil(), s: temiz(ekranArg || ekranAdi || ''), r: puan, m: metin, i: eposta }),
      }).then(function (r) { return r.json().then(function (b) { if (!r.ok) throw Error(b.hata || m.hata); }); })
        .then(function () {
          pencere.querySelector('.kutu').innerHTML = '<h2></h2><div class="alt"><button type="button" class="ana"></button></div>';
          $('h2').textContent = m.tesekkur;
          $('.ana').textContent = m.kapat;
          $('.ana').addEventListener('click', kapat);
          $('.ana').focus();
        })
        .catch(function (e) { hata.textContent = e.message || m.hata; hata.hidden = false; dugme.disabled = false; });
    });
    golge.appendChild(pencere);
    setTimeout(function () { var y = yildizlar.firstChild; y && y.focus(); }, 0);
  }
  function kapat() {
    if (!pencere) return;
    pencere.remove();
    pencere = null;
    if (sonOdak && sonOdak.focus) try { sonOdak.focus(); } catch (e) {}
  }

  // --- Otomatik ekran (statik, çok sayfalı ya da # ile gezilen uygulamalar) ---
  if (OTOMATIK) {
    var yolAdi = function () { return temiz((location.pathname.replace(/\/+$/, '').split('/').pop() || 'ana') + (location.hash ? '_' + location.hash.slice(1) : '')); };
    var izle = function () { ekran(yolAdi()); };
    ['pushState', 'replaceState'].forEach(function (f) {
      var asil = history[f];
      history[f] = function () { var r = asil.apply(this, arguments); setTimeout(izle, 0); return r; };
    });
    addEventListener('popstate', izle);
    addEventListener('hashchange', izle);
    izle();
  }

  if (yeniOturum) ekle({ a: 'oturum:basla' });

  window.olcum = {
    surum: 1,
    ekran: ekran,
    olay: olay,
    geriBildirimAc: function (e) { ac(e); },
    kapat: function () { yaz(yerel, 'olcum_kapali', '1'); kuyruk.length = 0; },
    ac: function () { yaz(yerel, 'olcum_kapali', null); },
  };
  var bekleyen = window.olcumKuyruk || [];
  window.olcumKuyruk = { push: function (c) { var f = window.olcum[c[0]]; f && f.apply(null, c.slice(1)); } };
  bekleyen.forEach(function (c) { window.olcumKuyruk.push(c); });

  if (document.body) hazirla(); else document.addEventListener('DOMContentLoaded', hazirla);
  setTimeout(function () { gonder(false); }, 3000);
})();
