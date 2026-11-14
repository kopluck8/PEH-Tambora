/*
 * Uji rumus generator kegiatan PEH. Jalankan: node --test
 * Data contoh di aplikasi disalin dari lampiran LPK Balai, jadi hasil hitungannya dibandingkan dengan angka yang tertulis di LPK itu.
 * Kegiatan tanpa data contoh diuji dengan data uji sintetis (tests/fixtures/uji-*.json) dan hitungan tangan di berkas ini.
 */
const test = require("node:test");
const assert = require("node:assert");
const { muat, fixture } = require("./muat.js");

const APP = muat();
const def = (id) => { const d = APP.PEH.KEGIATAN.find((k) => k.id === id); assert.ok(d, `kegiatan ${id} belum terdaftar`); return d; };
const dataUji = (id) => JSON.parse(fixture(`uji-${id}.json`));
const salin = (o) => JSON.parse(JSON.stringify(o));
const hitung = (id, contoh) => { const d = def(id); return d.hitung(d.dariContoh(contoh || d.contoh)); };
// Hasil hitungan sama dengan angka acuan setelah dibulatkan ke d desimal
const sama = (nyata, acuan, d, label = "") => assert.ok(Math.abs(Number(nyata) - acuan) <= 0.5 * 10 ** -d + 1e-9, `${label} ${nyata} tidak sama dengan ${acuan} (${d} desimal)`);
// Objek dari konteks vm punya prototipe Array/Object sendiri, jadi disalin dulu sebelum dibandingkan
const samaIsi = (nyata, acuan, pesan) => assert.deepStrictEqual(salin(nyata), acuan, pesan);
const shannon = (xs) => { const N = xs.reduce((a, b) => a + b, 0); return -xs.reduce((s, x) => s + (x / N) * Math.log(x / N), 0); };

const KEGIATAN = ["raptor", "elang-flores", "rusa-timor", "ground-check", "anggrek", "jenis-invasif", "burung", "tumbuhan-penting", "satwa-kunci", "pelepasliaran", "stok-karbon", "rekap-elang-flores", "uma-ani", "kehati-tinggi"];

test("ke-14 generator terdaftar; hasil hitungan dan narasi LPK/RPK tanpa NaN, undefined, atau galat", () => {
  samaIsi(APP.PEH.KEGIATAN.map((k) => k.id).sort(), [...KEGIATAN].sort());
  const cariNaN = (o, jalur, temu) => {
    if (typeof o === "number" && Number.isNaN(o)) temu.push(jalur);
    else if (o && typeof o === "object") Object.entries(o).forEach(([k, v]) => cariNaN(v, `${jalur}.${k}`, temu));
    return temu;
  };
  for (const id of KEGIATAN.filter((k) => k !== "raptor")) {
    const d = def(id), S = d.dariContoh(d.contoh || dataUji(id)), A = d.hitung(S);
    samaIsi(cariNaN(A, id, []), [], `${id}: ada NaN`);
    const teks = JSON.stringify([d.narasi(A, S), d.narasiRPK(A, S)]);
    for (const re of [/undefined/, /NaN/, /\bnull\b/, /\[object/, /Perhitungan gagal/, /Infinity/, /—/, / [,.;)]/]) {
      const m = teks.match(re);
      assert.ok(!m, `${id}: narasi memuat ${re} di "${m && teks.slice(Math.max(0, m.index - 50), m.index + 30)}"`);
    }
  }
});

test("setiap kegiatan punya kelompok (Satwa, Tumbuhan, Ekosistem) dan kode unik untuk daftar kegiatan dan sampulnya", () => {
  const semua = APP.PEH.KEGIATAN;
  semua.forEach((k) => assert.ok(["Satwa", "Tumbuhan", "Ekosistem"].includes(k.kelompok), `${k.id}: kelompok "${k.kelompok}" tidak dikenal`));
  const kode = semua.map((k) => k.kode);
  kode.forEach((x, i) => assert.ok(/^[A-Z]{2,8}$/.test(x || ""), `${semua[i].id}: kode "${x}" harus 2 sampai 8 huruf kapital`));
  assert.strictEqual(new Set(kode).size, kode.length, "kode kegiatan ada yang sama");
});

