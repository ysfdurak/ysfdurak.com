/* Ölçüm istemcisi (olcum.ysfdurak.com). Çerez yok, kimlik yok, ham olay yok.
 * Kullanım: <script defer src="https://olcum.ysfdurak.com/o.js" data-proje="durus"></script>
 *   olcum("olay_adi")            → olay sayacı
 *   olcum.geriBildirim(puan, not) → 1-5 puan ve/veya kısa not
 * Tarayıcıda "Do Not Track" ya da "Global Privacy Control" açıksa hiçbir şey gönderilmez. */
(function () {
  var s = document.currentScript, p = s && s.getAttribute("data-proje");
  var kok = s ? new URL(s.src).origin : "https://olcum.ysfdurak.com";
  var kapali = navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl === true;
  function gonder(yol, veri) {
    if (kapali || !p) return Promise.resolve(false);
    veri.p = p;
    var govde = JSON.stringify(veri);
    // text/plain: ön kontrol (preflight) gerektirmez; sendBeacon sayfa kapanırken de gider.
    if (yol === "/e" && navigator.sendBeacon) return Promise.resolve(navigator.sendBeacon(kok + yol, new Blob([govde], { type: "text/plain" })));
    return fetch(kok + yol, { method: "POST", body: govde, headers: { "Content-Type": "text/plain" }, keepalive: true, credentials: "omit" })
      .then(function (r) { return r.ok; }, function () { return false; });
  }
  function olcum(olay, sayfa) {
    return gonder("/e", { e: olay || "gorunum", s: sayfa || location.pathname, d: (document.documentElement.lang || "").slice(0, 2) });
  }
  olcum.geriBildirim = function (puan, metin) {
    return gonder("/g", { r: puan, t: metin || "", s: location.pathname });
  };
  window.olcum = olcum;
  if (!(s && s.hasAttribute("data-elle"))) olcum("gorunum");
})();
