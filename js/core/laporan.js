/*
 * Bagian laporan yang dipakai bersama semua kegiatan PEH.
 * Format mengikuti Memorandum M.57/T.41/TU/PEG/02/2026 (Lampiran 4, laporan kegiatan keteknisan)
 * seperti di Generator LPK SMART Patrol: sampul, lembar pengesahan, daftar isi/tabel, kop,
 * LAPORAN / TENTANG / judul, bagian bernomor, penutup, dan lampiran.
 */
(function () {
  "use strict";

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const SATUAN = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];

  const parseISO = (iso) => { const [y, m, d] = String(iso).split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const toISO = (dt) => dt.toISOString().substr(0, 10);
  const addDays = (iso, n) => { const d = parseISO(iso); d.setUTCDate(d.getUTCDate() + n); return toISO(d); };
  const validISO = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(String(iso || ""));
  function tglPanjang(iso, withDay) {
    if (!validISO(iso)) return "";
    const dt = parseISO(iso);
    return (withDay ? HARI[dt.getUTCDay()] + ", " : "") + `${dt.getUTCDate()} ${BULAN[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`;
  }
  // "10 Juni s.d. 14 Juni 2021"
  function periodeSd(a, b) {
    if (!validISO(a)) return "";
    if (!validISO(b) || a === b) return tglPanjang(a);
    const A = parseISO(a), B = parseISO(b);
    const left = `${A.getUTCDate()} ${BULAN[A.getUTCMonth()]}` + (A.getUTCFullYear() !== B.getUTCFullYear() ? " " + A.getUTCFullYear() : "");
    return `${left} s.d. ${tglPanjang(b)}`;
  }
  const jumlahHari = (a, b) => (validISO(a) && validISO(b) ? Math.round((parseISO(b) - parseISO(a)) / 864e5) + 1 : 0);
  const bulanTahun = (iso) => (validISO(iso) ? `${BULAN[parseISO(iso).getUTCMonth()]} ${iso.substr(0, 4)}` : "");
  // Bilangan bulat dalam kata: 270 → "dua ratus tujuh puluh"
  function kata(x) {
    const S = SATUAN;
    if (x < 12) return S[x];
    if (x < 20) return kata(x - 10) + " belas";
    if (x < 100) return kata(Math.floor(x / 10)) + " puluh" + (x % 10 ? " " + kata(x % 10) : "");
    if (x < 200) return "seratus" + (x - 100 ? " " + kata(x - 100) : "");
    if (x < 1000) return kata(Math.floor(x / 100)) + " ratus" + (x % 100 ? " " + kata(x % 100) : "");
    if (x < 2000) return "seribu" + (x - 1000 ? " " + kata(x - 1000) : "");
    for (const [v, w] of [[1e12, "triliun"], [1e9, "miliar"], [1e6, "juta"], [1e3, "ribu"]])
      if (x >= v) return kata(Math.floor(x / v)) + " " + w + (x % v ? " " + kata(x % v) : "");
    return "";
  }
  const terbilang = (n) => (Number.isInteger(n) && n >= 0 && n < 1e15 ? kata(n) : String(n));
  const nTxt = (n) => (Number.isInteger(n) && n >= 0 ? `${n.toLocaleString("id-ID")} (${terbilang(n) || "nol"})` : String(n));
  // Angka gaya Indonesia: 0,0027 ; 3.297
  const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v).toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }) : "-");
  const numVal = (v) => Number(String(v ?? "").replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".")) || 0;
  const rp = (n) => Math.round(n || 0).toLocaleString("id-ID");
  const rupiah = (n) => (n ? `Rp${rp(n)},00` : "");
  const fmtNip = (nip) => { const d = String(nip || "").replace(/\D/g, ""); return d.length === 18 ? `${d.substr(0, 8)} ${d.substr(8, 6)} ${d.substr(14, 1)} ${d.substr(15)}` : String(nip || ""); };
  const nb = (s) => String(s).replace(/ /g, " ");
  const cap1 = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
  // Huruf besar di awal setiap kata untuk judul tabel, kecuali kata tugas ("Daftar Jenis Tumbuhan Asing Invasif yang Ditemukan")
  const KATA_KECIL = new Set(["dan", "di", "ke", "dari", "yang", "pada", "untuk", "dengan", "atau", "per", "oleh", "dalam", "terhadap", "sebagai", "menurut"]);
  const judul = (s) => String(s || "").split(" ").map((w, i) => (i > 0 && KATA_KECIL.has(w.toLowerCase()) ? w.toLowerCase() : w.replace(/^([("'[]*)(\S)/, (m, a, h) => a + h.toUpperCase()))).join(" ");
  // Nama ilmiah dalam kurung dicetak miring: "Elang bondol (Haliastur indus)"
  const italicLatin = (html) => html.replace(/\(([A-Z][a-z]+ [a-z]+(?: [a-z]+)?)\)/g, "(<i>$1</i>)");
  const sci = (s) => `<i>${esc(s)}</i>`;

  function terbilangRupiah(n) {
    const f = kata;
    n = Math.round(n || 0);
    return n ? (f(n) + " rupiah").replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Nol Rupiah";
  }

  /* ---------- Blok halaman awal ---------- */
  const DEFAULT_PROFIL = {
    balai: "Balai Taman Nasional Tambora",
    alamat: "Jl. Syech Muhammad No. 5 Dompu 84212",
    kontak: "Telp. 0370-21919 Fax. 0370-21919, e-mail : tntambora@gmail.com"
  };
  function kopHtml(P = DEFAULT_PROFIL) {
    return `<div class="kop">${window.PEH_KOP_LOGO ? `<img src="${window.PEH_KOP_LOGO}" alt="">` : ""}<div class="kop-t"><div>KEMENTERIAN KEHUTANAN</div><div>DIREKTORAT JENDERAL KONSERVASI SUMBER DAYA ALAM DAN EKOSISTEM</div><div class="big">${esc(P.balai.toUpperCase())}</div>${P.alamat ? `<div class="addr">${esc(P.alamat)}</div>` : ""}${P.kontak ? `<div class="addr">${esc(P.kontak)}</div>` : ""}</div></div>`;
  }
  const titleHtml = (jenis, judul) => `<div class="doc-title"><p class="b">${esc(jenis)}</p><p class="gap">&nbsp;</p><p>TENTANG</p><p class="b">${esc(judul.toUpperCase())}</p></div>`;
  function coverHtml(o) {
    return `<div class="cover"><p class="cv-title">${esc(o.jenis)}<br>${esc(o.judul.toUpperCase())}<br>${esc(o.balai.toUpperCase())}</p>
      ${o.logo ? `<img class="cv-logo" src="${o.logo}" alt="">` : `<div class="cv-logo nologo">Logo Balai</div>`}
      <p class="cv-by">OLEH:<br>TIM PELAKSANA KEGIATAN</p>
      <p class="cv-st">${esc(o.nomorST ? (/^ST/i.test(o.nomorST) ? o.nomorST : "ST. " + o.nomorST) : "ST. ……………")}<br>${esc(String(o.periode || "").toUpperCase())}</p>
      <p class="cv-place">${esc((o.kota || "………").toUpperCase())}, ${esc(String(o.bulanTahun || "").toUpperCase())}</p></div>`;
  }
  function sign(lines, name, nip, cls = "") {
    return `<div class="sg${cls ? " " + cls : ""}">${lines.filter((l) => l !== undefined).map((l) => `<div>${esc(l) || "&nbsp;"}</div>`).join("")}<div class="space"></div><div class="nm">${esc(name || "……………………………")}</div><div>NIP. ${esc(fmtNip(nip) || "……………………")}</div></div>`;
  }
  const kvTable = (kv) => `<table class="kv-plain">${kv.map(([k, v]) => `<tr><td>${esc(k)}</td><td>:</td><td>${esc(v)}</td></tr>`).join("")}</table>`;
  // s = { kiri, kanan, bawah }: { head, jabatan, nama, nip }
  function pengesahanHtml(profil, kv, s) {
    const g = (x) => x || {};
    return `${kopHtml(profil)}<h1 class="front" id="pengesahan">LEMBAR PENGESAHAN</h1>${kvTable(kv)}
      <table class="sign memo"><tr><td>${sign([g(s.kiri).head || "", g(s.kiri).jabatan], g(s.kiri).nama, g(s.kiri).nip, "memo")}</td><td>${sign([g(s.kanan).head || "", g(s.kanan).jabatan], g(s.kanan).nama, g(s.kanan).nip, "memo")}</td></tr>
      <tr><td colspan="2">${sign([g(s.bawah).head || "", g(s.bawah).jabatan], g(s.bawah).nama, g(s.bawah).nip, "memo")}</td></tr></table>`;
  }
  function tocHtml(toc, tables) {
    return `<h1 class="front pb">DAFTAR ISI</h1><div class="toc" data-toc="isi">${toc.map((e) => `<div class="toc-${e.lv}">${esc(e.text)}</div>`).join("")}</div>
      <p class="toc-note noprint">Nomor halaman daftar isi dan daftar tabel terisi otomatis di file Word (pilih Yes saat Word menawarkan pembaruan field).</p>
      <h1 class="front pb">DAFTAR TABEL</h1><div class="toc" data-toc="tabel">${tables.map((t) => `<div class="toc-1">${esc(t)}</div>`).join("")}</div>`;
  }
  const closingHtml = (tempat, tanggal, jabatan, nama, nip) =>
    `<table class="sign close"><tr><td></td><td>${sign([`Dibuat di ${tempat || "………"}`, `Pada tanggal ${tanggal || "………"}`, jabatan], nama, nip, "close")}</td></tr></table>`;
  const lampiranIndex = (items) => `<div class="lamp-idx"><p class="lamp-head">LAMPIRAN</p><ul class="arrow">${items.map((x, i) => `<li>${esc(x)}${i === items.length - 1 ? "." : ";"}</li>`).join("")}</ul></div>`;

  // Penomoran judul dan tabel; daftar isi dan daftar tabel dikumpulkan sambil menyusun isi
  function numbering() {
    const toc = [], tables = [];
    let tab = 0;
    return {
      toc, tables,
      h1(text, cls = "sec", pb = false) { toc.push({ lv: 1, text }); return `<h1 class="${cls}${pb ? " pb" : ""}">${esc(text)}</h1>`; },
      h2(text, cls = "", pb = false) { toc.push({ lv: 2, text }); return `<h2 class="${(cls + (pb ? " pb" : "")).trim()}">${esc(text)}</h2>`; },
      h3: (text) => `<h3>${esc(text)}</h3>`,
      cap(text) { tab++; tables.push(`Tabel ${tab} ${text}`); return `<p class="cap" data-n="${tab}">Tabel ${tab} ${esc(text)}</p>`; },
      next: () => tab + 1
    };
  }
  const para = (html, lv = 2) => `<p class="para lv${lv}">${html}</p>`;
  // Narasi yang bisa disunting langsung di pratinjau; "1. …" dan "a. …" menjadi butir menggantung
  function noteBlock(notes, key, lv = 2) {
    const text = String(notes[key] || "");
    const html = text ? text.split("\n").map((l) => {
      const t = l.trim(), cls = /^\d+[.)]\s/.test(t) ? "num" : /^[a-z][.)]\s/.test(t) ? "let" : "par";
      return `<div class="ln ${cls}">${t ? italicLatin(esc(l).replace(/\[([^\]]+)\]/g, '<mark class="ph">[$1]</mark>')) : "<br>"}</div>`;
    }).join("") : "";
    return `<div class="note para lv${lv}" contenteditable="true" data-note="${key}">${html}</div>`;
  }
  const olList = (arr, lv = 2) => `<ol class="list lv${lv}">${arr.map((x) => `<li>${italicLatin(esc(x))}</li>`).join("")}</ol>`;

  /* ---------- Tabel bersama ---------- */
  function timTable(tim) {
    const rows = (tim || []).filter((m) => String(m.nama || "").trim());
    return `<table class="data team"><thead><tr><th>No</th><th>Nama</th><th>NIP</th><th>Pangkat/ Golongan</th><th>Jabatan</th><th>Peran dalam Tim</th></tr></thead><tbody>${rows.map((m, i) => `<tr><td class="c">${i + 1}</td><td>${esc(m.nama)}</td><td class="nw">${esc(fmtNip(m.nip) || "-")}</td><td>${esc(m.pangkat || "-")}</td><td>${esc(m.jabatan || "-")}</td><td>${esc(m.peran || "Anggota")}</td></tr>`).join("") || `<tr><td colspan="6" class="c">Belum ada anggota tim.</td></tr>`}</tbody></table>`;
  }
  function alatTable(alat) {
    const r = (alat || []).filter((x) => String(x.nama || "").trim());
    return `<table class="data alat"><thead><tr><th>No</th><th>Jenis Alat dan Bahan</th><th>Jumlah</th><th>Satuan</th></tr></thead><tbody>${r.map((x, i) => `<tr><td class="c">${i + 1}</td><td>${esc(x.nama)}</td><td class="c">${esc(x.jumlah || "-")}</td><td class="c">${esc(x.satuan || "-")}</td></tr>`).join("") || `<tr><td colspan="4" class="c">Belum ada daftar alat dan bahan.</td></tr>`}</tbody></table>`;
  }
  const rabRows = (rab) => (rab || []).filter((r) => String(r.uraian || "").trim()).map((r) => ({ ...r, total: numVal(r.volume) * numVal(r.harga) }));
  function rabTable(rab) {
    const rows = rabRows(rab), total = rows.reduce((a, r) => a + r.total, 0);
    return { total, html: `<table class="data rab"><thead><tr><th>No</th><th>Jenis Belanja</th><th>Volume</th><th>Harga Satuan (Rp)</th><th>Jumlah (Rp)</th></tr></thead><tbody>${rows.map((r, i) => `<tr><td class="c">${i + 1}</td><td>${esc(r.uraian)}</td><td class="c nw">${esc(`${r.volume} ${r.satuan || ""}`.trim())}</td><td class="r">${rp(numVal(r.harga))}</td><td class="r">${rp(r.total)}</td></tr>`).join("") || `<tr><td colspan="5" class="c">Rincian anggaran belum diisi.</td></tr>`}<tr class="total"><td colspan="4">Total</td><td class="r">${rp(total)}</td></tr><tr><td colspan="5"><i>Terbilang: ${esc(terbilangRupiah(total))}</i></td></tr></tbody></table>` };
  }
  // Tata waktu: [tahapan, mulai, selesai] per hari
  function ganttTable(rows) {
    const ok = rows.filter((r) => validISO(r[1]) && validISO(r[2]) && r[1] <= r[2]);
    if (!ok.length) return "";
    const a = ok.map((r) => r[1]).sort()[0], b = ok.map((r) => r[2]).sort().pop();
    const days = [];
    for (let d = a; d <= b && days.length < 62; d = addDays(d, 1)) days.push(d);
    const months = [];
    days.forEach((d) => { const m = parseISO(d).getUTCMonth(), y = parseISO(d).getUTCFullYear(), L = months[months.length - 1]; if (L && L.m === m && L.y === y) L.n++; else months.push({ m, y, n: 1 }); });
    return `<table class="data gantt"><thead><tr><th rowspan="2">No</th><th rowspan="2">Tahapan Kegiatan</th>${months.map((x) => `<th colspan="${x.n}">${BULAN[x.m]} ${x.y}</th>`).join("")}</tr><tr>${days.map((d) => `<th class="d">${parseISO(d).getUTCDate()}</th>`).join("")}</tr></thead><tbody>${ok.map((r, i) => `<tr><td class="c">${i + 1}.</td><td>${esc(r[0])}</td>${days.map((d) => `<td class="${d >= r[1] && d <= r[2] ? "on" : ""}"></td>`).join("")}</tr>`).join("")}</tbody></table>`;
  }

  window.PEHLaporan = { esc, BULAN, HARI, parseISO, addDays, validISO, tglPanjang, periodeSd, jumlahHari, bulanTahun, terbilang, nTxt, num, numVal, rp, rupiah, fmtNip, nb, cap1, judul, italicLatin, sci, terbilangRupiah,
    DEFAULT_PROFIL, kopHtml, titleHtml, coverHtml, sign, kvTable, pengesahanHtml, tocHtml, closingHtml, lampiranIndex, numbering, para, noteBlock, olList, timTable, alatTable, rabRows, rabTable, ganttTable };
})();
