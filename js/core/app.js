/*
 * Kerangka aplikasi PEH Tambora: daftar kegiatan, isian bersama (identitas, penandatangan, tim, alat, anggaran),
 * tabel data kegiatan, impor SMART, hasil analisis, dan pratinjau/ekspor LPK.
 * Setiap kegiatan mendaftarkan diri lewat PEH.daftar({...}); lihat kegiatan/raptor/raptor.js dan README.
 */
(function () {
  "use strict";
  const L = window.PEHLaporan, X = window.PEHExport;
  const $ = (id) => document.getElementById(id);
  const esc = L.esc;
  const KEGIATAN = [];
  const PEH = (window.PEH = { KEGIATAN, daftar: (def) => KEGIATAN.push(def) });

  /* ---------- Penyimpanan di browser (bisa gagal di mode privat; aplikasi tetap jalan) ---------- */
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } }
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- Isian bersama semua kegiatan ---------- */
  const IDENTITAS = [
    { key: "judul", label: "Judul kegiatan" },
    { key: "lokasi", label: "Lokasi kegiatan" },
    { key: "resort", label: "Resort", half: true }, { key: "sptn", label: "SPTN", half: true },
    { key: "mulai", label: "Tanggal mulai", type: "date", half: true }, { key: "selesai", label: "Tanggal selesai", type: "date", half: true },
    { key: "nomorST", label: "Nomor Surat Tugas", half: true }, { key: "tanggalST", label: "Tanggal ST", type: "date", half: true },
    { key: "kota", label: "Disusun di", half: true }, { key: "tanggalLaporan", label: "Tanggal laporan", type: "date", half: true },
    { key: "sumberAnggaran", label: "Sumber anggaran" },
    { key: "nomorDipa", label: "Nomor DIPA", half: true }, { key: "akun", label: "Akun (MAK)", half: true }
  ];
  const TTD = [["kiri", "Kiri (mis. Menyetujui/PPK)"], ["kanan", "Kanan (Ketua Tim)"], ["bawah", "Bawah tengah (Mengetahui)"]];
  const KOL_TIM = [{ key: "nama", label: "Nama" }, { key: "nip", label: "NIP" }, { key: "pangkat", label: "Pangkat/Gol." }, { key: "jabatan", label: "Jabatan" }, { key: "peran", label: "Peran", list: ["Koordinator", "Ketua Tim", "Anggota", "Pencatat Data", "Navigator", "Pemandu Lapangan"] }];
  const KOL_ALAT = [{ key: "nama", label: "Alat/bahan" }, { key: "jumlah", label: "Jml", w: 4 }, { key: "satuan", label: "Satuan", w: 6 }];
  const KOL_RAB = [{ key: "uraian", label: "Jenis belanja" }, { key: "volume", label: "Vol", w: 4 }, { key: "satuan", label: "Sat", w: 5 }, { key: "harga", label: "Harga (Rp)", w: 9 }];

  function stateKosong(def) {
    return { identitas: { judul: def.judul, kota: "Dompu" }, penandatangan: { kiri: { head: "Menyetujui", jabatan: "Kepala Subbagian Tata Usaha," }, kanan: { jabatan: "Ketua Tim," }, bawah: { head: "Mengetahui", jabatan: "Kepala Balai," } },
      tim: [], alat: clone(def.alatBawaan || []), rab: [], notes: {}, ...clone(def.stateAwal()) };
  }

  /* ---------- Komponen isian ---------- */
  function field(f, value, onInput) {
    const wrap = document.createElement("label");
    wrap.className = "fld";
    wrap.textContent = f.label;
    let el;
    if (f.options) {
      el = document.createElement("select");
      f.options.forEach(([v, t]) => { const o = document.createElement("option"); o.value = v; o.textContent = t; el.appendChild(o); });
    } else if (f.type === "textarea") { el = document.createElement("textarea"); el.rows = f.rows || 3; }
    else { el = document.createElement("input"); el.type = f.type || "text"; if (f.step) el.step = f.step; }
    el.value = value ?? "";
    el.addEventListener(f.options ? "change" : "input", () => onInput(f.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value));
    wrap.appendChild(el);
    return wrap;
  }
  function fieldGrid(fields, obj, onChange) {
    const box = document.createElement("div");
    let row = null;
    fields.forEach((f) => {
      const el = field(f, obj[f.key], (v) => { obj[f.key] = v; onChange(f.key); });
      if (f.half) {
        if (!row || row.children.length === 2) { row = document.createElement("div"); row.className = "row2"; box.appendChild(row); }
        row.appendChild(el);
      } else { row = null; box.appendChild(el); }
    });
    return box;
  }
  // Tabel isian baris: kolom { key, label, type, list, w }
  function tableEditor(rows, cols, onChange, opts = {}) {
    const box = document.createElement("div");
    box.className = "edt";
    const draw = () => {
      box.innerHTML = "";
      const t = document.createElement("table");
      t.innerHTML = `<thead><tr><th>No</th>${cols.map((c) => `<th title="${esc(c.title || "")}">${esc(c.label)}</th>`).join("")}<th></th></tr></thead>`;
      const tb = document.createElement("tbody");
      rows.forEach((r, i) => {
        const tr = document.createElement("tr");
        if (opts.rowClass) tr.className = opts.rowClass(r) || "";
        tr.innerHTML = `<td class="no">${i + 1}</td>`;
        cols.forEach((c) => {
          const td = document.createElement("td");
          let el;
          if (c.options) {
            el = document.createElement("select");
            ["", ...c.options].forEach((o) => { const op = document.createElement("option"); op.value = o; op.textContent = o; el.appendChild(op); });
            if (r[c.key] && !c.options.includes(r[c.key])) { const op = document.createElement("option"); op.value = op.textContent = r[c.key]; el.appendChild(op); }
          } else {
            el = document.createElement("input");
            el.type = c.type || "text";
            if (c.list) el.setAttribute("list", listId(c));
          }
          el.value = r[c.key] ?? "";
          if (c.w) el.style.minWidth = c.w + "em";
          el.setAttribute("aria-label", `${c.label} baris ${i + 1}`);
          el.dataset.key = c.key;
          el.addEventListener(c.options ? "change" : "input", () => {
            r[c.key] = c.type === "number" ? (el.value === "" ? "" : Number(el.value)) : el.value;
            if (c.onSet) {
              c.onSet(r, el.value);
              tr.querySelectorAll("[data-key]").forEach((o) => { if (o !== el && String(r[o.dataset.key] ?? "") !== o.value) o.value = r[o.dataset.key] ?? ""; });
            }
            onChange();
            if (opts.rowClass) tr.className = opts.rowClass(r) || "";
          });
          td.appendChild(el);
          tr.appendChild(td);
        });
        const td = document.createElement("td");
        const del = document.createElement("button");
        del.type = "button"; del.className = "del"; del.textContent = "×"; del.title = "Hapus baris";
        del.addEventListener("click", () => { rows.splice(i, 1); onChange(); draw(); });
        td.appendChild(del); tr.appendChild(td); tb.appendChild(tr);
      });
      t.appendChild(tb);
      box.appendChild(t);
      const add = document.createElement("button");
      add.type = "button"; add.className = "btn small"; add.textContent = "+ Tambah baris"; add.style.marginTop = "8px";
      add.addEventListener("click", () => { rows.push(opts.newRow ? opts.newRow() : {}); onChange(); draw(); });
      box.appendChild(add);
    };
    draw();
    return box;
  }
  // Datalist untuk kolom dengan daftar usulan
  const lists = new Map();
  function listId(c) {
    const id = "dl-" + c.key;
    if (!lists.has(id)) {
      const dl = document.createElement("datalist");
      dl.id = id;
      dl.innerHTML = c.list.map((v) => `<option value="${esc(v)}"></option>`).join("");
      document.body.appendChild(dl);
      lists.set(id, dl);
    }
    return id;
  }
  function card(title, body, open = true) {
    const sec = document.createElement("section");
    sec.className = "card";
    const det = document.createElement("details");
    det.open = open;
    det.innerHTML = `<summary><h2>${title}</h2></summary>`;
    det.appendChild(body);
    sec.appendChild(det);
    return sec;
  }
  const div = (html, cls) => { const d = document.createElement("div"); if (cls) d.className = cls; d.innerHTML = html; return d; };

  /* ---------- Aplikasi ---------- */
  let def = null, S = null, tab = "data", dmDict = null;
  const saveKey = () => `peh:${def.id}`;
  let saveTimer = 0;
  function changed(redraw = true) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set(saveKey(), S), 300);
    if (redraw) renderMain();
  }

  function pilihKegiatan(id) {
    def = KEGIATAN.find((k) => k.id === id) || KEGIATAN[0];
    S = store.get(saveKey()) || (def.contoh ? muatContoh(false) : stateKosong(def));
    if (location.hash !== "#" + def.id) history.replaceState(null, "", "#" + def.id);
    $("kegDesc").textContent = def.ringkas || "";
    renderSide();
    renderMain();
  }
  function muatContoh(apply = true) {
    const c = clone(def.contoh);
    const st = { ...stateKosong(def), ...def.dariContoh(c) };
    if (apply) { S = st; changed(false); renderSide(); renderMain(); }
    return st;
  }

  function renderSide() {
    const side = $("side");
    side.innerHTML = "";
    // 1. Sumber data
    const src = document.createElement("div");
    src.innerHTML = `<p class="muted">Isi data langsung di tab <b>Data</b>, muat file ekspor patroli SMART yang memakai kategori <code>${esc(def.kategoriSMART)}</code>, atau muat data contoh.</p>
      <label class="drop" for="smartFile"><b>Pilih file patroli SMART</b><span>.zip atau .xml (Patrol → Export). Bisa beberapa file sekaligus.</span></label>
      <input id="smartFile" type="file" accept=".zip,.xml" multiple hidden>
      <details class="sub-d"><summary>Kamus Data Model (opsional)</summary><p class="muted">Label kategori Metode Teknis dan jenis raptor sudah tersedia. Muat ekspor Data Model SMART (.xml) bila ada jenis yang labelnya belum terbaca.</p><input id="dmFile" type="file" accept=".xml"><p class="status" id="dmStatus"></p></details>
      <div class="btnrow">${def.contoh ? `<button class="btn small" id="contohBtn" type="button">Muat contoh: ${esc(def.contoh.nama)}</button>` : ""}<button class="btn small ghost" id="kosongBtn" type="button">Kosongkan</button></div>
      <p class="status" id="srcStatus"></p>`;
    side.appendChild(card(`<span class="step">1</span> Sumber data`, src));
    // 2. Parameter metode (khusus kegiatan)
    side.appendChild(card(`<span class="step">2</span> Parameter metode`, def.formParameter(S, changed, { fieldGrid, field, tableEditor })));
    // 3. Identitas
    side.appendChild(card(`<span class="step">3</span> Identitas kegiatan`, fieldGrid(IDENTITAS, S.identitas, () => changed()), false));
    // 4. Penandatangan
    const ttd = document.createElement("div");
    TTD.forEach(([k, label]) => {
      S.penandatangan[k] = S.penandatangan[k] || {};
      const box = div(`<p class="muted" style="margin:10px 0 0"><b>${label}</b></p>`);
      box.appendChild(fieldGrid([{ key: "head", label: "Baris atas", half: true }, { key: "jabatan", label: "Jabatan", half: true }, { key: "nama", label: "Nama", half: true }, { key: "nip", label: "NIP", half: true }], S.penandatangan[k], () => changed()));
      ttd.appendChild(box);
    });
    side.appendChild(card(`<span class="step">4</span> Penandatangan`, ttd, false));
    // 5. Tim, alat, anggaran
    side.appendChild(card(`<span class="step">5</span> Tim pelaksana`, tableEditor(S.tim, KOL_TIM, () => changed()), false));
    side.appendChild(card(`<span class="step">6</span> Alat dan bahan`, tableEditor(S.alat, KOL_ALAT, () => changed()), false));
    const rabBox = document.createElement("div");
    rabBox.appendChild(tableEditor(S.rab, KOL_RAB, () => { changed(); totalRab(); }));
    const tot = div("", "fixed");
    const totalRab = () => { const r = L.rabTable(S.rab); tot.innerHTML = `Total: <b>${L.rupiah(r.total) || "Rp0,00"}</b>`; };
    totalRab();
    rabBox.appendChild(tot);
    side.appendChild(card(`<span class="step">7</span> Rincian anggaran`, rabBox, false));

    $("smartFile").addEventListener("change", (e) => imporSMART([...e.target.files]));
    const drop = side.querySelector(".drop");
    ["dragover", "dragenter"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("over")));
    drop.addEventListener("drop", (e) => { e.preventDefault(); imporSMART([...e.dataTransfer.files]); });
    $("dmFile").addEventListener("change", async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try { dmDict = SMART.parseDataModelXML(await f.text()); $("dmStatus").textContent = `Kamus dimuat: ${Object.keys(dmDict.items).length} label pilihan.`; $("dmStatus").className = "status ok"; }
      catch (err) { $("dmStatus").textContent = err.message; $("dmStatus").className = "status err"; }
    });
    if ($("contohBtn")) $("contohBtn").addEventListener("click", () => { if (!S.perjumpaanDiubah || confirm("Ganti semua isian dengan data contoh?")) { muatContoh(); status("Data contoh dimuat.", "ok"); } });
    $("kosongBtn").addEventListener("click", () => { if (confirm("Kosongkan semua isian kegiatan ini?")) { S = stateKosong(def); changed(false); renderSide(); renderMain(); } });
  }
  const status = (msg, cls = "") => { const el = $("srcStatus"); if (el) { el.textContent = msg; el.className = "status " + cls; } };

  async function imporSMART(files) {
    if (!files.length) return;
    try {
      status("Membaca file…");
      const patrols = [];
      for (const f of files) patrols.push(...(await PEHSmart.bacaFile(f)));
      const dicts = [dmDict, window.PEH_DICT, ...(def.kamusSMART || []).map((n) => window[n])];
      const obs = PEHSmart.observasi(patrols, def.kategoriSMART, dicts);
      const info = PEHSmart.ringkas(patrols);
      if (!obs.length) throw new Error(`Tidak ada observasi kategori "${def.kategoriSMART}" di file ini. Pastikan patroli dicatat dengan kategori Metode Teknis.`);
      const pesan = def.dariSMART(S, obs, info);
      if (info.mulai) S.identitas.mulai = info.mulai;
      if (info.selesai) S.identitas.selesai = info.selesai;
      if (!S.tim.length && info.anggota.length) S.tim = info.anggota.map((a) => ({ nama: a.nama, nip: a.nip, peran: a.ketua ? "Ketua Tim" : "Anggota" }));
      S.sumber = `SMART: ${info.id}`;
      changed(false); renderSide(); renderMain();
      status(`${patrols.length} patroli dibaca. ${pesan}`, "ok");
    } catch (e) { console.error(e); status(e.message, "err"); }
  }

  /* ---------- Panel utama ---------- */
  function renderMain() {
    document.querySelectorAll(".tab").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    document.body.dataset.tab = tab;
    const main = $("main");
    const hasil = def.hitung(S);
    if (tab === "data") {
      main.innerHTML = "";
      main.appendChild(def.panelData(S, hasil, () => changed(false), { tableEditor, div }));
      return;
    }
    if (tab === "hasil") {
      main.innerHTML = `<div class="toolbar noprint"><button class="btn" id="csvBtn" type="button">Unduh hasil analisis (CSV)</button><span class="tip">Angka di sini dipakai langsung di LPK. Ubah data atau parameter di panel kiri.</span></div>${def.hasilHtml(hasil, S)}`;
      $("csvBtn").addEventListener("click", () => X.csv(def.csvHasil(hasil, S), `analisis_${def.id}_${X.safeName(S.identitas.lokasi || "")}.csv`));
      return;
    }
    // LPK
    const notesAuto = def.narasi(hasil, S);
    const notes = { ...notesAuto, ...S.notes };
    const html = def.lpk(hasil, S, notes);
    main.innerHTML = `<div class="toolbar noprint"><button class="btn primary" id="docxBtn" type="button">Unduh Word (.docx)</button><button class="btn" id="printBtn" type="button">Cetak / PDF</button><span class="sep"></span><button class="btn ghost small" id="resetNotes" type="button">Kembalikan narasi otomatis</button><span class="tip" id="lpkTip">Teks berlatar kuning bisa disunting langsung. Suntingan disimpan di browser ini.</span></div><article class="paper" id="report">${html}</article>`;
    $("report").addEventListener("input", (e) => {
      const n = e.target.closest("[data-note]");
      if (!n) return;
      S.notes[n.dataset.note] = n.innerText.replace(/\n{3,}/g, "\n\n").replace(/\n$/, "");
      changed(false);
    });
    $("printBtn").addEventListener("click", () => window.print());
    $("resetNotes").addEventListener("click", () => { if (confirm("Hapus semua suntingan narasi dan pakai narasi otomatis?")) { S.notes = {}; changed(); } });
    $("docxBtn").addEventListener("click", async () => {
      const btn = $("docxBtn"), tip = $("lpkTip");
      btn.disabled = true;
      try {
        await X.docx($("report"), (m) => (tip.textContent = m), { title: `LPK ${S.identitas.judul}`, fileName: `LPK_${X.safeName(def.id)}_${X.safeName(S.identitas.nomorST || S.identitas.mulai || "")}.docx` });
        tip.textContent = "File Word sudah diunduh. Saat dibuka, pilih Yes untuk memperbarui daftar isi.";
      } catch (e) { console.error(e); tip.textContent = "Gagal membuat Word: " + e.message; }
      btn.disabled = false;
    });
  }

  function init() {
    const sel = $("kegSel");
    sel.innerHTML = KEGIATAN.map((k) => `<option value="${k.id}">${esc(k.judul)}</option>`).join("") + `<option disabled>Kegiatan PEH lainnya menyusul…</option>`;
    sel.addEventListener("change", () => pilihKegiatan(sel.value));
    document.querySelectorAll(".tab").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; renderMain(); }));
    window.addEventListener("peh:redraw", () => renderMain());
    // simpan segera saat halaman ditutup/dimuat ulang (penyimpanan biasa ditunda 0,3 detik)
    window.addEventListener("pagehide", () => { clearTimeout(saveTimer); if (def) store.set(saveKey(), S); });
    const id = location.hash.slice(1);
    pilihKegiatan(KEGIATAN.some((k) => k.id === id) ? id : KEGIATAN[0].id);
    sel.value = def.id;
  }
  PEH.init = init;
  PEH.util = { store, clone, fieldGrid, field, tableEditor, card, div };
})();
