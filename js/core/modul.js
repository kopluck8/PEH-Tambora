/*
 * Modul analisis yang dipakai ulang oleh kegiatan PEH (lihat js/core/kegiatan.js).
 * Satu modul = satu analisis: perhitungan, rumus dan keterangan simbol untuk Metode Analisis Data (LPK dan RPK),
 * narasi dan tabel untuk Hasil, tampilan kalkulator, serta baris CSV.
 *
 * Bentuk modul:
 *   hitung(inp, opt)        → r (hasil; r.kosong = true bila belum ada data)
 *   narMetode(c)            → teks pengantar metode (bisa disunting di laporan)
 *   metode(c, r)            → HTML rumus + keterangan simbol
 *   narHasil(r, c)          → teks hasil (bisa disunting)
 *   hitungHtml(r, c)        → HTML contoh perhitungan dengan angka pengamatan
 *   tabel(r, c)             → [{ cap, spec }] tabel hasil
 *   lampiran(r, c)          → [{ cap, spec }] tabel tambahan untuk Matriks Analisis (opsional)
 *   simpulan(r, c)          → satu kalimat simpulan
 *   kpi(r, c)               → [[nilai, keterangan], ...]
 * c = { id, judul, objek, opt, lv } ; spec tabel: { head: [...], rows: [[sel...]], total: [[sel...]] }
 * Sel: angka → { n, d } ; teks rata kiri → { t } ; teks rata tengah → { k } ; { cs } untuk colspan.
 */
