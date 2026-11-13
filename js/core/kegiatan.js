/*
 * Mesin kegiatan PEH: satu konfigurasi (tabel data, parameter, modul analisis, teks) menjadi generator lengkap
 * (tab Data, Hasil Analisis, RPK, dan LPK) yang didaftarkan ke PEH. Contoh konfigurasi: kegiatan/burung/burung.js.
 *
 * cfg = {
 *   id, kode, judul, ringkas, objek, kategoriSMART, kamusSMART, alat, contoh,
 *   tabel: [{ key, judul, ket, kolom: [{ key, label, type, list, options, w }], smart: { sub, map(o, v) }, baruBaris() }],
 *   parameter: [{ key, label, type, options, half, step, def }], paramInfo,
 *   modul: [{ m, id, judul, judulMetode, objek, opsional, input(S, P, A), opt(P, S) }],  (judul, judulMetode, objek boleh fungsi (P, S))
 *   teks: { latar, maksud, ruanglingkup, lokasi, lokasiRPK, metode, anPengantar, hasilLokasi, pembahasan, saran, dasar: [..] },
 *   lokasiTabel(S, P) → { cap, spec } (opsional), isian: [{ key, label, rows }] (teks tambahan di tab Data)
 * }
 */
(function () {
  "use strict";
  const L = window.PEHLaporan, D = window.PEHDok, M = window.PEHModul, R_ = M.render;
  const { esc, num, nTxt, noteBlock, para, numbering, periodeSd, jumlahHari, cap1 } = L;
  const { daftarKata } = M.util;

  function parseCSV(text) {
    const first = text.split(/\r?\n/)[0];
    const sep = (first.match(/;/g) || []).length >= (first.match(/,/g) || []).length ? ";" : ",";
    const rows = []; let row = [], cur = "", q = false;
    text = text.replace(/^﻿/, "");
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) { if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
      else if (c === '"') q = true;
      else if (c === sep) { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += c;
    }
    if (cur || row.length) { row.push(cur); rows.push(row); }
    return rows;
  }

  function kegiatan(cfg) {
    const defaults = () => Object.fromEntries((cfg.parameter || []).filter((f) => f.key).map((f) => [f.key, f.def ?? ""]));
    const kosongData = () => Object.fromEntries(cfg.tabel.map((t) => [t.key, []]));
    const isi = (S) => { S.param = { ...defaults(), ...(S.param || {}) }; S.data = { ...kosongData(), ...(S.data || {}) }; S.teks = S.teks || {}; return S; };
    // Modul opsional (mis. vegetasi habitat) tidak tampil di LPK bila datanya kosong; RPK tetap memuat metodenya
    const tampil = (m, A, rpk) => rpk || !m.opsional || !!(A[m.id] && !A[m.id].kosong);
    const ctxM = (m, P, S) => {
      const mod = M[m.m], opt = typeof m.opt === "function" ? m.opt(P, S) : m.opt || {};
      const f = (v) => (typeof v === "function" ? v(P, S) : v);
      return { id: m.id, judul: f(m.judul) || mod.judul, judulMetode: f(m.judulMetode), objek: f(m.objek) || cfg.objek, opt, lv: 3 };
    };

    function hitung(S) {
      isi(S);
      const P = S.param, A = { _P: P };
      cfg.modul.forEach((m) => {
        const c = ctxM(m, P, S);
        try { A[m.id] = M[m.m].hitung(m.input(S, P, A), c.opt); } catch (e) { console.error(m.id, e); A[m.id] = { kosong: true, galat: e.message }; }
      });
      return A;
    }

    function ctx(S, A) {
      const I = S.identitas, P = S.param;
      const wil = I.resort ? `wilayah kerja ${I.resort}${I.sptn ? `, ${I.sptn}` : ""}` : I.lokasi || "lokasi kegiatan";
      return { S, I, P, D: S.data, A, wil, lokasi: I.lokasi || wil, judul: I.judul || cfg.judul, objek: cfg.objek, catatan: S.catatanLapangan || "", teks: S.teks, hari: jumlahHari(I.mulai, I.selesai), periode: periodeSd(I.mulai, I.selesai), num, nTxt, daftarKata, cap1 };
    }
    const baris = (v) => (Array.isArray(v) ? v.filter(Boolean).join("\n") : v || "");
    const nomori = (arr) => arr.filter(Boolean).map((s, i, a) => `${i + 1}. ${s}${i === a.length - 1 ? "." : ";"}`).join("\n");

    /* ---------- Narasi otomatis ---------- */
    function narasiDasar(x) {
      const T = cfg.teks;
      return { latar: baris(T.latar(x)), maksud: baris(T.maksud(x)), ruanglingkup: baris(T.ruanglingkup(x)), metode: baris(T.metode(x)),
        an_pengantar: baris(T.anPengantar ? T.anPengantar(x) : `Data hasil pengamatan dianalisis secara kuantitatif dan deskriptif dengan persamaan sebagai berikut.`) };
    }
    function narasi(A, S) {
      isi(S);
      const x = ctx(S, A), T = cfg.teks, P = S.param;
      const out = { ...narasiDasar(x), lokasi: baris(T.lokasi(x)), waktu: D.waktuTeks(S.identitas, false),
        hasil_lokasi: baris(T.hasilLokasi ? T.hasilLokasi(x) : `Pengamatan dilakukan di ${x.lokasi}.`) + (x.catatan ? `\n${x.catatan}` : ""),
        pembahasan: baris(T.pembahasan ? T.pembahasan(x) : ""),
        saran: nomori(T.saran ? T.saran(x) : []),
        penutup: `Demikian laporan pelaksanaan kegiatan ${x.judul} ini disusun sebagai bahan informasi dan pertimbangan dalam pengelolaan kawasan Taman Nasional Tambora.` };
      const simp = [];
      if (T.simpulanAwal) simp.push(T.simpulanAwal(x));
      cfg.modul.forEach((m) => {
        const c = ctxM(m, P, S), r = A[m.id], mod = M[m.m];
        out[`an_${m.id}`] = mod.narMetode(c);
        out[`hasil_${m.id}`] = r && !r.galat ? mod.narHasil(r, c) : `Perhitungan gagal: ${r && r.galat}`;
        if (r && !r.kosong && !r.galat) simp.push(mod.simpulan(r, c));
      });
      if (T.simpulanAkhir) simp.push(T.simpulanAkhir(x));
      out.kesimpulan = nomori(simp);
      return out;
    }
    function narasiRPK(A, S) {
      isi(S);
      const x = ctx(S, A), T = cfg.teks, P = S.param;
      const out = { ...narasiDasar(x), lokasi: baris(T.lokasiRPK ? T.lokasiRPK(x) : T.lokasi(x)), waktu: D.waktuTeks(S.identitas, true), penutup: D.penutupRPK(x.judul) };
      cfg.modul.forEach((m) => { out[`an_${m.id}`] = M[m.m].narMetode(ctxM(m, P, S)); });
      return out;
    }

    /* ---------- Bagian laporan ---------- */
    function metodeAnalisis(A, S, notes, N, rpk) {
      const out = [noteBlock(notes, "an_pengantar")];
      let i = 0;
      cfg.modul.filter((m) => tampil(m, A, rpk)).forEach((m) => {
        const c = ctxM(m, S.param, S), mod = M[m.m];
        i++;
        out.push(N.h3(`${i}) ${c.judulMetode || c.judul}`), noteBlock(notes, `an_${m.id}`, 3), mod.metode(c, A[m.id] || {}));
      });
      return out.join("\n");
    }
    const tabelHtml = (N, x) => `${N.cap(x.cap)}${R_.paperTable(x.spec)}${x.catatan ? `<p class="fn">${esc(x.catatan)}</p>` : ""}`;
    let gambarNo = 0;
    function hasil(A, S, notes, N) {
      const out = [N.h3(`1) ${cfg.judulLokasi || "Lokasi dan Unit Pengamatan"}`), noteBlock(notes, "hasil_lokasi", 3)];
      if (cfg.lokasiTabel) { const lt = cfg.lokasiTabel(S, S.param); if (lt && lt.spec.rows.length) out.push(tabelHtml(N, lt)); }
      let i = 1;
      cfg.modul.filter((m) => tampil(m, A, false)).forEach((m) => {
        const c = ctxM(m, S.param, S), r = A[m.id], mod = M[m.m];
        i++;
        out.push(N.h3(`${i}) ${c.judul}`), noteBlock(notes, `hasil_${m.id}`, 3));
        if (!r || r.kosong || r.galat) return;
        out.push(mod.hitungHtml(r, c));
        mod.tabel(r, c).forEach((x) => out.push(tabelHtml(N, x)));
        if (mod.gambar) { const g = mod.gambar(r, c); if (g) { gambarNo++; out.push(g, `<p class="fn">Gambar ${gambarNo}. ${esc(cap1(`sebaran titik perjumpaan dan poligon cembung minimum ${c.objek}`))}</p>`); } }
      });
      return out.join("\n");
    }
    const nilaiSel = (c, v) => {
      if (v === undefined || v === null || v === "") return "";
      if (c.key === "tanggal" && L.validISO(v)) return esc(L.tglPanjang(v));
      if (c.type === "number" && Number.isFinite(Number(v))) return esc(num(Number(v), Number.isInteger(Number(v)) ? 0 : Math.min(6, (String(v).split(".")[1] || "").length)));
      if (c.latin) return L.sci(v);
      return esc(v);
    };
    function lampiranData(S, N) {
      const out = [];
      cfg.tabel.forEach((tb) => {
        const rows = (S.data[tb.key] || []).filter((r) => Object.values(r).some((v) => String(v ?? "").trim()));
        if (!rows.length) return;
        const kol = tb.kolom.filter((c) => !c.bukanLampiran);
        out.push(N.cap(`Data ${tb.judul}`), `<table class="data"><thead><tr><th>No</th>${kol.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr><td class="c">${i + 1}</td>${kol.map((c) => `<td${c.type === "number" || c.tengah ? ' class="c"' : ""}>${nilaiSel(c, r[c.key])}</td>`).join("")}</tr>`).join("")}</tbody></table>`);
      });
      return out.length ? out.join("\n") : para("Data hasil kegiatan belum diisi.", 1);
    }
    function lampiranAnalisis(A, S, N) {
      const out = [];
      cfg.modul.forEach((m) => {
        const c = ctxM(m, S.param, S), r = A[m.id], mod = M[m.m];
        if (!r || r.kosong || !mod.lampiran) return;
        mod.lampiran(r, c).forEach((x) => out.push(tabelHtml(N, x)));
      });
      return out.length ? out.join("\n") : para("Hasil analisis lengkap disajikan pada bagian Hasil.", 1);
    }

    function lpk(A, S, notes) {
      isi(S);
      gambarNo = 0;
      const N = numbering();
      return D.lpk(S, notes, N, { judul: cfg.judul, dasarTambahan: cfg.teks.dasar || [], objekPeta: cfg.objekPeta || cfg.objek,
        metodeAnalisis: () => metodeAnalisis(A, S, notes, N), hasil: () => hasil(A, S, notes, N), lampiranData: () => lampiranData(S, N), lampiranAnalisis: () => lampiranAnalisis(A, S, N), lampiranIndex: cfg.lampiranIndex });
    }
    function rpk(A, S, notes) {
      isi(S);
      const N = numbering();
      return D.rpk(S, notes, N, { judul: cfg.judul, dasarTambahan: cfg.teks.dasar || [], objekPeta: cfg.objekPeta || cfg.objek, metodeAnalisis: () => metodeAnalisis(A, S, notes, N, true), tallysheet: () => D.tallysheet(N, cfg.tabel.filter((t) => !t.tanpaTally)) });
    }

    /* ---------- Tab Hasil Analisis ---------- */
    function hasilHtml(A, S) {
      isi(S);
      const P = S.param, kpi = [], blok = [];
      cfg.modul.forEach((m) => {
        const c = ctxM(m, P, S), r = A[m.id], mod = M[m.m];
        if (r && r.galat) { blok.push(`<div class="res"><h2>${esc(c.judul)}</h2><div class="callout"><b>Perhitungan gagal.</b> ${esc(r.galat)}</div></div>`); return; }
        if (!r || r.kosong) { blok.push(`<div class="res"><h2>${esc(c.judul)}</h2><p class="muted">${esc(mod.narHasil(r || { kosong: true }, c))}</p></div>`); return; }
        mod.kpi(r, c).forEach((x) => { if (!kpi.some((y) => String(y[1]).split(" (")[0] === String(x[1]).split(" (")[0])) kpi.push(x); });
        const tabs = [...mod.tabel(r, c), ...(mod.lampiran ? mod.lampiran(r, c) : [])];
        blok.push(`<div class="res"><h2>${esc(c.judul)}</h2><p class="muted">${esc(mod.narHasil(r, c))}</p>${tabs.map((x) => `<h3>${esc(x.cap)}</h3>${R_.resTable(x.spec)}`).join("")}${mod.kalkExtra ? mod.kalkExtra(r, c) : ""}${mod.gambar ? mod.gambar(r, c).replace('class="map"', 'class="map" style="margin:10px 0;max-width:640px"').replace("<img ", '<img style="width:100%;height:auto;border:1px solid var(--line);border-radius:8px" ') : ""}</div>`);
      });
      const adaData = cfg.tabel.some((tb) => (S.data[tb.key] || []).length);
      if (!adaData) return `<div class="empty"><h2>Belum ada data</h2><p>Isi tabel di tab Data, muat file patroli SMART, atau muat data contoh di panel kiri. Tab RPK bisa dipakai sebelum data lapangan tersedia.</p></div>`;
      return `${kpi.length ? `<div class="kpi">${kpi.slice(0, 8).map(([v, l]) => `<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join("")}</div>` : ""}${blok.join("")}`;
    }
    function csvHasil(A, S) {
      isi(S);
      const rows = [];
      cfg.modul.forEach((m) => {
        const c = ctxM(m, S.param, S), r = A[m.id], mod = M[m.m];
        if (!r || r.kosong || r.galat) return;
        [...mod.tabel(r, c), ...(mod.lampiran ? mod.lampiran(r, c) : [])].forEach((x) => { rows.push([x.cap]); rows.push(...R_.csvRows(x.spec)); rows.push([]); });
      });
      return rows.length ? rows : [["Belum ada hasil analisis"]];
    }

    /* ---------- Panel kiri dan tab Data ---------- */
    function formParameter(S, changed, U) {
      isi(S);
      const box = document.createElement("div");
      box.appendChild(U.fieldGrid((cfg.parameter || []).filter((f) => f.key), S.param, () => changed()));
      if (cfg.paramInfo) { const p = document.createElement("p"); p.className = "muted"; p.style.marginTop = "10px"; p.innerHTML = cfg.paramInfo; box.appendChild(p); }
      return box;
    }
    function panelData(S, A, changed, U) {
      isi(S);
      const wrap = document.createElement("div");
      wrap.appendChild(U.div(`<p class="muted">Isi tabel sesuai format isian lapangan, muat file patroli SMART dengan kategori <code>${esc(cfg.kategoriSMART)}</code>, atau impor CSV.${S.sumber ? ` Sumber data: ${esc(S.sumber)}.` : ""}</p>`));
      cfg.tabel.forEach((tb, ti) => {
        const rows = S.data[tb.key];
        const box = document.createElement("div");
        const info = U.div(`<p class="muted">${tb.ket || ""} <b data-n>${rows.length}</b> baris.</p>`);
        box.appendChild(info);
        box.appendChild(U.tableEditor(rows, tb.kolom, () => { S.diubah = true; info.querySelector("[data-n]").textContent = rows.length; changed(); }, {
          newRow: () => (tb.baruBaris ? tb.baruBaris(rows[rows.length - 1] || {}, S) : {}), rowClass: tb.rowClass ? (r) => tb.rowClass(r, S.param) : undefined }));
        const io = U.div(`<div class="btnrow"><button class="btn small" type="button" data-out>Unduh CSV</button><label class="btn small" for="csvIn-${tb.key}">Impor CSV</label><input type="file" id="csvIn-${tb.key}" accept=".csv,.txt" hidden></div><p class="status" data-st></p>`);
        box.appendChild(io);
        io.querySelector("[data-out]").addEventListener("click", () => window.PEHExport.csv([tb.kolom.map((c) => c.key), ...rows.map((r) => tb.kolom.map((c) => r[c.key] ?? ""))], `data_${cfg.id}_${tb.key}.csv`));
        io.querySelector("input").addEventListener("change", async (e) => {
          const st = io.querySelector("[data-st]");
          try {
            const all = parseCSV(await e.target.files[0].text());
            const head = all.shift().map((h) => h.trim().toLowerCase());
            const idx = tb.kolom.map((c) => head.findIndex((h) => h === c.key.toLowerCase() || h === c.label.toLowerCase()));
            if (!idx.some((i) => i >= 0)) throw new Error("Judul kolom tidak dikenali. Pakai file hasil Unduh CSV sebagai contoh.");
            const data = all.filter((r) => r.some((v) => v.trim())).map((r) => { const o = {}; tb.kolom.forEach((c, j) => { if (idx[j] >= 0) { const v = (r[idx[j]] ?? "").trim(); o[c.key] = c.type === "number" && v !== "" ? Number(v.replace(",", ".")) : v; } }); return o; });
            rows.splice(0, rows.length, ...data);
            S.diubah = true; changed();
            st.textContent = `${data.length} baris diimpor.`; st.className = "status ok";
            window.dispatchEvent(new Event("peh:redraw"));
          } catch (err) { st.textContent = err.message; st.className = "status err"; }
        });
        wrap.appendChild(window.PEH.util.card(`${esc(tb.judul)}${tb.smart ? ` <small>SMART: ${esc(tb.smart.sub)}</small>` : ""}`, box, ti < 2 || rows.length > 0));
      });
      const ext = document.createElement("div");
      [...(cfg.isian || []), { key: "catatanLapangan", label: "Catatan lapangan (cuaca, kondisi lokasi, kejadian penting); ikut di narasi hasil", rows: 3, akar: true }].forEach((f) => {
        const lab = document.createElement("label"); lab.className = "fld"; lab.textContent = f.label;
        const ta = document.createElement("textarea"); ta.rows = f.rows || 2; ta.value = (f.akar ? S[f.key] : S.teks[f.key]) || "";
        ta.addEventListener("input", () => { if (f.akar) S[f.key] = ta.value; else S.teks[f.key] = ta.value; changed(); });
        lab.appendChild(ta); ext.appendChild(lab);
      });
      wrap.appendChild(window.PEH.util.card("Catatan tambahan", ext, false));
      return wrap;
    }

    /* ---------- SMART ---------- */
    function dariSMART(S, obs) {
      isi(S);
      const v = window.PEHSmart.nilai, pesan = [];
      cfg.tabel.forEach((tb) => {
        if (!tb.smart) return;
        const subs = [].concat(tb.smart.sub);
        const o = obs.filter((x) => subs.includes(x.sub));
        if (!o.length) return;
        S.data[tb.key] = o.map((x) => tb.smart.map(x, (k) => v(x, k), S)).filter(Boolean);
        pesan.push(`${S.data[tb.key].length} baris ${tb.judul.toLowerCase()}`);
      });
      if (cfg.dariSMART) cfg.dariSMART(S, obs);
      S.diubah = false;
      return pesan.length ? pesan.join(", ") + "." : "Tidak ada observasi yang cocok dengan tabel kegiatan ini.";
    }

    const def = {
      id: cfg.id, kode: cfg.kode, judul: cfg.judul, ringkas: cfg.ringkas, kategoriSMART: cfg.kategoriSMART, kamusSMART: cfg.kamusSMART || [], contoh: cfg.contoh, alatBawaan: cfg.alat || [],
      stateAwal: () => ({ param: defaults(), data: kosongData(), teks: {}, catatanLapangan: "" }),
      dariContoh: (c) => ({ identitas: c.identitas, penandatangan: c.penandatangan, penandatanganRPK: c.penandatanganRPK, tim: c.tim || [], alat: c.alat || cfg.alat || [], rab: c.rab || [], param: { ...defaults(), ...(c.param || {}) }, data: { ...kosongData(), ...JSON.parse(JSON.stringify(c.data || {})) }, teks: c.teks || {}, catatanLapangan: c.catatanLapangan || "", sumber: c.nama }),
      formParameter, panelData, dariSMART, hitung, hasilHtml, csvHasil, narasi, lpk, narasiRPK, rpk, cfg
    };
    window.PEH.daftar(def);
    return def;
  }

  window.PEH.kegiatan = kegiatan;
  window.PEH.parseCSV = parseCSV;
})();
