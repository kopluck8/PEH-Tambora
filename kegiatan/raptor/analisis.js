/*
 * Analisis data Inventarisasi dan Sebaran Raptor (metode point count).
 * Mengikuti template "Analisa data.xlsx" dan LPK Resort Piong Juni 2021:
 * kepadatan populasi, keanekaragaman Shannon-Wiener, dominansi, dan indeks dispersi.
 * Berjalan di browser dan di Node (untuk uji).
 */
(function (root) {
  "use strict";
  const S = typeof module !== "undefined" && module.exports ? require("../../js/core/stats.js") : root.PEHStats;

  const num = (v) => { const n = parseFloat(String(v ?? "").replace(",", ".")); return Number.isFinite(n) ? n : 0; };
  const has = (v) => v !== undefined && v !== null && String(v).trim() !== "";
  const keyJenis = (r) => String(r.latin || r.jenis || "").trim().toLowerCase();

  /*
   * data = {
   *   n, r, pi,                       jumlah plot, jari-jari (m), nilai π (template 3,14)
   *   perjumpaan: [{ plot, jenis, latin, dewasa, anakan, jarak, ... }],
   *   urutanJenis: [{ jenis, latin }] (opsional, urutan baris tabel seperti di template)
   *   metodeID: "template" | "plot", kriteriaH: "template" | "krebs"
   * }
   */
  function analisis(data) {
    const n = Math.round(num(data.n)), r = num(data.r), pi = num(data.pi) || 3.14;
    const luas = S.luasPlotLingkaran(n, r, pi);
    const semua = (data.perjumpaan || []).filter((p) => has(p.jenis) || has(p.latin));
    // Perjumpaan di luar jari-jari plot dicatat tetapi tidak dihitung (seperti LPK 2021)
    const dalam = [], luar = [];
    for (const p of semua) {
      const ind = num(p.dewasa) + num(p.anakan);
      const rec = { ...p, individu: ind };
      if (has(p.jarak) && r && num(p.jarak) > r) luar.push(rec); else dalam.push(rec);
    }

    // Rekap per jenis
    const jenisMap = new Map();
    const tambahJenis = (j) => {
      const k = keyJenis(j);
      if (k && !jenisMap.has(k)) jenisMap.set(k, { jenis: j.jenis || "", latin: j.latin || "", dewasa: 0, anakan: 0, Xi: 0, plot: new Map(), perjumpaan: 0 });
      return jenisMap.get(k);
    };
    (data.urutanJenis || []).forEach(tambahJenis);
    for (const p of dalam) {
      const j = tambahJenis(p);
      if (!j.jenis && p.jenis) j.jenis = p.jenis;
      if (!j.latin && p.latin) j.latin = p.latin;
      j.dewasa += num(p.dewasa); j.anakan += num(p.anakan); j.Xi += p.individu; j.perjumpaan++;
      const kp = String(p.plot || "?").trim();
      j.plot.set(kp, (j.plot.get(kp) || 0) + p.individu);
    }
    const jenis = [...jenisMap.values()].filter((j) => j.Xi > 0);
    const N = S.sum(jenis.map((j) => j.Xi));

    // Kepadatan
    const D = S.kepadatan(N, luas.ha);
    // Keanekaragaman
    const H = S.shannon(jenis.map((j) => j.Xi));
    const kritH = S.KRITERIA_H[data.kriteriaH] || S.KRITERIA_H.template;
    // Dominansi
    const Dom = S.dominansi(jenis.map((j) => j.Xi));

    // Dispersi: dua cara dihitung; yang dipakai di laporan dipilih lewat metodeID
    const plotGab = new Map();
    for (const p of dalam) { const kp = String(p.plot || "?").trim(); plotGab.set(kp, (plotGab.get(kp) || 0) + p.individu); }
    const idPlotGab = S.dispersiPerPlot([...plotGab.values()], n);
    const idTplGab = S.dispersiTemplateGabungan(N, n);

    const baris = jenis.map((j, i) => {
      const tpl = S.dispersiTemplateJenis(j.Xi, n), per = S.dispersiPerPlot([...j.plot.values()], n);
      return {
        no: i + 1, jenis: j.jenis, latin: j.latin, dewasa: j.dewasa, anakan: j.anakan, Xi: j.Xi, perjumpaan: j.perjumpaan, plot: [...j.plot.keys()],
        perHa: luas.ha ? j.Xi / luas.ha : 0, haPerInd: luas.ha / j.Xi, Xi2: j.Xi * j.Xi,
        pi: H.rows[i].pi, piLnPi: H.rows[i].piLnPi,
        di: Dom[i].di, kritDom: Dom[i].kriteria,
        idTemplate: tpl, idPlot: per
      };
    });
    const metodeID = data.metodeID === "plot" ? "plot" : "template";
    baris.forEach((b) => { b.id = metodeID === "plot" ? b.idPlot : b.idTemplate; b.kritSebaran = S.kriteriaSebaran(b.id.id); });
    const idGab = metodeID === "plot" ? idPlotGab : idTplGab;

    const plotTerisi = [...plotGab.keys()].filter((k) => k !== "?");
    return {
      n, r, pi, luas, N, S: jenis.length, D, H: H.H, kritH: kritH.fn(H.H), kritHLabel: kritH.label,
      baris, metodeID,
      sumXi2: S.sum(baris.map((b) => b.Xi2)), sumPiLnPi: S.sum(baris.map((b) => b.piLnPi)), sumPi: S.sum(baris.map((b) => b.pi)),
      idGab: { ...idGab, kriteria: S.kriteriaSebaran(idGab.id) },
      pembanding: {
        template: { gab: { ...idTplGab, kriteria: S.kriteriaSebaran(idTplGab.id) }, jenis: baris.map((b) => ({ ...b.idTemplate, kriteria: S.kriteriaSebaran(b.idTemplate.id) })) },
        plot: { gab: { ...idPlotGab, kriteria: S.kriteriaSebaran(idPlotGab.id) }, jenis: baris.map((b) => ({ ...b.idPlot, kriteria: S.kriteriaSebaran(b.idPlot.id) })) }
      },
      plotPerjumpaan: plotTerisi, perPlot: [...plotGab.entries()],
      dalam, luar
    };
  }

  const api = { analisis, num, has };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PEHRaptorAnalisis = api;
})(typeof window !== "undefined" ? window : globalThis);