test("burung: kepadatan dan Shannon-Wiener sama dengan LPK Resort Doropeti Februari 2023", () => {
  const A = hitung("burung");
  assert.strictEqual(A.kepadatan.nPlot, 36);
  assert.strictEqual(A.kepadatan.luas.ha, 900);
  assert.strictEqual(A.kepadatan.N, 270);
  const nuri = A.kepadatan.baris.find((b) => b.latin === "Geoffroyus geoffroyi"), walet = A.kepadatan.baris.find((b) => b.latin === "Collocalia esculenta");
  assert.strictEqual(nuri.Xi, 47);
  sama(nuri.perHa, 0.052222222, 9, "Nuri pipi merah ind/ha");
  sama(nuri.haPerInd, 19.15, 2, "Nuri pipi merah ha/ind");
  sama(walet.perHa, 0.037777778, 9, "Walet sapi ind/ha");
  sama(walet.haPerInd, 26.47, 2, "Walet sapi ha/ind");
  const K = A.keragaman, b = (latin) => K.baris.find((x) => x.latin === latin);
  sama(K.H, 2.86, 2, "H′");
  assert.strictEqual(K.kritH, "Sedang");
  sama(b("Geoffroyus geoffroyi").pi, 0.174074, 6); sama(b("Geoffroyus geoffroyi").piLnPi, -0.30433, 5); sama(b("Geoffroyus geoffroyi").di, 17.40741, 5);
  assert.strictEqual(b("Geoffroyus geoffroyi").kritDom, "Dominan");
  sama(b("Philemon buceroides").di, 2.592593, 6);
  assert.strictEqual(b("Philemon buceroides").kritDom, "Sub Dominan");
  sama(b("Oriolus flavocinctus").di, 1.111111, 6);
  assert.strictEqual(b("Oriolus flavocinctus").kritDom, "Tidak Dominan");
});

test("stok karbon: tegakan, serasah, dan kayu mati plot DC11 sama dengan LPK SPTN Wilayah II Pekat September 2025", () => {
  const dc11 = (A) => A.karbon.list.find((p) => p.plot === "DC11");
  const p = dc11(hitung("stok-karbon"));
  sama(p.teg.V, 1.9469, 4, "volume"); assert.strictEqual(p.teg.BCEF, 9);
  sama(p.teg.B, 17.5223, 4, "biomassa"); sama(p.teg.CAP, 8.2355, 4, "karbon atas permukaan");
  sama(p.teg.BBP, 5.8408, 4, "biomassa bawah permukaan"); sama(p.teg.CBP, 2.7452, 4, "karbon bawah permukaan");
  // LPK membulatkan berat kering serasah ke 684,14 g sebelum dikonversi, jadi bahan organik dibandingkan sampai 3 desimal
  sama(p.sntb.komp.Serasah.BO, 6.8414, 3, "bahan organik serasah"); sama(p.sntb.komp.Serasah.C, 2.6278, 4, "karbon serasah");
  // Lampiran kayu mati LPK merinci satu potongan lapuk (DC11.A.R2-12); potongan lain di plot ini dikeluarkan supaya angkanya bisa dibandingkan.
  // Angka antara di lampiran sudah dibulatkan (selisih biomassa kurang dari 0,0001 t), jadi biomassa dibandingkan sampai 3 desimal.
  const c = salin(def("stok-karbon").contoh);
  c.data.kayuMati = c.data.kayuMati.filter((r) => r.kode === "DC11.A.R2-12");
  const km = dc11(hitung("stok-karbon", c)).km;
  sama(km.Bsum, 14.82722, 3, "biomassa kayu mati"); sama(km.Csum, 5.80337, 4, "karbon kayu mati");
  sama(km.B, 3.7068, 4, "biomassa kayu mati per kuadran"); sama(km.C, 1.45084, 4, "karbon kayu mati per kuadran");
});

test("rusa timor: kepadatan King dan dugaan populasi dari jejak sama dengan LPK Doro Ncanga Juli 2023", () => {
  const A = hitung("rusa-timor");
  assert.strictEqual(A.kepadatan.metode, "king");
  sama(A.kepadatan.king.ha, 120.64, 2, "luas efektif (ha)");
  sama(A.kepadatan.D, 0.033156, 6, "kepadatan (ekor/ha)");
  sama(A.kepadatan.haPerInd, 30.16, 2, "ha per ekor");
  assert.strictEqual(Math.round(A.kepadatan.populasi), 11, "dugaan populasi di area 325 ha");
  const J = A.jejak;
  sama(J.luas, 7.16, 2, "luas area sampel jejak");
  samaIsi([J.Nk, J.Nk1, J.N, J.Nh], [3, 1, 5, 44]);
});

