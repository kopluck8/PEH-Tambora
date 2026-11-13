/*
 * Uji pembacaan ekspor patroli SMART (tests/fixtures/*.xml) sampai menjadi baris tabel generator. Jalankan: node --test
 * XML dibaca dengan DOMParser kecil di tests/muat.js; hasilnya sama dengan pembacaan di peramban.
 */
const test = require("node:test");
const assert = require("node:assert");
const { muat, fixture } = require("./muat.js");

const APP = muat();
const salin = (o) => JSON.parse(JSON.stringify(o));
function impor(id, berkas) {
  const d = APP.PEH.KEGIATAN.find((k) => k.id === id), S = d.stateAwal();
  const patroli = [APP.SMART.parsePatrolXML(fixture(berkas))];
  const obs = APP.PEHSmart.observasi(patroli, d.kategoriSMART, [null, APP.PEH_DICT, ...(d.kamusSMART || []).map((n) => APP[n])]);
  const pesan = d.dariSMART(S, obs, APP.PEHSmart.ringkas(patroli));
  return { d, S, pesan, data: S.data ? salin(S.data) : null };
}
// Ambil sebagian kolom saja supaya uji tidak bergantung pada kolom yang tidak diperiksa
const pilih = (r, kunci) => Object.fromEntries(kunci.map((k) => [k, r[k]]));
const MT = "patroli-metode-teknis-contoh.xml";

test("raptor: patroli contoh Piong 2021 menghasilkan angka LPK", () => {
  const { d, S, pesan } = impor("raptor", "patroli-raptor-contoh.xml");
  assert.strictEqual(pesan, "42 titik pengamatan, 7 perjumpaan raptor.");
  const A = d.hitung(S);
  assert.deepStrictEqual([A.N, A.S, A.luas.ha], [9, 6, 3297]);
  assert.strictEqual(A.H.toFixed(2), "1.58");
});

test("kehati tinggi: nomor grid dari atribut lokasi \"Grid 681\" dan klasifikasi empat tingkat dari Ground Check > Tipe Ekosistem", () => {
  const { data } = impor("kehati-tinggi", MT);
  const K = ["kode", "lokasi", "kelas1", "kelas2", "kelas3", "tipe"];
  assert.deepStrictEqual(data.grid.map((r) => pilih(r, K)), [
    { kode: "681", lokasi: "", kelas1: "Alami", kelas2: "Ekosistem Teresterial", kelas3: "Daratan Rendah (0-1000mdpl)", tipe: "Savana" },
    { kode: "682", lokasi: "Sera Dana Kala", kelas1: "Alami", kelas2: "", kelas3: "Pegunungan Atas (1500-2400mdpl)", tipe: "Hutan Pamah" }
  ]);
  assert.deepStrictEqual(data.vegetasi.map((r) => pilih(r, ["grid", "tingkat", "jenis", "latin", "diameter"])), [{ grid: "682", tingkat: "Pohon", jenis: "Kesambi", latin: "Schleichera oleosa", diameter: 34 }]);
  // Satwa Liar > Perjumpaan Satwa milik patroli rutin ikut terbaca, grid dari lokasi
  assert.deepStrictEqual(data.satwa.map((r) => pilih(r, ["grid", "jenis", "latin", "n", "temuan"])), [{ grid: "681", jenis: "Elang Flores", latin: "Nisaetus floris", n: 2, temuan: "Perjumpaan langsung" }]);
});

test("ground check: Tutupan Lahan dan Tipe Ekosistem pada waypoint yang sama digabung menjadi satu titik", () => {
  const { data, pesan } = impor("ground-check", MT);
  assert.strictEqual(pesan, "1 baris titik ground check.");
  assert.deepStrictEqual(pilih(data.titik[0], ["kode", "lokasi", "lapangan", "openArea", "ekoLapangan"]), { kode: "1", lokasi: "Grid 681", lapangan: "Savana/ Padang Rumput", openArea: "Open area", ekoLapangan: "Savana" });
});

test("resor dibaca dari stasiun patroli dan disamakan dengan daftar resor (Resor Doroncanga menjadi Resor Doro Ncanga)", () => {
  const uma = impor("uma-ani", MT).data, rekap = impor("rekap-elang-flores", MT).data;
  assert.deepStrictEqual(pilih(uma.pohon[0], ["kode", "resor", "lokasi", "jenis", "jumlahSarang", "kondisi", "panen"]), { kode: "UA-01", resor: "Resor Doro Ncanga", lokasi: "Oi Marai", jenis: "Beringin", jumlahSarang: 3, kondisi: "Hidup sehat", panen: "Ada" });
  assert.deepStrictEqual(pilih(rekap.perjumpaan[0], ["resor", "jenis", "n", "sumber"]), { resor: "Resor Doro Ncanga", jenis: "Elang Flores", n: 2, sumber: "Patroli SMART" });
  assert.deepStrictEqual(pilih(rekap.sarang[0], ["kode", "resor", "kondisi"]), { kode: "EF-01", resor: "Resor Doro Ncanga", kondisi: "Aktif (material baru)" });
});

test("rusa timor: ulangan dari jam waypoint dan sisi transek", () => {
  const { data } = impor("rusa-timor", MT);
  assert.deepStrictEqual(pilih(data.langsung[0], ["transek", "waktu", "ulangan", "sisi", "n", "jarak", "sudut", "aktivitas"]), { transek: "T1", waktu: "17.30", ulangan: "Sore/malam", sisi: "Kanan", n: 4, jarak: 35, sudut: 30, aktivitas: "Makan" });
});

test("stok karbon: atribut ya/tidak pohonmati menjadi status Mati", () => {
  const { data } = impor("stok-karbon", MT);
  assert.deepStrictEqual(pilih(data.pohon[0], ["transek", "plot", "tingkat", "dbh", "hidup"]), { transek: "1", plot: "DC11", tingkat: "Pohon", dbh: 27.5, hidup: "Mati" });
});
