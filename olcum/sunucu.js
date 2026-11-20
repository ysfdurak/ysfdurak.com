// Ölçüm: projeler için gizlilik öncelikli kullanım sayacı ve kısa geri bildirim servisi.
// Bağımlılık yok (Node 24, yerleşik node:sqlite). Çerez, IP, tarayıcı kimliği SAKLANMAZ;
// ham olay tutulmaz: yalnızca "gün × proje × olay × sayfa" sayacı artar.
// Ayrıntı ve tasarım gerekçeleri: olcum/README.md
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const PORT = Number(process.env.PORT || 8080);
const VERI = process.env.VERI_DIZINI || "/veri";
const PANEL_SIFRE = process.env.PANEL_SIFRE || "";
// İzinli projeler: kısa ad = olayın "p" alanı. Başka ad gelirse yok sayılır.
const PROJELER = new Set(
  (process.env.PROJELER ||
    "ivme,durus,diyalog,zaman-etudu,kesit-sql,kesit-python,kesit-powerbi,kesit-istatistik,ingilizce,aday,kivilcim,pusula,destek,site")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean),
);
// İzinli kökenler: tarayıcıdan gelen istekte Origin bunlardan biri olmalı.
const KOKEN = /^https:\/\/([a-z0-9-]+\.)*ysfdurak\.(com|github\.io)$/;
const EK_KOKEN = new Set((process.env.EK_KOKENLER || "").split(",").map((x) => x.trim()).filter(Boolean));
const OLAY = /^[a-z0-9][a-z0-9_.-]{0,39}$/;
const GERI_BILDIRIM_GUN = 365;

fs.mkdirSync(VERI, { recursive: true });
const db = new DatabaseSync(path.join(VERI, "olcum.db"));
db.exec(`
  PRAGMA journal_mode=WAL;
  CREATE TABLE IF NOT EXISTS sayac (
    gun TEXT NOT NULL, proje TEXT NOT NULL, olay TEXT NOT NULL, sayfa TEXT NOT NULL DEFAULT '',
    dil TEXT NOT NULL DEFAULT '', adet INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (gun, proje, olay, sayfa, dil)
  );
  CREATE TABLE IF NOT EXISTS geri_bildirim (
    id INTEGER PRIMARY KEY AUTOINCREMENT, zaman TEXT NOT NULL, proje TEXT NOT NULL,
    puan INTEGER, metin TEXT NOT NULL DEFAULT '', sayfa TEXT NOT NULL DEFAULT ''
  );
`);
const artir = db.prepare(
  `INSERT INTO sayac (gun, proje, olay, sayfa, dil, adet) VALUES (?, ?, ?, ?, ?, 1)
   ON CONFLICT (gun, proje, olay, sayfa, dil) DO UPDATE SET adet = adet + 1`,
);
const gbEkle = db.prepare(`INSERT INTO geri_bildirim (zaman, proje, puan, metin, sayfa) VALUES (?, ?, ?, ?, ?)`);

// Türkiye günü (UTC+3).
const bugun = () => new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 10);

// Hız sınırı: IP yalnızca bellekte, günlük tuzla özetlenmiş hâlde ve dakikalık pencerede tutulur; diske yazılmaz.
let tuz = crypto.randomBytes(16), tuzGun = bugun();
const pencere = new Map();
function sinirli(ip, limit, tur) {
  if (tuzGun !== bugun()) { tuz = crypto.randomBytes(16); tuzGun = bugun(); }
  const k = crypto.createHmac("sha256", tuz).update(ip).digest("base64url").slice(0, 16) + tur;
  const dk = Math.floor(Date.now() / 60_000);
  const v = pencere.get(k);
  if (!v || v.dk !== dk) { pencere.set(k, { dk, n: 1 }); return false; }
  return ++v.n > limit;
}
setInterval(() => {
  const dk = Math.floor(Date.now() / 60_000);
  for (const [k, v] of pencere) if (v.dk < dk) pencere.delete(k);
}, 60_000).unref();

// Kişisel veri sızmasın: e-posta, telefon ve uzun sayılar maskelenir.
const maskele = (t) =>
  t
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[e-posta]")
    .replace(/(\+?\d[\d\s().-]{8,}\d)/g, "[numara]");