test("elang flores: kepadatan sama dengan LPK Oi Katupa Agustus 2023", () => {
  const K = hitung("elang-flores").kepadatan;
  assert.strictEqual(K.nPlot, 6);
  sama(K.luas.perPlotHa, 78.5, 1); assert.strictEqual(K.luas.ha, 471);
  assert.strictEqual(K.N, 3);
  // LPK menulis 0,636 individu/km² (dipotong); 3 individu / 4,71 km² = 0,637
  sama(K.D.perHa * 100, 0.637, 3, "individu/km²");
  assert.strictEqual(K.D.haPerInd, 157);
  samaIsi([...K.plotTemu].sort(), ["MT05", "MT06"]);
});

test("ground check: status open area sama dengan LPK Doro Ncanga September 2023; akurasi dan kappa sesuai matriks", () => {
  const A = hitung("ground-check");
  samaIsi(A.openarea.rows.map((r) => [r.k, r.x]), [["Non open area", 15], ["Open area buatan", 10], ["Open area alami", 6]]);
  const T = A.tuplah;
  assert.strictEqual(T.N, 31);
  assert.strictEqual(T.sesuai, 21);
  sama(T.OA, (21 / 31) * 100, 9, "akurasi keseluruhan");
  const N = T.N, po = T.M.reduce((s, r, i) => s + r[i], 0) / N, pe = T.baris.reduce((s, b, i) => s + b * T.kolom[i], 0) / (N * N);
  sama(T.kappa, (po - pe) / (1 - pe), 9, "kappa");
  sama(T.kappa, 0.568, 3, "kappa");
});

test("anggrek (data uji): daftar per genus, Margalef, dan Shannon-Wiener", () => {
  const c = dataUji("anggrek"), A = hitung("anggrek", c);
  assert.strictEqual(A.jenis.S, 8);
  assert.strictEqual(A.jenis.N, 29);
  assert.strictEqual(A.jenis.famili.length, 7, "jumlah genus");
  samaIsi(A.jenis.famili[0], ["Bulbophyllum", 2]);
  const per = {};
  c.data.temuan.forEach((r) => { per[r.latin] = (per[r.latin] || 0) + r.n; });
  sama(A.keragaman.H, shannon(Object.values(per)), 9, "H′");
  sama(A.keragaman.R, 7 / Math.log(29), 9, "Margalef");
  samaIsi(A.carahidup.rows.map((r) => [r.k, r.x]), [["Epifit", 21], ["Terestrial", 8]]);
});

test("jenis invasif (data uji): skor keinvasifan K = total × 10/15 menurut Modul Analisis Risiko (2016)", () => {
  const B = hitung("jenis-invasif", dataUji("jenis-invasif")).keinvasifan.baris;
  samaIsi(B.map((r) => [r.jenis, r.total, r.K]), [["Alang-alang", 12, 8], ["Tembelekan", 11, 7.3], ["Kerinyuh", 10, 6.7], ["Patikan kebo", 5, 3.3], ["Tempuh wiyang", 4, 2.7]]);
  B.forEach((r) => {
    assert.strictEqual(r.total, r.f.reduce((s, f) => s + f.skor, 0), `${r.jenis}: total = jumlah skor lima faktor`);
    sama(r.K, (r.total * 10) / 15, 1, r.jenis);
  });
});

test("tumbuhan penting: jumlah petak dari intensitas sampling sama dengan LPK Doro Ncanga dan Doropeti", () => {
  const sampling = (panjang) => { const c = dataUji("tumbuhan-penting"); c.param = { ...c.param, panjangJalur: panjang, lebarJalur: 20, IS: 4 }; return hitung("tumbuhan-penting", c).sampling; };
  // LPK Doro Ncanga: 15.000 m × 20 m = 300.000 m², petak 400 m², IS 4% → 30 petak; LPK Doropeti: 10.000 m → 20 petak
  const dc = sampling(15000), dp = sampling(10000);
  samaIsi([dc.A, dc.a, dc.nRencana], [300000, 400, 30]);
  samaIsi([dp.A, dp.nRencana], [200000, 20]);
  const uji = hitung("tumbuhan-penting", dataUji("tumbuhan-penting")).sampling;
  samaIsi([uji.A, uji.nRencana, uji.nA], [60000, 6, 6]);
  sama(uji.ISaktual, 4, 9, "intensitas aktual");
});