(function () {
  "use strict";
  const L = window.PEHLaporan, Q = window.PEHRumus, ST = window.PEHStats;
  const { esc, num, para, sci, nTxt } = L;
  const { R, F, Sub, Sup, SubSup, Sum, P, Sqrt } = Q;
  const M = (window.PEHModul = {});

  /* ---------- Bantuan bersama ---------- */
  const fin = (v) => Number.isFinite(v);
  const toN = (v) => { if (v === "" || v === null || v === undefined) return NaN; const x = Number(String(v).replace(",", ".")); return x; };
  const nOr = (v, d = 1) => { const x = toN(v); return fin(x) ? x : d; };
  const daftarKata = (arr) => (arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + (arr.length > 2 ? "," : "") + " dan " + arr[arr.length - 1]);
  const nm = (b) => { const j = String(b.jenis || "").trim(), l = String(b.latin || "").trim(); return !l || j.toLowerCase() === l.toLowerCase() ? j || l : !j ? l : `${j} (${l})`; };
  const dKecil = (v) => (Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 1 ? 2 : 4);
  const fx = (v, d) => num(v, d === undefined ? dKecil(v) : d);
  const haTxt = (v) => (fin(v) && v > 0 ? `1 ind/${num(v, v >= 100 ? 0 : 2)} ha` : "-");
  const kunci = (s) => String(s || "").trim().toLowerCase().replace(/\s+/g, " ");
  // Kelompokkan baris per jenis: { jenis, latin, n, unit:Set, rows }
  function perJenis(rows, ambilN = (r) => nOr(r.n, 1)) {
    const m = new Map();
    rows.forEach((r) => {
      const j = String(r.jenis || r.latin || "").trim();
      if (!j) return;
      const k = kunci(r.latin || r.jenis);
      if (!m.has(k)) m.set(k, { jenis: String(r.jenis || r.latin).trim(), latin: String(r.latin || "").trim(), n: 0, unit: new Set(), rows: [] });
      const o = m.get(k);
      o.n += ambilN(r);
      if (!o.latin && r.latin) o.latin = String(r.latin).trim();
      if (r.unit !== undefined && String(r.unit).trim()) o.unit.add(String(r.unit).trim());
      o.rows.push(r);
    });
    return [...m.values()];
  }
  M.util = { fin, toN, nOr, daftarKata, nm, fx, haTxt, perJenis, kunci };

  /* ---------- Render tabel dari spec (laporan, kalkulator, CSV) ---------- */
  const cellPaper = (c) => {
    if (c === null || c === undefined) return `<td></td>`;
    const cs = c.cs ? ` colspan="${c.cs}"` : "", rs = c.rs ? ` rowspan="${c.rs}"` : "";
    if (typeof c === "number") return `<td class="c">${fin(c) ? num(c, Number.isInteger(c) ? 0 : 2) : "-"}</td>`;
    if (typeof c === "string") return `<td>${c}</td>`;
    if ("n" in c) return `<td class="c${c.nw ? " nw" : ""}"${cs}${rs}>${fin(c.n) ? num(c.n, c.d ?? 2) : "-"}</td>`;
    if ("k" in c) return `<td class="c${c.nw ? " nw" : ""}"${cs}${rs}>${c.k}</td>`;
    return `<td${c.nw ? ' class="nw"' : ""}${cs}${rs}>${c.t ?? ""}</td>`;
  };
  const cellRes = (c) => {
    if (c === null || c === undefined) return `<td></td>`;
    const cs = c.cs ? ` colspan="${c.cs}"` : "", rs = c.rs ? ` rowspan="${c.rs}"` : "";
    if (typeof c === "number") return `<td>${fin(c) ? num(c, Number.isInteger(c) ? 0 : 2) : "-"}</td>`;
    if (typeof c === "string") return `<td class="t">${c}</td>`;
    if ("n" in c) return `<td${cs}${rs}>${fin(c.n) ? num(c.n, c.d ?? 2) : "-"}</td>`;
    if ("k" in c) return `<td class="c"${cs}${rs}>${c.k}</td>`;
    return `<td class="t"${cs}${rs}>${c.t ?? ""}</td>`;
  };
  const headRow = (head) => (Array.isArray(head[0]) ? head : [head]).map((h) => `<tr>${h.map((x) => (typeof x === "string" ? `<th>${x}</th>` : `<th${x.cs ? ` colspan="${x.cs}"` : ""}${x.rs ? ` rowspan="${x.rs}"` : ""}>${x.t}</th>`)).join("")}</tr>`).join("");
  function paperTable(spec, cls = "data") {
    const body = spec.rows.length ? spec.rows.map((r) => `<tr>${r.map(cellPaper).join("")}</tr>`).join("") : `<tr><td class="c" colspan="${spec.ncol || (Array.isArray(spec.head[0]) ? spec.head[spec.head.length - 1].length : spec.head.length)}">${spec.kosong || "Belum ada data."}</td></tr>`;
    return `<table class="${cls}"><thead>${headRow(spec.head)}</thead><tbody>${body}${(spec.total || []).map((r) => `<tr class="total">${r.map(cellPaper).join("")}</tr>`).join("")}</tbody></table>`;
  }
  function resTable(spec) {
    return `<table><thead>${headRow(spec.head)}</thead><tbody>${spec.rows.map((r) => `<tr>${r.map(cellRes).join("")}</tr>`).join("")}${(spec.total || []).map((r) => `<tr class="total">${r.map(cellRes).join("")}</tr>`).join("")}</tbody></table>`;
  }
  const plain = (h) => String(h ?? "").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
  function csvRows(spec) {
    const H = Array.isArray(spec.head[0]) ? spec.head[spec.head.length - 1] : spec.head;
    const cv = (c) => {
      if (c === null || c === undefined) return "";
      if (typeof c === "number") return fin(c) ? String(c).replace(".", ",") : "";
      if (typeof c === "string") return plain(c);
      if ("n" in c) return fin(c.n) ? num(c.n, Math.max(c.d ?? 2, 2)).replace(/\./g, "") : "";
      return plain(c.k ?? c.t);
    };
    const out = [H.map((h) => plain(typeof h === "string" ? h : h.t))];
    [...spec.rows, ...(spec.total || [])].forEach((r) => { const row = []; r.forEach((c) => { row.push(cv(c)); for (let i = 1; i < ((c && c.cs) || 1); i++) row.push(""); }); out.push(row); });
    return out;
  }
  M.render = { paperTable, resTable, csvRows, plain };
  const t = (html) => ({ t: html }), k = (html) => ({ k: html }), n = (v, d = 2) => ({ n: v, d });
  M.cell = { t, k, n };
  const ket = (rows, lv, head) => Q.ketHtml(rows, lv, head);
  const blk = (nodes, lv) => Q.blockHtml(nodes, lv);
  const xbar = "x̄";

  /* =====================================================================
   * 1. Indeks komunitas: Shannon-Wiener, Pielou, Margalef, Simpson, dominansi
   * inp: { rows: [{ jenis, latin, n }] } ; opt: { kriteriaH: "template"|"krebs", indeks: ["H","E","R","Ds","Di"] }
   * ===================================================================== */
  const KRIT_H = {
    template: [[[R("H′"), " ≤ 2"], "keanekaragaman rendah"], [["2 < ", R("H′"), " < 3"], "keanekaragaman sedang"], [[R("H′"), " ≥ 3"], "keanekaragaman tinggi"]],
    krebs: [[[R("H′"), " < 1"], "keanekaragaman rendah"], [["1 ≤ ", R("H′"), " ≤ 3"], "keanekaragaman sedang"], [[R("H′"), " > 3"], "keanekaragaman tinggi"]]
  };
  M.komunitas = {
    judul: "Keanekaragaman Jenis",
    hitung(inp, opt = {}) {
      const g = perJenis(inp.rows || []).filter((b) => b.n > 0).sort((a, b) => b.n - a.n || a.jenis.localeCompare(b.jenis));
      const K = ST.komunitas(g.map((b) => b.n));
      const kritH = (ST.KRITERIA_H[opt.kriteriaH] || ST.KRITERIA_H.template);
      const baris = g.map((b, i) => ({ no: i + 1, jenis: b.jenis, latin: b.latin, n: b.n, pi: K.rows[i].pi, piLnPi: K.rows[i].piLnPi, di: K.N ? (b.n / K.N) * 100 : 0 }));
      baris.forEach((b) => (b.kritDom = ST.kriteriaDominansi(b.di)));
      const indeks = opt.indeks || ["H", "E", "R", "Di"];
      return { kosong: !baris.length, baris, ...K, indeks, kriteriaH: opt.kriteriaH || "template", kritH: kritH.fn(K.H), kritHLabel: kritH.label, kritE: ST.kriteriaE(K.E), kritR: ST.kriteriaR(K.R), kritDs: ST.kriteriaDs(K.Ds), sumPiLnPi: baris.reduce((s, b) => s + b.piLnPi, 0) };
    },
    narMetode(c) {
      const ix = c.opt.indeks || ["H", "E", "R", "Di"], nama = { H: "indeks keanekaragaman Shannon-Wiener (H′)", E: "indeks kemerataan Pielou (E)", R: "indeks kekayaan jenis Margalef (R)", Ds: "indeks keanekaragaman Simpson (Ds)", Di: "indeks dominansi atau kelimpahan relatif (Di)" };
      return `Struktur komunitas ${c.objek} dianalisis dengan ${daftarKata(ix.map((x) => nama[x]))}. Keanekaragaman ditentukan oleh banyaknya jenis dan kemerataan jumlah individu tiap jenis; makin banyak jenis dengan jumlah individu yang merata, makin tinggi keanekaragamannya. Persamaan yang dipakai adalah sebagai berikut.`;
    },
    metode(c, r) {
      const ix = c.opt.indeks || ["H", "E", "R", "Di"], lv = c.lv, out = [];
      const krebs = (c.opt.kriteriaH || "template") === "krebs";
      if (ix.includes("H")) out.push(para("Indeks keanekaragaman Shannon-Wiener (Krebs, 1989):", lv), blk([R("H′"), R(" = −"), Sum([Sub("P", "i"), R(" ln "), Sub("P", "i")])], lv), blk([Sub("P", "i"), R(" = "), F(Sub("n", "i"), "N")], lv),
        ket([[R("H′"), "indeks keanekaragaman Shannon-Wiener"], [Sub("P", "i"), "proporsi individu jenis ke-i terhadap seluruh individu"], [Sub("n", "i"), "jumlah individu jenis ke-i"], ["N", "jumlah individu seluruh jenis"], ["ln", "logaritma natural"]], lv),
        ket(KRIT_H[krebs ? "krebs" : "template"], lv, krebs ? "Kriteria menurut Krebs (1989):" : "Kriteria (template analisis data Balai):"));
      if (ix.includes("E")) out.push(para("Indeks kemerataan jenis (Pielou, 1966):", lv), blk([R("E = "), F(R("H′"), "ln S")], lv),
        ket([["E", "indeks kemerataan jenis"], [R("H′"), "indeks keanekaragaman Shannon-Wiener"], ["S", "jumlah jenis"]], lv),
        ket([["E < 0,4", "kemerataan rendah"], ["0,4 ≤ E ≤ 0,6", "kemerataan sedang"], ["E > 0,6", "kemerataan tinggi"]], lv, "Kriteria (Odum, 1993):"));
      if (ix.includes("R")) out.push(para("Indeks kekayaan jenis (Margalef, 1958):", lv), blk([R("R = "), F("S − 1", "ln N")], lv),
        ket([["R", "indeks kekayaan jenis Margalef"], ["S", "jumlah jenis"], ["N", "jumlah individu seluruh jenis"]], lv),
        ket([["R < 2,5", "kekayaan jenis rendah"], ["2,5 ≤ R ≤ 4", "kekayaan jenis sedang"], ["R > 4", "kekayaan jenis tinggi"]], lv, "Kriteria:"));
      if (ix.includes("Ds")) out.push(para("Indeks keanekaragaman Simpson (Simpson, 1949):", lv), blk([R("λ = "), Sum(Sup(Sub("P", "i"), "2"))], lv), blk([Sub("D", "s"), R(" = 1 − λ")], lv),
        ket([["λ", "indeks dominansi Simpson"], [Sub("D", "s"), "indeks keanekaragaman Simpson"], [Sub("P", "i"), "proporsi individu jenis ke-i"]], lv),
        ket([[[Sub("D", "s"), " ≤ 0,30"], "rendah"], [["0,30 < ", Sub("D", "s"), " ≤ 0,60"], "sedang"], [[Sub("D", "s"), " > 0,60"], "tinggi"]], lv, "Kriteria (Odum, 1993):"));
      if (ix.includes("Di")) out.push(para("Indeks dominansi/kelimpahan relatif (Odum, 1993 dalam Sirait, 2018):", lv), blk([Sub("D", "i"), R(" = "), F(Sub("n", "i"), "N"), R(" × 100%")], lv),
        ket([[Sub("D", "i"), "indeks dominansi jenis ke-i (%)"], [Sub("n", "i"), "jumlah individu jenis ke-i"], ["N", "jumlah individu seluruh jenis"]], lv),
        ket([[[Sub("D", "i"), " < 2%"], "tidak dominan"], [["2% ≤ ", Sub("D", "i"), " < 5%"], "sub dominan"], [[Sub("D", "i"), " ≥ 5%"], "dominan"]], lv, "Kriteria:"));
      return out.join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data ${c.objek} untuk dianalisis.`;
      const dom = ["Dominan", "Sub Dominan", "Tidak Dominan"].map((kk) => [kk, r.baris.filter((b) => b.kritDom === kk)]).filter(([, a]) => a.length);
      const s = [`Tercatat ${nTxt(r.S)} jenis ${c.objek} dengan jumlah ${nTxt(r.N)} individu.`];
      const ix = r.indeks;
      const bag = [];
      if (ix.includes("H")) bag.push(`indeks keanekaragaman Shannon-Wiener (H′) sebesar ${num(r.H, 2)} (${r.kritH.toLowerCase()})`);
      if (ix.includes("E")) bag.push(`indeks kemerataan (E) ${num(r.E, 2)} (${r.kritE.toLowerCase()})`);
      if (ix.includes("R")) bag.push(`indeks kekayaan jenis Margalef (R) ${num(r.R, 2)} (${r.kritR.toLowerCase()})`);
      if (ix.includes("Ds")) bag.push(`indeks Simpson (Ds) ${num(r.Ds, 2)} (${r.kritDs.toLowerCase()})`);
      if (bag.length) s.push(`Nilai ${daftarKata(bag)}.`);
      if (ix.includes("Di")) s.push(dom.map(([kk, a]) => `${a.length === r.S ? `Seluruh jenis` : a.length > 6 ? `${nTxt(a.length)} jenis` : daftarKata(a.map(nm))} termasuk kategori ${kk.toLowerCase()}`).join("; ") + ".");
      return s.join(" ");
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv, top = r.baris[0], out = [para(`Contoh perhitungan untuk ${esc(top.jenis)}:`, lv),
        blk([Sub("P", "i"), R(" = "), F(num(top.n), num(r.N)), R(` = ${num(top.pi, 3)}`)], lv),
        blk([Sub("P", "i"), R(" ln "), Sub("P", "i"), R(` = ${num(top.pi, 3)} × ln ${num(top.pi, 3)} = ${num(top.piLnPi, 3)}`)], lv)];
      if (r.indeks.includes("H")) out.push(blk([R("H′"), R(" = −"), Sum([Sub("P", "i"), R(" ln "), Sub("P", "i")]), R(` = −(${num(r.sumPiLnPi, 3)}) = ${num(r.H, 2)}`)], lv));
      if (r.indeks.includes("E")) out.push(blk([R("E = "), F(R("H′"), "ln S"), R(" = "), F(num(r.H, 3), `ln ${num(r.S)}`), R(` = ${num(r.E, 2)}`)], lv));
      if (r.indeks.includes("R")) out.push(blk([R("R = "), F("S − 1", "ln N"), R(" = "), F(`${num(r.S)} − 1`, `ln ${num(r.N)}`), R(` = ${num(r.R, 2)}`)], lv));
      if (r.indeks.includes("Ds")) out.push(blk([Sub("D", "s"), R(` = 1 − ${num(r.lambda, 4)} = ${num(r.Ds, 2)}`)], lv));
      if (r.indeks.includes("Di")) out.push(blk([Sub("D", "i"), R(" = "), F(num(top.n), num(r.N)), R(` × 100% = ${num(top.di, 3)}%`)], lv));
      return out.join("");
    },
    spec(r) {
      const di = r.indeks.includes("Di");
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Jumlah Individu (ni)", "Pi", "Pi ln Pi", ...(di ? ["Di (%)", "Dominansi"] : [])],
        rows: r.baris.map((b) => [k(b.no), t(esc(b.jenis)), t(sci(b.latin)), n(b.n, 0), n(b.pi, 3), n(b.piLnPi, 3), ...(di ? [n(b.di, 3), k(esc(b.kritDom))] : [])]),
        total: [[{ t: "Jumlah", cs: 3 }, n(r.N, 0), n(1, 2), n(r.sumPiLnPi, 3), ...(di ? [n(100, 2), t("")] : [])]] };
    },
    ringkas(r) {
      const rows = [];
      if (r.indeks.includes("H")) rows.push([t("Indeks keanekaragaman Shannon-Wiener (H′)"), n(r.H, 2), k(esc(r.kritH))]);
      if (r.indeks.includes("E")) rows.push([t("Indeks kemerataan Pielou (E)"), n(r.E, 2), k(esc(r.kritE))]);
      if (r.indeks.includes("R")) rows.push([t("Indeks kekayaan jenis Margalef (R)"), n(r.R, 2), k(esc(r.kritR))]);
      if (r.indeks.includes("Ds")) rows.push([t("Indeks keanekaragaman Simpson (Ds)"), n(r.Ds, 2), k(esc(r.kritDs))]);
      return { head: ["Indeks", "Nilai", "Kriteria"], rows: [[t("Jumlah jenis (S)"), n(r.S, 0), t("")], [t("Jumlah individu (N)"), n(r.N, 0), t("")], ...rows] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Komposisi Jenis dan Indeks Dominansi ${L.judul(c.objek)}`, spec: this.spec(r) }, { cap: `Indeks Komunitas ${L.judul(c.objek)}`, spec: this.ringkas(r) }]; },
    simpulan(r, c) {
      if (r.kosong) return "";
      const bag = [];
      if (r.indeks.includes("H")) bag.push(`keanekaragaman jenis ${c.objek} tergolong ${r.kritH.toLowerCase()} (H′ = ${num(r.H, 2)})`);
      if (r.indeks.includes("E")) bag.push(`kemerataan ${r.kritE.toLowerCase()} (E = ${num(r.E, 2)})`);
      if (r.indeks.includes("R")) bag.push(`kekayaan jenis ${r.kritR.toLowerCase()} (R = ${num(r.R, 2)})`);
      if (r.indeks.includes("Ds")) bag.push(`indeks Simpson ${r.kritDs.toLowerCase()} (Ds = ${num(r.Ds, 2)})`);
      return `Tercatat ${nTxt(r.S)} jenis ${c.objek} (${r.N} individu); ${daftarKata(bag)}`;
    },
    kpi(r) { return r.kosong ? [] : [[r.S, "jenis"], [r.N, "individu"], [num(r.H, 2), `H′ (${r.kritH})`]]; }
  };

  /* =====================================================================
   * 2. Kepadatan populasi titik hitung/point count (Jarvinen 1978)
   * inp: { rows: [{ jenis, latin, n, unit, jarak }], nPlot, bentuk: "lingkaran"|"persegi", ukuran (m), pi }
   * ===================================================================== */
  M.titik = {
    judul: "Kepadatan Populasi",
    hitung(inp) {
      const bentuk = inp.bentuk === "persegi" ? "persegi" : "lingkaran", u = nOr(inp.ukuran, 0), pi = nOr(inp.pi, 3.14);
      const batas = bentuk === "lingkaran" ? u : (u * Math.SQRT2) / 2;
      const luar = (inp.rows || []).filter((r) => fin(toN(r.jarak)) && batas && toN(r.jarak) > batas);
      const dalam = (inp.rows || []).filter((r) => !luar.includes(r));
      const unit = new Set(dalam.map((r) => String(r.unit ?? "").trim()).filter(Boolean));
      const nPlot = nOr(inp.nPlot, 0) || unit.size;
      const luas = ST.luasTitik(nPlot, bentuk, u, pi);
      const g = perJenis(dalam).filter((b) => b.n > 0).sort((a, b) => b.n - a.n || a.jenis.localeCompare(b.jenis));
      const N = g.reduce((s, b) => s + b.n, 0), D = ST.kepadatan(N, luas.ha);
      const baris = g.map((b, i) => ({ no: i + 1, jenis: b.jenis, latin: b.latin, Xi: b.n, plot: [...b.unit], ...ST.kepadatan(b.n, luas.ha) }));
      return { kosong: !N || !luas.ha, bentuk, ukuran: u, pi, nPlot, luas, N, D, baris, luar: luar.map((r) => ({ jenis: r.jenis, n: nOr(r.n, 1), jarak: r.jarak, unit: r.unit })), plotTemu: [...unit] };
    },
    narMetode(c) { return `Kepadatan populasi menunjukkan jumlah individu ${c.objek} per satuan luas plot pengamatan. Kepadatan dihitung dengan persamaan menurut Jarvinen (1978), sebagai berikut:`; },
    metode(c, r) {
      const lv = c.lv, sq = (c.opt.bentuk || r.bentuk) === "persegi";
      return [blk([R("D = "), F("N", "A")], lv), sq ? blk([R("A = n × "), Sup("s", "2")], lv) : blk([R("A = n × π × "), Sup("r", "2")], lv),
        ket([["D", `kepadatan populasi ${esc(c.objek)} (individu/ha)`], ["N", "jumlah individu yang tercatat di dalam plot pengamatan"], ["A", "luas seluruh plot pengamatan (ha)"], ["n", "jumlah plot pengamatan"],
          ...(sq ? [["s", "panjang sisi plot bujur sangkar (m)"]] : [["r", "jari-jari (radius) plot pengamatan (m)"], ["π", `konstanta ${num(nOr(c.opt.pi, 3.14), 2)}`]])], lv),
        para("Kepadatan juga dinyatakan sebagai luas wilayah yang ditempati satu individu, yaitu A/N (1 individu/… ha).", lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data perjumpaan ${c.objek} di dalam plot pengamatan.`;
      const maxB = r.baris[0], minB = r.baris[r.baris.length - 1];
      return `Pengamatan dilakukan pada ${nTxt(r.nPlot)} plot ${r.bentuk === "persegi" ? `bujur sangkar bersisi ${num(r.ukuran)} m` : `lingkaran berjari-jari ${num(r.ukuran)} m`} dengan luas seluruhnya ${fx(r.luas.ha)} ha. Di dalam plot tercatat ${nTxt(r.N)} individu ${c.objek} sehingga kepadatan populasinya ${fx(r.D.perHa, 4)} individu/ha atau satu individu menempati wilayah seluas ${fx(r.D.haPerInd, 2)} ha.${r.baris.length > 1 ? ` Kepadatan tertinggi terdapat pada ${nm(maxB)} sebesar ${fx(maxB.perHa, 4)} ind/ha dan terendah pada ${nm(minB)} sebesar ${fx(minB.perHa, 4)} ind/ha.` : ""}${r.luar.length ? ` Sebanyak ${r.luar.length} perjumpaan berada di luar plot sehingga tidak dihitung.` : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv, ha = fx(r.luas.ha);
      return [para(`Perhitungan kepadatan populasi ${esc(c.objek)} secara keseluruhan:`, lv),
        r.bentuk === "persegi" ? blk([R(`A = n × `), Sup("s", "2"), R(` = ${num(r.nPlot)} × `), Sup(num(r.ukuran), "2"), R(` = ${num(r.luas.m2)} `), Sup("m", "2"), R(` = ${ha} ha`)], lv)
          : blk([R(`A = n × π × `), Sup("r", "2"), R(` = ${num(r.nPlot)} × ${num(r.pi, 2)} × `), Sup(num(r.ukuran), "2"), R(` = ${num(r.luas.m2)} `), Sup("m", "2"), R(` = ${ha} ha`)], lv),
        blk([R("D = "), F("N", "A"), R(" = "), F(num(r.N), ha), R(` = ${fx(r.D.perHa, 4)} ind/ha`)], lv),
        blk([F("A", "N"), R(" = "), F(ha, num(r.N)), R(` = ${fx(r.D.haPerInd, 2)} ha/individu`)], lv)].join("");
    },
    spec(r) {
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Jumlah Individu (Xi)", "Kepadatan (ind/ha)", "1 ind/… ha"],
        rows: r.baris.map((b) => [k(b.no), t(esc(b.jenis)), t(sci(b.latin)), n(b.Xi, 0), n(b.perHa, 4), k(haTxt(b.haPerInd))]),
        total: [[{ t: "Jumlah", cs: 3 }, n(r.N, 0), n(r.D.perHa, 4), k(haTxt(r.D.haPerInd))]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Kepadatan Populasi ${L.judul(c.objek)} pada Plot Pengamatan`, spec: this.spec(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Kepadatan populasi ${c.objek} pada ${r.nPlot} plot pengamatan (${fx(r.luas.ha)} ha) adalah ${fx(r.D.perHa, 4)} individu/ha atau 1 individu/${fx(r.D.haPerInd, 2)} ha`; },
    kpi(r) { return r.kosong ? [] : [[`${fx(r.luas.ha)} ha`, `${r.nPlot} plot`], [fx(r.D.perHa, 4), `ind/ha (${haTxt(r.D.haPerInd)})`]]; }
  };

  /* =====================================================================
   * 3. Pola sebaran: indeks dispersi (Ludwig dan Reynolds 1988) dan Morisita
   * inp: { rows: [{ jenis, latin, n, unit }], units: [id unit, termasuk unit tanpa temuan] | nUnit } ; opt: { metodeID: "template"|"unit" }
   * ===================================================================== */
  M.dispersi = {
    judul: "Pola Sebaran",
    hitung(inp, opt = {}) {
      const rows = (inp.rows || []).filter((r) => String(r.jenis || r.latin || "").trim());
      const units = [...new Set([...(inp.units || []).map((u) => String(u).trim()).filter(Boolean), ...rows.map((r) => String(r.unit ?? "").trim()).filter(Boolean)])];
      const nU = Math.max(nOr(inp.nUnit, 0), units.length);
      const tpl = (opt.metodeID || "template") === "template";
      const g = perJenis(rows).filter((b) => b.n > 0).sort((a, b) => b.n - a.n || a.jenis.localeCompare(b.jenis));
      const vec = (rr) => { const m = new Map(units.map((u) => [u, 0])); rr.forEach((r) => { const u = String(r.unit ?? "").trim(); if (u) m.set(u, (m.get(u) || 0) + nOr(r.n, 1)); }); const v = [...m.values()]; while (v.length < nU) v.push(0); return v; };
      const krit = (id) => ST.kriteriaSebaran(id);
      const baris = g.map((b, i) => {
        const v = vec(b.rows), pu = ST.dispersiPerPlot(v, nU), tp = ST.dispersiTemplateJenis(b.n, nU);
        const pakai = tpl ? tp : pu;
        return { no: i + 1, jenis: b.jenis, latin: b.latin, Xi: b.n, unit: [...b.unit], id: pakai, kriteria: krit(pakai.id), plot: pu, tpl: tp, kritPlot: krit(pu.id), kritTpl: krit(tp.id), morisita: ST.morisita(v).Id };
      });
      const N = g.reduce((s, b) => s + b.n, 0), vAll = vec(rows);
      const gp = ST.dispersiPerPlot(vAll, nU), gt = ST.dispersiTemplateGabungan(N, nU), gab = tpl ? gt : gp;
      const chi = ST.khiKuadratID(gab.id, nU);
      return { kosong: !N || nU < 2, tpl, nU, N, baris, gab: { ...gab, kriteria: krit(gab.id) }, gabPlot: { ...gp, kriteria: krit(gp.id) }, gabTpl: { ...gt, kriteria: krit(gt.id) }, chi, morisita: ST.morisita(vAll).Id, units };
    },
    narMetode(c) { return `Pola sebaran populasi satwa liar secara umum terdiri atas tiga bentuk, yaitu sebaran acak, sebaran kelompok, dan sebaran homogen (merata). Pola sebaran ${c.objek} dianalisis dengan Indeks Dispersi (ID) menurut Ludwig dan Reynolds (1988):`; },
    metode(c) {
      const lv = c.lv, tpl = (c.opt.metodeID || "template") === "template", u = c.opt.unitLabel || "plot";
      const out = [blk([R("ID = "), F(Sup("S", "2"), xbar)], lv), blk([R(xbar + " = "), F(Sum(Sub("x", "i")), "n")], lv),
        blk([Sup("S", "2"), R(" = "), F([Sum(SubSup("x", "i", "2")), R(" − "), F(Sup(P(Sum(Sub("x", "i"))), "2"), "n")], "n − 1")], lv),
        ket([["ID", "indeks dispersi"], [Sup("S", "2"), `ragam (varians) jumlah individu per ${u}`], [xbar, `rata-rata jumlah individu per ${u}`], [Sub("x", "i"), `jumlah individu pada ${u} ke-i`], ["n", `jumlah ${u} pengamatan`]], lv)];
      if (tpl) out.push(para(`Mengikuti template analisis data Balai (Analisa data.xlsx), ragam per jenis dihitung dari jumlah individu total jenis tersebut (Xi) dan ragam gabungan dari jumlah total individu (N):`, lv),
        blk([SubSup("S", "i", "2"), R(" = "), F([Sup(Sub("X", "i"), "2"), R(" − "), F(Sup(Sub("X", "i"), "4"), "n")], "n − 1")], lv) + blk([Sub(xbar, "i"), R(" = "), F(Sub("X", "i"), "n")], lv),
        blk([Sup("S", "2"), R(" = "), F([R("N − "), F(Sup("N", "2"), "n")], "n − 1")], lv) + blk([R(xbar + " = "), F("N", "n")], lv),
        ket([[Sub("X", "i"), "jumlah individu jenis ke-i"], ["N", "jumlah total individu"], ["n", `jumlah ${u} pengamatan`]], lv));
      else out.push(para(`Ragam dihitung dari jumlah individu yang tercatat pada setiap ${u}; ${u} tanpa perjumpaan bernilai nol.`, lv));
      out.push(ket([["ID = 1", "sebaran acak"], ["ID > 1", "sebaran kelompok"], ["ID < 1", "sebaran homogen/merata"]], lv, "Pola sebaran berdasarkan nilai ID:"),
        para("Kebermaknaan simpangan nilai ID dari 1 diuji dengan khi-kuadrat, χ² = ID × (n − 1) dengan derajat bebas n − 1 (Ludwig dan Reynolds, 1988).", lv));
      return out.join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Data perjumpaan ${c.objek} belum cukup untuk menghitung pola sebaran (perlu paling sedikit dua unit pengamatan).`;
      const per = ["Kelompok", "Acak", "Homogen"].map((kk) => [kk, r.baris.filter((b) => b.kriteria === kk)]).filter(([, a]) => a.length);
      return `Secara keseluruhan ${c.objek} pada ${nTxt(r.nU)} ${c.opt.unitLabel || "plot"} pengamatan memiliki pola sebaran ${r.gab.kriteria.toLowerCase()} dengan nilai ID ${num(r.gab.id, 3)}.${r.baris.length > 1 ? ` Menurut jenis, ${per.map(([kk, a]) => `${a.length > 6 ? `${nTxt(a.length)} jenis` : daftarKata(a.map(nm))} memiliki pola sebaran ${kk.toLowerCase()}`).join("; ")}.` : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv, g = r.gab;
      const out = [para(`Perhitungan indeks dispersi seluruh ${esc(c.objek)}:`, lv)];
      if (r.tpl) out.push(blk([Sup("S", "2"), R(" = "), F([R(num(r.N) + " − "), F(Sup(num(r.N), "2"), num(r.nU))], `${num(r.nU)} − 1`), R(` = ${num(g.s2, 6)}`)], lv));
      else out.push(blk([Sup("S", "2"), R(" = "), F([R(num(g.sx2) + " − "), F(Sup(num(g.sx), "2"), num(r.nU))], `${num(r.nU)} − 1`), R(` = ${num(g.s2, 6)}`)], lv));
      out.push(blk([R(xbar + " = "), F(num(r.N), num(r.nU)), R(` = ${num(g.mean, 6)}`)], lv), blk([R("ID = "), F(num(g.s2, 6), num(g.mean, 6)), R(` = ${num(g.id, 3)}`)], lv));
      return out.join("");
    },
    spec(r) {
      return { head: ["No", "Nama Jenis", "Nama Ilmiah", "Jumlah Individu (Xi)", "S²", "x̄", "ID", "Pola Sebaran"],
        rows: r.baris.map((b) => [k(b.no), t(esc(b.jenis)), t(sci(b.latin)), n(b.Xi, 0), n(b.id.s2, 4), n(b.id.mean, 4), n(b.id.id, 3), k(esc(b.kriteria))]),
        total: [[{ t: `Seluruh jenis (n = ${r.nU})`, cs: 3 }, n(r.N, 0), n(r.gab.s2, 4), n(r.gab.mean, 4), n(r.gab.id, 3), k(esc(r.gab.kriteria))]] };
    },
    banding(r) {
      return { head: ["Jenis", "ID template", "Kriteria", "ID per unit", "Kriteria", "Morisita"],
        rows: r.baris.map((b) => [t(esc(b.jenis)), n(b.tpl.id, 3), k(b.kritTpl), n(b.plot.id, 3), k(b.kritPlot), n(b.morisita, 3)]),
        total: [[t("Gabungan"), n(r.gabTpl.id, 3), k(r.gabTpl.kriteria), n(r.gabPlot.id, 3), k(r.gabPlot.kriteria), n(r.morisita, 3)]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Pola Sebaran ${L.judul(c.objek)}`, spec: this.spec(r) }]; },
    kalkExtra(r) {
      if (r.kosong) return "";
      const beda = r.gabTpl.kriteria !== r.gabPlot.kriteria || r.baris.some((b) => b.kritTpl !== b.kritPlot);
      return `<h3>Perbandingan rumus indeks dispersi</h3><p class="muted">Laporan memakai: <b>${r.tpl ? "rumus template Analisa data.xlsx" : "rumus per unit pengamatan (Ludwig dan Reynolds)"}</b>. Ganti di panel kiri, Parameter metode. χ² = ${num(r.chi.chi2, 3)} (db ${r.chi.df}).</p>${resTable(this.banding(r))}${beda ? `<div class="callout"><b>Hasil kedua rumus berbeda.</b> Rumus template menghitung ragam dari total individu, seolah-olah sebaran per unit tidak diketahui. Rumus per unit memakai jumlah individu yang benar-benar tercatat di setiap unit, sesuai definisi Ludwig dan Reynolds (1988).</div>` : ""}`;
    },
    simpulan(r, c) { return r.kosong ? "" : `Secara keseluruhan ${c.objek} memiliki pola sebaran ${r.gab.kriteria.toLowerCase()} (ID = ${num(r.gab.id, 3)})`; },
    kpi(r) { return r.kosong ? [] : [[num(r.gab.id, 3), `ID (${r.gab.kriteria})`]]; }
  };

  /* =====================================================================
   * 4. Penduga kekayaan jenis: Chao2, Jackknife orde satu, Chao1, kurva akumulasi
   * inp: { rows: [{ jenis, unit, n }], units }
   * ===================================================================== */
  M.penduga = {
    judul: "Pendugaan Kekayaan Jenis",
    hitung(inp) {
      const r = ST.penduga((inp.rows || []).map((x) => ({ jenis: x.latin || x.jenis, unit: x.unit, n: x.n })), inp.units);
      const ak = r.akumulasi, ekor = ak.slice(Math.floor(ak.length * 0.8));
      return { ...r, kosong: !r.S || r.m < 2, baruAkhir: ekor.reduce((s, x) => s + x.baru, 0), nEkor: ekor.length };
    },
    narMetode(c) { return `Kelengkapan inventarisasi dinilai dengan menduga jumlah jenis ${c.objek} yang sebenarnya ada, termasuk yang belum tercatat. Pendugaan memakai penduga nonparametrik Chao2 dan Jackknife orde satu dari data kehadiran jenis pada setiap unit contoh, serta kurva akumulasi jenis (Colwell dan Coddington, 1994):`; },
    metode(c) {
      const lv = c.lv, ob = Sub("S", "obs");
      return [blk([Sub("S", "Chao2"), R(" = "), ob, R(" + "), F("m − 1", "m"), R(" × "), F(Sup(Sub("Q", "1"), "2"), [R("2"), Sub("Q", "2")])], lv),
        para("Bila tidak ada jenis yang ditemukan tepat di dua unit (Q₂ = 0):", lv),
        blk([Sub("S", "Chao2"), R(" = "), ob, R(" + "), F("m − 1", "m"), R(" × "), F([Sub("Q", "1"), P([Sub("Q", "1"), R(" − 1")])], "2")], lv),
        blk([Sub("S", "Jack1"), R(" = "), ob, R(" + "), Sub("Q", "1"), R(" × "), F("m − 1", "m")], lv),
        blk([R("Kelengkapan = "), F(ob, Sub("S", "Chao2")), R(" × 100%")], lv),
        ket([[ob, "jumlah jenis yang tercatat"], ["m", "jumlah unit contoh"], [Sub("Q", "1"), "jumlah jenis yang hanya ditemukan di satu unit"], [Sub("Q", "2"), "jumlah jenis yang ditemukan tepat di dua unit"]], lv),
        para("Hasil penduga adalah batas bawah jumlah jenis. Kurva akumulasi yang masih menanjak menandakan inventarisasi belum lengkap; kurva yang mendatar menandakan sebagian besar jenis sudah tercatat.", lv)].join("");
    },
    narHasil(r, c) {
      if (r.kosong) return `Data belum cukup untuk menduga kekayaan jenis ${c.objek} (perlu paling sedikit dua unit contoh).`;
      const q1 = r.Q1 ? `Sebanyak ${r.Q1} jenis hanya ditemukan di satu unit` : "Tidak ada jenis yang hanya ditemukan di satu unit";
      const q2 = r.Q2 ? ` dan ${r.Q2} jenis ditemukan tepat di dua unit` : r.Q1 ? ", sedangkan tidak ada jenis yang ditemukan tepat di dua unit" : "";
      return `Dari ${nTxt(r.m)} unit contoh tercatat ${nTxt(r.S)} jenis ${c.objek}. ${q1}${q2}. Dugaan jumlah jenis menurut Chao2 adalah ${num(r.chao2, 1)} jenis dan menurut Jackknife orde satu ${num(r.jack1, 1)} ± ${num(r.seJack, 1)} jenis, sehingga kelengkapan inventarisasi sekitar ${num(r.lengkap, 0)}%. ${r.nEkor ? (r.baruAkhir === 0 ? `Kurva akumulasi jenis sudah mendatar: ${nTxt(r.nEkor)} unit terakhir tidak menambah jenis baru.` : `Kurva akumulasi jenis masih menanjak: ${nTxt(r.nEkor)} unit terakhir masih menambah ${r.baruAkhir} jenis baru.`) : ""}`;
    },
    hitungHtml(r, c) {
      if (r.kosong) return "";
      const lv = c.lv, ob = Sub("S", "obs");
      const q2 = r.Q2 > 0 ? [F(Sup(num(r.Q1), "2"), `2 × ${num(r.Q2)}`)] : [F(`${num(r.Q1)} × (${num(r.Q1)} − 1)`, "2")];
      return [blk([Sub("S", "Chao2"), R(` = ${num(r.S)} + `), F(`${num(r.m)} − 1`, num(r.m)), R(" × "), ...q2, R(` = ${num(r.chao2, 2)}`)], lv),
        blk([Sub("S", "Jack1"), R(` = ${num(r.S)} + ${num(r.Q1)} × `), F(`${num(r.m)} − 1`, num(r.m)), R(` = ${num(r.jack1, 2)}`)], lv),
        blk([R("Kelengkapan = "), F(num(r.S), num(r.chao2, 2)), R(` × 100% = ${num(r.lengkap, 1)}%`)], lv)].join("");
    },
    spec(r) {
      return { head: ["Parameter", "Nilai"], rows: [[t("Jumlah unit contoh (m)"), n(r.m, 0)], [t("Jumlah jenis tercatat (S<sub>obs</sub>)"), n(r.S, 0)], [t("Jenis di satu unit (Q<sub>1</sub>)"), n(r.Q1, 0)], [t("Jenis di dua unit (Q<sub>2</sub>)"), n(r.Q2, 0)],
        [t("Chao2"), n(r.chao2, 2)], [t("Jackknife orde satu"), k(`${num(r.jack1, 2)} ± ${num(r.seJack, 2)}`)], [t("Chao1 (dari jumlah individu)"), n(r.chao1, 2)], [t("Kelengkapan inventarisasi (S<sub>obs</sub>/Chao2)"), k(`${num(r.lengkap, 1)}%`)]] };
    },
    akumulasi(r) { return { head: ["Unit ke-", "Unit contoh", "Jenis baru", "Jumlah jenis kumulatif"], rows: r.akumulasi.map((a) => [k(a.ke), t(esc(a.unit)), n(a.baru, 0), n(a.kumulatif, 0)]) }; },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Pendugaan Kekayaan Jenis ${L.judul(c.objek)}`, spec: this.spec(r) }]; },
    lampiran(r, c) { return r.kosong ? [] : [{ cap: `Kurva Akumulasi Jenis ${L.judul(c.objek)}`, spec: this.akumulasi(r) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Dugaan kekayaan jenis ${c.objek} adalah ${num(r.chao2, 1)} jenis (Chao2) dan ${num(r.jack1, 1)} jenis (Jackknife), dengan kelengkapan inventarisasi sekitar ${num(r.lengkap, 0)}%`; },
    kpi(r) { return r.kosong ? [] : [[num(r.chao2, 1), "dugaan jenis (Chao2)"], [`${num(r.lengkap, 0)}%`, "kelengkapan"]]; }
  };

  /* =====================================================================
   * 5. Persentase kategori (perilaku, tipe temuan, habitus, dll.): P = x/y × 100%
   * inp: { items: [[kategori, jumlah]] } ; opt: { label: "aktivitas" }
   * ===================================================================== */
  M.persen = {
    judul: "Persentase Kategori",
    hitung(inp) { const r = ST.persen(inp.items || []); return { ...r, kosong: !r.y }; },
    narMetode(c) { return `Persentase setiap ${c.opt.label || "kategori"} ${c.objek} dihitung dari frekuensi kategori tersebut terhadap seluruh ${c.opt.satuan || "catatan"}, dengan persamaan:`; },
    metode(c) { const lv = c.lv; return [blk([R("P = "), F("x", "y"), R(" × 100%")], lv), ket([["P", `persentase ${esc(c.opt.label || "kategori")} (%)`], ["x", `frekuensi satu ${esc(c.opt.label || "kategori")}`], ["y", `jumlah seluruh ${esc(c.opt.satuan || "catatan")}`]], lv)].join(""); },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada catatan ${c.opt.label || "kategori"} ${c.objek}.`;
      // Tiga teratas, ditambah kategori lain yang nilainya sama dengan urutan ketiga
      const top = r.rows.filter((x, i) => i < 3 || x.x === r.rows[2].x);
      return `Dari ${nTxt(r.y)} ${c.opt.satuan || "catatan"}, ${c.opt.label || "kategori"} yang paling banyak adalah ${daftarKata(top.map((x) => `${x.k.toLowerCase()} (${num(x.p, 1)}%)`))}.`;
    },
    hitungHtml(r, c) { if (r.kosong) return ""; const a = r.rows[0]; return blk([R("P = "), F(num(a.x), num(r.y)), R(` × 100% = ${num(a.p, 2)}%`)], c.lv); },
    spec(r, c) { return { head: ["No", L.judul(c.opt.label || "Kategori"), "Frekuensi", "Persentase (%)"], rows: r.rows.map((x, i) => [k(i + 1), t(esc(x.k)), n(x.x, 0), n(x.p, 2)]), total: [[{ t: "Jumlah", cs: 2 }, n(r.y, 0), n(100, 2)]] }; },
    tabel(r, c) { return r.kosong ? [] : [{ cap: c.opt.cap || `Persentase ${L.judul(c.opt.label || "Kategori")} ${L.judul(c.objek)}`, spec: this.spec(r, c) }]; },
    simpulan(r, c) {
      if (r.kosong) return "";
      const atas = r.rows.filter((x) => x.x === r.rows[0].x);
      return `${L.cap1(c.opt.label || "kategori")} ${c.objek} yang paling sering tercatat adalah ${daftarKata(atas.map((x) => x.k.toLowerCase()))} (${atas.length > 1 ? "masing-masing " : ""}${num(r.rows[0].p, 1)}%)`;
    },
    kpi() { return []; }
  };

  /* =====================================================================
   * 6. Daftar jenis (deskriptif): famili, jumlah temuan, atribut tambahan
   * inp: { rows: [{ jenis, latin, famili, n, unit, ... }] } ; opt: { kolom: [{ key, label }], satuan: "individu" }
   * ===================================================================== */
  M.daftar = {
    judul: "Daftar Jenis",
    hitung(inp, opt = {}) {
      const g = perJenis(inp.rows || []).sort((a, b) => String(a.rows[0].famili || "").localeCompare(String(b.rows[0].famili || "")) || a.jenis.localeCompare(b.jenis));
      const kol = opt.kolom || [];
      const baris = g.map((b, i) => {
        const o = { no: i + 1, jenis: b.jenis, latin: b.latin, n: b.n, temu: b.rows.length, unit: [...b.unit], famili: (b.rows.find((r) => r.famili) || {}).famili || "" };
        kol.forEach((c) => { const v = [...new Set(b.rows.map((r) => String(r[c.key] ?? "").trim()).filter(Boolean))]; o[c.key] = v.join(", "); });
        return o;
      });
      const fam = new Map(); baris.forEach((b) => { if (b.famili) fam.set(b.famili, (fam.get(b.famili) || 0) + 1); });
      return { kosong: !baris.length, baris, S: baris.length, N: baris.reduce((s, b) => s + b.n, 0), famili: [...fam.entries()].sort((a, b) => b[1] - a[1]), kol };
    },
    narMetode(c) { return `Data hasil identifikasi dianalisis secara deskriptif: daftar jenis ${c.objek}, ${c.opt.kelompok || "famili"}, jumlah temuan, dan lokasi ditemukannya, dilengkapi foto dan ciri pengenal tiap jenis.`; },
    metode() { return ""; },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data jenis ${c.objek}.`;
      const f = r.famili;
      const kl = c.opt.kelompok || "famili";
      const banyak = f.filter(([, x]) => x > 1).slice(0, 3);
      const fTxt = banyak.length ? ` ${L.cap1(kl)} dengan jenis terbanyak adalah ${daftarKata(banyak.map(([nmF, x]) => `${nmF} (${x} jenis)`))}.` : f.length > 1 ? ` Setiap ${kl} diwakili oleh satu jenis.` : "";
      const tanpa = f.length ? r.baris.filter((b) => !b.famili).length : 0;
      return `Teridentifikasi ${nTxt(r.S)} jenis ${c.objek}${f.length ? ` dari ${nTxt(f.length)} ${kl}${tanpa ? ` (${tanpa} jenis belum diketahui ${kl}nya)` : ""}` : ""} dengan jumlah ${r.N} ${c.opt.satuan || "individu"}.${fTxt}`;
    },
    hitungHtml() { return ""; },
    spec(r, c) {
      const kol = r.kol;
      return { head: ["No", ...(r.famili.length ? [L.judul(c.opt.kelompok || "famili")] : []), "Nama Jenis", "Nama Ilmiah", `Jumlah (${c.opt.satuan || "individu"})`, ...kol.map((x) => x.label), "Unit/Lokasi Temuan"],
        rows: r.baris.map((b) => [k(b.no), ...(r.famili.length ? [t(esc(b.famili))] : []), t(esc(b.jenis)), t(sci(b.latin)), n(b.n, 0), ...kol.map((x) => t(esc(b[x.key] || "-"))), t(esc(b.unit.join(", ") || "-"))]),
        total: [[{ t: "Jumlah", cs: r.famili.length ? 4 : 3 }, n(r.N, 0), ...kol.map(() => t("")), t("")]] };
    },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Daftar Jenis ${L.judul(c.objek)} yang Ditemukan`, spec: this.spec(r, c) }]; },
    simpulan(r, c) { return r.kosong ? "" : `Teridentifikasi ${nTxt(r.S)} jenis ${c.objek}${r.famili.length ? ` dari ${r.famili.length} ${c.opt.kelompok || "famili"}` : ""}`; },
    kpi(r, c) { return r.kosong ? [] : [[r.S, "jenis"], [r.famili.length || "-", (c && c.opt.kelompok) || "famili"]]; }
  };

  /* =====================================================================
   * 7. Struktur populasi: nisbah kelamin dan kelas umur (perjumpaan langsung)
   * inp: { rows: [{ jantan, betina, dewasa, muda, anak }] }
   * ===================================================================== */
  M.struktur = {
    judul: "Struktur Populasi",
    hitung(inp) {
      const s = (k_) => (inp.rows || []).reduce((a, r) => a + (fin(toN(r[k_])) ? toN(r[k_]) : 0), 0);
      const J = s("jantan"), B = s("betina"), D = s("dewasa"), Mu = s("muda"), A = s("anak");
      return { kosong: !(J + B + D + Mu + A), J, B, D, Mu, A, SR: B ? J / B : null };
    },
    narMetode(c) { return `Struktur populasi ${c.objek} dianalisis dari perjumpaan langsung, berupa nisbah kelamin (sex ratio) dan perbandingan kelas umur (anak, muda, dewasa):`; },
    metode(c) { const lv = c.lv; return [blk([R("SR = "), F("J", "B")], lv), ket([["SR", "nisbah kelamin"], ["J", "jumlah individu jantan"], ["B", "jumlah individu betina"]], lv)].join(""); },
    narHasil(r, c) {
      if (r.kosong) return `Belum ada data kelas umur atau jenis kelamin ${c.objek} dari perjumpaan langsung.`;
      const kel = r.J + r.B ? `Dari perjumpaan langsung tercatat ${r.J} individu jantan dan ${r.B} individu betina${r.SR !== null ? ` sehingga nisbah kelamin 1 : ${num(r.B / Math.max(r.J, 1e-9), 2)} (SR = ${num(r.SR, 2)})` : ""}.` : "Jenis kelamin individu yang dijumpai tidak dapat diidentifikasi.";
      return `${kel}${r.A + r.Mu + r.D ? ` Perbandingan kelas umur anak : muda : dewasa adalah ${r.A} : ${r.Mu} : ${r.D}.` : ""}`;
    },
    hitungHtml(r, c) { return r.kosong || r.SR === null ? "" : blk([R("SR = "), F(num(r.J), num(r.B)), R(` = ${num(r.SR, 2)}`)], c.lv); },
    spec(r) { return { head: ["Jantan", "Betina", "Nisbah Kelamin (J/B)", "Anak", "Muda", "Dewasa"], rows: [[n(r.J, 0), n(r.B, 0), r.SR === null ? k("-") : n(r.SR, 2), n(r.A, 0), n(r.Mu, 0), n(r.D, 0)]] }; },
    tabel(r, c) { return r.kosong ? [] : [{ cap: `Struktur Populasi ${L.judul(c.objek)} dari Perjumpaan Langsung`, spec: this.spec(r) }]; },
    simpulan(r, c) {
      if (r.kosong) return "";
      const bag = [];
      if (r.J + r.B) bag.push(`${r.J} jantan dan ${r.B} betina`);
      if (r.A + r.Mu + r.D) bag.push(`anak : muda : dewasa = ${r.A} : ${r.Mu} : ${r.D}`);
      return `Struktur populasi ${c.objek} dari perjumpaan langsung: ${bag.join("; ")}`;
    },
    kpi() { return []; }
  };
})();
