// Ölçüm servisi testleri: node --test test.mjs (Node 22.13+ / 24).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const dizin = fs.mkdtempSync(path.join(os.tmpdir(), "olcum-"));
process.env.NODE_ENV = "test";
process.env.VERI_DIZINI = dizin;
process.env.PANEL_SIFRE = "dogru-sifre";
const { sunucu } = await import("./sunucu.js");
let kok;
before(() => new Promise((ok) => sunucu.listen(0, "127.0.0.1", () => { kok = "http://127.0.0.1:" + sunucu.address().port; ok(); })));
after(() => { sunucu.close(); fs.rmSync(dizin, { recursive: true, force: true }); });

const ORIGIN = "https://ivme.ysfdurak.com";
const post = (yol, govde, origin = ORIGIN, ip = "1.1.1.1") =>
  fetch(kok + yol, { method: "POST", headers: { "Content-Type": "text/plain", ...(origin ? { Origin: origin } : {}), "CF-Connecting-IP": ip }, body: typeof govde === "string" ? govde : JSON.stringify(govde) });
const panel = (sifre, q = "", ip = "9.9.9.9") =>
  fetch(kok + "/panel" + q, { headers: { "CF-Connecting-IP": ip, ...(sifre ? { Authorization: "Basic " + Buffer.from("panel:" + sifre).toString("base64") } : {}) } });

test("olay sayılır; sorgu ve kimlik parçaları sayfadan atılır", async () => {
  assert.equal((await post("/e", { p: "ivme", e: "gorunum", s: "/oneri/123456?mail=a@b.com#x", d: "tr" })).status, 204);
  assert.equal((await post("/e", { p: "ivme", e: "gorunum", s: "/oneri/987654" })).status, 204);
  const h = await (await panel("dogru-sifre")).text();
  assert.match(h, /\/oneri\/:id/);
  assert.doesNotMatch(h, /mail=|a@b\.com|123456/);
});

test("izinsiz köken, Origin'siz istek ve bilinmeyen proje reddedilir", async () => {
  assert.equal((await post("/e", { p: "ivme" }, "https://kotu.example")).status, 403);
  assert.equal((await post("/e", { p: "ivme" }, null)).status, 403);
  assert.equal((await post("/e", { p: "bilinmeyen" })).status, 400);
  assert.equal((await post("/e", { p: "ivme", e: "<script>" })).status, 400);
  assert.equal((await post("/e", "x".repeat(5000))).status >= 400, true);
});

test("geri bildirim: e-posta/telefon maskelenir, panelde kaçışlı görünür", async () => {
  assert.equal((await post("/g", { p: "durus", r: 4, t: "Güzel <b>araç</b>, bana yaz ali@ornek.com 0532 123 45 67" })).status, 204);
  assert.equal((await post("/g", { p: "durus", r: 9 })).status, 400);
  const h = await (await panel("dogru-sifre")).text();
  assert.match(h, /\[e-posta\]/);
  assert.match(h, /\[numara\]/);
  assert.match(h, /&lt;b&gt;araç/);
  assert.doesNotMatch(h, /ali@ornek|0532/);
});

test("panel şifresiz açılmaz, CSP sıkı; 10 hatalı denemede kilit", async () => {
  assert.equal((await panel("")).status, 401);
  const ok = await panel("dogru-sifre");
  assert.equal(ok.status, 200);
  assert.match(ok.headers.get("content-security-policy"), /default-src 'none'/);
  for (let i = 0; i < 10; i++) assert.equal((await panel("yanlis", "", "5.5.5.5")).status, 401);
  assert.equal((await panel("dogru-sifre", "", "5.5.5.5")).status, 429);
});

test("hız sınırı: geri bildirim dakikada 5", async () => {
  let son;
  for (let i = 0; i < 6; i++) son = await post("/g", { p: "site", t: "deneme " + i }, ORIGIN, "7.7.7.7");
  assert.equal(son.status, 429);
});

test("veritabanında IP ya da tarayıcı bilgisi yok", async () => {
  const { DatabaseSync } = await import("node:sqlite");
  const db = new DatabaseSync(path.join(dizin, "olcum.db"));
  const sutun = db.prepare("SELECT name FROM pragma_table_info('sayac') UNION SELECT name FROM pragma_table_info('geri_bildirim')").all().map((r) => r.name);
  db.close();
  assert.deepEqual(sutun.filter((s) => /ip|agent|cerez|cookie|kimlik/i.test(s)), []);
});

test("CORS: izinli kökene başlık, ön kontrol", async () => {
  const r = await fetch(kok + "/e", { method: "OPTIONS", headers: { Origin: "https://durus.ysfdurak.com" } });
  assert.equal(r.status, 204);
  assert.equal(r.headers.get("access-control-allow-origin"), "https://durus.ysfdurak.com");
  assert.equal((await fetch(kok + "/e", { method: "OPTIONS", headers: { Origin: "https://x.com" } })).status, 403);
  assert.equal((await fetch(kok + "/o.js")).headers.get("content-type"), "text/javascript; charset=utf-8");
});
