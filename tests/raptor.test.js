/* Uji rumus raptor terhadap angka di LPK Resort Piong Juni 2021 (Tabel 5–8, Lampiran 3). Jalankan: node --test */
const test = require("node:test");
const assert = require("node:assert");
const { analisis } = require("../kegiatan/raptor/analisis.js");
const CONTOH = require("../kegiatan/raptor/contoh-piong-2021.js");

const r3 = (v) => Math.round(v * 1000) / 1000;
const base = { n: CONTOH.plot.n, r: CONTOH.plot.r, pi: CONTOH.plot.pi, perjumpaan: CONTOH.perjumpaan, urutanJenis: CONTOH.urutanJenis };

test("luas plot dan kepadatan populasi (Tabel 5)", () => {
  const A = analisis(base);
  assert.strictEqual(A.luas.m2, 32970000);
  assert.strictEqual(A.luas.ha, 3297);
  assert.strictEqual(A.N, 9);
  assert.strictEqual(A.S, 6);
  assert.strictEqual(A.D.perHa.toFixed(4), "0.0027");
  assert.strictEqual(A.D.haPerInd.toFixed(2), "366.33");
  assert.strictEqual(A.baris[0].perHa.toFixed(7), "0.0003033");
  assert.strictEqual(A.baris[2].perHa.toFixed(7), "0.0012132");
  assert.strictEqual(A.baris[2].haPerInd.toFixed(2), "824.25");
});

test("urutan jenis mengikuti template", () => {
  const A = analisis(base);
  assert.deepStrictEqual(A.baris.map((b) => b.jenis), CONTOH.urutanJenis.map((j) => j.jenis));
  assert.deepStrictEqual(A.baris.map((b) => b.Xi), [1, 1, 4, 1, 1, 1]);
});

test("keanekaragaman Shannon-Wiener (Tabel 6)", () => {
  const A = analisis(base);
  assert.strictEqual(A.H.toFixed(2), "1.58");
  assert.strictEqual(A.baris[0].piLnPi.toFixed(3), "-0.244");
  assert.strictEqual(A.baris[2].piLnPi.toFixed(3), "-0.360");
  assert.strictEqual(A.kritH, "Rendah");
  assert.strictEqual(analisis({ ...base, kriteriaH: "krebs" }).kritH, "Sedang");
});

test("dominansi (Tabel 7)", () => {
  const A = analisis(base);
  assert.deepStrictEqual(A.baris.map((b) => b.di.toFixed(3)), ["11.111", "11.111", "44.444", "11.111", "11.111", "11.111"]);
  assert.ok(A.baris.every((b) => b.kritDom === "Dominan"));
});

test("indeks dispersi rumus template (Tabel 8, Lampiran 3)", () => {
  const A = analisis(base);
  assert.deepStrictEqual(A.baris.map((b) => r3(b.id.id)), [1, 1, 2.537, 1, 1, 1]);
  assert.deepStrictEqual(A.baris.map((b) => b.kritSebaran), ["Acak", "Acak", "Kelompok", "Acak", "Acak", "Acak"]);
  assert.strictEqual(A.baris[2].id.s2.toFixed(4), "0.2416");
  assert.strictEqual(A.idGab.s2.toFixed(6), "0.172474");
  assert.strictEqual(A.idGab.mean.toFixed(6), "0.214286");
  assert.strictEqual(A.idGab.id.toFixed(6), "0.804878");
  assert.strictEqual(A.idGab.kriteria, "Homogen");
});

test("indeks dispersi per plot (Ludwig & Reynolds dengan data per plot)", () => {
  const A = analisis({ ...base, metodeID: "plot" });
  // Alap-alap sapi: 2 individu di JP02 dan 2 di JP19
  assert.strictEqual(r3(A.baris[2].id.id), 1.951);
  // Gabungan: JP02=2, JP04=1, JP17=1, JP19=4, DO03=1
  assert.strictEqual(r3(A.idGab.id), 2.398);
  assert.strictEqual(A.idGab.kriteria, "Kelompok");
});

test("perjumpaan di luar jari-jari plot tidak dihitung", () => {
  const extra = [...CONTOH.perjumpaan, { plot: "DO04", jenis: "Elang bondol", latin: "Haliastur indus", dewasa: 1, jarak: 2000 }];
  const A = analisis({ ...base, perjumpaan: extra });
  assert.strictEqual(A.N, 9);
  assert.strictEqual(A.luar.length, 1);
});
