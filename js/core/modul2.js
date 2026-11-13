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
      const s = [`Pengamatan dilakukan pada ${nTxt(r.nTransek)} ${c.opt.unitLabel || "transek"} dengan panjang total ${num(r.L)} m${r.ul > 1 ? ` (termasuk ${r.ul} kali ulangan)` : ""}. Tercatat ${nTxt(r.N)} individu ${c.objek} dari ${r.nKontak} kontak.`];
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
    spec(r, c) {
      return { head: [L.judul(L.cap1((c && c.opt.unitLabel) || "transek")), "Panjang (m)", "Jumlah Kontak", "Jumlah Individu", "Rata-rata Jarak Kontak (m)"],
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
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Rekapitulasi Perjumpaan Langsung ${L.judul(c.objek)} per ${L.judul(L.cap1(c.opt.unitLabel || "transek"))}`, spec: this.spec(r, c) }, { cap: `Dugaan Kepadatan Populasi ${L.judul(c.objek)}`, spec: this.ringkas(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Kepadatan populasi ${c.objek} dari perjumpaan langsung (${r.metode === "king" ? "metode King" : r.metode === "hayne" ? "metode Hayne" : "transek jalur"}) adalah ${fx(r.D, 4)} individu/ha atau 1 individu/${fx(r.haPerInd, 2)} ha${r.populasi !== null ? `, dengan dugaan populasi sekitar ${num(r.populasi, 0)} individu` : ""}`; },
    kpi(r, c) { return r.kosong ? [] : [[fx(r.D, 4), `ind/ha (${haTxt(r.haPerInd)})`], [`${num(r.L)} m`, `panjang ${(c && c.opt.unitLabel) || "transek"}`]]; }
  };

  /* =====================================================================
   * 9. Pellet count (Sukmawati 2012); umur onggokan menurut fase dekomposisi (Suba dkk. 2010)
   * inp: { rows: [{ unit, p, fase }], fase: ["A","B"], t, d, a, A }
   * ===================================================================== */
  const FASE = ["A", "B", "C", "D", "E", "F"];
  M.pellet = {
    judul: "Pendugaan Populasi dari Onggokan Kotoran",
    hitung(inp) {
      // fase: [] berarti onggokan tidak dicatat fase dekomposisinya, sehingga semua onggokan dihitung
      const fs = (inp.fase || ["A", "B"]).map((x) => str(x).toUpperCase()), semua = !fs.length, dipakai = new Set(fs);
      const rows = (inp.rows || []).filter((r) => nOr(r.p, 0) > 0);
      const masuk = (r) => semua || !str(r.fase) || dipakai.has(str(r.fase).toUpperCase().charAt(0));
      const p = sum(rows.filter(masuk).map((r) => nOr(r.p, 0)));
      const units = [...new Set(rows.map((r) => str(r.unit) || "-"))];
      const perU = units.map((u) => { const o = { unit: u, fase: {}, dihitung: 0 }; rows.filter((r) => (str(r.unit) || "-") === u).forEach((r) => { const f = str(r.fase).toUpperCase().charAt(0) || "?"; o.fase[f] = (o.fase[f] || 0) + nOr(r.p, 0); if (masuk(r)) o.dihitung += nOr(r.p, 0); }); return o; });
      const tt = nOr(inp.t, 0), d = nOr(inp.d, 0), a = nOr(inp.a, 0), A = nOr(inp.A, 0);
      const res = ST.pellet(p, tt, d, a, A);
      return { kosong: !rows.length, lengkap: !!(tt && d && a), p, tt, d, a, A, res, perU, fase: [...dipakai], adaFase: !semua && rows.some((r) => str(r.fase)), total: sum(rows.map((r) => nOr(r.p, 0))) };
    },
    narMetode(c) {
      if (c.opt.fase && !c.opt.fase.length) return `Onggokan kotoran ${c.objek} yang dijumpai di jalur pengamatan dihitung jumlahnya pada setiap lokasi temuan. Kepadatan populasi diduga dengan metode pellet count (Sukmawati, 2012):`;
      return `Kelompok feses (onggokan) ${c.objek} dicatat menurut fase dekomposisinya (Suba dkk., 2010): fase A feses segar dan berbau khas; fase B feses mengering; fase C terdapat jamur di sekeliling feses; fase D feses mulai terdekomposisi; fase E setengah atau lebih feses terdekomposisi; fase F feses terdekomposisi sempurna. Onggokan yang dihitung adalah yang berumur kurang dari satu bulan (fase ${daftarKata((c.opt.fase || ["A", "B"]).map(String))}). Kepadatan populasi diduga dengan metode pellet count (Sukmawati, 2012):`;
    },
    metode(c) {
      const lv = c.lv;
      return [blk([R("D = "), F("A × p", "t × d × a")], lv),
        ket([["D", "dugaan populasi pada area seluas A (individu); bila A = 1 ha, D adalah kepadatan per ha"], ["A", "luas area penelitian (ha)"], ["p", "jumlah onggokan kotoran"], ["t", "interval waktu penumpukan onggokan (hari)"], ["d", "rata-rata laju defekasi (onggokan/individu/hari)"], ["a", "luas plot penelitian (ha)"]], lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data onggokan kotoran ${c.objek}.`;
      const faseTxt = r.adaFase ? `, ${r.p} di antaranya termasuk fase ${daftarKata(r.fase)} (berumur kurang dari satu bulan)` : "";
      if (!r.lengkap) return `Tercatat ${nTxt(r.total)} onggokan kotoran ${c.objek}${faseTxt}. Kepadatan populasi dari onggokan kotoran belum dihitung karena interval waktu penumpukan (t), laju defekasi (d), atau luas plot (a) belum ditetapkan; data onggokan dipakai sebagai petunjuk keberadaan dan intensitas penggunaan habitat.`;
      return `Tercatat ${r.total} onggokan kotoran ${c.objek}${r.adaFase ? `, ${r.p} di antaranya berumur kurang dari satu bulan (fase ${daftarKata(r.fase)})` : ""}. Dengan interval waktu ${num(r.tt)} hari, laju defekasi ${num(r.d, 2)} onggokan/individu/hari, dan luas plot ${num(r.a, 2)} ha, kepadatan populasi ${c.objek} adalah ${fx(r.res.D, 4)} individu/ha atau 1 individu/${fx(r.res.haPerInd, 2)} ha.${r.res.populasi !== null ? ` Pada area pengamatan seluas ${num(r.A, 2)} ha, dugaan populasinya sekitar ${num(r.res.populasi, 0)} individu.` : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong || !r.lengkap) return "";
      const lv = c.lv, out = [blk([R("D = "), F(`1 × ${num(r.p)}`, `${num(r.tt)} × ${num(r.d, 2)} × ${num(r.a, 2)}`), R(` = ${fx(r.res.D, 4)} ind/ha`)], lv)];
      if (r.res.populasi !== null) out.push(blk([R("D = "), F(`${num(r.A, 2)} × ${num(r.p)}`, `${num(r.tt)} × ${num(r.d, 2)} × ${num(r.a, 2)}`), R(` = ${num(r.res.populasi, 1)} individu`)], lv));
      return out.join("");
    },
    spec(r) {
      if (!r.adaFase) return { head: ["Lokasi/Transek", "Jumlah Onggokan"], rows: r.perU.map((u) => [k(esc(u.unit)), n(u.dihitung, 0)]), total: [[t("Jumlah"), n(r.p, 0)]] };
      return { head: ["Lokasi/Transek", ...FASE.map((f) => `Fase ${f}`), "Onggokan Dihitung"],
        rows: r.perU.map((u) => [k(esc(u.unit)), ...FASE.map((f) => n(u.fase[f] || 0, 0)), n(u.dihitung, 0)]),
        total: [[t("Jumlah"), ...FASE.map((f) => n(sum(r.perU.map((u) => u.fase[f] || 0)), 0)), n(r.p, 0)]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Rekapitulasi Onggokan Kotoran ${L.judul(c.objek)}${r.adaFase ? " menurut Fase Dekomposisi" : " per Lokasi"}`, spec: this.spec(r) }]; },
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
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Rekapitulasi Perjumpaan Jejak Kaki ${L.judul(c.objek)}`, spec: this.spec(r) }]; },
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
        para(`Tingkat pertumbuhan dan ukuran petak: semai (anakan, tinggi kurang dari 1,5 m) pada petak ${esc(c.opt.ukuranTxt?.semai || `${num(nOr(lu.semai, 4))} m²`)}; pancang (tinggi 1,5 m atau lebih, diameter kurang dari 10 cm) pada petak ${esc(c.opt.ukuranTxt?.pancang || `${num(nOr(lu.pancang, 25))} m²`)}; tiang (diameter 10 cm sampai kurang dari 20 cm) pada petak ${esc(c.opt.ukuranTxt?.tiang || `${num(nOr(lu.tiang, 100))} m²`)}; dan pohon (diameter 20 cm atau lebih) pada petak ${esc(c.opt.ukuranTxt?.pohon || `${num(nOr(lu.pohon, 400))} m²`)}.`, lv), ...(c.opt.kriteriaH ? [para(`Kriteria keanekaragaman: ${(ST.KRITERIA_H[c.opt.kriteriaH] || ST.KRITERIA_H.template).label.replace(/'/g, "′")} (${c.opt.kriteriaH === "krebs" ? "Krebs, 1989" : "template analisis data Balai"}).`, lv)] : [])].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return "Belum ada data vegetasi.";
      return `Analisis vegetasi pada ${nTxt(r.P)} petak contoh mencatat ${nTxt(r.S)} jenis tumbuhan. ` + r.per.map((v) => `Pada tingkat ${v.tingkat} ditemukan ${v.S} jenis (${v.N} individu); jenis dengan INP tertinggi adalah ${daftarKata(v.rows.slice(0, 3).map((x) => `${nm(x)} dengan INP ${num(x.INP, 2)}%`))}. Indeks keanekaragaman H′ tingkat ini ${num(v.H, 2)}${c.opt.kriteriaH ? ` (${(ST.KRITERIA_H[c.opt.kriteriaH] || ST.KRITERIA_H.template).fn(v.H).toLowerCase()})` : ""}.`).join(" ");
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
    tabel(r, c) { return r.kosong ? [] : r.per.map((v) => ({ cap: `Indeks Nilai Penting Tingkat ${L.judul(v.tingkat)}`, spec: this.spec(v, c.opt.tanda), catatan: c.opt.tanda && v.rows.some(c.opt.tanda) ? c.opt.tandaKet || "* jenis yang ditandai" : "" })); },
    simpulan(r) { return r.kosong ? "" : r.per.map((v) => `tingkat ${v.tingkat} didominasi ${nm(v.rows[0])} dengan INP ${num(v.rows[0].INP, 2)}%`).join("; ").replace(/^./, (s) => s.toUpperCase()); },
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
  // opt.istilah "sebaran": luas daerah sebaran (extent of occurrence) seluruh catatan, bukan wilayah jelajah individu
  const istilahMCP = (c) => (c.opt.istilah === "sebaran" ? "daerah sebaran" : "wilayah jelajah");
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
    narMetode(c) {
      if (c.opt.istilah === "sebaran") return `Luas daerah sebaran (extent of occurrence) ${c.objek} dihitung dengan metode poligon cembung minimum (Minimum Convex Polygon, MCP), yaitu poligon cembung terkecil yang memuat seluruh ${c.opt.labelLokasi || "lokasi perjumpaan"} yang diketahui (IUCN, 2012). Luas poligon dihitung dari koordinat titik sudut poligon yang sudah diproyeksikan ke satuan meter:`;
      return `Luas wilayah jelajah (home range) ${c.objek} diduga dengan metode poligon cembung minimum (Minimum Convex Polygon, MCP; Mohr, 1947), yaitu poligon cembung terkecil yang memuat seluruh titik perjumpaan. Luas poligon dihitung dari koordinat titik sudut poligon yang sudah diproyeksikan ke satuan meter:`;
    },
    metode(c) {
      const lv = c.lv, out = [blk([R("A = "), F("1", "2"), R(" × "), R("|"), Sum([Sub("x", "i"), Sub("y", "i+1"), R(" − "), Sub("x", "i+1"), Sub("y", "i")]), R("|")], lv),
        ket([["A", `luas ${istilahMCP(c)} (m², dikonversi ke ha dan km²)`], [[Sub("x", "i"), ", ", Sub("y", "i")], "koordinat titik sudut ke-i poligon cembung (m)"]], lv)];
      if (c.opt.pasangan) out.push(para("Perkiraan jumlah pasangan yang dapat ditampung habitat dihitung dari luas habitat sesuai dibagi luas wilayah jelajah satu pasangan:", lv), blk([Sub("N", "pasangan"), R(" ≈ "), F(Sub("A", "habitat"), Sub("A", "jelajah"))], lv),
        ket([[Sub("A", "habitat"), "luas habitat yang sesuai (km²)"], [Sub("A", "jelajah"), `luas wilayah jelajah satu pasangan (km²); acuan ${esc(c.opt.acuanJelajah || "Raharjaningtrah dan Rahman (2004): sekitar 38,5 km²")}`]], lv));
      return out.join("");
    },
    narHasil(r, c) {
      if (r.kosong) return r.n ? `Perjumpaan ${c.objek} tercatat pada ${nTxt(r.nUnik)} titik berkoordinat berbeda, belum cukup untuk membentuk poligon ${istilahMCP(c)} (perlu paling sedikit tiga titik berbeda yang tidak segaris).` : `Belum ada titik perjumpaan ${c.objek} yang berkoordinat untuk membentuk poligon ${istilahMCP(c)}.`;
      return `Dari ${nTxt(r.n)} ${c.opt.labelTitik || "titik perjumpaan"} (${r.nUnik} titik berbeda), poligon cembung minimum dibentuk oleh ${r.hull.length} titik sudut dengan luas ${num(r.ha, 2)} ha (${num(r.km2, 2)} km²) dan keliling ${num(r.keliling / 1000, 2)} km.${r.kel.length > 1 ? ` Menurut kelompok data: ${r.kel.map((g) => `${g.kelompok} ${g.nUnik >= 3 ? `${num(g.ha, 2)} ha` : "kurang dari tiga titik"}`).join("; ")}.` : ""}${r.pasangan !== null ? ` Dengan luas habitat ${num(r.hab, 2)} km² dan wilayah jelajah ${num(r.jp, 1)} km² per pasangan, habitat diperkirakan menampung sekitar ${num(r.pasangan, 1)} pasangan.` : ""}`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; return blk([R(`A = ${num(r.m2)} `), Sup("m", "2"), R(` = ${num(r.ha, 2)} ha = ${num(r.km2, 2)} `), Sup("km", "2")], c.lv) + (r.pasangan !== null ? blk([Sub("N", "pasangan"), R(" ≈ "), F(num(r.hab, 2), num(r.jp, 1)), R(` = ${num(r.pasangan, 1)} pasangan`)], c.lv) : ""); },
    spec(r) {
      const geo = r.sistem === "geo";
      return { head: ["No", geo ? "Bujur (X)" : "X (m)", geo ? "Lintang (Y)" : "Y (m)", "Keterangan"], rows: r.hull.map((p, i) => [k(i + 1), n(p.x, geo ? 6 : 0), n(p.y, geo ? 6 : 0), t(esc(p.label || p.kelompok || ""))]) };
    },
    kelSpec(r) { return { head: ["Kelompok Data", "Jumlah Titik", "Luas (ha)", "Luas (km²)", "Keliling (km)"], rows: r.kel.map((g) => [t(esc(g.kelompok)), n(g.n, 0), g.nUnik >= 3 ? n(g.ha, 2) : k("-"), g.nUnik >= 3 ? n(g.km2, 2) : k("-"), g.nUnik >= 3 ? n(g.keliling / 1000, 2) : k("-")]), total: [[t("Seluruh titik"), n(r.n, 0), n(r.ha, 2), n(r.km2, 2), n(r.keliling / 1000, 2)]] }; },
    tabel(r, c) { if (r.kosong) return []; const out = [{ cap: `Titik Sudut Poligon Cembung Minimum ${L.judul(c.objek)}`, spec: this.spec(r) }]; if (r.kel.length > 1) out.push({ cap: `Luas ${L.judul(istilahMCP(c))} ${L.judul(c.objek)} menurut Kelompok Data`, spec: this.kelSpec(r) }); return out; },
    gambarCap(r, c) { return c.opt.capPeta || `sebaran ${c.opt.labelTitik || "titik perjumpaan"} serta poligon cembung minimum ${istilahMCP(c)} ${c.objek}`; },
    gambar(r, c) { return r.kosong || !r.peta ? "" : `<figure class="map"><img src="${r.peta}" alt="${esc(L.cap1(this.gambarCap(r, c)))}"></figure>`; },
    simpulan(r, c) { return r.kosong ? "" : `Luas ${istilahMCP(c)} ${c.objek} menurut poligon cembung minimum adalah ${num(r.ha, 2)} ha (${num(r.km2, 2)} km²)`; },
    kpi(r, c) { return r.kosong ? [] : [[`${num(r.km2, 2)} km²`, `${c ? istilahMCP(c) : "wilayah jelajah"} (MCP)`]]; }
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
    rekap(r, c) { return { head: ["No", `Kelas ${L.judul((c && c.opt.label) || "tutupan lahan")} (Lapangan)`, "Jumlah Titik", "Persentase (%)"], rows: r.kelasLap.rows.map((x, i) => [k(i + 1), t(esc(x.k)), n(x.x, 0), n(x.p, 2)]), total: [[{ t: "Jumlah", cs: 2 }, n(r.kelasLap.y, 0), n(100, 2)]] }; },
    tabel(r, c) { const lb = L.judul((c && c.opt.label) || "tutupan lahan").replace(/\b\w/g, (x) => x.toUpperCase()); return r.kosong ? [] : [{ cap: `Rekapitulasi Kelas ${lb} Hasil Ground Check`, spec: this.rekap(r, c) }, { cap: `Matriks Kesalahan Peta ${lb} terhadap Kondisi Lapangan`, spec: this.spec(r) }]; },
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
      if (c.opt.metodeTambahan) out.push(para(esc(c.opt.metodeTambahan), lv));
      if (c.opt.basis === "total") out.push(blk([R("Skor total = "), Sum(Sub("s", "j"))], lv), ket([[Sub("s", "j"), "skor pada kriteria ke-j"]], lv));
      else out.push(blk([R("Nilai = "), F("skor aktual", "skor maksimal"), R(" × 100%")], lv));
      if (c.opt.kelas) out.push(ket(c.opt.kelas.map(([b, l], i, a) => [c.opt.basis === "total" ? (i === 0 ? `skor ≥ ${b}` : `${b} ≤ skor < ${a[i - 1][0]}`) : (i === 0 ? `≥ ${num(b)}%` : `${num(b)}% – < ${num(a[i - 1][0])}%`), esc(l)]), lv, `Kelas${c.opt.acuan ? ` (${esc(c.opt.acuan)})` : ""}:`));
      return out.join("");
    },
    // Jumlah anggota tiap kelas, urut sesuai daftar kelas
    perKelas(r, c) { return (c.opt.kelas || []).map(([, l]) => [l, r.baris.filter((b) => b.kelas === l).length]).filter(([, x]) => x); },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data skoring ${c.objek}.`;
      const top = r.baris.filter((b) => b.total === r.baris[0].total), pk = this.perKelas(r, c);
      return `Dari ${nTxt(r.baris.length)} ${c.objek} yang dinilai, skor tertinggi (${numL(r.baris[0].total)} dari ${numL(r.baris[0].maks)}) dimiliki oleh ${daftarKata(top.map((b) => b.nama + (b.latin && b.latin !== b.nama ? ` (${b.latin})` : "")))}${top[0].kelas ? ` dengan kelas ${top[0].kelas.toLowerCase()}` : ""}.${pk.length ? ` Menurut kelasnya, ${daftarKata(pk.map(([l, x]) => `${x} ${c.opt.satuan || c.objek} ${l.toLowerCase()}`))}.` : ""}`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; const b = r.baris[0]; return c.opt.basis === "total" ? blk([R(`Skor total ${b.nama} = ${(b.nilai || []).map((v) => numL(nOr(v, 0))).join(" + ")} = ${numL(b.total)}`)], c.lv) : blk([R(`Nilai ${b.nama} = `), F(numL(b.total), numL(b.maks)), R(` × 100% = ${num(b.persen, 2)}%`)], c.lv); },
    spec(r, c) {
      const kr = r.kr, d = c.opt.desimal ?? 0;
      return { head: ["No", L.judul(c.opt.labelNama || "Nama"), ...(c.opt.latin ? ["Nama Ilmiah"] : []), ...kr.map((x) => esc(x.label)), "Jumlah Skor", ...(c.opt.basis === "total" ? [] : ["Nilai (%)"]), ...(c.opt.kelas ? ["Kelas"] : [])],
        rows: r.baris.map((b, i) => [k(i + 1), t(esc(b.nama)), ...(c.opt.latin ? [t(sci(b.latin))] : []), ...kr.map((_, j) => n(nOr((b.nilai || [])[j], 0), d)), n(b.total, d), ...(c.opt.basis === "total" ? [] : [n(b.persen, 2)]), ...(c.opt.kelas ? [k(esc(b.kelas || "-"))] : [])]) };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: c.opt.cap || `Hasil Skoring ${L.judul(c.objek)}`, spec: this.spec(r, c) }]; },
    simpulan(r, c) {
      if (r.kosong) return "";
      const pk = this.perKelas(r, c);
      if (pk.length) return `Dari ${nTxt(r.baris.length)} ${c.objek} yang dinilai, ${daftarKata(pk.map(([l, x]) => `${x} ${c.opt.satuan || c.objek} ${c.opt.kataKelas ? `${c.opt.kataKelas} ` : ""}${l.toLowerCase()}`))}; skor tertinggi pada ${r.baris[0].nama} (${num(r.baris[0].persen, 1)}%)`;
      return `Skor tertinggi pada ${r.baris[0].nama} (${numL(r.baris[0].total)} dari ${numL(r.baris[0].maks)}${r.baris[0].kelas ? `, ${r.baris[0].kelas.toLowerCase()}` : ""})`;
    },
    kpi(r, c) { const pk = r.kosong ? [] : this.perKelas(r, c); return pk.length ? [[pk[0][1], `${(c.opt.satuan || c.objek)} ${pk[0][0].toLowerCase()}`]] : []; }
  };

  /* =====================================================================
   * 23. Kesesuaian lokasi: rata-rata skor kriteria per lokasi, dikelompokkan menurut faktor
   * (skoring lokasi pelepasliaran: faktor ekologi, ekonomi, dan kelembagaan)
   * inp: { rows: [{ lokasi, faktor, kriteria, skor }] } ; Nilai = Σ s_j / n
   * ===================================================================== */
  M.kesesuaian = {
    judul: "Kesesuaian Lokasi",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => str(r.lokasi) && str(r.skor) !== "" && Number.isFinite(Number(r.skor)));
      const faktor = [...new Set(rows.map((r) => str(r.faktor)).filter(Boolean))], m = new Map();
      rows.forEach((r) => {
        const kk = str(r.lokasi);
        if (!m.has(kk)) m.set(kk, { lokasi: kk, n: 0, total: 0, f: new Map(), rinci: [] });
        const o = m.get(kk), v = Number(r.skor), f = str(r.faktor);
        o.n++; o.total += v; o.rinci.push({ faktor: f, kriteria: str(r.kriteria), skor: v });
        if (f) { const x = o.f.get(f) || { n: 0, t: 0 }; x.n++; x.t += v; o.f.set(f, x); }
      });
      const lokasi = [...m.values()].map((o) => ({ ...o, nilai: o.total / o.n })).sort((a, b) => b.nilai - a.nilai);
      return { kosong: !lokasi.length, lokasi, faktor };
    },
    narMetode(c) { return `Setiap ${c.objek} dinilai pada sejumlah kriteria${c.opt.faktor ? ` yang dikelompokkan dalam faktor ${daftarKata(c.opt.faktor)}` : ""}. Skor setiap kriteria ditetapkan tim dari hasil pengamatan lapangan, lalu nilai skoring lokasi dihitung sebagai rata-rata skor seluruh kriteria. Lokasi dengan nilai tertinggi menjadi lokasi yang direkomendasikan:`; },
    metode(c) { const lv = c.lv; return [blk([R("Nilai = "), F(Sum(Sub("s", "j")), "n")], lv), ket([["Nilai", `nilai skoring ${esc(c.objek)}`], [Sub("s", "j"), "skor kriteria ke-j"], ["n", "jumlah kriteria yang dinilai"]], lv)].join(""); },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data skoring ${c.objek}.`;
      const a = r.lokasi, z = a[a.length - 1];
      return `Dari ${nTxt(a.length)} ${c.objek} yang dinilai, nilai skoring tertinggi diperoleh ${daftarKata(a.slice(0, Math.min(2, a.length)).map((x) => `${x.lokasi} (${numL(x.nilai)})`))}${a.length > 2 ? `, sedangkan nilai terendah ${z.lokasi} (${numL(z.nilai)})` : ""}.`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; const x = r.lokasi[0]; return blk([R(`Nilai ${x.lokasi} = `), F(x.rinci.length <= 8 ? x.rinci.map((y) => numL(y.skor)).join(" + ") : numL(x.total), num(x.n)), R(` = ${numL(x.nilai)}`)], c.lv); },
    spec(r) {
      return { head: ["No", "Lokasi", ...r.faktor.map((f) => `${f} (rata-rata)`), "Jumlah Kriteria", "Nilai Skoring"],
        rows: r.lokasi.map((x, i) => [k(i + 1), t(esc(x.lokasi)), ...r.faktor.map((f) => (x.f.has(f) ? n(x.f.get(f).t / x.f.get(f).n, 2) : k("-"))), n(x.n, 0), n(x.nilai, 2)]) };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: c.opt.cap || `Nilai Skoring ${L.judul(c.objek)}`, spec: this.spec(r) }]; },
    lampiran(r, c) {
      if (r.kosong) return [];
      let i = 0;
      return [{ cap: `Rincian Skor Kriteria ${L.judul(c.objek)}`, spec: { head: ["No", "Lokasi", "Faktor", "Kriteria", "Skor"], rows: r.lokasi.flatMap((x) => x.rinci.map((y) => [k(++i), t(esc(x.lokasi)), t(esc(y.faktor || "-")), t(esc(y.kriteria || "-")), n(y.skor, 2)])) } }];
    },
    simpulan(r, c) { return r.kosong ? "" : `Nilai skoring ${c.objek} tertinggi diperoleh ${r.lokasi[0].lokasi} dengan nilai ${numL(r.lokasi[0].nilai)}`; },
    kpi(r) { return r.kosong ? [] : [[numL(r.lokasi[0].nilai), "nilai skoring tertinggi"]]; }
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
      return `Pada ${nTxt(r.nU)} plot pengamatan${r.adaLuas ? ` (luas total ${num(r.luasHa, 2)} ha)` : ""} tercatat ${nTxt(r.S)} jenis ${c.objek} dengan ${r.N} individu. Jenis dengan INP tertinggi adalah ${nm(a)} dengan INP ${num(a.INP, 2)}%${r.adaLuas ? ` dan kelimpahan ${num(a.K, 2)} individu/ha` : ""}, sedangkan jenis yang tersebar paling luas adalah ${nm(f)} (ditemukan pada ${f.p} dari ${r.nU} plot).${c.opt.H === false ? "" : ` Indeks keanekaragaman Shannon-Wiener (H′) seluruh jenis adalah ${num(r.H, 2)}.`}`;
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
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Kelimpahan, Distribusi, dan Indeks Nilai Penting ${L.judul(c.objek)}`, spec: this.spec(r, c) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Jenis ${c.objek} dengan INP tertinggi adalah ${nm(r.rows[0])} dengan INP ${num(r.rows[0].INP, 2)}%${c.opt.H === false ? "" : `; keanekaragaman jenis H′ = ${num(r.H, 2)}`}`; },
    kpi(r, c) { return r.kosong ? [] : c && c.opt.H === false ? [[r.nU, "plot pengamatan"]] : [[r.S, "jenis"], [num(r.H, 2), "H′"]]; }
  };

  /* =====================================================================
   * 18. Tumbuhan asing invasif dalam analisis vegetasi: K, KR, F, FR, (DR), INP jenis invasif per tingkat pertumbuhan
   * inp: { rows: baris vegetasi { petak, tingkat, jenis, latin, n, diameter }, isInv(r), basis: "komunitas"|"invasif",
   *        luas: { semai, pancang, tiang, pohon, "tumbuhan bawah" } (m²), nPetak, grup: [{ nama, petak: [kode], nPetak }] }
   * basis "komunitas": nilai relatif terhadap seluruh jenis di petak contoh; "invasif": terhadap jenis invasif saja
   * ===================================================================== */
  M.invasif = {
    judul: "Kerapatan, Frekuensi, dan Indeks Nilai Penting Tumbuhan Asing Invasif",
    hitung(inp) {
      const isInv = inp.isInv || ((r) => /^ya$/i.test(str(r.invasif)));
      const semua = (inp.rows || []).filter((r) => str(r.jenis) || str(r.latin));
      const grup = (inp.grup || []).filter((g) => g.petak && g.petak.length);
      const daftarGrup = grup.length ? grup : [{ nama: "", petak: null, nPetak: inp.nPetak }];
      const kunci = M.util.kunci, basis = inp.basis === "invasif" ? "invasif" : "komunitas";
      const per = [], lamp = [];
      daftarGrup.forEach((g) => {
        const rr = semua.filter((r) => !g.petak || g.petak.includes(str(r.petak)));
        const inv = rr.filter(isInv);
        if (!inv.length && basis === "invasif") return;
        if (!rr.length) return;
        const v = M.vegetasi.hitung({ mode: "petak", rows: basis === "invasif" ? inv : rr, luas: inp.luas, nPetak: g.nPetak });
        const kunciInv = new Set(inv.map((r) => kunci(r.latin || r.jenis)));
        v.per.forEach((tk) => {
          const rows = tk.rows.filter((x) => kunciInv.has(kunci(x.latin || x.jenis)));
          if (basis === "komunitas") lamp.push({ grup: g.nama, ...tk, tanda: kunciInv });
          if (rows.length) per.push({ grup: g.nama, tingkat: tk.tingkat, P: v.P, luasPetak: tk.luasPetak, luasHa: tk.luasHa, adaD: tk.adaD, sK: tk.sK, sF: tk.sF, sD: tk.sD, Sall: tk.S, Nall: tk.N, maksINP: tk.maksINP, rows,
            KRinv: sum(rows.map((x) => x.KR)), Ninv: sum(rows.map((x) => x.n)) });
        });
      });
      const inv = semua.filter(isInv);
      const nPetak = grup.length ? sum(grup.map((g) => nOr(g.nPetak, g.petak.length))) : nOr(inp.nPetak, 0) || new Set(semua.map((r) => str(r.petak)).filter(Boolean)).size;
      return { kosong: !per.length, per, lamp, basis, S: new Set(inv.map((r) => kunci(r.latin || r.jenis))).size, N: sum(inv.map((r) => nOr(r.n, 1))),
        petakInv: new Set(inv.map((r) => str(r.petak)).filter(Boolean)).size, nPetak, adaGrup: grup.length > 0, Sall: new Set(semua.map((r) => kunci(r.latin || r.jenis))).size };
    },
    narMetode(c) {
      return `Kerapatan, frekuensi, dominansi, dan indeks nilai penting (INP) tumbuhan asing invasif dihitung dari data vegetasi pada petak contoh mengikuti Peraturan Direktur Jenderal KSDAE Nomor P.10/KSDAE/SET/KSA.0/9/2016. ${c.opt.basis === "invasif" ? "Nilai relatif dihitung terhadap seluruh jenis tumbuhan asing invasif yang tercatat." : "Nilai relatif dihitung terhadap seluruh jenis tumbuhan yang tercatat pada petak contoh, sehingga INP menunjukkan peran jenis invasif di dalam komunitas tumbuhan setempat."}${c.opt.perEkosistem ? " Perhitungan dipisahkan menurut tipe ekosistem petak contoh." : ""} Persamaan yang digunakan:`;
    },
    metode(c) {
      const lv = c.lv, lu = c.opt.luas || {}, kr = (a) => [Sub(a, "i"), R(" = ")];
      return [blk([...kr("K"), F("jumlah individu jenis ke-i", "luas seluruh petak contoh (ha)"), R(";  "), ...kr("KR"), F(Sub("K", "i"), "Σ K"), R(" × 100%")], lv),
        blk([...kr("F"), F("jumlah petak ditemukan jenis ke-i", "jumlah seluruh petak contoh"), R(";  "), ...kr("FR"), F(Sub("F", "i"), "Σ F"), R(" × 100%")], lv),
        blk([...kr("D"), F("Σ LBDS jenis ke-i", "luas seluruh petak contoh (ha)"), R(";  LBDS = "), F("1", "4"), R(" × π × "), Sup("d", "2"), R(";  "), ...kr("DR"), F(Sub("D", "i"), "Σ D"), R(" × 100%")], lv),
        blk([R("INP = KR + FR (semai, pancang, tumbuhan bawah);  INP = KR + FR + DR (tiang dan pohon)")], lv),
        ket([["K", "kerapatan (individu/ha)"], ["KR", "kerapatan relatif (%)"], ["F", "frekuensi"], ["FR", "frekuensi relatif (%)"], ["D", "dominansi (m²/ha)"], ["DR", "dominansi relatif (%)"], ["LBDS", "luas bidang dasar batang (m²)"], ["d", "diameter batang setinggi dada (m)"], ["INP", "indeks nilai penting (%)"], ["Σ", c.opt.basis === "invasif" ? "jumlah untuk seluruh jenis tumbuhan asing invasif" : "jumlah untuk seluruh jenis tumbuhan pada tingkat pertumbuhan yang sama"]], lv),
        para(`Ukuran petak: semai dan tumbuhan bawah (termasuk herba, semak, dan rumput) ${num(nOr(lu.semai, 4))} m²; pancang (tinggi lebih dari 1,5 m, diameter kurang dari 10 cm) ${num(nOr(lu.pancang, 25))} m²; tiang (diameter 10 sampai 19 cm) ${num(nOr(lu.tiang, 100))} m²; pohon (diameter 20 cm atau lebih) ${num(nOr(lu.pohon, 400))} m².`, lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data ${c.objek} pada petak contoh.`;
      const awal = `Tumbuhan asing invasif ditemukan pada ${nTxt(r.petakInv)} dari ${nTxt(r.nPetak)} petak contoh, terdiri atas ${nTxt(r.S)} jenis dengan ${r.N} individu${r.basis === "komunitas" ? ` dari ${r.Sall} jenis tumbuhan yang tercatat` : ""}.`;
      const isi = r.per.map((v) => {
        const a = v.rows[0];
        return `Pada tingkat ${v.tingkat}${v.grup ? ` di ekosistem ${v.grup.toLowerCase()}` : ""}, INP tertinggi dimiliki ${nm(a)} dengan nilai ${num(a.INP, 2)}%${r.basis === "komunitas" ? `; jenis invasif menyusun ${num(v.KRinv, 2)}% kerapatan tingkat ini` : ""}.`;
      });
      return [awal, ...isi].join(" ");
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const v = r.per[0], x = v.rows[0], lv = c.lv;
      return [para(`Contoh perhitungan untuk ${esc(x.jenis)} pada tingkat ${esc(v.tingkat)}${v.grup ? ` (ekosistem ${esc(v.grup.toLowerCase())})` : ""}, luas petak contoh ${num(v.P)} × ${num(v.luasPetak)} m² = ${fx(v.luasHa, 4)} ha:`, lv),
        blk([R("K = "), F(num(x.n), fx(v.luasHa, 4)), R(` = ${num(x.K, 2)} ind/ha;  KR = `), F(num(x.K, 2), num(v.sK, 2)), R(` × 100% = ${num(x.KR, 2)}%`)], lv),
        blk([R("F = "), F(num(x.p), num(v.P)), R(` = ${num(x.F, 2)};  FR = `), F(num(x.F, 2), num(v.sF, 2)), R(` × 100% = ${num(x.FR, 2)}%`)], lv),
        ...(v.adaD ? [blk([R(`D = ${num(x.D, 3)} `), Sup("m", "2"), R(`/ha;  DR = ${num(x.DR, 2)}%`)], lv)] : []),
        blk([R(`INP = ${num(x.KR, 2)} + ${num(x.FR, 2)}${v.adaD ? ` + ${num(x.DR, 2)}` : ""} = ${num(x.INP, 2)}%`)], lv)].join("");
    },
    spec(v) {
      const D = v.adaD;
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Jumlah Individu", "Jumlah Petak Ditemukan", "K (ind/ha)", "KR (%)", "F", "FR (%)", ...(D ? ["D (m²/ha)", "DR (%)"] : []), "INP (%)"],
        rows: v.rows.map((x, i) => [k(i + 1), t(esc(x.jenis)), t(sci(x.latin)), n(x.n, 0), n(x.p, 0), n(x.K, 2), n(x.KR, 2), n(x.F, 2), n(x.FR, 2), ...(D ? [n(x.D, 3), n(x.DR, 2)] : []), n(x.INP, 2)]),
        total: [[{ t: "Jumlah jenis invasif", cs: 3 }, n(v.Ninv, 0), t(""), n(sum(v.rows.map((x) => x.K)), 2), n(v.KRinv, 2), n(sum(v.rows.map((x) => x.F)), 2), n(sum(v.rows.map((x) => x.FR)), 2), ...(D ? [n(sum(v.rows.map((x) => x.D)), 3), n(sum(v.rows.map((x) => x.DR)), 2)] : []), n(sum(v.rows.map((x) => x.INP)), 2)]] };
    },
    tabel(r) {
      return r.kosong ? [] : r.per.map((v) => ({ cap: `Indeks Nilai Penting Tumbuhan Asing Invasif Tingkat ${L.judul(v.tingkat)}${v.grup ? ` pada Ekosistem ${L.judul(v.grup)}` : ""}`, spec: this.spec(v),
        catatan: r.basis === "komunitas" ? `Nilai relatif dihitung terhadap seluruh ${v.Sall} jenis tumbuhan (${v.Nall} individu) pada tingkat ini.` : "" }));
    },
    lampiran(r) {
      if (r.kosong || r.basis !== "komunitas") return [];
      const kunci = M.util.kunci;
      return r.lamp.map((v) => ({ cap: `Analisis Vegetasi Tingkat ${L.judul(v.tingkat)}${v.grup ? ` pada Ekosistem ${L.judul(v.grup)}` : ""}`, spec: M.vegetasi.spec(v, (x) => v.tanda.has(kunci(x.latin || x.jenis))), catatan: "* tumbuhan asing invasif" }));
    },
    simpulan(r) {
      if (r.kosong) return "";
      return `Tumbuhan asing invasif ditemukan pada ${r.petakInv} dari ${r.nPetak} petak contoh; INP tertinggi ${r.per.map((v) => `tingkat ${v.tingkat}${v.grup ? ` (${v.grup.toLowerCase()})` : ""} dimiliki ${nm(v.rows[0])} dengan nilai ${num(v.rows[0].INP, 2)}%`).join(", ")}`;
    },
    kpi(r) { return r.kosong ? [] : [[r.S, "jenis invasif"], [`${r.petakInv}/${r.nPetak}`, "petak berisi jenis invasif"]]; }
  };

  /* =====================================================================
   * 19. Keinvasifan jenis tumbuhan asing (Modul Analisis Risiko Spesies Asing Invasif (Post Border), FORIS Indonesia dan Puslitbang Hutan, 2016)
   * inp: { rows: [{ nama, latin, mapan, tahan, buah, biji, vegetatif, burung, hewan, air, angin, sengaja, tanpaSengaja, kontaminasi, ternak }] }
   * Faktor 1 dan 2: rendah 0, medium 1, tinggi 2, sangat tinggi 3. Faktor 3: jumlah subfaktor 0 → 0, 1–2 → 1, 3–4 → 2, 5–6 → 3.
   * Faktor 4 dan 5: jumlah subfaktor 0 → 0, 1–2 → 1, 3–5 → 2, 6–8 → 3. K = Σ skor / 15 × 10. "Tidak tahu" diberi 0 dan ditandai.
   * ===================================================================== */
  const INV_PETA = {
    tingkat: { rendah: 0, medium: 1, tinggi: 2, "sangat tinggi": 3, "amat tinggi": 3 },
    buah: { "1 tahun": 2, "2 sampai 3 tahun": 1, "2-3 tahun": 1, "2–3 tahun": 1, "lebih dari 3 tahun": 0, "> 3 tahun": 0, ">3 tahun": 0 },
    biji: { banyak: 2, sedikit: 1, "tidak ada": 0, "tak ada": 0 },
    vegetatif: { cepat: 2, lambat: 1, "tidak ada": 0, "tak ada": 0 },
    sebar: { umum: 2, "kadang-kadang": 1, "mungkin tidak": 0 }
  };
  const INV_FAKTOR = [
    { key: "mapan", label: "Kemampuan mapan di antara tumbuhan asli", pendek: "Mapan" },
    { key: "tahan", label: "Ketahanan terhadap praktik pengelolaan", pendek: "Ketahanan" },
    { key: "reproduksi", label: "Kemampuan reproduksi", pendek: "Reproduksi", sub: [["buah", "periode berbuah", "buah"], ["biji", "produksi biji", "biji"], ["vegetatif", "reproduksi vegetatif", "vegetatif"]], batas: [[5, 3], [3, 2], [1, 1], [0, 0]] },
    { key: "alamiah", label: "Penyebaran jarak jauh (lebih dari 100 m) secara alamiah", pendek: "Penyebaran Alamiah", sub: [["burung", "oleh burung", "sebar"], ["hewan", "oleh hewan lain", "sebar"], ["air", "oleh air", "sebar"], ["angin", "oleh angin", "sebar"]], batas: [[6, 3], [3, 2], [1, 1], [0, 0]] },
    { key: "manusia", label: "Penyebaran jarak jauh oleh manusia", pendek: "Penyebaran oleh Manusia", sub: [["sengaja", "penyebaran sengaja", "sebar"], ["tanpaSengaja", "penyebaran tanpa sengaja", "sebar"], ["kontaminasi", "mengontaminasi hasil bumi", "sebar"], ["ternak", "dibawa hewan ternak", "sebar"]], batas: [[6, 3], [3, 2], [1, 1], [0, 0]] }
  ];
  const INV_LABEL = { 0: "Rendah", 1: "Medium rendah", 2: "Medium tinggi", 3: "Tinggi" }, INV_LABEL12 = ["Rendah", "Medium", "Tinggi", "Sangat tinggi"];
  const skorJawab = (v, peta, maks) => {
    const s = str(v).toLowerCase();
    if (!s || s === "tidak tahu" || s === "?") return { s: 0, ragu: true };
    if (s in peta) return { s: peta[s], ragu: false };
    const nn = toN(v);
    return fin(nn) ? { s: Math.max(0, Math.min(maks, nn)), ragu: false } : { s: 0, ragu: true };
  };
  M.keinvasifan = {
    judul: "Tingkat Keinvasifan Jenis",
    FAKTOR: INV_FAKTOR,
    hitung(inp) {
      const baris = (inp.rows || []).filter((r) => str(r.nama) || str(r.latin)).map((r) => {
        const f = INV_FAKTOR.map((fk) => {
          if (!fk.sub) { const j = skorJawab(r[fk.key], INV_PETA.tingkat, 3); return { skor: j.s, ragu: j.ragu, label: INV_LABEL12[j.s] }; }
          const js = fk.sub.map(([key, , peta]) => skorJawab(r[key], INV_PETA[peta], 2));
          const jumlah = sum(js.map((j) => j.s)), skor = (fk.batas.find(([b]) => jumlah >= b) || [0, 0])[1];
          return { skor, ragu: js.some((j) => j.ragu), jumlah, label: INV_LABEL[skor], subSkor: js.map((j) => j.s) };
        });
        const total = sum(f.map((x) => x.skor));
        return { ...r, f, total, K: Math.round((total / 15) * 100) / 10, ragu: f.some((x) => x.ragu) };
      }).sort((a, b) => b.total - a.total);
      const rata = INV_FAKTOR.map((fk, i) => ({ label: fk.label, mean: baris.length ? mean(baris.map((b) => b.f[i].skor)) : 0 }));
      return { kosong: !baris.length, baris, rata };
    },
    narMetode(c) { return `Tingkat keinvasifan setiap jenis tumbuhan asing invasif dinilai dengan lima faktor menurut Modul Analisis Risiko Spesies Asing Invasif (Post Border) (FORIS Indonesia dan Puslitbang Hutan, 2016), yaitu kemampuan mapan di antara tumbuhan asli, ketahanan terhadap praktik pengelolaan, kemampuan reproduksi, penyebaran jarak jauh (lebih dari 100 m) secara alamiah, dan penyebaran jarak jauh oleh manusia. Setiap faktor diberi skor 0 sampai 3, lalu skor kelima faktor dijumlahkan dan dikonversi menjadi nilai keinvasifan berskala 0 sampai 10:`; },
    metode(c) {
      const lv = c.lv;
      return [ket([["Faktor 1 dan 2", "rendah = 0; medium = 1; tinggi = 2; sangat tinggi = 3"],
        ["Faktor 3 (reproduksi)", "jumlah skor periode berbuah (1 tahun = 2; 2 sampai 3 tahun = 1; lebih dari 3 tahun = 0), produksi biji (banyak = 2; sedikit = 1; tidak ada = 0), dan reproduksi vegetatif (cepat = 2; lambat = 1; tidak ada = 0). Jumlah 5 sampai 6 = 3 (tinggi); 3 sampai 4 = 2 (medium tinggi); 1 sampai 2 = 1 (medium rendah); 0 = 0 (rendah)"],
        ["Faktor 4 dan 5 (penyebaran)", "jumlah skor empat subfaktor, yaitu penyebaran oleh burung, hewan lain, air, dan angin (faktor 4) atau penyebaran sengaja, tanpa sengaja, kontaminasi hasil bumi, dan hewan ternak (faktor 5), masing-masing umum = 2; kadang-kadang = 1; mungkin tidak = 0. Jumlah 6 sampai 8 = 3 (tinggi); 3 sampai 5 = 2 (medium tinggi); 1 sampai 2 = 1 (medium rendah); 0 = 0 (rendah)"]], lv, "Skor faktor:"),
        blk([R("K = "), F(Sum(Sub("s", "j")), "15"), R(" × 10")], lv),
        ket([["K", "nilai keinvasifan (0 sampai 10)"], [Sub("s", "j"), "skor faktor keinvasifan ke-j (j = 1 sampai 5)"], ["15", "jumlah skor maksimal lima faktor"]], lv),
        para("Jawaban tidak tahu diberi skor 0 dan faktornya ditandai (?) pada tabel hasil. Nilai keinvasifan merupakan satu dari tiga komponen analisis risiko jenis invasif bersama dampak (D) dan potensi distribusi (PD), dengan Risiko = K × D × PD; komponen dampak dan potensi distribusi dinilai tersendiri.", lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada penilaian keinvasifan ${c.objek}.`;
      const nmB = (b) => `${b.nama || b.latin}${b.nama && b.latin && b.nama !== b.latin ? ` (${b.latin})` : ""}`;
      const top = r.baris.filter((b) => b.total === r.baris[0].total), lain = r.baris.filter((b) => b.total !== r.baris[0].total);
      const fTop = [...r.rata].sort((a, b) => b.mean - a.mean)[0], ragu = r.baris.filter((b) => b.ragu);
      return `Dari ${nTxt(r.baris.length)} jenis yang dinilai, nilai keinvasifan tertinggi dimiliki ${daftarKata(top.map(nmB))} dengan jumlah skor ${r.baris[0].total} dari 15 (K = ${num(r.baris[0].K, 1)}).${lain.length ? ` Jenis lainnya berturut-turut ${daftarKata(lain.slice(0, 6).map((b) => `${b.nama || b.latin} (K = ${num(b.K, 1)})`))}${lain.length > 6 ? ", dan seterusnya" : ""}.` : ""} Faktor dengan skor rata-rata tertinggi adalah ${fTop.label.toLowerCase()} (${num(fTop.mean, 1)} dari 3).${ragu.length ? ` Sebanyak ${nTxt(ragu.length)} jenis memiliki faktor yang dijawab tidak tahu atau belum dinilai, sehingga nilainya masih dapat bertambah.` : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const b = r.baris[0], lv = c.lv, out = [para(`Contoh perhitungan untuk ${esc(b.nama || b.latin)}:`, lv)];
      INV_FAKTOR.forEach((fk, i) => { if (fk.sub) out.push(blk([R(`${fk.pendek}: ${b.f[i].subSkor.map((s) => num(s)).join(" + ")} = ${num(b.f[i].jumlah)}, skor ${num(b.f[i].skor)}`)], lv)); });
      out.push(blk([R("K = "), F(b.f.map((x) => num(x.skor)).join(" + "), "15"), R(` × 10 = ${num(b.K, 1)}`)], lv));
      return out.join("");
    },
    spec(r) {
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", ...INV_FAKTOR.map((x) => x.pendek), "Jumlah Skor", "Nilai Keinvasifan (K)"],
        rows: r.baris.map((b, i) => [k(i + 1), t(esc(b.nama || "-")), t(sci(b.latin)), ...b.f.map((x) => k(`${x.skor}${x.ragu ? " ?" : ""}`)), n(b.total, 0), n(b.K, 1)]) };
    },
    rinci(r) {
      const cols = INV_FAKTOR.flatMap((fk) => (fk.sub ? fk.sub.map(([key, label]) => ({ key, label })) : [{ key: fk.key, label: fk.pendek }]));
      return { head: ["No", "Nama Jenis", ...cols.map((x) => L.judul(x.label))], rows: r.baris.map((b, i) => [k(i + 1), t(esc(b.nama || b.latin)), ...cols.map((x) => k(esc(str(b[x.key]) || "-")))]) };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: c.opt.cap || `Skor Keinvasifan ${L.judul(c.objek)}`, spec: this.spec(r), catatan: r.baris.some((b) => b.ragu) ? "? = memuat jawaban tidak tahu atau belum dinilai (diberi skor 0)" : "" }]; },
    lampiran(r, c) { return r.kosong ? [] : [{ cap: `Rincian Penilaian Keinvasifan ${L.judul(c.objek)}`, spec: this.rinci(r) }]; },
    simpulan(r) { return r.kosong ? "" : `Nilai keinvasifan tertinggi dimiliki ${daftarKata(r.baris.filter((b) => b.total === r.baris[0].total).map((b) => b.nama || b.latin))} (jumlah skor ${r.baris[0].total} dari 15, K = ${num(r.baris[0].K, 1)})`; },
    kpi(r) { return r.kosong ? [] : [[num(r.baris[0].K, 1), "nilai keinvasifan tertinggi"]]; }
  };

  /* =====================================================================
   * 20. Intensitas sampling dan jumlah petak contoh (Soerianegara dan Indrawan, 1978)
   * inp: { panjang (m), lebar (m), luasHa (menggantikan panjang × lebar bila diisi), luasPetak (m²), IS (%), nPetak (petak yang diukur) }
   * n = A/a × IS ; IS aktual = n × a / A × 100%
   * ===================================================================== */
  M.sampling = {
    judul: "Intensitas Sampling",
    hitung(inp) {
      const p = nOr(inp.panjang, 0), l = nOr(inp.lebar, 0), A = nOr(inp.luasHa, 0) * 10000 || p * l;
      const a = nOr(inp.luasPetak, 0), IS = nOr(inp.IS, 0), nA = nOr(inp.nPetak, 0);
      return { kosong: !A || !a, A, a, IS, p, l, dariLuas: !!nOr(inp.luasHa, 0), nRencana: A && a && IS ? Math.ceil(Math.round((A / a) * (IS / 100) * 1e6) / 1e6) : null, nA, ISaktual: A && a && nA ? ((nA * a) / A) * 100 : null };
    },
    narMetode() { return "Jumlah petak contoh ditentukan dari luas populasi dan intensitas sampling. Soerianegara dan Indrawan (1978) menyarankan intensitas sampling 2% untuk luas 1.000 ha atau lebih dan 5 sampai 10% untuk luas kurang dari 1.000 ha:"; },
    metode(c, r) {
      const lv = c.lv, out = [blk([R("n = "), F("A", "a"), R(" × IS")], lv), blk([R("IS aktual = "), F("n × a", "A"), R(" × 100%")], lv),
        ket([["n", "jumlah petak contoh"], ["A", "luas populasi (m²); untuk jalur pengamatan, A = panjang jalur × lebar jalur"], ["a", "luas satu petak contoh (m²)"], ["IS", "intensitas sampling"]], lv)];
      if (r && !r.kosong && r.nRencana) out.push(para(`Rencana: A = ${r.dariLuas ? `${numL(r.A / 10000)} ha = ${numL(r.A)} m²` : `${numL(r.p)} m × ${numL(r.l)} m = ${numL(r.A)} m²`}; a = ${numL(r.a)} m²; IS = ${numL(r.IS)}%; n = ${numL(r.A)}/${numL(r.a)} × ${numL(r.IS / 100, 4)} = ${r.nRencana} petak contoh.`, lv));
      return out.join("");
    },
    narHasil(r) {
      if (r.kosong) return "Luas populasi atau luas petak belum diisi, sehingga intensitas sampling belum dihitung.";
      const luas = r.dariLuas ? `${numL(r.A / 10000)} ha` : `${numL(r.A)} m² (panjang ${numL(r.p)} m × lebar ${numL(r.l)} m)`;
      return `Luas populasi yang diwakili adalah ${luas}.${r.nRencana ? ` Dengan intensitas sampling ${numL(r.IS)}% diperlukan ${r.nRencana} petak contoh berukuran ${numL(r.a)} m².` : ""}${r.ISaktual !== null ? ` Jumlah petak yang diukur ${r.nA} petak, sehingga intensitas sampling aktual ${numL(r.ISaktual, 2)}%.` : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv, out = [];
      if (r.nRencana) out.push(blk([R("n = "), F(numL(r.A), numL(r.a)), R(` × ${numL(r.IS / 100, 4)} = ${r.nRencana} petak`)], lv));
      if (r.ISaktual !== null) out.push(blk([R("IS aktual = "), F(`${r.nA} × ${numL(r.a)}`, numL(r.A)), R(` × 100% = ${numL(r.ISaktual, 2)}%`)], lv));
      return out.join("");
    },
    tabel() { return []; },
    simpulan() { return ""; },
    kpi(r) { return r.kosong || r.ISaktual === null ? [] : [[`${numL(r.ISaktual, 1)}%`, "intensitas sampling"]]; }
  };

  /* =====================================================================
   * 21. Deskripsi jenis: uraian habitat dan morfologi, status, endemisitas, dan nilai ekonomi per jenis
   * (bagian "Deskripsi Jenis Tumbuhan Penting" pada LPK 2020)
   * inp: { rows: [{ jenis, latin, famili, deskripsi, atribut: [[label, nilai]] }] }
   * ===================================================================== */
  M.deskripsi = {
    judul: "Deskripsi Jenis",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => str(r.jenis) || str(r.latin));
      return { kosong: !rows.some((r) => str(r.deskripsi)), rows };
    },
    narMetode(c) { return `Setiap jenis ${c.objek} dideskripsikan habitat dan morfologinya dari pengamatan lapangan dan literatur, lalu dilengkapi status konservasi, endemisitas, dan nilai ekonominya.`; },
    metode() { return ""; },
    narHasil(r, c) {
      if (r.kosong) return `Deskripsi jenis ${c.objek} belum diisi.`;
      const titik = (s) => (/[.!?]$/.test(s) ? s : `${s}.`);
      return [`Ciri morfologi, habitat, status konservasi, endemisitas, dan nilai ekonomi setiap jenis ${c.objek} diuraikan sebagai berikut.`,
        ...r.rows.map((b, i) => {
          const at = (b.atribut || []).filter(([, v]) => str(v)).map(([lab, v]) => `${lab}: ${str(v)}`);
          return `${i + 1}. ${nm(b)}${str(b.famili) ? `, famili ${str(b.famili)}` : ""}.${str(b.deskripsi) ? ` ${titik(str(b.deskripsi))}` : ""}${at.length ? ` ${titik(L.cap1(at.join("; ")))}` : ""}`;
        })].join("\n");
    },
    hitungHtml() { return ""; },
    tabel() { return []; },
    simpulan() { return ""; },
    kpi() { return []; }
  };

  /* =====================================================================
   * 22. Perkiraan jumlah individu per jenis dan lokasi dari perjumpaan langsung dan tanda keberadaan
   * (analisis deskriptif berdasarkan lokasi perjumpaan, LPK monitoring satwa kunci)
   * inp: { rows: [{ jenis, latin, unit, langsung, taksir, tipe, ketinggian, habitat }] }
   * N = N_L + N_T
   * ===================================================================== */
  M.perkiraan = {
    judul: "Perkiraan Jumlah Individu dan Sebaran",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => str(r.jenis) || str(r.latin));
      const m = new Map(), units = [];
      rows.forEach((r) => {
        const kk = M.util.kunci(r.latin || r.jenis), u = str(r.unit) || "-";
        if (!m.has(kk)) m.set(kk, { jenis: str(r.jenis) || str(r.latin), latin: str(r.latin), NL: 0, NT: 0, tl: 0, tt: 0, unit: new Map(), tipe: new Map(), alt: [], habitat: new Set() });
        const o = m.get(kk), L_ = nOr(r.langsung, 0), T_ = nOr(r.taksir, 0);
        if (!o.latin && str(r.latin)) o.latin = str(r.latin);
        if (!units.includes(u)) units.push(u);
        if (!o.unit.has(u)) o.unit.set(u, { NL: 0, NT: 0 });
        o.unit.get(u).NL += L_; o.unit.get(u).NT += T_;
        o.NL += L_; o.NT += T_;
        if (r.langsung !== undefined && str(r.langsung) !== "") o.tl++; else o.tt++;
        if (str(r.tipe)) o.tipe.set(str(r.tipe), (o.tipe.get(str(r.tipe)) || 0) + 1);
        if (nOr(r.ketinggian, 0) > 0) o.alt.push(nOr(r.ketinggian, 0));
        if (str(r.habitat)) o.habitat.add(str(r.habitat));
      });
      const jenis = [...m.values()].map((o) => ({ ...o, N: o.NL + o.NT, titik: o.tl + o.tt })).sort((a, b) => b.N - a.N || b.titik - a.titik);
      return { kosong: !rows.length, jenis, units, NL: sum(jenis.map((j) => j.NL)), NT: sum(jenis.map((j) => j.NT)), N: sum(jenis.map((j) => j.N)) };
    },
    narMetode(c) { return `Data ${c.objek} direkapitulasi berdasarkan jenis dan lokasi perjumpaan, lalu dianalisis secara deskriptif. Jumlah individu dari perjumpaan langsung adalah individu yang terlihat. Jumlah individu dari tanda keberadaan diperkirakan dari ukuran, arah, dan kebaruan tanda; jejak dengan ukuran atau arah berbeda pada lokasi yang sama dianggap individu berbeda. Onggokan kotoran tidak dipakai untuk memperkirakan jumlah individu karena dapat berasal dari individu yang sama. Perkiraan jumlah individu setiap jenis:`; },
    metode(c) {
      const lv = c.lv;
      return [blk([R("N = "), Sub("N", "L"), R(" + "), Sub("N", "T")], lv), ket([["N", "perkiraan jumlah individu satu jenis (ekor)"], [Sub("N", "L"), "jumlah individu dari perjumpaan langsung"], [Sub("N", "T"), "perkiraan jumlah individu dari tanda keberadaan"]], lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data temuan ${c.objek}.`;
      const kal = r.jenis.map((j) => {
        const u = [...j.unit.keys()].filter((x) => x !== "-"), alt = j.alt.length ? (Math.min(...j.alt) === Math.max(...j.alt) ? `${num(j.alt[0])} mdpl` : `${num(Math.min(...j.alt))} sampai ${num(Math.max(...j.alt))} mdpl`) : "";
        const rinci = j.NL && j.NT ? ` (${j.NL} dari perjumpaan langsung dan ${j.NT} dari tanda keberadaan)` : j.NL ? " dari perjumpaan langsung" : j.NT ? " dari tanda keberadaan" : "";
        const tanda = [...j.tipe.entries()].sort((a, b) => b[1] - a[1]).map(([k_]) => k_.toLowerCase());
        return `${L.cap1(nm(j))} ${j.N ? `diperkirakan sebanyak ${j.N} individu${rinci}` : `tercatat dari ${j.titik} temuan tanpa perkiraan jumlah individu`}${u.length ? ` di ${daftarKata(u)}` : ""}${alt ? ` pada ketinggian ${alt}` : ""}${j.habitat.size ? ` (${daftarKata([...j.habitat].map((h) => h.toLowerCase()))})` : ""}.${tanda.length ? ` Temuan berupa ${daftarKata(tanda)}.` : ""}`;
      });
      return [`Sebanyak ${nTxt(r.jenis.length)} jenis ${c.objek} terdeteksi, yaitu ${daftarKata(r.jenis.map(nm))}.`, ...kal].join(" ");
    },
    hitungHtml(r, c) {
      if (r.kosong || !r.jenis[0].NL || !r.jenis[0].NT) return "";
      const j = r.jenis[0];
      return blk([R(`N ${nm(j)} = `), R(`${j.NL} + ${j.NT} = ${j.N} individu`)], c.lv);
    },
    spec(r) {
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Perjumpaan Langsung (individu)", "Tanda Keberadaan (perkiraan individu)", "Perkiraan Jumlah (individu)", "Jumlah Temuan", "Lokasi"],
        rows: r.jenis.map((j, i) => [k(i + 1), t(esc(j.jenis)), t(sci(j.latin)), n(j.NL, 0), n(j.NT, 0), n(j.N, 0), n(j.titik, 0), t(esc([...j.unit.keys()].filter((x) => x !== "-").join(", ") || "-"))]),
        total: [[{ t: "Jumlah", cs: 3 }, n(r.NL, 0), n(r.NT, 0), n(r.N, 0), n(sum(r.jenis.map((j) => j.titik)), 0), t("")]] };
    },
    specUnit(r) {
      const U = r.units;
      return { head: ["No", "Nama Jenis", ...U.map((u) => (u === "-" ? "Tanpa lokasi" : u)), "Jumlah"],
        rows: r.jenis.map((j, i) => [k(i + 1), t(esc(nm(j))), ...U.map((u) => { const x = j.unit.get(u); return x ? k(x.NL && x.NT ? `${x.NL + x.NT} (${x.NL} + ${x.NT})` : String(x.NL + x.NT)) : k("-"); }), n(j.N, 0)]) };
    },
    tabel(r, c) {
      if (r.kosong) return [];
      const out = [{ cap: `Rekapitulasi Perkiraan Jumlah Individu ${L.judul(c.objek)}`, spec: this.spec(r) }];
      if (r.units.filter((u) => u !== "-").length > 1) out.push({ cap: `Perkiraan Jumlah Individu ${L.judul(c.objek)} per Lokasi`, spec: this.specUnit(r), catatan: "Angka dalam kurung: perjumpaan langsung + perkiraan dari tanda keberadaan." });
      return out;
    },
    simpulan(r, c) {
      if (r.kosong) return "";
      return r.jenis.map((j) => `${L.cap1(nm(j))} ${j.N ? `diperkirakan sebanyak ${j.N} individu${j.NL && j.NT ? `, ${j.NL} dari perjumpaan langsung dan ${j.NT} melalui tanda keberadaan` : ""}` : "terdeteksi melalui tanda keberadaan"}${j.unit.size && [...j.unit.keys()].some((x) => x !== "-") ? ` di ${daftarKata([...j.unit.keys()].filter((x) => x !== "-"))}` : ""}`).join("; ");
    },
    kpi(r) { return r.kosong ? [] : [[r.jenis.length, "jenis terdeteksi"], [r.N, "perkiraan individu"]]; }
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
      // Perbandingan dengan survei sebelumnya pada pohon yang sama (kolom sarangLalu diisi, termasuk 0)
      const banding = rows.filter((r) => str(r.sarangLalu) !== "" && fin(toN(r.sarangLalu))).map((r, i) => ({ no: i + 1, kode: str(r.kode), lokasi: str(r.lokasi), jenis: str(r.jenis) || str(r.latin), latin: str(r.latin), lalu: toN(r.sarangLalu), kini: nOr(r.jumlahSarang, 0) }));
      const bd = banding.length ? { rows: banding, lalu: sum(banding.map((b) => b.lalu)), kini: sum(banding.map((b) => b.kini)), naik: banding.filter((b) => b.lalu > 0 && b.kini > b.lalu).length, baru: banding.filter((b) => b.lalu === 0 && b.kini > 0).length, turun: banding.filter((b) => b.kini > 0 && b.kini < b.lalu).length, hilang: banding.filter((b) => b.lalu > 0 && b.kini === 0).length, tetap: banding.filter((b) => b.kini === b.lalu).length } : null;
      return { kosong: !tot, baris: g, pohon: tot, sarang: sar, rata: tot ? sar / tot : 0, tinggi: h.length ? { mean: mean(h), min: Math.min(...h), max: Math.max(...h) } : null, jarakAir: ja.length ? { mean: mean(ja), min: Math.min(...ja), max: Math.max(...ja) } : null, lokasi: [...new Set(rows.map((r) => str(r.lokasi)).filter(Boolean))], kosongSarang: rows.filter((r) => nOr(r.jumlahSarang, 0) === 0).length, banding: bd };
    },
    narMetode(c) { return `Data pohon sarang ${c.objek} dianalisis secara deskriptif: jenis pohon yang digunakan, jumlah sarang, tinggi sarang, dan jarak pohon sarang ke sumber air.${c.opt.banding ? ` Jumlah sarang pada setiap pohon dibandingkan dengan hasil survei ${c.opt.tahunLalu ? `tahun ${c.opt.tahunLalu}` : "sebelumnya"} pada pohon yang sama.` : ""} Rata-rata dan persentase dihitung dengan persamaan:`; },
    metode(c) {
      const lv = c.lv, bd = !!c.opt.banding;
      return [blk([R("x̄ = "), F(Sum(Sub("x", "i")), "n")], lv), blk([R("P = "), F("x", "y"), R(" × 100%")], lv),
        ...(bd ? [blk([R("Δ"), Sub("S", "j"), R(" = "), Sub("S", "j,t"), R(" − "), Sub("S", "j,0")], lv)] : []),
        ket([["x̄", "rata-rata (jumlah sarang per pohon, tinggi sarang, atau jarak ke sumber air)"], [Sub("x", "i"), "nilai pada pohon sarang ke-i"], ["n", "jumlah pohon sarang"], ["P", "persentase pohon sarang suatu jenis pohon (%)"], ["x", "jumlah pohon sarang jenis tersebut"], ["y", "jumlah seluruh pohon sarang"],
          ...(bd ? [[["Δ", Sub("S", "j")], "perubahan jumlah sarang pada pohon ke-j"], [Sub("S", "j,t"), `jumlah sarang pada pohon ke-j saat survei ${esc(c.opt.tahunKini || "ini")}`], [Sub("S", "j,0"), `jumlah sarang pada pohon ke-j pada survei ${esc(c.opt.tahunLalu || "sebelumnya")}`]] : [])], lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data pohon sarang ${c.objek}.`;
      const tg = r.tinggi, ja = r.jarakAir;
      return `Ditemukan ${nTxt(r.pohon)} pohon sarang dengan ${r.sarang} sarang ${c.objek}${r.pohon > 1 ? ` (rata-rata ${num(r.rata, 2)} sarang per pohon)` : ""}${r.lokasi.length ? ` di ${daftarKata(r.lokasi)}` : ""}.${this.jenisKalimat(r)}${tg ? ` Tinggi sarang ${tg.min === tg.max ? `${num(tg.min, 1)} m` : `berkisar ${num(tg.min, 1)}–${num(tg.max, 1)} m dengan rata-rata ${num(tg.mean, 1)} m`}.` : ""}${ja ? ` Jarak pohon sarang ke sumber air ${ja.min === ja.max ? `${num(ja.min, 0)} m` : `rata-rata ${num(ja.mean, 0)} m (${num(ja.min, 0)}–${num(ja.max, 0)} m)`}.` : ""}${r.banding ? ` ${this.bandingKalimat(r, c)}` : r.kosongSarang ? ` Sebanyak ${nTxt(r.kosongSarang)} pohon tidak lagi memiliki sarang saat diamati.` : ""}`;
    },
    jenisKalimat(r) {
      const jt = (b) => `${nm(b)} sebanyak ${b.pohon} pohon (${num(b.persen, 1)}%)`, j = r.baris.length;
      if (r.pohon === 1) return ` Pohon sarang tersebut adalah ${nm(r.baris[0])}.`;
      if (j === 1) return ` Seluruh pohon sarang adalah ${nm(r.baris[0])}.`;
      return j <= 4 ? ` Pohon sarang terdiri atas ${nTxt(j)} jenis, yaitu ${daftarKata(r.baris.map(jt))}.` : ` Pohon sarang terdiri atas ${nTxt(j)} jenis; yang paling banyak digunakan adalah ${daftarKata(r.baris.slice(0, 3).map(jt))}.`;
    },
    bandingKalimat(r, c) {
      const b = r.banding, rinci = [b.naik && `${b.naik} pohon bertambah`, b.baru && `${b.baru} pohon baru bersarang`, b.turun && `${b.turun} pohon berkurang`, b.hilang && `${b.hilang} pohon tidak lagi bersarang`, b.tetap && `${b.tetap} pohon tetap`].filter(Boolean);
      return `Dibandingkan survei ${c.opt.tahunLalu ? `tahun ${c.opt.tahunLalu}` : "sebelumnya"} pada ${nTxt(b.rows.length)} pohon yang sama, jumlah sarang ${b.kini === b.lalu ? `tetap ${b.kini}` : `${b.kini > b.lalu ? "bertambah" : "berkurang"} dari ${b.lalu} menjadi ${b.kini}`} sarang${rinci.length ? `: ${daftarKata(rinci)}` : ""}.`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const b = r.banding, d = b ? b.kini - b.lalu : 0;
      return blk([R("x̄ sarang = "), F(num(r.sarang), num(r.pohon)), R(` = ${num(r.rata, 2)} sarang/pohon`)], c.lv) +
        (b ? blk([R("ΣΔS = "), R(`${num(b.kini)} − ${num(b.lalu)} = ${d > 0 ? "+" : d < 0 ? "−" : ""}${num(Math.abs(d))} sarang (${num(b.rows.length)} pohon yang sama)`)], c.lv) : "");
    },
    spec(r) { return { head: ["No", "Jenis Pohon", "Nama Ilmiah", "Jumlah Pohon Sarang", "Persentase (%)", "Jumlah Sarang", "Rata-rata Tinggi Sarang (m)"], rows: r.baris.map((b, i) => [k(i + 1), t(esc(b.jenis)), t(sci(b.latin)), n(b.pohon, 0), n(b.persen, 2), n(b.sarang, 0), b.tinggi === null ? k("-") : n(b.tinggi, 1)]), total: [[{ t: "Jumlah", cs: 3 }, n(r.pohon, 0), n(100, 2), n(r.sarang, 0), r.tinggi ? n(r.tinggi.mean, 1) : k("-")]] }; },
    specBanding(r, c) {
      const b = r.banding, th = (x, d) => (x ? `Jumlah Sarang ${x}` : d);
      return { head: ["No", "Kode/Lokasi", "Jenis Pohon", th(c.opt.tahunLalu, "Jumlah Sarang Sebelumnya"), th(c.opt.tahunKini, "Jumlah Sarang Saat Ini"), "Perubahan"],
        rows: b.rows.map((x, i) => [k(i + 1), t(esc([x.kode, x.lokasi].filter(Boolean).join(", ") || "-")), t(esc(nm(x))), n(x.lalu, 0), n(x.kini, 0), k(x.kini === x.lalu ? "0" : `${x.kini > x.lalu ? "+" : "−"}${num(Math.abs(x.kini - x.lalu))}`)]),
        total: [[{ t: "Jumlah", cs: 3 }, n(b.lalu, 0), n(b.kini, 0), k(b.kini === b.lalu ? "0" : `${b.kini > b.lalu ? "+" : "−"}${num(Math.abs(b.kini - b.lalu))}`)]] };
    },
    tabel(r, c) {
      if (r.kosong) return [];
      const out = [{ cap: `Jenis Pohon Sarang ${L.judul(c.objek)}`, spec: this.spec(r) }];
      if (r.banding) out.push({ cap: `Perbandingan Jumlah Sarang ${L.judul(c.objek)} per Pohon`, spec: this.specBanding(r, c) });
      return out;
    },
    simpulan(r, c) { return r.kosong ? "" : `Ditemukan ${r.pohon} pohon sarang ${c.objek} dengan ${r.sarang} sarang; jenis pohon yang paling banyak digunakan adalah ${nm(r.baris[0])}${r.banding && r.banding.kini !== r.banding.lalu ? `; dibandingkan survei ${c.opt.tahunLalu ? `tahun ${c.opt.tahunLalu}` : "sebelumnya"}, jumlah sarang pada pohon yang sama ${r.banding.kini > r.banding.lalu ? "bertambah" : "berkurang"} dari ${r.banding.lalu} menjadi ${r.banding.kini}` : ""}`; },
    kpi(r) { return r.kosong ? [] : [[r.pohon, "pohon sarang"], [r.sarang, "sarang"]]; }
  };

  /* =====================================================================
   * 24. Rekapitulasi perjumpaan lintas tahun: jumlah catatan, lokasi, individu minimum, dan sarang
   * (rekap perjumpaan elang flores seluruh kawasan dari monitoring, inventarisasi, patroli, dan laporan)
   * inp: { rows: [{ tahun, unit, n, langsung }], sarang: [{ tahun, kode, aktif }] }
   * N_min,t = Σ_j maks_i n_ij,t   (perjumpaan berulang di satu lokasi tidak dijumlahkan)
   * ===================================================================== */
  M.rekap = {
    judul: "Rekapitulasi Perjumpaan",
    hitung(inp) {
      const rows = (inp.rows || []).filter((r) => str(r.tahun));
      const sar = (inp.sarang || []).filter((s) => str(s.tahun));
      const tahun = [...new Set([...rows, ...sar].map((r) => str(r.tahun)))].sort();
      const units = [...new Set(rows.map((r) => str(r.unit) || "-"))].sort((a, b) => (a === "-") - (b === "-") || a.localeCompare(b));
      const sel = new Map(), kunci = (u, th) => `${u}|${th}`;
      rows.forEach((r) => {
        const kk = kunci(str(r.unit) || "-", str(r.tahun));
        if (!sel.has(kk)) sel.set(kk, { maks: 0, catatan: 0 });
        const o = sel.get(kk);
        o.catatan++;
        if (r.langsung !== false) o.maks = Math.max(o.maks, nOr(r.n, 0));
      });
      const perTahun = tahun.map((th) => {
        const rr = rows.filter((r) => str(r.tahun) === th), u = units.filter((x) => sel.has(kunci(x, th)));
        const ns = new Map();
        sar.filter((s) => str(s.tahun) === th).forEach((s, i) => { const kk = str(s.kode) || `#${i}`; ns.set(kk, ns.get(kk) || !!s.aktif); });
        return { tahun: th, catatan: rr.length, lokasi: u.filter((x) => x !== "-").length, Nmin: sum(u.map((x) => sel.get(kunci(x, th)).maks)), sarang: ns.size, aktif: [...ns.values()].filter(Boolean).length };
      });
      const perUnit = units.map((u) => ({ unit: u, catatan: sum(tahun.map((th) => (sel.get(kunci(u, th)) || { catatan: 0 }).catatan)), sel: tahun.map((th) => sel.get(kunci(u, th)) || null) }));
      const puncak = perTahun.filter((p) => p.catatan).sort((a, b) => b.Nmin - a.Nmin || b.tahun.localeCompare(a.tahun))[0] || null;
      return { kosong: !rows.length && !sar.length, tahun, units, perTahun, perUnit, catatan: rows.length, adaSarang: sar.length > 0, puncak };
    },
    narMetode(c) {
      const u = c.opt.unitLabel || "lokasi";
      return `Seluruh catatan perjumpaan ${c.objek} dari kegiatan monitoring, inventarisasi, patroli, dan laporan direkapitulasi menurut ${u} dan tahun. Satu individu dapat terlihat lebih dari sekali di ${u} yang sama, sehingga jumlah individu di setiap ${u} pada satu tahun diambil dari jumlah terbanyak yang terlihat sekaligus dalam satu perjumpaan, bukan jumlah seluruh catatan. Jumlah individu minimum dalam satu tahun adalah jumlah dari nilai terbanyak tersebut di seluruh ${u}:`;
    },
    metode(c) {
      const lv = c.lv, u = c.opt.unitLabel || "lokasi";
      return [blk([Sub("N", "min,t"), R(" = "), Sum([R("maks "), Sub("n", "ij,t")])], lv),
        ket([[Sub("N", "min,t"), `jumlah individu minimum ${esc(c.objek)} pada tahun t`], [Sub("n", "ij,t"), `jumlah individu yang terlihat pada perjumpaan ke-i di ${esc(u)} ke-j pada tahun t`], ["maks", `nilai terbanyak dari seluruh perjumpaan di satu ${esc(u)}`]], lv),
        para("Catatan berupa suara, jejak, atau sarang tanpa individu yang terlihat ikut dihitung sebagai catatan dan lokasi, tetapi tidak menambah jumlah individu minimum.", lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada catatan perjumpaan ${c.objek}.`;
      const u = c.opt.unitLabel || "lokasi", th = r.perTahun.filter((p) => p.catatan), awal = th[0], akhir = th[th.length - 1];
      const rentang = r.tahun.length > 1 ? `Selama ${r.tahun[0]} sampai ${r.tahun[r.tahun.length - 1]}` : `Pada tahun ${r.tahun[0]}`;
      const nU = r.units.filter((x) => x !== "-").length;
      const out = [`${rentang} tercatat ${nTxt(r.catatan)} perjumpaan ${c.objek}${nU ? ` di ${nTxt(nU)} ${u}` : ""}.`];
      if (th.length > 1) {
        out.push(`Jumlah individu minimum tertinggi tercatat pada tahun ${r.puncak.tahun} (${r.puncak.Nmin} individu).`);
        if (awal !== akhir) out.push(`Pada tahun ${akhir.tahun} jumlah individu minimum ${akhir.Nmin === awal.Nmin ? "sama dengan" : akhir.Nmin > awal.Nmin ? "lebih banyak daripada" : "lebih sedikit daripada"} tahun ${awal.tahun} (${akhir.Nmin} dan ${awal.Nmin} individu). Perbedaan ini juga dipengaruhi oleh banyaknya lokasi dan kegiatan pada setiap tahun, sehingga belum dapat dibaca langsung sebagai perubahan populasi.`);
      } else if (th.length === 1) out.push(`Jumlah individu minimum adalah ${th[0].Nmin} individu.`);
      if (r.adaSarang) { const s = r.perTahun.filter((p) => p.sarang); out.push(`Sarang yang diperiksa: ${s.map((p) => `${p.tahun} sebanyak ${p.sarang} sarang (${p.aktif} aktif)`).join("; ")}.`); }
      return out.join(" ");
    },
    hitungHtml(r, c) {
      if (r.kosong || !r.puncak) return "";
      const th = r.puncak.tahun, vals = r.perUnit.map((p) => p.sel[r.tahun.indexOf(th)]).filter((x) => x && x.maks);
      if (vals.length < 2) return "";
      return blk([Sub("N", `min,${th}`), R(` = ${vals.map((x) => x.maks).join(" + ")} = ${r.puncak.Nmin} individu`)], c.lv);
    },
    spec(r) {
      return { head: ["Tahun", "Jumlah Catatan", "Jumlah Lokasi", "Individu Minimum", ...(r.adaSarang ? ["Sarang Diperiksa", "Sarang Aktif"] : [])],
        rows: r.perTahun.map((p) => [k(p.tahun), n(p.catatan, 0), n(p.lokasi, 0), n(p.Nmin, 0), ...(r.adaSarang ? [n(p.sarang, 0), n(p.aktif, 0)] : [])]) };
    },
    specUnit(r, c) {
      return { head: ["No", L.judul(c.opt.unitLabel || "lokasi"), ...r.tahun, "Jumlah Catatan"],
        rows: r.perUnit.map((p, i) => [k(i + 1), t(esc(p.unit === "-" ? "Tanpa lokasi" : p.unit)), ...p.sel.map((x) => (x ? k(x.maks ? String(x.maks) : "0") : k("-"))), n(p.catatan, 0)]),
        total: [[{ t: "Individu minimum", cs: 2 }, ...r.perTahun.map((p) => n(p.Nmin, 0)), n(r.catatan, 0)]] };
    },
    tabel(r, c) {
      if (r.kosong) return [];
      const out = [{ cap: `Rekapitulasi Perjumpaan ${L.judul(c.objek)} per Tahun`, spec: this.spec(r) }];
      if (r.units.length > 1 || r.tahun.length > 1) out.push({ cap: `Jumlah Individu Terbanyak ${L.judul(c.objek)} per ${L.judul(c.opt.unitLabel || "lokasi")} dan Tahun`, spec: this.specUnit(r, c), catatan: "Angka adalah jumlah individu terbanyak dalam satu perjumpaan; 0 berarti hanya tercatat suara, jejak, atau sarang; tanda - berarti tidak ada catatan." });
      return out;
    },
    simpulan(r, c) {
      if (r.kosong) return "";
      const th = r.perTahun.filter((p) => p.catatan), nU = r.units.filter((x) => x !== "-").length;
      return `Tercatat ${nTxt(r.catatan)} perjumpaan ${c.objek}${nU ? ` di ${nU} ${c.opt.unitLabel || "lokasi"}` : ""}${th.length > 1 ? ` selama ${r.tahun[0]} sampai ${r.tahun[r.tahun.length - 1]}; jumlah individu minimum tertinggi ${r.puncak.Nmin} individu pada tahun ${r.puncak.tahun}` : th.length ? ` dengan jumlah individu minimum ${th[0].Nmin} individu` : ""}`;
    },
    kpi(r) { return r.kosong ? [] : [[r.catatan, "catatan perjumpaan"], ...(r.puncak ? [[r.puncak.Nmin, `individu minimum (${r.puncak.tahun})`]] : [])]; }
  };

  /* =====================================================================
   * 25. Karakteristik tipe ekosistem dari grid verifikasi kawasan bernilai kehati tinggi
   * inp: { grid: [{ kode, tipe, zona, ketinggian }], veg: [{ grid, petak, tingkat, jenis, latin, n, diameter }], satwa: [{ grid, jenis, latin }] }
   * opt: { kriteriaH, luas: { semai, pancang, tiang, pohon } (m²), sisiGrid (km) }
   * H′ tumbuhan per tipe ekosistem dihitung dari jumlah individu seluruh tingkat pertumbuhan;
   * jenis dominan adalah jenis dengan INP tertinggi pada tingkat tertinggi yang tercatat (pohon, tiang, pancang, semai)
   * ===================================================================== */
  const BELUM = "Belum ditentukan";
  const kritH = (h, k) => (ST.KRITERIA_H[k] || ST.KRITERIA_H.template).fn(h);
  M.ekosistem = {
    judul: "Karakteristik Tipe Ekosistem",
    hitung(inp, opt = {}) {
      const grid = (inp.grid || []).filter((g) => str(g.kode) || str(g.tipe));
      const tipeOf = (g) => str(g.tipe) || BELUM;
      const peta = new Map(grid.filter((g) => str(g.kode)).map((g) => [str(g.kode).toLowerCase(), tipeOf(g)]));
      const tipeDari = (r) => peta.get(str(r.grid).toLowerCase()) || "";
      const veg = (inp.veg || []).filter((r) => str(r.jenis) || str(r.latin)), sat = (inp.satwa || []).filter((r) => str(r.jenis) || str(r.latin));
      const luas = opt.luas || {}, normT = M.vegetasi.normT;
      const rows = [...new Set(grid.map(tipeOf))].map((tp) => {
        const gs = grid.filter((g) => tipeOf(g) === tp), v = veg.filter((r) => tipeDari(r) === tp), s = sat.filter((r) => tipeDari(r) === tp);
        const alt = gs.map((g) => toN(g.ketinggian)).filter((x) => fin(x) && x > 0);
        const pj = perJenis(v), sh = ST.shannon(pj.map((b) => b.n));
        const petak = new Set(v.map((r) => str(r.petak)).filter(Boolean));
        const tk = ["pohon", "tiang", "pancang", "semai", "tumbuhan bawah"].find((x) => v.some((r) => normT(r.tingkat) === x));
        let dom = null;
        if (tk) {
          const rr = v.filter((r) => normT(r.tingkat) === tk), P_ = new Set(rr.map((r) => str(r.petak)).filter(Boolean)).size || petak.size || 1;
          const lu = nOr(luas[tk] ?? luas[tk.replace(/ /g, "")], 0) || nOr(luas.semai, 4), pakaiD = tk === "pohon" || tk === "tiang";
          const jenis = perJenis(rr).map((b) => ({ jenis: b.jenis, latin: b.latin, n: b.n, p: new Set(b.rows.map((x) => str(x.petak)).filter(Boolean)).size || 1, lbds: sum(b.rows.map((x) => ST.lbds(toN(x.diameter)) * nOr(x.n, 1))) }));
          const vv = ST.vegetasi(jenis, P_, (P_ * lu) / 10000, pakaiD);
          if (vv.rows[0]) dom = { jenis: vv.rows[0].jenis, latin: vv.rows[0].latin, INP: vv.rows[0].INP, tingkat: tk };
        }
        return { tipe: tp, grid: gs.length, kode: gs.map((g) => str(g.kode)).filter(Boolean), alt: alt.length ? { min: Math.min(...alt), max: Math.max(...alt) } : null, zona: [...new Set(gs.map((g) => str(g.zona)).filter(Boolean))],
          petak: petak.size, S: pj.length, N: sh.N, H: pj.length > 1 ? sh.H : pj.length ? 0 : null, dom, satwa: new Set(s.map((r) => M.util.kunci(r.latin || r.jenis))).size };
      }).sort((a, b) => b.grid - a.grid || b.S - a.S);
      const lepas = veg.filter((r) => !tipeDari(r)).length + sat.filter((r) => !tipeDari(r)).length;
      return { kosong: !grid.length, rows, nGrid: grid.length, lepas, adaVeg: veg.length > 0, adaSatwa: sat.length > 0 };
    },
    narMetode(c) {
      const sg = nOr(c.opt.sisiGrid, 1);
      return `Karakteristik setiap tipe ekosistem disusun dari hasil verifikasi grid berukuran ${numL(sg)} km × ${numL(sg)} km: jumlah grid, rentang ketinggian, zona pengelolaan, jumlah jenis tumbuhan dan satwa yang tercatat, jenis tumbuhan dengan indeks nilai penting (INP) tertinggi, dan indeks keanekaragaman jenis tumbuhan Shannon-Wiener (H′) yang dihitung dari seluruh individu pada tipe ekosistem tersebut:`;
    },
    metode(c) {
      const lv = c.lv;
      return [blk([R("H′ = −"), Sum([Sub("p", "i"), R(" × ln "), Sub("p", "i")]), R(";  "), Sub("p", "i"), R(" = "), F(Sub("n", "i"), "N")], lv),
        ket([["H′", "indeks keanekaragaman jenis tumbuhan pada satu tipe ekosistem"], [Sub("n", "i"), "jumlah individu jenis ke-i pada seluruh petak contoh di tipe ekosistem tersebut"], ["N", "jumlah individu seluruh jenis pada tipe ekosistem tersebut"]], lv),
        para(`Kriteria keanekaragaman: ${esc((ST.KRITERIA_H[c.opt.kriteriaH] || ST.KRITERIA_H.template).label.replace(/H'/g, "H′"))}.`, lv)].join("");
    },
    altTxt: (a) => (!a ? "" : a.min === a.max ? `${numL(a.min, 0)} mdpl` : `${numL(a.min, 0)} sampai ${numL(a.max, 0)} mdpl`),
    narHasil(r, c) {
      if (r.kosong) return "Belum ada data grid verifikasi.";
      const kecilT = (s) => (s === BELUM ? "tipe yang belum ditentukan" : M.util.kecil(s));
      const tipe = r.rows.map((x) => `${kecilT(x.tipe)} ${x.grid} grid${x.alt ? ` (${this.altTxt(x.alt)})` : ""}`);
      const out = [`Grid verifikasi berjumlah ${nTxt(r.nGrid)} dan mencakup ${nTxt(r.rows.length)} tipe ekosistem, yaitu ${daftarKata(tipe)}.`];
      r.rows.filter((x) => x.S).forEach((x) => out.push(`Pada ${kecilT(x.tipe)} tercatat ${nTxt(x.S)} jenis tumbuhan${x.H !== null && x.S > 1 ? ` (H′ = ${num(x.H, 2)}, ${kritH(x.H, c.opt.kriteriaH).toLowerCase()})` : ""}${x.dom ? ` dengan jenis dominan ${nm(x.dom)} pada tingkat ${x.dom.tingkat} (INP ${num(x.dom.INP, 2)}%)` : ""}${x.satwa ? `, serta ${nTxt(x.satwa)} jenis satwa` : ""}.`));
      if (r.lepas) out.push(`Sebanyak ${nTxt(r.lepas)} baris data vegetasi atau satwa tidak memiliki kode grid yang cocok dengan tabel grid, sehingga tidak masuk ringkasan per tipe ekosistem.`);
      return out.join(" ");
    },
    hitungHtml(r, c) {
      const x = r.rows.find((y) => y.S > 1);
      if (!x) return "";
      return para(`Contoh perhitungan untuk ${esc(x.tipe === BELUM ? "tipe yang belum ditentukan" : x.tipe)}: ${nTxt(x.S)} jenis dengan ${num(x.N)} individu menghasilkan H′ = ${num(x.H, 2)} (${esc(kritH(x.H, c.opt.kriteriaH).toLowerCase())}).`, c.lv);
    },
    spec(r) {
      return { head: ["No", "Tipe Ekosistem", "Jumlah Grid", "Ketinggian (mdpl)", "Zona", "Jumlah Jenis Tumbuhan", "H′ Tumbuhan", "Jenis Dominan (INP %)", "Jumlah Jenis Satwa"],
        rows: r.rows.map((x, i) => [k(i + 1), t(esc(x.tipe)), n(x.grid, 0), k(esc(x.alt ? (x.alt.min === x.alt.max ? numL(x.alt.min, 0) : `${numL(x.alt.min, 0)}–${numL(x.alt.max, 0)}`) : "-")), t(esc(x.zona.join(", ") || "-")),
          r.adaVeg ? n(x.S, 0) : k("-"), x.H === null ? k("-") : n(x.H, 2), x.dom ? t(`${esc(x.dom.jenis)}${x.dom.latin && x.dom.latin.toLowerCase() !== x.dom.jenis.toLowerCase() ? ` (${sci(x.dom.latin)})` : ""}, ${esc(x.dom.tingkat)} (${num(x.dom.INP, 2)})`) : k("-"), r.adaSatwa ? n(x.satwa, 0) : k("-")]),
        total: [[{ t: "Jumlah grid", cs: 2 }, n(r.nGrid, 0), { t: "", cs: 6 }]] };
    },
    tabel(r) { return r.kosong ? [] : [{ cap: "Karakteristik Tipe Ekosistem pada Grid Verifikasi", spec: this.spec(r), catatan: "H′ dihitung dari seluruh individu tumbuhan pada tipe ekosistem tersebut; jenis dominan diambil dari tingkat pertumbuhan tertinggi yang tercatat." }]; },
    simpulan(r) {
      if (r.kosong) return "";
      const kecilT = (s) => (s === BELUM ? "tipe yang belum ditentukan" : M.util.kecil(s)), adaS = r.rows.filter((x) => x.S), top = adaS.slice().sort((a, b) => b.S - a.S)[0];
      return `Grid yang diverifikasi mencakup ${nTxt(r.rows.length)} tipe ekosistem, yaitu ${daftarKata(r.rows.map((x) => kecilT(x.tipe)))}${adaS.length > 1 && top ? `; jumlah jenis tumbuhan terbanyak tercatat pada ${kecilT(top.tipe)}, yaitu ${top.S} jenis` : ""}`;
    },
    kpi(r) { return r.kosong ? [] : [[r.rows.length, "tipe ekosistem"], [r.nGrid, "grid"]]; }
  };
})();