test("satwa kunci (data uji): perkiraan individu tanpa onggokan kotoran dan kepadatan King", () => {
  const A = hitung("satwa-kunci", dataUji("satwa-kunci"));
  const rusa = A.perkiraan.jenis.find((j) => j.jenis === "Rusa timor");
  // langsung 10 + 2 + 1; tanda (jejak 3 + 6 + 8, garukan 1); onggokan kotoran tidak dihitung sebagai individu
  samaIsi([rusa.NL, rusa.NT, rusa.N], [13, 18, 31]);
  const k = A.kepadatan.king;
  assert.strictEqual(k.L, 4200 + 5100 + 3600);
  sama(k.dbar, (120 + 60 + 10) / 3, 9, "rerata jarak");
  sama(k.ha, (2 * k.dbar * k.L) / 10000, 9, "luas efektif");
  sama(A.kepadatan.D, 13 / k.ha, 9, "kepadatan");
});

test("pelepasliaran (data uji): nilai fungsi pohon (Handayani, 2015) dan skor kesesuaian lokasi", () => {
  const A = hitung("pelepasliaran", dataUji("pelepasliaran"));
  const beluwat = A.fungsipohon.baris.find((b) => b.nama === "Beluwat");
  sama(beluwat.total, beluwat.nilai.reduce((s, x) => s + x, 0), 9);
  sama(beluwat.total, 7.66667, 5); sama(beluwat.persen, (beluwat.total / beluwat.maks) * 100, 9); sama(beluwat.persen, 85.185, 3);
  assert.strictEqual(beluwat.kelas, "Sangat baik");
  const lok = A.kesesuaian.lokasi;
  samaIsi(lok.map((l) => l.lokasi), ["Pintu 1 Doropeti", "Karyasari", "Doro Toi", "Pintu 4 Doro Ncanga"]);
  lok.forEach((l) => sama(l.nilai, l.total / l.n, 9, l.lokasi));
  sama(lok[0].nilai, 70.714, 3);
});

test("rekap elang flores (data uji): catatan ganda dibuang dan individu minimum per tahun", () => {
  const c = dataUji("rekap-elang-flores"), R = hitung("rekap-elang-flores", c).rekap;
  assert.strictEqual(c.data.perjumpaan.length, 20);
  assert.strictEqual(R.catatan, 19, "satu catatan yang sama persis terhitung sekali");
  // 2022: Mada Oi Toi maks(2, 3) + Ngguwu Saha 2 + Pintu 4 Doro Ncanga 1 + Karyasari 2 = 8
  samaIsi(R.perTahun.map((t) => [t.tahun, t.Nmin]), [["2021", 3], ["2022", 8], ["2023", 7], ["2024", 6]]);
  assert.strictEqual(R.puncak.tahun, "2022");
});

test("uma ani: perubahan jumlah sarang 2019 ke 2024 sama dengan tabel perbandingan LPK 2024", () => {
  const Z = hitung("uma-ani", dataUji("uma-ani")).sarang;
  samaIsi([Z.pohon, Z.sarang, Z.kosongSarang], [11, 111, 2]);
  const B = Z.banding;
  samaIsi([B.lalu, B.kini, B.naik, B.turun, B.hilang, B.baru], [101, 111, 7, 2, 2, 0]);
  samaIsi(Z.baris.map((b) => [b.jenis, b.pohon, b.sarang]), [["Owo", 6, 79], ["Monggo", 3, 16], ["Katowi", 1, 16], ["Bara", 1, 0]]);
});

test("kehati tinggi (data uji): H′ tiap tipe ekosistem dihitung dari petak pada grid bertipe sama", () => {
  const c = dataUji("kehati-tinggi"), E = hitung("kehati-tinggi", c).ekosistem;
  assert.strictEqual(E.nGrid, 8);
  const tipe = Object.fromEntries(c.data.grid.map((g) => [g.kode, g.tipe])), per = {};
  c.data.vegetasi.forEach((v) => { const t = tipe[v.grid]; per[t] = per[t] || {}; per[t][v.latin || v.jenis] = (per[t][v.latin || v.jenis] || 0) + (Number(v.n) || 1); });
  samaIsi(E.rows.map((r) => r.tipe), ["Hutan Pamah", "Savana", "Hutan Pegunungan Bawah"]);
  E.rows.forEach((r) => {
    const xs = Object.values(per[r.tipe]);
    assert.strictEqual(r.S, xs.length, `${r.tipe}: jumlah jenis`);
    sama(r.H, shannon(xs), 9, `${r.tipe}: H′`);
  });
  samaIsi(E.rows.map((r) => r.grid), [3, 3, 2]);
});
