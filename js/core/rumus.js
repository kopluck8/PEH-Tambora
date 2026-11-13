/*
 * Rumus matematika untuk laporan: satu definisi dipakai dua kali,
 * sebagai MathML di pratinjau browser dan sebagai equation asli Word (OMML) di file .docx.
 *
 * Penulisan rumus memakai pembangun kecil:
 *   R("D")                 teks/variabel           F(a, b)            pecahan a/b
 *   Sub(b, s)  Sup(b, s)   subskrip/superskrip     SubSup(b, s, p)    keduanya
 *   Sum(isi)               Σ isi                   P(isi)             (isi)
 *   Sqrt(isi)              √isi
 * Argumen boleh berupa string, simpul, atau array keduanya.
 */
(function () {
  "use strict";
  const arr = (x) => (Array.isArray(x) ? x : [x]).flat().map((v) => (typeof v === "string" || typeof v === "number" ? { t: "r", v: String(v) } : v));
  const R = (v) => ({ t: "r", v: String(v) });
  const F = (n, d) => ({ t: "frac", n: arr(n), d: arr(d) });
  const Sub = (b, s) => ({ t: "sub", b: arr(b), s: arr(s) });
  const Sup = (b, s) => ({ t: "sup", b: arr(b), s: arr(s) });
  const SubSup = (b, s, p) => ({ t: "subsup", b: arr(b), s: arr(s), p: arr(p) });
  const Sum = (c) => ({ t: "sum", c: arr(c) });
  const P = (c) => ({ t: "par", c: arr(c) });
  const Sqrt = (c) => ({ t: "sqrt", c: arr(c) });
  const eq = (...parts) => arr(parts);

  /* ---------- MathML (pratinjau) ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // Pecah teks menjadi angka, operator, dan identifier supaya tampil seperti rumus
  const OPS = /^[=+−\-×·/<>≤≥%()]$/;
  function runML(v) {
    const toks = v.split(/(\s+|[=+−\-×·/<>≤≥%()])/).filter((x) => x);
    return toks.map((tok, i) => {
      // Spasi antar kata/angka (mis. "0,0027 ind/ha") dipertahankan; di sekitar operator cukup jarak bawaan
      if (/^\s+$/.test(tok)) return toks[i - 1] && toks[i + 1] && !OPS.test(toks[i - 1]) && !OPS.test(toks[i + 1]) ? '<mspace width="0.25em"/>' : "";
      if (/^[\d.,]+$/.test(tok)) return `<mn>${esc(tok)}</mn>`;
      if (/^[A-Za-z]′$/.test(tok)) return `<msup><mi>${tok[0]}</mi><mo>′</mo></msup>`;
      if (OPS.test(tok)) return `<mo>${esc(tok === "-" ? "−" : tok)}</mo>`;
      if (/^[A-Za-zÀ-ÿ']+$/.test(tok) && tok.length > 1 && !/^[A-Z][a-z]?'?$/.test(tok)) return `<mi mathvariant="normal">${esc(tok)}</mi>`;
      return `<mi>${esc(tok)}</mi>`;
    }).join("");
  }
  const row = (a) => `<mrow>${a.map(ml).join("")}</mrow>`;
  function ml(n) {
    switch (n.t) {
      case "r": return runML(n.v);
      case "frac": return `<mfrac>${row(n.n)}${row(n.d)}</mfrac>`;
      case "sub": return `<msub>${row(n.b)}${row(n.s)}</msub>`;
      case "sup": return `<msup>${row(n.b)}${row(n.s)}</msup>`;
      case "subsup": return `<msubsup>${row(n.b)}${row(n.s)}${row(n.p)}</msubsup>`;
      case "sum": return `<mrow><mo largeop="true">∑</mo>${row(n.c)}</mrow>`;
      case "par": return `<mrow><mo>(</mo>${row(n.c)}<mo>)</mo></mrow>`;
      case "sqrt": return `<msqrt>${row(n.c)}</msqrt>`;
      default: return "";
    }
  }
  const toMathML = (nodes, block = true) => `<math${block ? ' display="block"' : ""}>${row(nodes)}</math>`;
  // Blok rumus untuk laporan; definisinya ikut tersimpan agar ekspor Word bisa membuat equation asli
  const blockHtml = (nodes, lv = 2) => `<div class="eq lv${lv}" data-eq="${esc(JSON.stringify(nodes))}">${toMathML(nodes)}</div>`;

  // Keterangan simbol: [[simbol (string atau simpul rumus), uraian], ...]; uraian berupa HTML yang sudah aman
  const ketHtml = (rows, lv = 2, head = "Keterangan:") => `<p class="ket-head lv${lv}">${esc(head)}</p><table class="ket lv${lv}">${rows.map(([sym, desc]) => {
    const nodes = arr(sym);
    return `<tr><td><span data-eq="${esc(JSON.stringify(nodes))}">${toMathML(nodes, false)}</span></td><td>=</td><td>${desc}</td></tr>`;
  }).join("")}</table>`;

  /* ---------- Word (OMML lewat pustaka docx) ---------- */
  function toDocx(nodes, D) {
    const conv = (a) => a.flatMap(dx);
    function dx(n) {
      switch (n.t) {
        case "r": return [new D.MathRun(n.v)];
        case "frac": return [new D.MathFraction({ numerator: conv(n.n), denominator: conv(n.d) })];
        case "sub": return [new D.MathSubScript({ children: conv(n.b), subScript: conv(n.s) })];
        case "sup": return [new D.MathSuperScript({ children: conv(n.b), superScript: conv(n.s) })];
        case "subsup": return [new D.MathSubSuperScript({ children: conv(n.b), subScript: conv(n.s), superScript: conv(n.p) })];
        case "sum": return [new D.MathSum({ children: conv(n.c) })];
        case "par": return [new D.MathRoundBrackets({ children: conv(n.c) })];
        case "sqrt": return [new D.MathRadical({ children: conv(n.c) })];
        default: return [];
      }
    }
    return new D.Math({ children: conv(nodes) });
  }

  window.PEHRumus = { ketHtml, R, F, Sub, Sup, SubSup, Sum, P, Sqrt, eq, toMathML, blockHtml, toDocx };
})();