// Sayfa: yalnızca yol; sorgu ve # atılır, kimlik gibi görünen parçalar :id olur.
const sayfaTemizle = (s) =>
  String(s || "")
    .split(/[?#]/)[0]
    .replace(/\/[0-9a-f-]{8,}(?=\/|$)/gi, "/:id")
    .replace(/\/\d{3,}(?=\/|$)/g, "/:id")
    .slice(0, 80);

const GUVENLIK = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Cross-Origin-Resource-Policy": "cross-origin",
};
function yanit(res, kod, govde, ek = {}) {
  const tip = typeof govde === "string" ? "text/plain; charset=utf-8" : "application/json";
  res.writeHead(kod, { ...GUVENLIK, "Content-Type": tip, "Cache-Control": "no-store", ...ek });
  res.end(typeof govde === "string" ? govde : JSON.stringify(govde));
}
const izinliKoken = (o) => !!o && (KOKEN.test(o) || EK_KOKEN.has(o));
function cors(req) {
  const o = req.headers.origin;
  return izinliKoken(o) ? { "Access-Control-Allow-Origin": o, Vary: "Origin" } : {};
}
function govdeOku(req, sinir = 2048) {
  return new Promise((ok, red) => {
    if (Number(req.headers["content-length"] || 0) > sinir) return red(new Error("büyük"));
    let n = 0; const parcalar = [];
    // Sınır aşılırsa gövde okunmaya devam eder ama saklanmaz; bağlantı koparılmadan 413 döner.
    req.on("data", (c) => { n += c.length; if (n <= sinir) parcalar.push(c); });
    req.on("end", () => (n > sinir ? red(new Error("büyük")) : ok(Buffer.concat(parcalar).toString("utf8"))));
    req.on("error", red);
  });
}
function esitMi(a, b) {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
}
const hatali = new Map(); // panel şifre denemesi: IP özeti → {n, ilk}
function panelYetkili(req, ip) {
  if (!PANEL_SIFRE) return false;
  const h = hatali.get(ip);
  if (h && h.n >= 10 && Date.now() - h.ilk < 15 * 60_000) return null; // kilitli
  const m = /^Basic (.+)$/.exec(req.headers.authorization || "");
  const sifre = m ? Buffer.from(m[1], "base64").toString().split(":").slice(1).join(":") : "";
  if (sifre && esitMi(sifre, PANEL_SIFRE)) { hatali.delete(ip); return true; }
  if (m) {
    const v = h && Date.now() - h.ilk < 15 * 60_000 ? h : { n: 0, ilk: Date.now() };
    v.n++; hatali.set(ip, v);
  }
  return false;
}
const kacis = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function panel(gun) {
  const bas = new Date(Date.now() + 3 * 3600_000 - gun * 86400_000).toISOString().slice(0, 10);
  const proje = db.prepare(`SELECT proje, olay, SUM(adet) n FROM sayac WHERE gun >= ? GROUP BY proje, olay ORDER BY proje, n DESC`).all(bas);
  const sayfa = db.prepare(`SELECT proje, sayfa, SUM(adet) n FROM sayac WHERE gun >= ? AND olay='gorunum' AND sayfa<>'' GROUP BY proje, sayfa ORDER BY n DESC LIMIT 40`).all(bas);
  const gunluk = db.prepare(`SELECT gun, SUM(adet) n FROM sayac WHERE gun >= ? AND olay='gorunum' GROUP BY gun ORDER BY gun`).all(bas);
  const gb = db.prepare(`SELECT zaman, proje, puan, metin, sayfa FROM geri_bildirim WHERE zaman >= ? ORDER BY id DESC LIMIT 200`).all(bas);
  const tablo = (b, satirlar) =>
    `<table><tr>${b.map((x) => `<th>${x}</th>`).join("")}</tr>${satirlar.map((r) => `<tr>${r.map((x) => `<td>${kacis(x ?? "")}</td>`).join("")}</tr>`).join("")}</table>`;
  const enCok = Math.max(1, ...gunluk.map((g) => g.n));
  return `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ölçüm paneli</title><meta name="robots" content="noindex">
<style>body{font:15px system-ui,sans-serif;margin:24px auto;max-width:1000px;padding:0 16px;color:#1d2433}
table{border-collapse:collapse;width:100%;margin:8px 0 24px}td,th{border-bottom:1px solid #e3e6ee;padding:6px 8px;text-align:left}
th{font-size:13px;color:#5b6378}.bar{display:flex;gap:2px;align-items:flex-end;height:80px}.bar i{flex:1;background:#6352d7;min-height:1px}
nav a{margin-right:12px}</style>
<h1>Ölçüm · son ${gun} gün</h1><nav><a href="?gun=7">7 gün</a><a href="?gun=30">30 gün</a><a href="?gun=90">90 gün</a></nav>
<h2>Günlük görüntülenme</h2><div class="bar">${gunluk.map((g) => `<i title="${g.gun}: ${g.n}" style="height:${Math.round((g.n / enCok) * 100)}%"></i>`).join("")}</div>
<h2>Proje ve olay</h2>${tablo(["Proje", "Olay", "Adet"], proje.map((r) => [r.proje, r.olay, r.n]))}
<h2>En çok açılan sayfalar</h2>${tablo(["Proje", "Sayfa", "Görüntülenme"], sayfa.map((r) => [r.proje, r.sayfa, r.n]))}
<h2>Geri bildirim</h2>${tablo(["Zaman", "Proje", "Puan", "Not", "Sayfa"], gb.map((r) => [r.zaman.slice(0, 16).replace("T", " "), r.proje, r.puan ?? "", r.metin, r.sayfa]))}
</html>`;
}

const istemci = fs.readFileSync(new URL("./o.js", import.meta.url), "utf8");

export const sunucu = http.createServer(async (req, res) => {
  const ip = String(req.headers["cf-connecting-ip"] || req.socket.remoteAddress || "");
  const url = new URL(req.url || "/", "http://x");
  try {
    if (req.method === "OPTIONS") {
      const c = cors(req);
      if (!c["Access-Control-Allow-Origin"]) return yanit(res, 403, "");
      return yanit(res, 204, "", { ...c, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" });
    }
    if (req.method === "GET" && url.pathname === "/healthz") return yanit(res, 200, "ok");
    if (req.method === "GET" && url.pathname === "/o.js")
      return yanit(res, 200, istemci, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "public, max-age=86400" });
    if (req.method === "POST" && (url.pathname === "/e" || url.pathname === "/g")) {
      // Tarayıcı dışı (Origin'siz) ve izinsiz kökenden gelen istek sayılmaz.
      if (!izinliKoken(req.headers.origin)) return yanit(res, 403, "");
      const g = url.pathname === "/g";
      if (sinirli(ip, g ? 5 : 120, g ? "g" : "e")) return yanit(res, 429, "", cors(req));
      let b;
      try { b = JSON.parse(await govdeOku(req, g ? 4096 : 1024)); }
      catch (e) { return yanit(res, e?.message === "büyük" ? 413 : 400, "", { ...cors(req), Connection: "close" }); }
      const proje = String(b?.p || "");
      if (!PROJELER.has(proje)) return yanit(res, 400, "", cors(req));
      if (!g) {
        const olay = String(b?.e || "gorunum");
        if (!OLAY.test(olay)) return yanit(res, 400, "", cors(req));
        const dil = /^[a-z]{2}$/.test(String(b?.d || "")) ? b.d : "";
        artir.run(bugun(), proje, olay, sayfaTemizle(b?.s), dil);
        return yanit(res, 204, "", cors(req));
      }
      const puan = Number.isInteger(b?.r) && b.r >= 1 && b.r <= 5 ? b.r : null;
      const metin = maskele(String(b?.t || "").trim()).slice(0, 500);
      if (puan === null && metin.length < 2) return yanit(res, 400, "", cors(req));
      gbEkle.run(new Date().toISOString(), proje, puan, metin, sayfaTemizle(b?.s));
      return yanit(res, 204, "", cors(req));
    }
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/panel")) {
      const y = panelYetkili(req, crypto.createHash("sha256").update(ip).digest("hex"));
      if (y === null) return yanit(res, 429, "Çok fazla hatalı deneme. 15 dakika sonra tekrar deneyin.");
      if (!y) return yanit(res, 401, "Şifre gerekli.", { "WWW-Authenticate": 'Basic realm="olcum", charset="UTF-8"' });
      const gun = Math.min(365, Math.max(1, Number(url.searchParams.get("gun")) || 30));
      return yanit(res, 200, panel(gun), {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
        "X-Frame-Options": "DENY",
      });
    }
    yanit(res, 404, "");
  } catch (e) {
    console.error("hata", e?.message);
    if (!res.headersSent) yanit(res, 500, "");
  }
});
sunucu.requestTimeout = 10_000;
sunucu.headersTimeout = 10_000;

// Saklama: geri bildirim 1 yıl, sayaçlar 2 yıl.
function temizle() {
  const once = (g) => new Date(Date.now() - g * 86400_000).toISOString();
  db.prepare(`DELETE FROM geri_bildirim WHERE zaman < ?`).run(once(GERI_BILDIRIM_GUN));
  db.prepare(`DELETE FROM sayac WHERE gun < ?`).run(once(730).slice(0, 10));
}
if (process.env.NODE_ENV !== "test") {
  temizle();
  setInterval(temizle, 86400_000).unref();
  sunucu.listen(PORT, () => console.log("ölçüm hazır :" + PORT, "projeler:", [...PROJELER].join(",")));
  for (const s of ["SIGTERM", "SIGINT"]) process.on(s, () => sunucu.close(() => { db.close(); process.exit(0); }));
}
