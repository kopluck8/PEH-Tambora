/*
 * Modul analisis (lanjutan): transek garis, pellet count, jejak kaki, analisis vegetasi, wilayah jelajah (MCP),
 * stok karbon, uji akurasi tutupan lahan, skoring, dan pohon sarang. Bentuk modul: lihat js/core/modul.js.
 */
(function () {
  "use strict";
  const L = window.PEHLaporan, Q = window.PEHRumus, ST = window.PEHStats, M = window.PEHModul;
  const { esc, num, para, sci, nTxt } = L;
  const { R, F, Sub, Sup, SubSup, Sum, P, Sqrt } = Q;
  const { fin, toN, nOr, daftarKata, nm, fx, haTxt, perJenis } = M.util;
  const { t, k, n } = M.cell;
  const ket = (rows, lv, head) => Q.ketHtml(rows, lv, head);
  const blk = (nodes, lv) => Q.blockHtml(nodes, lv);
  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const mean = (a) => (a.length ? sum(a) / a.length : 0);
  const str = (v) => String(v ?? "").trim();
  // Angka dengan desimal seperlunya (325 → "325", 7,16 → "7,16")
  const numL = (v, d = 2) => (Number.isFinite(Number(v)) ? Number(v).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: d }) : "-");

  /* =====================================================================
   * 8. Transek garis: King (Tobing 2008), Hayne (Santosa dkk. 2014), jalur berlebar tetap
   * inp: { kontak: [{ transek, n, jarak }], transek: [{ id, panjang }], ulangan, metode, w, luasArea }
   * ===================================================================== */
  M.transek = {
    judul: "Kepadatan Populasi (Transek Garis)",
    hitung(inp) {
      const tr = (inp.transek || []).filter((x) => str(x.id) || nOr(x.panjang, 0) > 0), ul = nOr(inp.ulangan, 1) || 1;
      const L_ = sum(tr.map((x) => nOr(x.panjang, 0))) * ul;
      const kontak = (inp.kontak || []).filter((r) => nOr(r.n, 0) > 0);
      const N = sum(kontak.map((r) => nOr(r.n, 0)));
      const jarak = kontak.map((r) => toN(r.jarak)).filter((x) => fin(x) && x > 0);
      const metode = inp.metode || "king", w = nOr(inp.w, 0), A = nOr(inp.luasArea, 0);
      const king = ST.king(N, jarak, L_), hayne = ST.hayne(jarak, L_, N);
      const Nw = sum(kontak.filter((r) => w && fin(toN(r.jarak)) && toN(r.jarak) <= w).map((r) => nOr(r.n, 0)));
      const jalur = ST.jalur(Nw, w, L_);
      const D = metode === "hayne" ? hayne.Dind : metode === "jalur" ? jalur.D : king.D;
      const perT = tr.map((x) => {
        const kk = kontak.filter((r) => str(r.transek) === str(x.id));
        const dj = kk.map((r) => toN(r.jarak)).filter((v) => fin(v) && v > 0);
        return { id: str(x.id), panjang: nOr(x.panjang, 0), kontak: kk.length, individu: sum(kk.map((r) => nOr(r.n, 0))), dbar: mean(dj) };
      });
      const haAmat = metode === "jalur" ? jalur.ha : metode === "king" ? king.ha : 0;
      return { kosong: !N || !L_, metode, L: L_, ul, nTransek: tr.length, N, nKontak: kontak.length, jarak, king, hayne, jalur, w, D, haPerInd: D ? 1 / D : Infinity, A, populasi: A && D ? D * A : null, IS: A && haAmat ? (haAmat / A) * 100 : null, perT };
    },
    narMetode(c) {
      const m = c.opt.metode || "king";
      if (m === "jalur") return `Kepadatan populasi ${c.objek} diduga dengan metode transek jalur berlebar tetap: hanya individu di dalam jalur yang dihitung (Krebs, 1999). Persamaan yang dipakai:`;
      if (m === "hayne") return `Kepadatan populasi ${c.objek} diduga dengan metode transek garis Hayne. Lebar jalur tidak ditetapkan; setiap perjumpaan diberi bobot menurut jarak kontaknya (Santosa dkk., 2014):`;
      return `Analisis data perjumpaan langsung menggunakan metode King. Metode ini menduga kepadatan populasi pada luasan tertentu dari panjang jalur yang ditempuh, jarak langsung antara pengamat dan satwa, dan jumlah individu yang terlihat (Tobing, 2008):`;
    },
    metode(c) {
      const lv = c.lv, m = c.opt.metode || "king", out = [];
      const ragam = [para("Ragam pendugaan kepadatan populasi dihitung dengan persamaan yang dikembangkan oleh Hayne (Santosa dkk., 2014):", lv),
        blk([R("V("), Sub("D", "H"), R(") ≈ "), Sup(Sub("D", "H"), "2"), R(" × "), P([F("var(x)", Sup("x", "2")), R(" + "), F(Sum(Sup(P([F("1", Sub("r", "i")), R(" − R")]), "2")), [Sup("R", "2"), R(" × x × (x − 1)")])])], lv),
        blk([R("R = "), F("1", "x"), R(" × "), Sum(F("1", Sub("r", "i")))], lv), blk([R("SE("), Sub("D", "H"), R(") = "), Sqrt([R("V("), Sub("D", "H"), R(")")])], lv),
        ket([[["V(", Sub("D", "H"), ")"], "ragam pendugaan kepadatan populasi menurut Hayne"], ["var(x)", "ragam jumlah kontak, didekati dengan x"], ["x", "jumlah kontak (perjumpaan)"], [Sub("r", "i"), "jarak kontak setiap perjumpaan"], ["R", "rata-rata kebalikan jarak kontak"], [["SE(", Sub("D", "H"), ")"], "simpangan baku kepadatan dugaan"]], lv)];
      if (m === "jalur") out.push(blk([R("D = "), F("N", "2 × w × L")], lv), ket([["D", "kepadatan populasi (individu/ha)"], ["N", "jumlah individu di dalam jalur"], ["w", "setengah lebar jalur (m)"], ["L", "panjang jalur (m)"]], lv));
      else if (m === "hayne") out.push(blk([Sub("D", "H"), R(" = "), F([R("x × R")], "2L")], lv), ...ragam);
      else out.push(blk([R("D = "), F("N", [Sub("L", "j"), R(" × "), Sub("P", "j")])], lv), blk([Sub("L", "j"), R(" = 2 × "), R("d̄")], lv),
        ket([["D", "kepadatan populasi (individu/ha)"], ["N", "jumlah individu yang terdeteksi saat pengamatan"], [Sub("L", "j"), "lebar jalur efektif (m)"], ["d̄", "rata-rata jarak kontak pengamat dengan satwa (m)"], [Sub("P", "j"), "panjang jalur yang ditempuh (m)"]], lv), ...ragam);
      out.push(para("Dugaan populasi pada area pengamatan diperoleh dari kepadatan dikali luas area pengamatan (N = D × A). Intensitas sampling (IS) adalah perbandingan luas area amatan dengan luas area pengamatan (IS = a/A × 100%).", lv));
      return out.join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada perjumpaan langsung ${c.objek} atau panjang transek belum diisi.`;
      const s = [`Pengamatan dilakukan pada ${nTxt(r.nTransek)} transek dengan panjang total ${num(r.L)} m${r.ul > 1 ? ` (termasuk ${r.ul} kali ulangan)` : ""}. Tercatat ${nTxt(r.N)} individu ${c.objek} dari ${r.nKontak} kontak.`];
      if (r.metode === "king") s.push(`Rata-rata jarak kontak ${num(r.king.dbar, 2)} m sehingga luas area amatan ${num(r.king.ha, 2)} ha. Kepadatan populasi menurut metode King adalah ${fx(r.king.D, 4)} individu/ha atau 1 individu/${fx(r.king.haPerInd, 2)} ha.${r.hayne.n > 1 ? ` Dugaan Hayne sebagai pembanding adalah ${fx(r.hayne.Dind, 4)} ± ${fx(r.hayne.SEInd, 4)} individu/ha.` : ""}`);
      if (r.metode === "hayne") s.push(`Kepadatan populasi menurut Hayne adalah ${fx(r.hayne.Dind, 4)} ± ${fx(r.hayne.SEInd, 4)} individu/ha (rata-rata ukuran kelompok ${num(r.hayne.ukuranKelompok, 2)} individu).`);
      if (r.metode === "jalur") s.push(`Dengan lebar jalur ${num(r.w * 2)} m, kepadatan populasinya ${fx(r.jalur.D, 4)} individu/ha.`);
      if (r.populasi !== null) s.push(`Dengan luas area pengamatan ${numL(r.A)} ha${r.IS !== null ? ` dan intensitas sampling ${num(r.IS, 1)}%` : ""}, dugaan populasi ${c.objek} sekitar ${num(r.populasi, 0)} individu.`);
      return s.join(" ");
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv, out = [];
      if (r.metode === "king") out.push(blk([Sub("L", "j"), R(` = 2 × ${num(r.king.dbar, 2)} = ${num(r.king.dbar * 2, 2)} m`)], lv),
        blk([R("D = "), F(num(r.N), `${num(r.king.dbar * 2, 2)} × ${num(r.L)}`), R(` = ${fx(r.king.D * 1e-4, 8)} ind/`), Sup("m", "2"), R(` = ${fx(r.king.D, 4)} ind/ha`)], lv));
      if (r.metode === "hayne" || (r.metode === "king" && r.hayne.n > 1)) out.push(blk([R("R = "), F("1", num(r.hayne.n)), R(" × "), Sum(F("1", Sub("r", "i"))), R(` = ${fx(r.hayne.R, 6)}`)], lv),
        blk([Sub("D", "H"), R(" = "), F(`${num(r.hayne.n)} × ${fx(r.hayne.R, 6)}`, `2 × ${num(r.L)}`), R(` × 10.000 = ${fx(r.hayne.D, 4)} kelompok/ha`)], lv),
        blk([R("SE("), Sub("D", "H"), R(`) = `), Sqrt(fx(r.hayne.V, 8)), R(` = ${fx(r.hayne.SE, 4)}`)], lv));
      if (r.metode === "jalur") out.push(blk([R("D = "), F(num(r.jalur.N), `2 × ${num(r.w)} × ${num(r.L)}`), R(` × 10.000 = ${fx(r.jalur.D, 4)} ind/ha`)], lv));
      if (r.IS !== null) out.push(blk([R("IS = "), F(num(r.metode === "jalur" ? r.jalur.ha : r.king.ha, 2), num(r.A, 2)), R(` × 100% = ${num(r.IS, 1)}%`)], lv));
      if (r.populasi !== null) out.push(blk([R(`N = ${fx(r.D, 4)} × ${num(r.A, 2)} = ${num(r.populasi, 0)} individu`)], lv));
      return out.join("");
    },
    spec(r) {
      return { head: ["Transek", "Panjang (m)", "Jumlah Kontak", "Jumlah Individu", "Rata-rata Jarak Kontak (m)"],
        rows: r.perT.map((x) => [k(esc(x.id)), n(x.panjang, 0), n(x.kontak, 0), n(x.individu, 0), x.dbar ? n(x.dbar, 2) : k("-")]),
        total: [[t(`Jumlah${r.ul > 1 ? ` (× ${r.ul} ulangan)` : ""}`), n(r.L, 0), n(r.nKontak, 0), n(r.N, 0), r.king.dbar ? n(r.king.dbar, 2) : k("-")]] };
    },
    ringkas(r) {
      const rows = [[t("Metode King: luas amatan (ha)"), n(r.king.ha, 2)], [t("Metode King: kepadatan (ind/ha)"), n(r.king.D, 4)], [t("Metode King: 1 individu per … ha"), n(r.king.haPerInd, 2)]];
      if (r.hayne.n) rows.push([t("Hayne: kepadatan kelompok (kelompok/ha)"), n(r.hayne.D, 4)], [t("Hayne: kepadatan individu (ind/ha)"), n(r.hayne.Dind, 4)], [t("Hayne: simpangan baku (ind/ha)"), n(r.hayne.SEInd, 4)]);
      if (r.w) rows.push([t(`Jalur berlebar ${num(r.w * 2)} m: kepadatan (ind/ha)`), n(r.jalur.D, 4)]);
      if (r.IS !== null) rows.push([t(`Intensitas sampling terhadap area ${numL(r.A)} ha (%)`), n(r.IS, 1)]);
      if (r.populasi !== null) rows.push([t(`Dugaan populasi pada ${numL(r.A)} ha (individu)`), n(r.populasi, 0)]);
      return { head: ["Parameter", "Nilai"], rows };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Rekapitulasi Perjumpaan Langsung ${L.cap1(c.objek)} per Transek`, spec: this.spec(r) }, { cap: `Dugaan Kepadatan Populasi ${L.cap1(c.objek)}`, spec: this.ringkas(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Kepadatan populasi ${c.objek} dari perjumpaan langsung (${r.metode === "king" ? "metode King" : r.metode === "hayne" ? "metode Hayne" : "transek jalur"}) adalah ${fx(r.D, 4)} individu/ha atau 1 individu/${fx(r.haPerInd, 2)} ha${r.populasi !== null ? `, dengan dugaan populasi sekitar ${num(r.populasi, 0)} individu` : ""}`; },
    kpi(r) { return r.kosong ? [] : [[fx(r.D, 4), `ind/ha (${haTxt(r.haPerInd)})`], [`${num(r.L)} m`, "panjang transek"]]; }
  };

  /* =====================================================================
   * 9. Pellet count (Sukmawati 2012); umur onggokan menurut fase dekomposisi (Suba dkk. 2010)
   * inp: { rows: [{ unit, p, fase }], fase: ["A","B"], t, d, a, A }
   * ===================================================================== */
  const FASE = ["A", "B", "C", "D", "E", "F"];
  M.pellet = {
    judul: "Pendugaan Populasi dari Onggokan Kotoran",
    hitung(inp) {
      const dipakai = new Set((inp.fase || ["A", "B"]).map((x) => str(x).toUpperCase()));
      const rows = (inp.rows || []).filter((r) => nOr(r.p, 0) > 0);
      const masuk = (r) => !str(r.fase) || dipakai.has(str(r.fase).toUpperCase().charAt(0));
      const p = sum(rows.filter(masuk).map((r) => nOr(r.p, 0)));
      const units = [...new Set(rows.map((r) => str(r.unit) || "-"))];
      const perU = units.map((u) => { const o = { unit: u, fase: {}, dihitung: 0 }; rows.filter((r) => (str(r.unit) || "-") === u).forEach((r) => { const f = str(r.fase).toUpperCase().charAt(0) || "?"; o.fase[f] = (o.fase[f] || 0) + nOr(r.p, 0); if (masuk(r)) o.dihitung += nOr(r.p, 0); }); return o; });
      const tt = nOr(inp.t, 0), d = nOr(inp.d, 0), a = nOr(inp.a, 0), A = nOr(inp.A, 0);
      const res = ST.pellet(p, tt, d, a, A);
      return { kosong: !rows.length, lengkap: !!(tt && d && a), p, tt, d, a, A, res, perU, fase: [...dipakai], total: sum(rows.map((r) => nOr(r.p, 0))) };
    },
    narMetode(c) { return `Kelompok feses (onggokan) ${c.objek} dicatat menurut fase dekomposisinya (Suba dkk., 2010): fase A feses segar dan berbau khas; fase B feses mengering; fase C terdapat jamur di sekeliling feses; fase D feses mulai terdekomposisi; fase E setengah atau lebih feses terdekomposisi; fase F feses terdekomposisi sempurna. Onggokan yang dihitung adalah yang berumur kurang dari satu bulan (fase ${daftarKata((c.opt.fase || ["A", "B"]).map(String))}). Kepadatan populasi diduga dengan metode pellet count (Sukmawati, 2012):`; },
    metode(c) {
      const lv = c.lv;
      return [blk([R("D = "), F("A × p", "t × d × a")], lv),
        ket([["D", "dugaan populasi pada area seluas A (individu); bila A = 1 ha, D adalah kepadatan per ha"], ["A", "luas area penelitian (ha)"], ["p", "jumlah onggokan kotoran"], ["t", "interval waktu penumpukan onggokan (hari)"], ["d", "rata-rata laju defekasi (onggokan/individu/hari)"], ["a", "luas plot penelitian (ha)"]], lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data onggokan kotoran ${c.objek}.`;
      if (!r.lengkap) return `Tercatat ${nTxt(r.total)} onggokan kotoran ${c.objek}, ${r.p} di antaranya termasuk fase ${daftarKata(r.fase)} (berumur kurang dari satu bulan). Kepadatan populasi dari onggokan kotoran belum dihitung karena interval waktu penumpukan (t), laju defekasi (d), atau luas plot (a) belum ditetapkan; data onggokan dipakai sebagai petunjuk keberadaan dan intensitas penggunaan habitat.`;
      return `Tercatat ${r.total} onggokan kotoran ${c.objek}, ${r.p} di antaranya berumur kurang dari satu bulan (fase ${daftarKata(r.fase)}). Dengan interval waktu ${num(r.tt)} hari, laju defekasi ${num(r.d, 2)} onggokan/individu/hari, dan luas plot ${num(r.a, 2)} ha, kepadatan populasi ${c.objek} adalah ${fx(r.res.D, 4)} individu/ha atau 1 individu/${fx(r.res.haPerInd, 2)} ha.${r.res.populasi !== null ? ` Pada area pengamatan seluas ${num(r.A, 2)} ha, dugaan populasinya sekitar ${num(r.res.populasi, 0)} individu.` : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong || !r.lengkap) return "";
      const lv = c.lv, out = [blk([R("D = "), F(`1 × ${num(r.p)}`, `${num(r.tt)} × ${num(r.d, 2)} × ${num(r.a, 2)}`), R(` = ${fx(r.res.D, 4)} ind/ha`)], lv)];
      if (r.res.populasi !== null) out.push(blk([R("D = "), F(`${num(r.A, 2)} × ${num(r.p)}`, `${num(r.tt)} × ${num(r.d, 2)} × ${num(r.a, 2)}`), R(` = ${num(r.res.populasi, 1)} individu`)], lv));
      return out.join("");
    },
    spec(r) {
      return { head: ["Lokasi/Transek", ...FASE.map((f) => `Fase ${f}`), "Onggokan Dihitung"],
        rows: r.perU.map((u) => [k(esc(u.unit)), ...FASE.map((f) => n(u.fase[f] || 0, 0)), n(u.dihitung, 0)]),
        total: [[t("Jumlah"), ...FASE.map((f) => n(sum(r.perU.map((u) => u.fase[f] || 0)), 0)), n(r.p, 0)]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Rekapitulasi Onggokan Kotoran ${L.cap1(c.objek)} menurut Fase Dekomposisi`, spec: this.spec(r) }]; },
    simpulan(r, c) { return r.kosong || !r.lengkap ? "" : `Kepadatan populasi ${c.objek} berdasarkan onggokan kotoran adalah ${fx(r.res.D, 4)} individu/ha (1 individu/${fx(r.res.haPerInd, 2)} ha)`; },
    kpi(r) { return r.kosong ? [] : [[r.p, "onggokan dihitung"]]; }
  };

  /* =====================================================================
   * 10. Pendugaan populasi dari jejak kaki (Tikupadang dan Gunawan 1997)
   * inp: { rows: [{ unit, n }], units: [{ id, luas }], a }
   * ===================================================================== */
  M.jejak = {
    judul: "Pendugaan Populasi dari Jejak Kaki",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => nOr(r.n, 0) > 0);
      const U = (inp.units || []).filter((u) => str(u.id));
      const ids = [...new Set([...U.map((u) => str(u.id)), ...rows.map((r) => str(r.unit) || "-")])];
      const per = ids.map((id) => ({ id, luas: nOr((U.find((u) => str(u.id) === id) || {}).luas, 0), n: sum(rows.filter((r) => (str(r.unit) || "-") === id).map((r) => nOr(r.n, 0))) }));
      const luas = sum(per.map((x) => x.luas)), a = nOr(inp.a, 0.05) || 0.05;
      const j = ST.jejak(per.map((x) => x.n), a, luas);
      return { kosong: !rows.length, per, luas, ...j };
    },
    narMetode(c) { return `Pendugaan populasi ${c.objek} dari jejak kaki memakai jumlah pasangan jejak kaki berumur tidak lebih dari satu minggu. Data yang digunakan adalah jumlah pasangan jejak terbanyak pertama (Nk) dan terbanyak kedua (Nk1) untuk menghindari pengamatan ganda akibat perpindahan satwa. Karena satwa bergerak aktif, digunakan taraf nyata 5%. Model matematik menurut Tikupadang dan Gunawan (1997):`; },
    metode(c) {
      const lv = c.lv;
      return [blk([R("N = 2"), Sub("N", "k"), R(" − "), Sub("N", "k1")], lv), blk([Sub("N", "h"), R(" = "), P([Sub("N", "k"), R(" + "), F("1 − a", "a")]), R(" × "), P([Sub("N", "k"), R(" − "), Sub("N", "k1")])], lv),
        ket([["N", "dugaan jumlah minimum populasi"], [Sub("N", "h"), "dugaan jumlah maksimum populasi"], [Sub("N", "k"), "jumlah pasangan jejak kaki terbanyak pertama"], [Sub("N", "k1"), "jumlah pasangan jejak kaki terbanyak kedua"], ["a", `taraf nyata (${num(nOr(c.opt.a, 0.05) * 100)}%)`]], lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data pasangan jejak kaki ${c.objek}.`;
      return `Jumlah pasangan jejak terbanyak pertama (Nk) adalah ${r.Nk} dan terbanyak kedua (Nk1) adalah ${r.Nk1}. Dengan model Tikupadang dan Gunawan (1997) diperoleh taksiran populasi minimum (N) sebanyak ${nTxt(r.N)} individu dan taksiran maksimum (Nh) sebanyak ${numL(r.Nh, 1)} individu${r.luas ? ` pada area sampel seluas ${numL(r.luas)} ha, atau kepadatan ${fx(r.Dmin, 4)} sampai ${fx(r.Dmax, 4)} individu/ha (1 individu/${fx(1 / r.Dmin, 2)} ha untuk taksiran minimum)` : ""}.${r.nhSamaN ? " Karena Nk sama dengan Nk1, taksiran maksimum disamakan dengan taksiran minimum." : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv;
      return [blk([R(`N = 2 × ${num(r.Nk)} − ${num(r.Nk1)} = ${num(r.N)} individu`)], lv),
        blk([Sub("N", "h"), R(` = `), P([R(`${num(r.Nk)} + `), F(`1 − ${num(r.a, 2)}`, num(r.a, 2))]), R(` × (${num(r.Nk)} − ${num(r.Nk1)}) = ${num(r.Nh)} individu`)], lv)].join("");
    },
    spec(r) {
      return { head: ["Transek/Lokasi", "Luas Area Sampel (ha)", "Jumlah Pasangan Jejak Kaki"], rows: r.per.map((x) => [k(esc(x.id)), x.luas ? n(x.luas, 2) : k("-"), n(x.n, 0)]),
        total: [[t("Total"), n(r.luas, 2), n(sum(r.per.map((x) => x.n)), 0)], [t("Taksiran populasi minimum (N) / maksimum (Nh)"), { k: `${r.N} / ${numL(r.Nh, 1)} individu`, cs: 2 }]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Rekapitulasi Perjumpaan Jejak Kaki ${L.cap1(c.objek)}`, spec: this.spec(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Berdasarkan jejak kaki, populasi ${c.objek} diduga ${r.N} sampai ${numL(r.Nh, 1)} individu${r.luas ? ` pada area sampel ${numL(r.luas)} ha` : ""}`; },
    kpi(r) { return r.kosong ? [] : [[`${r.N}–${numL(r.Nh, 1)}`, "individu (jejak)"]]; }
  };

  /* =====================================================================
   * 11. Analisis vegetasi: K, KR, F, FR, D, DR, INP per tingkat pertumbuhan
   * inp: { mode: "petak"|"rekap", rows, luas: { semai, pancang, tiang, pohon } (m²), nPetak, ukur: "diameter"|"keliling" }
   * ===================================================================== */
  const TINGKAT = ["pohon", "tiang", "pancang", "semai"];
  const normT = (v) => { const s = str(v).toLowerCase(); if (!s) return "pohon"; if (/semai|anakan|seedling/.test(s)) return "semai"; if (/pancang|sapling/.test(s)) return "pancang"; if (/tiang|pole/.test(s)) return "tiang"; if (/pohon|tree/.test(s)) return "pohon"; if (/bawah|herba|semak|tumbuhan/.test(s)) return "tumbuhan bawah"; return s; };
  M.vegetasi = {
    judul: "Analisis Vegetasi",
    TINGKAT, normT,
    hitung(inp) {
      const mode = inp.mode === "rekap" ? "rekap" : "petak", luas = inp.luas || {}, rows = (inp.rows || []).filter((r) => str(r.jenis) || str(r.latin));
      const petakAll = new Set(rows.map((r) => str(r.petak)).filter(Boolean));
      const P_ = nOr(inp.nPetak, 0) || petakAll.size;
      const ada = [...new Set(rows.map((r) => normT(r.tingkat)))];
      const urut = [...TINGKAT.filter((x) => ada.includes(x)), ...ada.filter((x) => !TINGKAT.includes(x))];
      const per = urut.map((tk) => {
        const rr = rows.filter((r) => normT(r.tingkat) === tk);
        const lu = nOr(luas[tk] ?? luas[tk.replace(/ /g, "")], 0) || nOr(luas.semai, 4);
        const luasHa = (P_ * lu) / 10000, pakaiD = tk === "pohon" || tk === "tiang";
        let jenis;
        if (mode === "rekap") jenis = perJenis(rr).map((b) => ({ jenis: b.jenis, latin: b.latin, n: b.n, p: Math.max(...b.rows.map((x) => nOr(x.p, 0))), lbds: sum(b.rows.map((x) => nOr(x.lbds, 0))) }));
        else jenis = perJenis(rr).map((b) => ({ jenis: b.jenis, latin: b.latin, n: b.n, p: new Set(b.rows.map((x) => str(x.petak)).filter(Boolean)).size || 1,
          lbds: sum(b.rows.map((x) => { const dd = fin(toN(x.diameter)) ? toN(x.diameter) : fin(toN(x.keliling)) ? toN(x.keliling) / Math.PI : NaN; return fin(dd) ? ST.lbds(dd) * nOr(x.n, 1) : 0; })) }));
        const v = ST.vegetasi(jenis, P_, luasHa, pakaiD);
        return { tingkat: tk, luasPetak: lu, ...v };
      }).filter((x) => x.rows.length);
      return { kosong: !per.length, mode, P: P_, per, luas, S: new Set(rows.map((r) => M.util.kunci(r.latin || r.jenis))).size };
    },
    narMetode(c) { return `Data vegetasi dianalisis untuk mengetahui komposisi dan struktur vegetasi pada setiap tingkat pertumbuhan (semai, pancang, tiang, dan pohon). Parameter yang dihitung adalah kerapatan, frekuensi, dominansi, dan Indeks Nilai Penting (INP) mengikuti Peraturan Direktur Jenderal KSDAE Nomor P.10/KSDAE/SET/KSA.0/9/2016:`; },
    metode(c) {
      const lv = c.lv, lu = c.opt.luas || {};
      const kr = (a) => [Sub(a, "i"), R(" = ")];
      return [blk([...kr("K"), F("jumlah individu jenis ke-i", "luas seluruh petak contoh (ha)")], lv),
        blk([...kr("KR"), F(Sub("K", "i"), "Σ K seluruh jenis"), R(" × 100%")], lv),
        blk([...kr("F"), F("jumlah petak ditemukan jenis ke-i", "jumlah seluruh petak contoh")], lv),
        blk([...kr("FR"), F(Sub("F", "i"), "Σ F seluruh jenis"), R(" × 100%")], lv),
        blk([...kr("D"), F("Σ LBDS jenis ke-i", "luas seluruh petak contoh (ha)")], lv), blk([R("LBDS = "), F("1", "4"), R(" × π × "), Sup("d", "2")], lv),
        blk([...kr("DR"), F(Sub("D", "i"), "Σ D seluruh jenis"), R(" × 100%")], lv),
        blk([R("INP = KR + FR + DR"), R(" (tiang dan pohon); INP = KR + FR (semai dan pancang)")], lv),
        blk([R("H′ = −"), Sum([Sub("p", "i"), R(" × ln "), Sub("p", "i")]), R(";  "), Sub("p", "i"), R(" = "), F(Sub("n", "i"), "N")], lv),
        ket([["K", "kerapatan (individu/ha)"], ["KR", "kerapatan relatif (%)"], ["F", "frekuensi"], ["FR", "frekuensi relatif (%)"], ["D", "dominansi (m²/ha)"], ["DR", "dominansi relatif (%)"], ["LBDS", "luas bidang dasar batang (m²)"], ["d", "diameter batang setinggi dada (m); bila yang diukur keliling, d = keliling/π"], ["INP", "indeks nilai penting (maksimal 300% untuk tiang dan pohon, 200% untuk semai dan pancang)"], ["H′", "indeks keanekaragaman Shannon-Wiener per tingkat pertumbuhan"], [Sub("n", "i"), "jumlah individu jenis ke-i"], ["N", "jumlah individu seluruh jenis pada tingkat tersebut"]], lv),
        para(`Tingkat pertumbuhan dan ukuran petak: semai (anakan, tinggi kurang dari 1,5 m) pada petak ${esc(c.opt.ukuranTxt?.semai || `${num(nOr(lu.semai, 4))} m²`)}; pancang (tinggi 1,5 m atau lebih, diameter kurang dari 10 cm) pada petak ${esc(c.opt.ukuranTxt?.pancang || `${num(nOr(lu.pancang, 25))} m²`)}; tiang (diameter 10 cm sampai kurang dari 20 cm) pada petak ${esc(c.opt.ukuranTxt?.tiang || `${num(nOr(lu.tiang, 100))} m²`)}; dan pohon (diameter 20 cm atau lebih) pada petak ${esc(c.opt.ukuranTxt?.pohon || `${num(nOr(lu.pohon, 400))} m²`)}.`, lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return "Belum ada data vegetasi.";
      return `Analisis vegetasi pada ${nTxt(r.P)} petak contoh mencatat ${nTxt(r.S)} jenis tumbuhan. ` + r.per.map((v) => `Pada tingkat ${v.tingkat} ditemukan ${v.S} jenis (${v.N} individu); jenis dengan INP tertinggi adalah ${daftarKata(v.rows.slice(0, 3).map((x) => `${nm(x)} (${num(x.INP, 2)}%)`))}, dengan indeks keanekaragaman H′ ${num(v.H, 2)}.`).join(" ");
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const v = r.per[0], x = v.rows[0], lv = c.lv;
      return [para(`Contoh perhitungan untuk ${esc(x.jenis)} pada tingkat ${esc(v.tingkat)} (luas petak contoh ${num(v.P)} × ${num(v.luasPetak)} m² = ${fx(v.luasHa, 4)} ha):`, lv),
        blk([R(`K = `), F(num(x.n), fx(v.luasHa, 4)), R(` = ${num(x.K, 2)} ind/ha;  KR = `), F(num(x.K, 2), num(v.sK, 2)), R(` × 100% = ${num(x.KR, 2)}%`)], lv),
        blk([R(`F = `), F(num(x.p), num(v.P)), R(` = ${num(x.F, 2)};  FR = `), F(num(x.F, 2), num(v.sF, 2)), R(` × 100% = ${num(x.FR, 2)}%`)], lv),
        ...(v.adaD ? [blk([R(`D = `), F(fx(x.lbds, 4), fx(v.luasHa, 4)), R(` = ${num(x.D, 3)} `), Sup("m", "2"), R(`/ha;  DR = ${num(x.DR, 2)}%`)], lv)] : []),
        blk([R(`INP = ${num(x.KR, 2)} + ${num(x.FR, 2)}${v.adaD ? ` + ${num(x.DR, 2)}` : ""} = ${num(x.INP, 2)}%`)], lv)].join("");
    },
    spec(v, tanda) {
      const D = v.adaD;
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Jumlah Individu", "Jumlah Petak Ditemukan", "K (ind/ha)", "KR (%)", "F", "FR (%)", ...(D ? ["D (m²/ha)", "DR (%)"] : []), "INP (%)"],
        rows: v.rows.map((x, i) => [k(i + 1), t(esc(x.jenis) + (tanda && tanda(x) ? " *" : "")), t(sci(x.latin)), n(x.n, 0), n(x.p, 0), n(x.K, 2), n(x.KR, 2), n(x.F, 2), n(x.FR, 2), ...(D ? [n(x.D, 3), n(x.DR, 2)] : []), n(x.INP, 2)]),
        total: [[{ t: "Jumlah", cs: 3 }, n(v.N, 0), t(""), n(v.sK, 2), n(100, 2), n(v.sF, 2), n(100, 2), ...(D ? [n(v.sD, 3), n(100, 2)] : []), n(v.maksINP, 2)]] };
    },
    tabel(r, c) { return r.kosong ? [] : r.per.map((v) => ({ cap: `Indeks Nilai Penting Tingkat ${L.cap1(v.tingkat)}`, spec: this.spec(v, c.opt.tanda), catatan: c.opt.tanda && v.rows.some(c.opt.tanda) ? c.opt.tandaKet || "* jenis yang ditandai" : "" })); },
    simpulan(r) { return r.kosong ? "" : r.per.map((v) => `tingkat ${v.tingkat} didominasi ${nm(v.rows[0])} (INP ${num(v.rows[0].INP, 2)}%)`).join("; ").replace(/^./, (s) => s.toUpperCase()); },
    kpi(r) { return r.kosong ? [] : [[r.S, "jenis tumbuhan"], [r.P, "petak contoh"]]; }
  };

  /* =====================================================================
   * 12. Wilayah jelajah: poligon cembung minimum (Mohr 1947)
   * inp: { titik: [{ x, y, label, kelompok }], sistem: "geo"|"utm", luasHabitat (km²), jelajahPasangan (km²) }
   * ===================================================================== */
  function svgPeta(titik, hull, sistem) {
    const ok = titik.filter((p) => fin(p.x) && fin(p.y));
    if (ok.length < 1) return "";
    const lat0 = mean(ok.map((p) => p.y)) * Math.PI / 180;
    const pr = (p) => (sistem === "geo" ? { x: p.x * Math.cos(lat0) * 111320, y: p.y * 110574 } : { x: p.x, y: p.y });
    const P_ = ok.map(pr), H = hull.map(pr);
    const xs = P_.map((p) => p.x), ys = P_.map((p) => p.y), minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
    const W = 640, Hh = 440, m = 40, span = Math.max(maxX - minX, maxY - minY, 1), s = Math.min((W - 2 * m) / Math.max(maxX - minX, span * 0.3), (Hh - 2 * m) / Math.max(maxY - minY, span * 0.3));
    const X = (x) => m + (x - minX) * s, Y = (y) => Hh - m - (y - minY) * s;
    const bar = [100, 200, 500, 1000, 2000, 5000, 10000, 20000].find((b) => b * s >= 80) || 20000;
    const poly = H.length >= 3 ? `<polygon points="${H.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ")}" fill="#2f6b3f" fill-opacity="0.12" stroke="#2f6b3f" stroke-width="2"/>` : "";
    const pts = P_.map((p) => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="4" fill="#9a5b00" stroke="#fff" stroke-width="1"/>`).join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}" viewBox="0 0 ${W} ${Hh}" font-family="Arial" font-size="12"><rect width="${W}" height="${Hh}" fill="#fff"/>${poly}${pts}<g transform="translate(${W - 40},40)"><path d="M0 -18 L7 6 L0 1 L-7 6 Z" fill="#1d2420"/><text y="22" text-anchor="middle">U</text></g><g transform="translate(${m},${Hh - 14})"><rect width="${(bar * s).toFixed(1)}" height="5" fill="#1d2420"/><text y="-4">${bar >= 1000 ? `${bar / 1000} km` : `${bar} m`}</text></g><text x="${m}" y="22">Titik perjumpaan (${ok.length}) dan poligon cembung minimum</text></svg>`;
    return "data:image/svg+xml;base64," + (typeof btoa === "function" ? btoa(unescape(encodeURIComponent(svg))) : Buffer.from(svg).toString("base64"));
  }
  M.mcp = {
    judul: "Wilayah Jelajah (Poligon Cembung Minimum)",
    hitung(inp) {
      const sistem = inp.sistem === "utm" ? "utm" : "geo";
      const titik = (inp.titik || []).map((p) => ({ ...p, x: toN(p.x), y: toN(p.y) })).filter((p) => fin(p.x) && fin(p.y));
      const all = ST.mcp(titik, sistem);
      const kel = [...new Set(titik.map((p) => str(p.kelompok)).filter(Boolean))].map((g) => ({ kelompok: g, ...ST.mcp(titik.filter((p) => str(p.kelompok) === g), sistem) }));
      const hab = nOr(inp.luasHabitat, 0), jp = nOr(inp.jelajahPasangan, 0);
      return { kosong: all.nUnik < 3 || !all.m2, sistem, titik, ...all, kel, hab, jp, pasangan: hab && jp ? hab / jp : null, peta: titik.length ? svgPeta(titik, all.hull, sistem) : "" };
    },
    narMetode(c) { return `Luas wilayah jelajah (home range) ${c.objek} diduga dengan metode poligon cembung minimum (Minimum Convex Polygon, MCP; Mohr, 1947), yaitu poligon cembung terkecil yang memuat seluruh titik perjumpaan. Luas poligon dihitung dari koordinat titik sudut poligon yang sudah diproyeksikan ke satuan meter:`; },
    metode(c) {
      const lv = c.lv, out = [blk([R("A = "), F("1", "2"), R(" × "), R("|"), Sum([Sub("x", "i"), Sub("y", "i+1"), R(" − "), Sub("x", "i+1"), Sub("y", "i")]), R("|")], lv),
        ket([["A", "luas wilayah jelajah (m², dikonversi ke ha dan km²)"], [[Sub("x", "i"), ", ", Sub("y", "i")], "koordinat titik sudut ke-i poligon cembung (m)"]], lv)];
      if (c.opt.pasangan) out.push(para("Perkiraan jumlah pasangan yang dapat ditampung habitat dihitung dari luas habitat sesuai dibagi luas wilayah jelajah satu pasangan:", lv), blk([Sub("N", "pasangan"), R(" ≈ "), F(Sub("A", "habitat"), Sub("A", "jelajah"))], lv),
        ket([[Sub("A", "habitat"), "luas habitat yang sesuai (km²)"], [Sub("A", "jelajah"), `luas wilayah jelajah satu pasangan (km²); acuan ${esc(c.opt.acuanJelajah || "Raharjaningtrah dan Rahman (2004): sekitar 38,5 km²")}`]], lv));
      return out.join("");
    },
    narHasil(r, c) {
      if (r.kosong) return r.n ? `Perjumpaan ${c.objek} tercatat pada ${nTxt(r.nUnik)} titik berkoordinat berbeda, belum cukup untuk membentuk poligon wilayah jelajah (perlu paling sedikit tiga titik berbeda yang tidak segaris).` : `Belum ada titik perjumpaan ${c.objek} yang berkoordinat untuk membentuk poligon wilayah jelajah.`;
      return `Dari ${nTxt(r.n)} titik perjumpaan (${r.nUnik} titik berbeda), poligon cembung minimum dibentuk oleh ${r.hull.length} titik sudut dengan luas ${num(r.ha, 2)} ha (${num(r.km2, 2)} km²) dan keliling ${num(r.keliling / 1000, 2)} km.${r.kel.length > 1 ? ` Menurut kelompok data: ${r.kel.map((g) => `${g.kelompok} ${g.nUnik >= 3 ? `${num(g.ha, 2)} ha` : "kurang dari tiga titik"}`).join("; ")}.` : ""}${r.pasangan !== null ? ` Dengan luas habitat ${num(r.hab, 2)} km² dan wilayah jelajah ${num(r.jp, 1)} km² per pasangan, habitat diperkirakan menampung sekitar ${num(r.pasangan, 1)} pasangan.` : ""}`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; return blk([R(`A = ${num(r.m2)} `), Sup("m", "2"), R(` = ${num(r.ha, 2)} ha = ${num(r.km2, 2)} `), Sup("km", "2")], c.lv) + (r.pasangan !== null ? blk([Sub("N", "pasangan"), R(" ≈ "), F(num(r.hab, 2), num(r.jp, 1)), R(` = ${num(r.pasangan, 1)} pasangan`)], c.lv) : ""); },
    spec(r) {
      const geo = r.sistem === "geo";
      return { head: ["No", geo ? "Bujur (X)" : "X (m)", geo ? "Lintang (Y)" : "Y (m)", "Keterangan"], rows: r.hull.map((p, i) => [k(i + 1), n(p.x, geo ? 6 : 0), n(p.y, geo ? 6 : 0), t(esc(p.label || p.kelompok || ""))]) };
    },
    kelSpec(r) { return { head: ["Kelompok Data", "Jumlah Titik", "Luas (ha)", "Luas (km²)", "Keliling (km)"], rows: r.kel.map((g) => [t(esc(g.kelompok)), n(g.n, 0), g.nUnik >= 3 ? n(g.ha, 2) : k("-"), g.nUnik >= 3 ? n(g.km2, 2) : k("-"), g.nUnik >= 3 ? n(g.keliling / 1000, 2) : k("-")]), total: [[t("Seluruh titik"), n(r.n, 0), n(r.ha, 2), n(r.km2, 2), n(r.keliling / 1000, 2)]] }; },
    tabel(r, c) { if (r.kosong) return []; const out = [{ cap: `Titik Sudut Poligon Cembung Minimum ${L.cap1(c.objek)}`, spec: this.spec(r) }]; if (r.kel.length > 1) out.push({ cap: `Luas Wilayah Jelajah ${L.cap1(c.objek)} menurut Kelompok Data`, spec: this.kelSpec(r) }); return out; },
    gambar(r, c) { return r.kosong || !r.peta ? "" : `<figure class="map"><img src="${r.peta}" alt="Sebaran titik perjumpaan dan poligon cembung minimum ${esc(c.objek)}"></figure>`; },
    simpulan(r, c) { return r.kosong ? "" : `Luas wilayah jelajah ${c.objek} menurut poligon cembung minimum adalah ${num(r.ha, 2)} ha (${num(r.km2, 2)} km²)`; },
    kpi(r) { return r.kosong ? [] : [[`${num(r.km2, 2)} km²`, "wilayah jelajah (MCP)"]]; }
  };

  /* =====================================================================
   * 13. Stok karbon lima pool (SNI 7724:2011; IPCC 2006; LPK stok karbon Balai)
   * inp: { pohon, sntb, kayuMati, tanah } ; opt: { agregasi: "template"|"rerata", bcef: "ipcc"|angka, nap, cf, nKuadran, radius, bingkai }
   * ===================================================================== */
  const plotKey = (r) => `${str(r.transek) || "-"}|${str(r.plot) || "-"}`;
  M.karbon = {
    judul: "Cadangan Karbon",
    hitung(inp, opt = {}) {
      const cf = nOr(opt.cf, 0.47), nap = nOr(opt.nap, 1 / 3), tpl = (opt.agregasi || "template") === "template", nKw = nOr(opt.nKuadran, 4) || 4, rad = nOr(opt.radius, 0), bing = nOr(opt.bingkai, 1) || 1;
      const bcefOf = (gs) => (opt.bcef && opt.bcef !== "ipcc" && fin(toN(opt.bcef)) ? toN(opt.bcef) : ST.bcefIPCC(gs));
      const plots = new Map();
      const getP = (r) => { const kk = plotKey(r); if (!plots.has(kk)) plots.set(kk, { key: kk, transek: str(r.transek) || "-", plot: str(r.plot) || "-" }); return plots.get(kk); };
      // Tegakan
      // Pohon mati berdiri ikut dihitung pada cara template (seperti LPK ST.1472); pada cara per hektare hanya pohon hidup
      const ukur = (inp.pohon || []).filter((r) => fin(toN(r.dbh)) && toN(r.dbh) > 0), pohon = tpl ? ukur : ukur.filter((r) => !/mati/i.test(str(r.hidup)));
      const nMati = ukur.filter((r) => /mati/i.test(str(r.hidup))).length;
      const teg = new Map();
      pohon.forEach((r) => {
        const p = getP(r), key = ST.persVolume(r.latin, r.jenis), v = ST.volumePohon(toN(r.dbh), key);
        const R_ = nOr(r.radius, rad), ef = R_ ? 10000 / (Math.PI * R_ * R_) : 0;
        const o = teg.get(p.key) || { V: 0, Vha: 0, n: 0, tanpaR: 0 };
        o.V += v; o.Vha += v * ef; o.n++; if (!ef) o.tanpaR++;
        teg.set(p.key, o);
      });
      teg.forEach((o, kk) => {
        const gs = tpl ? o.V : o.Vha; o.GS = gs; o.BCEF = bcefOf(gs); o.B = gs * o.BCEF; o.CAP = o.B * cf; o.BBP = o.B * nap; o.CBP = o.BBP * cf; plots.get(kk).teg = o;
      });
      // Serasah, nekromas, tumbuhan bawah
      (inp.sntb || []).filter((r) => fin(toN(r.bks))).forEach((r) => {
        const p = getP(r), bo = ST.bahanOrganik(nOr(r.bbt, 0), nOr(r.bbs, 0), nOr(r.bks, 0), nOr(r.bingkai, bing)), pc = fin(toN(r.persenC)) ? toN(r.persenC) / 100 : cf;
        p.sntb = p.sntb || { BO: 0, C: 0, komp: {} };
        const kk = str(r.komponen) || "Serasah"; p.sntb.komp[kk] = p.sntb.komp[kk] || { BO: 0, C: 0 };
        p.sntb.BO += bo.tHa; p.sntb.C += bo.tHa * pc; p.sntb.komp[kk].BO += bo.tHa; p.sntb.komp[kk].C += bo.tHa * pc;
      });
      // Kayu mati
      (inp.kayuMati || []).filter((r) => fin(toN(r.vol)) || fin(toN(r.diameter))).forEach((r) => {
        const p = getP(r), V = fin(toN(r.vol)) ? toN(r.vol) : ST.volumeKayuMati(toN(r.diameter), nOr(r.panjang, 0)), B = V * (nOr(r.bj, 0) / 1000), pc = fin(toN(r.persenC)) ? toN(r.persenC) / 100 : cf;
        p.km = p.km || { V: 0, Bsum: 0, Csum: 0 };
        p.km.V += V; p.km.Bsum += B; p.km.Csum += B * pc;
      });
      plots.forEach((p) => { if (p.km) { p.km.B = p.km.Bsum / nKw; p.km.C = p.km.Csum / nKw; } });
      // Tanah
      (inp.tanah || []).filter((r) => fin(toN(r.bks)) && fin(toN(r.vol))).forEach((r) => {
        const p = getP(r), c_ = ST.karbonTanah(toN(r.bks), toN(r.vol), nOr(r.kd, 0), nOr(r.persenC, 0));
        p.tanah = p.tanah || { C: 0, lapisan: 0 }; p.tanah.C += c_.tHa; p.tanah.lapisan++;
      });
      const list = [...plots.values()].sort((a, b) => a.transek.localeCompare(b.transek, "id", { numeric: true }) || a.plot.localeCompare(b.plot, "id", { numeric: true }));
      const trs = [...new Set(list.map((p) => p.transek))];
      const pool = (getv, cara) => {
        const per = trs.map((tr) => { const v = list.filter((p) => p.transek === tr).map(getv).filter((x) => x !== null); return { tr, v, agg: cara === "jumlah" ? sum(v) : mean(v), ada: v.length > 0 }; }).filter((x) => x.ada);
        const all = list.map(getv).filter((x) => x !== null);
        return { per, nilai: cara === "jumlah" ? mean(per.map((x) => x.agg)) : mean(all), n: all.length };
      };
      const caraTeg = tpl ? "jumlah" : "rerata";
      const g = (f) => (p) => (f(p) === undefined ? null : f(p));
      const P_ = {
        V: pool(g((p) => p.teg && (tpl ? p.teg.V : p.teg.Vha)), caraTeg), B: pool(g((p) => p.teg && p.teg.B), caraTeg), CAP: pool(g((p) => p.teg && p.teg.CAP), caraTeg), BBP: pool(g((p) => p.teg && p.teg.BBP), caraTeg), CBP: pool(g((p) => p.teg && p.teg.CBP), caraTeg),
        BO: pool(g((p) => p.sntb && p.sntb.BO), caraTeg), CSNTB: pool(g((p) => p.sntb && p.sntb.C), caraTeg), BKM: pool(g((p) => p.km && p.km.B), caraTeg), CKM: pool(g((p) => p.km && p.km.C), caraTeg), CT: pool(g((p) => p.tanah && p.tanah.C), "rerata")
      };
      const total = P_.CAP.nilai + P_.CBP.nilai + P_.CSNTB.nilai + P_.CKM.nilai + P_.CT.nilai;
      const komp = [...new Set(list.flatMap((p) => (p.sntb ? Object.keys(p.sntb.komp) : [])))];
      return { kosong: !list.length, tpl, cf, nap, nKw, list, trs, pool: P_, total, co2: total * 44 / 12, komp, nPohon: pohon.length, nMati, tanpaR: [...teg.values()].reduce((s, o) => s + o.tanpaR, 0) };
    },
    narMetode(c) { return `Cadangan karbon dihitung pada lima pool karbon: biomassa atas permukaan (tegakan), biomassa bawah permukaan (akar), serasah/nekromas/tumbuhan bawah, kayu mati, dan tanah (SNI 7724:2011). Karena model alometrik biomassa dan berat jenis kayu belum tersedia, biomassa tegakan diduga dari volume tegakan dikali faktor ekspansi dan konversi biomassa (BCEF) menurut IPCC (2006). Persamaan yang dipakai adalah sebagai berikut.`; },
    metode(c) {
      const lv = c.lv, sub = (x, s) => Sub(x, s);
      return [para("Volume pohon dengan persamaan alometrik hutan alam Provinsi Nusa Tenggara Barat:", lv),
        blk([R("V = 0,000107 × "), Sup("D", "2,5541"), R("  (Duabanga sp.)")], lv), blk([R("V = 0,00013 × "), Sup("D", "2,5017"), R("  (Toona sureni)")], lv), blk([R("V = 0,000051464 × "), Sup("D", "2,5874"), R("  (jenis lain)")], lv),
        ket([["V", "volume pohon (m³)"], ["D", "diameter setinggi dada (cm)"]], lv),
        para("Biomassa dan karbon atas permukaan:", lv), blk([sub("B", "teg"), R(" = "), sub("V", "teg"), R(" × BCEF")], lv), blk([sub("C", "AP"), R(" = "), sub("B", "teg"), R(" × %C")], lv),
        ket([[sub("B", "teg"), "biomassa tegakan (ton/ha)"], [sub("V", "teg"), "volume tegakan (m³)"], ["BCEF", "faktor ekspansi dan konversi biomassa, nilai bawaan IPCC (2006) menurut kelas volume tegakan: ≤ 10 m³ = 9,0; 11–20 = 4,0; 21–40 = 2,8; 41–100 = 2,05; 101–200 = 1,7; > 200 = 1,5"], [sub("C", "AP"), "karbon atas permukaan (ton/ha)"], ["%C", `fraksi karbon (${num(nOr(c.opt.cf, 0.47), 2)} atau hasil uji laboratorium)`]], lv),
        para("Biomassa dan karbon bawah permukaan dengan nisbah akar pucuk (NAP):", lv), blk([sub("B", "BP"), R(" = "), sub("B", "teg"), R(" × NAP")], lv), blk([sub("C", "BP"), R(" = "), sub("B", "BP"), R(" × %C")], lv),
        ket([[sub("B", "BP"), "biomassa bawah permukaan (ton/ha)"], ["NAP", `nisbah akar pucuk (${num(nOr(c.opt.nap, 1 / 3), 4)})`], [sub("C", "BP"), "karbon bawah permukaan (ton/ha)"]], lv),
        para("Serasah, nekromas, dan tumbuhan bawah:", lv), blk([sub("B", "o"), R(" = "), F([sub("B", "ks"), R(" × "), sub("B", "bt")], sub("B", "bs"))], lv), blk([sub("C", "SNTB"), R(" = "), sub("B", "o"), R(" × %C")], lv),
        ket([[sub("B", "o"), "berat bahan organik (g, dikonversi ke ton/ha menurut luas bingkai)"], [sub("B", "ks"), "berat kering contoh (g)"], [sub("B", "bt"), "berat basah total (g)"], [sub("B", "bs"), "berat basah contoh (g)"]], lv),
        para("Kayu mati dengan metode planar intersect (Van Wagner, 1968; Kauffman dkk., 2016):", lv), blk([sub("V", "KM"), R(" = "), F([Sup("π", "2"), R(" × "), Sum(Sup(Sub("d", "n"), "2"))], "8 × L")], lv), blk([sub("B", "KM"), R(" = "), sub("V", "KM"), R(" × ρ")], lv), blk([sub("C", "KM"), R(" = "), sub("B", "KM"), R(" × %C")], lv),
        ket([[sub("V", "KM"), "volume kayu mati (m³/ha)"], [Sub("d", "n"), "diameter potongan kayu mati pada titik potong (cm)"], ["L", "panjang transek (m)"], ["ρ", "berat jenis kayu mati (ton/m³)"]], lv),
        para("Karbon tanah:", lv), blk([R("ρ = "), F(sub("B", "ks"), sub("V", "tot"))], lv), blk([sub("C", "T"), R(" = "), sub("K", "d"), R(" × ρ × %C")], lv),
        ket([["ρ", "kerapatan lindak (bulk density) tanah (g/cm³)"], [sub("V", "tot"), "volume contoh tanah (cm³)"], [sub("K", "d"), "kedalaman/ketebalan lapisan tanah (cm)"], [sub("C", "T"), "karbon tanah (g/cm², dikali 100 menjadi ton/ha)"]], lv),
        para("Total cadangan karbon pada lima pool:", lv), blk([sub("C", "total"), R(" = "), sub("C", "AP"), R(" + "), sub("C", "BP"), R(" + "), sub("C", "SNTB"), R(" + "), sub("C", "KM"), R(" + "), sub("C", "T")], lv),
        para((c.opt.agregasi || "template") === "template" ? "Mengikuti LPK stok karbon Balai (ST.1472), nilai tegakan, serasah/nekromas/tumbuhan bawah, dan kayu mati dijumlahkan per transek lalu dirata-rata antartransek, sedangkan karbon tanah dirata-rata per plot." : "Nilai setiap pool dihitung per hektare pada tiap plot (volume tegakan dikonversi dengan luas plot lingkaran), lalu dirata-rata antarplot.", lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return "Belum ada data pengukuran karbon.";
      const p = r.pool;
      return `Pengukuran dilakukan pada ${nTxt(r.list.length)} plot di ${nTxt(r.trs.length)} transek dengan ${r.nPohon} batang tegakan terukur${r.tpl && r.nMati ? ` (termasuk ${r.nMati} batang pohon mati berdiri)` : ""}. Cadangan karbon atas permukaan sebesar ${num(p.CAP.nilai, 2)} ton/ha, bawah permukaan ${num(p.CBP.nilai, 2)} ton/ha, serasah/nekromas/tumbuhan bawah ${num(p.CSNTB.nilai, 2)} ton/ha, kayu mati ${num(p.CKM.nilai, 2)} ton/ha, dan tanah ${num(p.CT.nilai, 2)} ton/ha, sehingga total cadangan karbon ${num(r.total, 2)} ton/ha atau setara ${num(r.co2, 2)} ton CO₂e/ha.`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const p = r.list.find((x) => x.teg), lv = c.lv, out = [];
      if (p) out.push(para(`Contoh perhitungan tegakan pada plot ${esc(p.plot)} (transek ${esc(p.transek)}):`, lv),
        blk([Sub("B", "teg"), R(` = ${num(p.teg.GS, 4)} × ${num(p.teg.BCEF, 2)} = ${num(p.teg.B, 4)} ton/ha`)], lv),
        blk([Sub("C", "AP"), R(` = ${num(p.teg.B, 4)} × ${num(r.cf, 2)} = ${num(p.teg.CAP, 4)} ton/ha`)], lv),
        blk([Sub("B", "BP"), R(` = ${num(p.teg.B, 4)} × ${num(r.nap, 4)} = ${num(p.teg.BBP, 4)} ton/ha;  `), Sub("C", "BP"), R(` = ${num(p.teg.CBP, 4)} ton/ha`)], lv));
      out.push(blk([Sub("C", "total"), R(` = ${num(r.pool.CAP.nilai, 4)} + ${num(r.pool.CBP.nilai, 4)} + ${num(r.pool.CSNTB.nilai, 4)} + ${num(r.pool.CKM.nilai, 4)} + ${num(r.pool.CT.nilai, 4)} = ${num(r.total, 4)} ton/ha`)], lv));
      return out.join("");
    },
    specTeg(r) {
      const rows = r.list.filter((p) => p.teg).map((p) => [k(esc(p.transek)), k(esc(p.plot)), n(p.teg.GS, 4), n(p.teg.BCEF, 2), n(p.teg.B, 4), n(p.teg.CAP, 4), n(p.teg.BBP, 4), n(p.teg.CBP, 4)]);
      return { head: ["Transek", "Plot", r.tpl ? "Volume Tegakan (m³)" : "Volume Tegakan (m³/ha)", "BCEF", "Biomassa Tegakan (ton/ha)", "CAP (ton/ha)", "Biomassa Bawah Permukaan (ton/ha)", "CBP (ton/ha)"], rows };
    },
    specTr(r) {
      const p = r.pool, tr = (x, tt) => (p[x].per.find((y) => y.tr === tt) || {}).agg;
      return { head: ["Transek", "Volume Tegakan", "Biomassa Tegakan (ton/ha)", "CAP (ton/ha)", "CBP (ton/ha)", "C Serasah dkk. (ton/ha)", "C Kayu Mati (ton/ha)", "C Tanah (ton/ha)"],
        rows: r.trs.map((tt) => [k(esc(tt)), ...["V", "B", "CAP", "CBP", "CSNTB", "CKM", "CT"].map((x) => (fin(tr(x, tt)) ? n(tr(x, tt), 4) : k("-")))]),
        total: [[t(r.tpl ? "Rerata per transek" : "Rerata per plot"), ...["V", "B", "CAP", "CBP", "CSNTB", "CKM", "CT"].map((x) => n(p[x].nilai, 4))]] };
    },
    specTotal(r) {
      const p = r.pool;
      return { head: ["Pool Karbon", "Cadangan Karbon (ton/ha)"], rows: [[t("Karbon atas permukaan (CAP)"), n(p.CAP.nilai, 4)], [t("Karbon bawah permukaan (CBP)"), n(p.CBP.nilai, 4)], [t("Karbon serasah, nekromas, dan tumbuhan bawah (CSNTB)"), n(p.CSNTB.nilai, 4)], [t("Karbon kayu mati (CKM)"), n(p.CKM.nilai, 4)], [t("Karbon tanah (CT)"), n(p.CT.nilai, 4)]],
        total: [[t("Total cadangan karbon"), n(r.total, 4)], [t("Setara CO₂ (× 44/12, ton CO₂e/ha)"), n(r.co2, 4)]] };
    },
    specPlot(r) {
      return { head: ["Transek", "Plot", "C Serasah dkk. (ton/ha)", "Biomassa Kayu Mati (ton/ha)", "C Kayu Mati (ton/ha)", "Lapisan Tanah", "C Tanah (ton/ha)"],
        rows: r.list.map((p) => [k(esc(p.transek)), k(esc(p.plot)), p.sntb ? n(p.sntb.C, 4) : k("-"), p.km ? n(p.km.B, 4) : k("-"), p.km ? n(p.km.C, 4) : k("-"), p.tanah ? n(p.tanah.lapisan, 0) : k("-"), p.tanah ? n(p.tanah.C, 4) : k("-")]) };
    },
    tabel(r) {
      if (r.kosong) return [];
      return [{ cap: "Volume, Biomassa, dan Karbon Tegakan per Plot", spec: this.specTeg(r) }, { cap: "Rekapitulasi Cadangan Karbon per Transek", spec: this.specTr(r) }, { cap: "Total Cadangan Karbon pada Lima Pool", spec: this.specTotal(r) }];
    },
    lampiran(r) { return r.kosong ? [] : [{ cap: "Karbon Serasah, Kayu Mati, dan Tanah per Plot", spec: this.specPlot(r) }]; },
    kalkExtra(r) { return r.kosong ? "" : `${r.tpl ? `<div class="callout"><b>Cara agregasi mengikuti LPK ST.1472.</b> Volume per plot (termasuk pohon mati berdiri) dipakai langsung sebagai volume tegakan per hektare dan nilai plot dijumlahkan per transek. Pilih "per hektare" di Parameter metode untuk mengonversi volume dengan luas plot lingkaran (jari-jari di kolom R atau Parameter metode).</div>` : ""}${!r.tpl && r.tanpaR ? `<div class="callout"><b>${r.tanpaR} pohon tanpa jari-jari plot.</b> Isi kolom R (m) atau jari-jari bawaan di Parameter metode; pohon tersebut belum ikut dalam volume per hektare.</div>` : ""}`; },
    simpulan(r) { return r.kosong ? "" : `Total cadangan karbon lima pool adalah ${num(r.total, 2)} ton/ha (setara ${num(r.co2, 2)} ton CO₂e/ha), terbesar pada ${[["karbon tanah", r.pool.CT.nilai], ["karbon atas permukaan", r.pool.CAP.nilai], ["karbon bawah permukaan", r.pool.CBP.nilai], ["serasah, nekromas, dan tumbuhan bawah", r.pool.CSNTB.nilai], ["kayu mati", r.pool.CKM.nilai]].sort((a, b) => b[1] - a[1])[0][0]}`; },
    kpi(r) { return r.kosong ? [] : [[num(r.total, 2), "ton C/ha (total)"], [num(r.pool.CAP.nilai, 2), "ton C/ha atas permukaan"]]; }
  };

  /* =====================================================================
   * 14. Uji akurasi peta tutupan lahan (ground check): matriks kesalahan, akurasi keseluruhan, kappa
   * inp: { titik: [{ id, peta, lapangan, openArea }] }
   * ===================================================================== */
  M.tutupan = {
    judul: "Kesesuaian Hasil Interpretasi Citra dengan Kondisi Lapangan",
    hitung(inp) {
      const ti = (inp.titik || []).filter((p) => str(p.peta) || str(p.lapangan));
      const a = ST.akurasi(ti);
      const kelas = ST.persen(ti.filter((p) => str(p.lapangan)).map((p) => [p.lapangan, 1]));
      const oa = ST.persen(ti.filter((p) => str(p.openArea)).map((p) => [p.openArea, 1]));
      return { kosong: !a.N, ...a, nTitik: ti.length, kelasLap: kelas, openArea: oa, beda: ti.filter((p) => str(p.peta) && str(p.lapangan) && str(p.peta) !== str(p.lapangan)) };
    },
    narMetode(c) { return `Kesesuaian kelas ${c.opt.label || "tutupan lahan"} pada peta (hasil interpretasi citra atau peta indikatif) dengan kondisi lapangan dinilai dengan matriks kesalahan (confusion matrix). Dari matriks tersebut dihitung akurasi keseluruhan (overall accuracy) dan koefisien kappa (Congalton, 1991; Cohen, 1960):`; },
    metode(c) {
      const lv = c.lv;
      return [blk([R("OA = "), F(Sum(Sub("x", "ii")), "N"), R(" × 100%")], lv),
        blk([R("κ = "), F([R("N × "), Sum(Sub("x", "ii")), R(" − "), Sum([Sub("x", "i+"), R(" × "), Sub("x", "+i")])], [Sup("N", "2"), R(" − "), Sum([Sub("x", "i+"), R(" × "), Sub("x", "+i")])])], lv),
        ket([["OA", "akurasi keseluruhan (%)"], [Sub("x", "ii"), "jumlah titik yang kelas peta dan kelas lapangannya sama"], [Sub("x", "i+"), "jumlah titik pada baris kelas ke-i (kelas peta)"], [Sub("x", "+i"), "jumlah titik pada kolom kelas ke-i (kelas lapangan)"], ["N", "jumlah seluruh titik ground check"], ["κ", "koefisien kappa"]], lv),
        ket([["κ ≤ 0,40", "kesesuaian lemah sampai cukup"], ["0,40 < κ ≤ 0,60", "kesesuaian sedang"], ["0,60 < κ ≤ 0,80", "kesesuaian kuat"], ["κ > 0,80", "kesesuaian hampir sempurna"]], lv, "Kriteria kappa (Landis dan Koch, 1977):")].join("");
    },
    narHasil(r, c) {
      const lb = (c && c.opt.label) || "tutupan lahan";
      if (r.kosong) return `Belum ada titik ground check yang memuat kelas ${lb} pada peta dan di lapangan.`;
      return `Ground check ${lb} dilakukan pada ${nTxt(r.nTitik)} titik. Sebanyak ${r.sesuai} dari ${r.N} titik memiliki kelas ${lb} di lapangan yang sama dengan peta sehingga akurasi keseluruhan ${num(r.OA, 2)}% dengan koefisien kappa ${num(r.kappa, 3)}, tergolong ${ST.kriteriaKappa(r.kappa).toLowerCase()}.${r.beda.length ? ` Ketidaksesuaian terdapat pada ${r.beda.length} titik, terutama ${daftarKata([...new Set(r.beda.map((p) => `${str(p.peta).toLowerCase()} yang di lapangan berupa ${str(p.lapangan).toLowerCase()}`))].slice(0, 3))}.` : ""}${r.openArea.y ? ` Menurut status open area, ${daftarKata(r.openArea.rows.map((x) => `${x.x} titik ${x.k.toLowerCase()}`))}.` : ""}`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; return blk([R("OA = "), F(num(r.sesuai), num(r.N)), R(` × 100% = ${num(r.OA, 2)}%;  κ = ${num(r.kappa, 3)}`)], c.lv); },
    spec(r) {
      return { head: ["Kelas Peta \\ Kelas Lapangan", ...r.kelas.map(esc), "Jumlah", "Akurasi Pengguna (%)"],
        rows: r.kelas.map((kk, i) => [t(esc(kk)), ...r.M[i].map((v) => n(v, 0)), n(r.baris[i], 0), n(r.per[i].pengguna, 1)]),
        total: [[t("Jumlah"), ...r.kolom.map((v) => n(v, 0)), n(r.N, 0), t("")], [t("Akurasi Pembuat (%)"), ...r.per.map((x) => n(x.pembuat, 1)), { t: `OA ${num(r.OA, 2)}%; κ ${num(r.kappa, 3)}`, cs: 2 }]] };
    },
    rekap(r, c) { return { head: ["No", `Kelas ${L.cap1((c && c.opt.label) || "tutupan lahan")} (Lapangan)`, "Jumlah Titik", "Persentase (%)"], rows: r.kelasLap.rows.map((x, i) => [k(i + 1), t(esc(x.k)), n(x.x, 0), n(x.p, 2)]), total: [[{ t: "Jumlah", cs: 2 }, n(r.kelasLap.y, 0), n(100, 2)]] }; },
    tabel(r, c) { const lb = L.cap1((c && c.opt.label) || "tutupan lahan").replace(/\b\w/g, (x) => x.toUpperCase()); return r.kosong ? [] : [{ cap: `Rekapitulasi Kelas ${lb} Hasil Ground Check`, spec: this.rekap(r, c) }, { cap: `Matriks Kesalahan Peta ${lb} terhadap Kondisi Lapangan`, spec: this.spec(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Akurasi keseluruhan peta ${(c && c.opt.label) || "tutupan lahan"} terhadap kondisi lapangan adalah ${num(r.OA, 2)}% dengan koefisien kappa ${num(r.kappa, 3)}, tergolong ${ST.kriteriaKappa(r.kappa).toLowerCase()}`; },
    kpi(r) { return r.kosong ? [] : [[`${num(r.OA, 1)}%`, "akurasi keseluruhan"], [num(r.kappa, 3), "kappa"]]; }
  };

  /* =====================================================================
   * 15. Skoring (keinvasifan jenis, fungsi pohon bagi burung, kelayakan lokasi, dll.)
   * inp: { rows: [{ nama, latin, nilai: [...] }] } ; opt: { kriteria: [{ label, maks }], kelas: [[batas, label]], basis: "persen"|"total", acuan }
   * ===================================================================== */
  M.skor = {
    judul: "Skoring",
    hitung(inp, opt = {}) {
      const kr = opt.kriteria || [], maks = kr.map((x) => x.maks);
      const baris = (inp.rows || []).filter((r) => str(r.nama) || str(r.latin)).map((r) => {
        const s = ST.skor(r.nilai || [], maks, opt.basis === "total" ? [] : opt.kelas);
        let kelas = s.kelas;
        if (opt.basis === "total") { const kk = (opt.kelas || []).find(([b]) => s.total >= b); kelas = kk ? kk[1] : ""; }
        return { ...r, ...s, kelas };
      }).sort((a, b) => b.total - a.total);
      return { kosong: !baris.length, baris, kr };
    },
    narMetode(c) { return c.opt.narMetode || `Setiap ${c.objek} dinilai dengan skor pada beberapa kriteria, lalu skor dijumlahkan dan dibandingkan dengan skor maksimal untuk menentukan kelasnya.`; },
    metode(c) {
      const lv = c.lv, kr = c.opt.kriteria || [], out = [];
      if (kr.length) out.push(para(`Kriteria penilaian: ${esc(daftarKata(kr.map((x) => `${x.label} (skor ${x.min ?? 1}–${x.maks})`)))}.`, lv));
      if (c.opt.basis === "total") out.push(blk([R("Skor total = "), Sum(Sub("s", "j"))], lv), ket([[Sub("s", "j"), "skor pada kriteria ke-j"]], lv));
      else out.push(blk([R("Nilai = "), F("skor aktual", "skor maksimal"), R(" × 100%")], lv));
      if (c.opt.kelas) out.push(ket(c.opt.kelas.map(([b, l], i, a) => [c.opt.basis === "total" ? (i === 0 ? `skor ≥ ${b}` : `${b} ≤ skor < ${a[i - 1][0]}`) : (i === 0 ? `≥ ${num(b)}%` : `${num(b)}% – < ${num(a[i - 1][0])}%`), esc(l)]), lv, `Kelas${c.opt.acuan ? ` (${esc(c.opt.acuan)})` : ""}:`));
      return out.join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data skoring ${c.objek}.`;
      const top = r.baris.filter((b) => b.total === r.baris[0].total);
      return `Dari ${nTxt(r.baris.length)} ${c.objek} yang dinilai, skor tertinggi (${num(r.baris[0].total)} dari ${num(r.baris[0].maks)}) dimiliki oleh ${daftarKata(top.map((b) => b.nama + (b.latin ? ` (${b.latin})` : "")))}${top[0].kelas ? ` dengan kelas ${top[0].kelas.toLowerCase()}` : ""}. ${["", ...new Set(r.baris.map((b) => b.kelas).filter(Boolean))].slice(1).map((kk) => `${L.cap1(kk)}: ${r.baris.filter((b) => b.kelas === kk).length}`).join("; ")}${r.baris.some((b) => b.kelas) ? "." : ""}`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; const b = r.baris[0]; return c.opt.basis === "total" ? blk([R(`Skor total ${b.nama} = ${(b.nilai || []).map((v) => num(nOr(v, 0))).join(" + ")} = ${num(b.total)}`)], c.lv) : blk([R(`Nilai ${b.nama} = `), F(num(b.total), num(b.maks)), R(` × 100% = ${num(b.persen, 2)}%`)], c.lv); },
    spec(r, c) {
      const kr = r.kr;
      return { head: ["No", L.cap1(c.opt.labelNama || "Nama"), ...(c.opt.latin ? ["Nama Ilmiah"] : []), ...kr.map((x) => esc(x.label)), "Jumlah Skor", ...(c.opt.basis === "total" ? [] : ["Nilai (%)"]), ...(c.opt.kelas ? ["Kelas"] : [])],
        rows: r.baris.map((b, i) => [k(i + 1), t(esc(b.nama)), ...(c.opt.latin ? [t(sci(b.latin))] : []), ...kr.map((_, j) => n(nOr((b.nilai || [])[j], 0), 0)), n(b.total, 0), ...(c.opt.basis === "total" ? [] : [n(b.persen, 2)]), ...(c.opt.kelas ? [k(esc(b.kelas || "-"))] : [])]) };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: c.opt.cap || `Hasil Skoring ${L.cap1(c.objek)}`, spec: this.spec(r, c) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Skor tertinggi pada ${r.baris[0].nama} (${num(r.baris[0].total)} dari ${num(r.baris[0].maks)}${r.baris[0].kelas ? `, ${r.baris[0].kelas.toLowerCase()}` : ""})`; },
    kpi() { return []; }
  };

  /* =====================================================================
   * 17. Kelimpahan dan sebaran jenis pada plot/petak pengamatan (anggrek, tumbuhan penting, dll.)
   * inp: { rows: [{ jenis, latin, n, unit }], units: [id plot, termasuk plot tanpa temuan] | nUnit, luasUnit (m²) }
   * Kelimpahan K = n/luas (ind/ha), KR; distribusi F = plot ditemukan/jumlah plot, FR; INP = KR + FR; H′ per jenis
   * ===================================================================== */
  M.kelimpahan = {
    judul: "Kelimpahan dan Distribusi Jenis",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => str(r.jenis) || str(r.latin));
      const units = [...new Set([...(inp.units || []).map(str).filter(Boolean), ...rows.map((r) => str(r.unit)).filter(Boolean)])];
      const nU = Math.max(nOr(inp.nUnit, 0), units.length), lu = nOr(inp.luasUnit, 0), luasHa = (nU * lu) / 10000;
      const jenis = perJenis(rows).map((b) => ({ jenis: b.jenis, latin: b.latin, n: b.n, p: b.unit.size || 1 }));
      const v = ST.vegetasi(jenis, nU, luasHa, false);
      return { kosong: !v.rows.length || !nU, ...v, nU, luasUnit: lu, adaLuas: luasHa > 0 };
    },
    narMetode(c) { return `Kelimpahan ${c.objek} dihitung sebagai jumlah individu per satuan luas plot pengamatan dan distribusinya sebagai proporsi plot yang memuat jenis tersebut. Kedua nilai relatifnya dijumlahkan menjadi indeks nilai penting (INP)${c.opt.H === false ? "" : ", dan keanekaragaman dihitung dengan indeks Shannon-Wiener"}:`; },
    metode(c) {
      const lv = c.lv, H = c.opt.H !== false;
      return [blk([Sub("K", "i"), R(" = "), F(Sub("n", "i"), "jumlah plot × luas plot (ha)"), R(";  "), Sub("KR", "i"), R(" = "), F(Sub("K", "i"), "Σ K"), R(" × 100%")], lv),
        blk([Sub("F", "i"), R(" = "), F("jumlah plot ditemukan jenis ke-i", "jumlah seluruh plot"), R(";  "), Sub("FR", "i"), R(" = "), F(Sub("F", "i"), "Σ F"), R(" × 100%")], lv),
        H ? blk([R("INP = KR + FR;  H′ = −"), Sum([Sub("p", "i"), R(" × ln "), Sub("p", "i")]), R(";  "), Sub("p", "i"), R(" = "), F(Sub("n", "i"), "N")], lv) : blk([R("INP = KR + FR")], lv),
        ket([["K", "kelimpahan (individu/ha)"], ["KR", "kelimpahan relatif (%)"], ["F", "distribusi (frekuensi kehadiran pada plot)"], ["FR", "distribusi relatif (%)"], ["INP", "indeks nilai penting (maksimal 200%)"], [Sub("n", "i"), "jumlah individu jenis ke-i"], ...(H ? [["N", "jumlah individu seluruh jenis"], ["H′", "indeks keanekaragaman Shannon-Wiener"]] : [])], lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data ${c.objek} pada plot pengamatan.`;
      const a = r.rows[0], f = [...r.rows].sort((x, y) => y.F - x.F)[0];
      return `Pada ${nTxt(r.nU)} plot pengamatan${r.adaLuas ? ` (luas total ${num(r.luasHa, 2)} ha)` : ""} tercatat ${nTxt(r.S)} jenis ${c.objek} dengan ${r.N} individu. Jenis dengan INP tertinggi adalah ${nm(a)} (${num(a.INP, 2)}%)${r.adaLuas ? ` dengan kelimpahan ${num(a.K, 2)} individu/ha` : ""}, sedangkan jenis yang tersebar paling luas adalah ${nm(f)} (ditemukan pada ${f.p} dari ${r.nU} plot).${c.opt.H === false ? "" : ` Indeks keanekaragaman Shannon-Wiener (H′) seluruh jenis adalah ${num(r.H, 2)}.`}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const x = r.rows[0], lv = c.lv;
      return [para(`Contoh perhitungan untuk ${esc(x.jenis)}:`, lv),
        ...(r.adaLuas ? [blk([R("K = "), F(num(x.n), `${num(r.nU)} × ${fx(r.luasUnit / 10000, 4)}`), R(` = ${num(x.K, 2)} ind/ha;  KR = ${num(x.KR, 2)}%`)], lv)] : []),
        blk([R("F = "), F(num(x.p), num(r.nU)), R(` = ${num(x.F, 2)};  FR = ${num(x.FR, 2)}%;  INP = ${num(x.INP, 2)}%`)], lv)].join("");
    },
    spec(r, c) {
      const H = !c || c.opt.H !== false;
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Jumlah Individu", "Jumlah Plot Ditemukan", "K (ind/ha)", "KR (%)", "F", "FR (%)", "INP (%)", ...(H ? ["pi", "−pi ln pi"] : [])],
        rows: r.rows.map((x, i) => [k(i + 1), t(esc(x.jenis)), t(sci(x.latin)), n(x.n, 0), n(x.p, 0), r.adaLuas ? n(x.K, 2) : k("-"), n(x.KR, 2), n(x.F, 2), n(x.FR, 2), n(x.INP, 2), ...(H ? [n(x.pi, 4), n(-x.piLnPi, 4)] : [])]),
        total: [[{ t: "Jumlah", cs: 3 }, n(r.N, 0), t(""), r.adaLuas ? n(r.sK, 2) : k("-"), n(100, 2), n(r.sF, 2), n(100, 2), n(200, 2), ...(H ? [n(1, 4), n(r.H, 4)] : [])]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Kelimpahan, Distribusi, dan Indeks Nilai Penting ${L.cap1(c.objek)}`, spec: this.spec(r, c) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Jenis ${c.objek} dengan INP tertinggi adalah ${nm(r.rows[0])} (${num(r.rows[0].INP, 2)}%)${c.opt.H === false ? "" : `; keanekaragaman jenis H′ = ${num(r.H, 2)}`}`; },
    kpi(r, c) { return r.kosong ? [] : c && c.opt.H === false ? [[r.nU, "plot pengamatan"]] : [[r.S, "jenis"], [num(r.H, 2), "H′"]]; }
  };

  /* =====================================================================
   * 16. Pohon sarang (mis. lebah hutan/uma ani): rekap jenis pohon, jumlah sarang, tinggi sarang, jarak ke sumber air
   * inp: { rows: [{ jenis, latin, jumlahSarang, tinggiSarang, jarakAir, lokasi }] }
   * ===================================================================== */
  M.sarang = {
    judul: "Pohon Sarang",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => str(r.jenis) || str(r.latin));
      const g = perJenis(rows, () => 1).map((b) => {
        const s = b.rows.map((r) => nOr(r.jumlahSarang, 0)), h = b.rows.flatMap((r) => (fin(toN(r.tinggiSarang)) ? [toN(r.tinggiSarang)] : []));
        return { jenis: b.jenis, latin: b.latin, pohon: b.rows.length, sarang: sum(s), tinggi: h.length ? mean(h) : null };
      }).sort((a, b) => b.pohon - a.pohon || b.sarang - a.sarang);
      const tot = rows.length, sar = sum(rows.map((r) => nOr(r.jumlahSarang, 0)));
      const h = rows.flatMap((r) => (fin(toN(r.tinggiSarang)) ? [toN(r.tinggiSarang)] : [])), ja = rows.flatMap((r) => (fin(toN(r.jarakAir)) ? [toN(r.jarakAir)] : []));
      g.forEach((x) => (x.persen = tot ? (x.pohon / tot) * 100 : 0));
      return { kosong: !tot, baris: g, pohon: tot, sarang: sar, rata: tot ? sar / tot : 0, tinggi: h.length ? { mean: mean(h), min: Math.min(...h), max: Math.max(...h) } : null, jarakAir: ja.length ? { mean: mean(ja), min: Math.min(...ja), max: Math.max(...ja) } : null, lokasi: [...new Set(rows.map((r) => str(r.lokasi)).filter(Boolean))] };
    },
    narMetode(c) { return `Data pohon sarang ${c.objek} dianalisis secara deskriptif: jenis pohon yang digunakan, jumlah sarang, tinggi sarang, dan jarak pohon sarang ke sumber air. Rata-rata dan persentase dihitung dengan persamaan:`; },
    metode(c) { const lv = c.lv; return [blk([R("x̄ = "), F(Sum(Sub("x", "i")), "n")], lv), blk([R("P = "), F("x", "y"), R(" × 100%")], lv), ket([["x̄", "rata-rata (jumlah sarang per pohon, tinggi sarang, atau jarak ke sumber air)"], [Sub("x", "i"), "nilai pada pohon sarang ke-i"], ["n", "jumlah pohon sarang"], ["P", "persentase pohon sarang suatu jenis pohon (%)"], ["x", "jumlah pohon sarang jenis tersebut"], ["y", "jumlah seluruh pohon sarang"]], lv)].join(""); },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data pohon sarang ${c.objek}.`;
      return `Ditemukan ${nTxt(r.pohon)} pohon sarang dengan ${r.sarang} sarang ${c.objek} (rata-rata ${num(r.rata, 2)} sarang per pohon)${r.lokasi.length ? ` di ${daftarKata(r.lokasi)}` : ""}. Jenis pohon yang paling banyak digunakan adalah ${daftarKata(r.baris.slice(0, 3).map((b) => `${nm(b)} (${b.pohon} pohon, ${num(b.persen, 1)}%)`))}.${r.tinggi ? ` Tinggi sarang berkisar ${num(r.tinggi.min, 1)}–${num(r.tinggi.max, 1)} m dengan rata-rata ${num(r.tinggi.mean, 1)} m.` : ""}${r.jarakAir ? ` Jarak pohon sarang ke sumber air rata-rata ${num(r.jarakAir.mean, 0)} m (${num(r.jarakAir.min, 0)}–${num(r.jarakAir.max, 0)} m).` : ""}`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; return blk([R("x̄ sarang = "), F(num(r.sarang), num(r.pohon)), R(` = ${num(r.rata, 2)} sarang/pohon`)], c.lv); },
    spec(r) { return { head: ["No", "Jenis Pohon", "Nama Ilmiah", "Jumlah Pohon Sarang", "Persentase (%)", "Jumlah Sarang", "Rata-rata Tinggi Sarang (m)"], rows: r.baris.map((b, i) => [k(i + 1), t(esc(b.jenis)), t(sci(b.latin)), n(b.pohon, 0), n(b.persen, 2), n(b.sarang, 0), b.tinggi === null ? k("-") : n(b.tinggi, 1)]), total: [[{ t: "Jumlah", cs: 3 }, n(r.pohon, 0), n(100, 2), n(r.sarang, 0), r.tinggi ? n(r.tinggi.mean, 1) : k("-")]] }; },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Jenis Pohon Sarang ${L.cap1(c.objek)}`, spec: this.spec(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Ditemukan ${r.pohon} pohon sarang ${c.objek} dengan ${r.sarang} sarang; jenis pohon yang paling banyak digunakan adalah ${nm(r.baris[0])}`; },
    kpi(r) { return r.kosong ? [] : [[r.pohon, "pohon sarang"], [r.sarang, "sarang"]]; }
  };
})();
