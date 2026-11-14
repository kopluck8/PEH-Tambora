/*
 * Kerangka aplikasi PEH Tambora: beranda, daftar kegiatan, isian bersama (identitas, penandatangan, tim, alat, anggaran),
 * tabel data kegiatan, impor SMART, hasil analisis, serta pratinjau/ekspor RPK dan LPK.
 * Tata letak: daftar kegiatan (kiri), tampilan kegiatan (tengah), panel isian (kanan), bilah kegiatan aktif (bawah).
 * Alamat halaman: #beranda, #<id kegiatan>, atau #<id kegiatan>/<rpk|hasil|lpk> (tanpa akhiran = tab Data).
 * Setiap kegiatan mendaftarkan diri lewat PEH.daftar({...}) atau PEH.kegiatan({...}); lihat README.
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
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    bisa() { try { localStorage.setItem("peh:uji", "1"); localStorage.removeItem("peh:uji"); return true; } catch (e) { return false; } }
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  /* ---------- Isian bersama semua kegiatan ---------- */
  const IDENTITAS = [
    { key: "judul", label: "Judul kegiatan" },
    { key: "lokasi", label: "Lokasi kegiatan" },
    { key: "resort", label: "Resort", half: true }, { key: "sptn", label: "SPTN", half: true },
    { key: "mulai", label: "Tanggal mulai", type: "date", half: true }, { key: "selesai", label: "Tanggal selesai", type: "date", half: true },
    { key: "nomorST", label: "Nomor Surat Tugas", half: true }, { key: "tanggalST", label: "Tanggal ST", type: "date", half: true },
    { key: "kota", label: "Disusun di", half: true }, { key: "tanggalLaporan", label: "Tanggal LPK", type: "date", half: true },
    { key: "tanggalRPK", label: "Tanggal RPK", type: "date", half: true },
    { key: "sumberAnggaran", label: "Sumber anggaran" },
    { key: "nomorDipa", label: "Nomor DIPA", half: true }, { key: "akun", label: "Akun (MAK)", half: true }
  ];
  const TTD = [["kiri", "Kiri (mis. Menyetujui/PPK)"], ["kanan", "Kanan (Ketua Tim)"], ["bawah", "Bawah tengah (Mengetahui)"]];
  const TTD_RPK = [["kiri", "Kiri (Diperiksa dan Disetujui, PPK)"], ["kanan", "Kanan (Koordinator Kegiatan)"], ["bawah", "Bawah tengah (Mengesahkan, Kepala Balai)"]];
  const ttdRPKAwal = () => ({ kiri: { head: "Diperiksa dan Disetujui,", jabatan: "Pejabat Pembuat Komitmen," }, kanan: { head: "", jabatan: "Koordinator Kegiatan," }, bawah: { head: "Mengesahkan,", jabatan: "Kepala Balai," } });
  const KOL_TIM = [{ key: "nama", label: "Nama" }, { key: "nip", label: "NIP" }, { key: "pangkat", label: "Pangkat/Gol." }, { key: "jabatan", label: "Jabatan" }, { key: "peran", label: "Peran", list: ["Koordinator", "Ketua Tim", "Anggota", "Pencatat Data", "Navigator", "Pemandu Lapangan"] }];
  const KOL_ALAT = [{ key: "nama", label: "Alat/bahan" }, { key: "jumlah", label: "Jml", w: 4 }, { key: "satuan", label: "Satuan", w: 6 }];
  const KOL_RAB = [{ key: "uraian", label: "Jenis belanja" }, { key: "volume", label: "Vol", w: 4 }, { key: "satuan", label: "Sat", w: 5 }, { key: "harga", label: "Harga (Rp)", w: 9 }];

  /* ---------- Tahap kerja, kelompok kegiatan, dan ikon ---------- */
  const TAHAP = [
    { id: "rpk", label: "RPK", ket: "Rencana Pelaksanaan Kegiatan" },
    { id: "data", label: "Data", ket: "Isian data lapangan" },
    { id: "hasil", label: "Hasil Analisis", ket: "Kalkulator analisis" },
    { id: "lpk", label: "LPK", ket: "Laporan Pelaksanaan Kegiatan" }
  ];
  // Warna sampul per kelompok: [hue, saturasi] HSL. Tiap kegiatan bergeser sedikit dalam kelompoknya.
  const KELOMPOK = { Satwa: [28, 62], Tumbuhan: [96, 38], Ekosistem: [205, 50] };
  const LAIN = "Lainnya";

  const svg = (isi) => `<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">${isi}</svg>`;
  const garis = (d, w = 2) => `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const pejal = (d) => `<path d="${d}" fill="currentColor"/>`;
  const lup = `<circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/>`;
  const IKON = {
    rumah: svg(garis("M4 10.5 12 4l8 6.5V20h-5v-5.5H9V20H4Z")),
    rumahIsi: svg(pejal("M12 3 3 10.3V21h6.5v-6h5v6H21V10.3Z")),
    cari: svg(lup + garis("m15.5 15.5 5 5", 2.2)),
    daftar: svg(garis("M8 3h7l4 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM15 3v4h4M4 7v13a1 1 0 0 0 1 1h10")),
    isian: svg(`<rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>` + garis("M15 4v16")),
    semat: svg(pejal("M9 2h6v2l-1 1v5l3 3v2h-4v6l-1 1-1-1v-6H7v-2l3-3V5L9 4Z")),
    sematGaris: svg(garis("M9 2.8h6v1.4l-1 1v5l3 3v1.6h-4.2v6l-.8.8-.8-.8v-6H7v-1.6l3-3v-5l-1-1Z", 1.6)),
    unduh: svg(garis("M12 3.5V15m0 0-4.5-4.5M12 15l4.5-4.5M4.5 17.5V20h15v-2.5", 2.2)),
    unggah: svg(garis("M12 15V3.5m0 0L7.5 8M12 3.5 16.5 8M4.5 17.5V20h15v-2.5", 2.2)),
    putar: svg(pejal("M8 5.1v13.8a.6.6 0 0 0 .9.5l11-6.9a.6.6 0 0 0 0-1L8.9 4.6a.6.6 0 0 0-.9.5Z")),
    mundur: svg(pejal("M6 5h2.2v14H6ZM19.2 5.4v13.2a.6.6 0 0 1-.9.5L9.5 12.5a.6.6 0 0 1 0-1l8.8-6.6a.6.6 0 0 1 .9.5Z")),
    maju: svg(pejal("M15.8 5H18v14h-2.2ZM4.8 5.4v13.2a.6.6 0 0 0 .9.5l8.8-6.6a.6.6 0 0 0 0-1L5.7 4.9a.6.6 0 0 0-.9.5Z")),
    cetak: svg(garis("M7 8V3.5h10V8M7 17H4.5v-6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2V17H17M7 14h10v6.5H7Z")),
    ulang: svg(garis("M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4v4h4")),
    zoom: svg(lup + garis("m15.5 15.5 5 5M10.5 7.8v5.4M7.8 10.5h5.4")),
    tutup: svg(garis("M6 6l12 12M18 6 6 18", 2.2)),
    cek: svg(garis("M5 12.5l4.5 4.5L19 7.5", 2.4)),
    muat: svg(garis("M12 3.5a8.5 8.5 0 1 0 8.5 8.5", 2.4))
  };

  function stateKosong(def) {
    return { identitas: { judul: def.judul, kota: "Dompu" }, penandatangan: { kiri: { head: "Menyetujui", jabatan: "Kepala Subbagian Tata Usaha," }, kanan: { jabatan: "Ketua Tim," }, bawah: { head: "Mengetahui", jabatan: "Kepala Balai," } },
      penandatanganRPK: ttdRPKAwal(), tim: [], alat: clone(def.alatBawaan || []), rab: [], notes: {}, notesRPK: {}, ...clone(def.stateAwal()) };
  }
  // Isian yang belum ada di data tersimpan versi lama
  function lengkapi(st) {
    st.penandatanganRPK = st.penandatanganRPK || ttdRPKAwal();
    st.notesRPK = st.notesRPK || {};
    st.notes = st.notes || {};
    return st;
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
      t.innerHTML = `<thead><tr><th>No</th>${cols.map((c) => `<th title="${esc(c.title || "")}">${esc(c.label)}</th>`).join("")}<th><span class="vh">Hapus</span></th></tr></thead>`;
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
        del.type = "button"; del.className = "del"; del.textContent = "×"; del.title = "Hapus baris"; del.setAttribute("aria-label", `Hapus baris ${i + 1}`);
        del.addEventListener("click", () => { rows.splice(i, 1); onChange(); draw(); });
        td.appendChild(del); tr.appendChild(td); tb.appendChild(tr);
      });
      t.appendChild(tb);
      box.appendChild(t);
      const add = document.createElement("button");
      add.type = "button"; add.className = "btn small"; add.textContent = "+ Tambah baris";
      add.addEventListener("click", () => { rows.push(opts.newRow ? opts.newRow() : {}); onChange(); draw(); });
      box.appendChild(add);
    };
    draw();
    return box;
  }
  // Datalist untuk kolom dengan daftar usulan (satu datalist per daftar, karena nama kolom yang sama bisa punya daftar berbeda antarkegiatan)
  const lists = new WeakMap();
  let nList = 0;
  function listId(c) {
    let id = lists.get(c.list);
    if (!id) {
      id = "dl-" + ++nList;
      const dl = document.createElement("datalist");
      dl.id = id;
      dl.innerHTML = c.list.map((v) => `<option value="${esc(v)}"></option>`).join("");
      document.body.appendChild(dl);
      lists.set(c.list, id);
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

  /* ---------- Keadaan aplikasi ---------- */
  let def = null, S = null, tab = "data", dmDict = null, view = "beranda";
  let ui = { libMini: false, panelOff: false, zoom: null, urut: "bawaan" };
  const saring = { kel: "", q: "" };
  const saveKey = () => `peh:${def.id}`;
  const simpanUI = () => store.set("peh:ui", ui);
  const cariDef = (id) => KEGIATAN.find((k) => k.id === id);
  const daftarId = (k) => { const v = store.get(k); return Array.isArray(v) ? v.filter((id) => cariDef(id)) : []; };
  const terakhir = () => daftarId("peh:terakhir");
  const sematan = () => daftarId("peh:sematan");
  const media = (q) => window.matchMedia(q).matches;
  const lebar = () => media("(min-width: 1100px)");
  const ponsel = () => media("(max-width: 760px)");
  const hashFor = (id, t) => "#" + id + (t && t !== "data" ? "/" + t : "");
  const kelompokOf = (k) => (KELOMPOK[k.kelompok] ? k.kelompok : LAIN);
  const daftarKelompok = () => [...Object.keys(KELOMPOK), LAIN].filter((g) => KEGIATAN.some((k) => kelompokOf(k) === g));
  const kodeOf = (k) => k.kode || k.id.toUpperCase();

  function warnaKegiatan(k) {
    const [h, s] = KELOMPOK[k.kelompok] || [0, 0];
    const sama = KEGIATAN.filter((x) => x.kelompok === k.kelompok), i = sama.indexOf(k), n = sama.length;
    return { h: Math.round(h + (n > 1 ? (i / (n - 1) - 0.5) * 24 : 0)), s };
  }
  const gaya = (k) => { const w = warnaKegiatan(k); return `--h:${w.h};--s:${w.s}%`; };
  function sampul(k, cls = "") {
    const kode = kodeOf(k);
    return `<span class="art${cls ? " " + cls : ""}" style="${gaya(k)};--n:${Math.max(kode.length, 3)}" aria-hidden="true"><span>${esc(kode)}</span></span>`;
  }
  function jumlahBaris(st) {
    if (!st) return null;
    let n = 0;
    if (st.data) Object.values(st.data).forEach((v) => { if (Array.isArray(v)) n += v.length; });
    if (Array.isArray(st.perjumpaan)) n += st.perjumpaan.length;
    return n;
  }
  function ketData(k) {
    const n = jumlahBaris(def && k.id === def.id ? S : store.get(`peh:${k.id}`));
    if (n === null) return k.contoh ? "ada data contoh" : "belum dibuka";
    return n ? `${n} baris data` : "belum ada data";
  }

  /* ---------- Simpan otomatis ---------- */
  let saveTimer = 0, gagalDiberitahu = false;
  function changed(redraw = true) {
    clearTimeout(saveTimer);
    tandaSimpan("proses");
    saveTimer = setTimeout(simpan, 300);
    if (redraw) renderMain();
  }
  function simpan() {
    clearTimeout(saveTimer);
    if (!def || !S) return;
    tandaSimpan(store.set(saveKey(), S) ? "ok" : "gagal");
    perbaruiRingkas();
  }
  function tandaSimpan(st) {
    const el = $("saveState");
    if (!el) return;
    el.classList.toggle("gagal", st === "gagal");
    el.innerHTML = { awal: "Isian disimpan otomatis di browser ini", proses: "Menyimpan…", ok: `${IKON.cek}Tersimpan di browser ini`, gagal: "Gagal menyimpan di browser ini" }[st];
    if (st === "gagal" && !gagalDiberitahu) {
      gagalDiberitahu = true;
      toast("Isian tidak bisa disimpan di browser ini (penyimpanan penuh atau diblokir). Unduh CSV atau Word supaya data tidak hilang.", "err");
    }
    if (st === "ok") gagalDiberitahu = false;
  }
  // Jumlah baris data di judul, daftar kegiatan, dan bilah bawah setelah isian berubah
  function perbaruiRingkas() {
    const m = $("heroMeta");
    if (m) m.innerHTML = metaKegiatan();
    const li = document.querySelector(`.lib-item[data-id="${def.id}"] .li-s`);
    if (li) li.innerHTML = subDaftar(def);
    const np = document.querySelector(".np-s");
    if (np) np.textContent = subBilah();
  }

  /* ---------- Pesan singkat dan dialog konfirmasi ---------- */
  function toast(pesan, jenis = "") {
    const box = $("toasts");
    if (!box) return;
    const t = document.createElement("div");
    t.className = "toast" + (jenis ? " " + jenis : "");
    t.innerHTML = `<span>${esc(pesan)}</span>`;
    if (jenis === "err") {
      const b = document.createElement("button");
      b.type = "button"; b.className = "icon-btn"; b.setAttribute("aria-label", "Tutup pesan"); b.innerHTML = IKON.tutup;
      b.addEventListener("click", () => t.remove());
      t.appendChild(b);
    } else setTimeout(() => t.remove(), 4000);
    box.appendChild(t);
    while (box.children.length > 3) box.firstElementChild.remove();
  }
  function tanya(judul, isi, ya = "Lanjutkan") {
    const d = $("tanya");
    if (!d || typeof d.showModal !== "function") return Promise.resolve(window.confirm(`${judul}\n\n${isi}`));
    $("tanyaJudul").textContent = judul;
    $("tanyaIsi").textContent = isi;
    $("tanyaYa").textContent = ya;
    d.returnValue = "";
    d.showModal();
    return new Promise((res) => d.addEventListener("close", () => res(d.returnValue === "ya"), { once: true }));
  }
  const status = (msg, cls = "") => {
    const el = $("srcStatus");
    if (el) { el.textContent = msg; el.className = "status " + cls; }
    toast(msg, cls === "err" ? "err" : "");
  };

  /* ---------- Memilih kegiatan dan memuat isian ---------- */
  function pilihKegiatan(id) {
    if (def && S) simpan();
    def = cariDef(id) || KEGIATAN[0];
    S = lengkapi(store.get(saveKey()) || (def.contoh ? muatContoh(false) : stateKosong(def)));
    renderSide();
  }
  function muatContoh(apply = true) {
    const c = clone(def.contoh);
    const dc = def.dariContoh(c);
    Object.keys(dc).forEach((k) => dc[k] === undefined && delete dc[k]);
    const st = lengkapi({ ...stateKosong(def), ...dc });
    if (!st.penandatanganRPK) st.penandatanganRPK = ttdRPKAwal();
    if (apply) { S = st; changed(false); renderSide(); renderMain(); renderLibrary(); }
    return st;
  }
  async function tawarContoh() {
    if (!def || !def.contoh) return;
    if ((S.diubah || S.perjumpaanDiubah) && !(await tanya("Ganti dengan data contoh?", `Semua isian ${def.judul} akan diganti dengan data contoh ${def.contoh.nama}.`, "Ganti"))) return;
    muatContoh();
    status("Data contoh dimuat.", "ok");
  }

  /* ---------- Panel isian (kanan) ---------- */
  function renderSide() {
    const side = $("side");
    $("panelSub").textContent = def ? def.judul : "";
    side.innerHTML = "";
    if (!def) {
      side.appendChild(div(`<p class="panel-kosong">Belum ada kegiatan yang dibuka. Pilih kegiatan dari daftar atau beranda; sumber data, parameter, identitas, penandatangan, tim, alat, dan anggaran tampil di sini.</p>`));
      return;
    }
    // 1. Sumber data
    const src = document.createElement("div");
    src.innerHTML = `<p class="muted">Isi data langsung di tab <b>Data</b>, muat file ekspor patroli SMART yang memakai kategori <code>${esc([].concat(def.kategoriSMART).join(", "))}</code>, atau muat data contoh.</p>
      <label class="drop" for="smartFile">${IKON.unggah}<b>Pilih file patroli SMART</b><span>.zip atau .xml (Patrol → Export). Bisa beberapa file sekaligus, atau seret file ke sini.</span></label>
      <details class="sub-d"><summary>Kamus Data Model (opsional)</summary><p class="muted">Label kategori Metode Teknis sudah tersedia. Muat ekspor Data Model SMART (.xml) bila ada pilihan (misalnya nama jenis) yang labelnya belum terbaca.</p><label class="vh" for="dmFile">File ekspor Data Model SMART</label><input id="dmFile" type="file" accept=".xml"><p class="status" id="dmStatus"></p></details>
      <div class="btnrow">${def.contoh ? `<button class="btn small" id="contohBtn" type="button">Muat contoh: ${esc(def.contoh.nama)}</button>` : ""}<button class="btn small ghost" id="kosongBtn" type="button">Kosongkan</button></div>
      <p class="status" id="srcStatus"></p>`;
    side.appendChild(card(`<span class="step">1</span> Sumber data`, src));
    // 2. Parameter metode (khusus kegiatan)
    side.appendChild(card(`<span class="step">2</span> Parameter metode`, def.formParameter(S, changed, { fieldGrid, field, tableEditor })));
    // 3. Identitas
    side.appendChild(card(`<span class="step">3</span> Identitas kegiatan`, fieldGrid(IDENTITAS, S.identitas, () => changed()), false));
    // 4. Penandatangan LPK dan RPK
    const ttd = document.createElement("div");
    const ttdSet = (judul, daftar, obj, ket) => {
      ttd.appendChild(div(`<p class="panel-label">${judul}</p>${ket ? `<p class="muted" style="margin:2px 0 0">${ket}</p>` : ""}`));
      daftar.forEach(([k, label]) => {
        obj[k] = obj[k] || {};
        const box = div(`<p class="muted" style="margin:10px 0 0"><b>${label}</b></p>`);
        box.appendChild(fieldGrid([{ key: "head", label: "Baris atas", half: true }, { key: "jabatan", label: "Jabatan", half: true }, { key: "nama", label: "Nama", half: true }, { key: "nip", label: "NIP", half: true }], obj[k], () => changed()));
        ttd.appendChild(box);
      });
    };
    ttdSet("LPK", TTD, S.penandatangan);
    ttdSet("RPK", TTD_RPK, S.penandatanganRPK, "Nama dan NIP yang dikosongkan memakai penandatangan LPK (kanan dan bawah).");
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
    if ($("contohBtn")) $("contohBtn").addEventListener("click", tawarContoh);
    $("kosongBtn").addEventListener("click", async () => {
      if (!(await tanya("Kosongkan isian?", `Semua isian ${def.judul} di browser ini akan dihapus, termasuk data, identitas, dan suntingan narasi.`, "Kosongkan"))) return;
      S = stateKosong(def); changed(false); renderSide(); renderMain(); renderLibrary();
      status("Isian kegiatan dikosongkan.");
    });
  }

  async function imporSMART(files) {
    if (!files.length || !def) return;
    try {
      status("Membaca file patroli SMART…");
      const patrols = [];
      for (const f of files) patrols.push(...(await PEHSmart.bacaFile(f)));
      const dicts = [dmDict, window.PEH_DICT, ...(def.kamusSMART || []).map((n) => window[n])];
      const obs = PEHSmart.observasi(patrols, def.kategoriSMART, dicts);
      const info = PEHSmart.ringkas(patrols);
      if (!obs.length) throw new Error(`Tidak ada observasi kategori "${[].concat(def.kategoriSMART).join(", ")}" di file ini. Pastikan patroli dicatat dengan kategori yang sesuai.`);
      const pesan = def.dariSMART(S, obs, info);
      if (info.mulai) S.identitas.mulai = info.mulai;
      if (info.selesai) S.identitas.selesai = info.selesai;
      if (!S.tim.length && info.anggota.length) S.tim = info.anggota.map((a) => ({ nama: a.nama, nip: a.nip, peran: a.ketua ? "Ketua Tim" : "Anggota" }));
      S.sumber = `SMART: ${info.id}`;
      changed(false); renderSide(); renderMain(); renderLibrary();
      status(`${patrols.length} patroli dibaca. ${pesan}`, "ok");
    } catch (e) { console.error(e); status(e.message, "err"); }
  }

  /* ---------- Daftar kegiatan (kiri) ---------- */
  function cocok(k) {
    if (saring.kel && kelompokOf(k) !== saring.kel) return false;
    if (!saring.q) return true;
    const q = saring.q.toLowerCase();
    return [k.judul, kodeOf(k), k.id, k.kelompok, k.ringkas].some((s) => String(s || "").toLowerCase().includes(q));
  }
  function urutan(daftar) {
    const pin = sematan(), baru = terakhir(), peringkat = (id) => { const i = baru.indexOf(id); return i < 0 ? 1e3 : i; };
    const arr = daftar.slice();
    if (ui.urut === "abjad") arr.sort((a, b) => a.judul.localeCompare(b.judul, "id"));
    else if (ui.urut === "terakhir") arr.sort((a, b) => peringkat(a.id) - peringkat(b.id));
    // Kegiatan yang disematkan selalu di atas, yang terakhir disematkan paling atas
    return [...pin.map((id) => arr.find((k) => k.id === id)).filter(Boolean), ...arr.filter((k) => !pin.includes(k.id))];
  }
  const subDaftar = (k, pin = sematan()) => `${pin.includes(k.id) ? `<span class="li-pin" title="Disematkan">${IKON.semat}<span class="vh">Disematkan. </span></span>` : ""}${esc(kelompokOf(k))} • ${esc(ketData(k))}`;
  function chipKelompok(semua) {
    const x = !semua && saring.kel ? `<button type="button" class="chip x" data-kel="" aria-label="Hapus saringan kelompok" title="Hapus saringan">${IKON.tutup}</button>` : "";
    return x + (semua ? [["", "Semua"]] : []).concat(daftarKelompok().map((g) => [g, g]))
      .map(([v, t]) => `<button type="button" class="chip${saring.kel === v ? " on" : ""}" data-kel="${esc(v)}" aria-pressed="${saring.kel === v}">${esc(t)}</button>`).join("");
  }
  // Ganti isi wadah chip tanpa kehilangan fokus papan ketik
  function isiChip(wadah, html) {
    if (!wadah) return;
    const a = document.activeElement, fokus = a && wadah.contains(a) ? a.dataset.kel : null;
    wadah.innerHTML = html;
    if (fokus !== null) (wadah.querySelector(`[data-kel="${fokus}"]`) || wadah.querySelector("[data-kel]")).focus();
  }
  function renderLibrary() {
    const pin = sematan(), isi = urutan(KEGIATAN.filter(cocok));
    $("libList").innerHTML = isi.map((k) => {
      const kini = def && k.id === def.id, buka = kini && view === "kegiatan";
      return `<li><a class="lib-item${kini ? " on" : ""}" href="#${k.id}" data-id="${k.id}" title="${esc(k.judul)}"${buka ? ' aria-current="page"' : ""}>${sampul(k)}<span class="li-txt"><span class="li-t">${esc(k.judul)}</span><span class="li-s">${subDaftar(k, pin)}</span></span></a></li>`;
    }).join("") || `<li class="lib-empty">Tidak ada kegiatan yang cocok${saring.q ? ` dengan “${esc(saring.q)}”` : ""}.</li>`;
    isiChip($("libChips"), chipKelompok(false));
  }
  function pilihKelompok(tombol) {
    const v = tombol.dataset.kel;
    saring.kel = v && saring.kel === v ? "" : v;
    renderLibrary();
    if (view === "beranda") isiHome();
  }
  function toggleSemat() {
    if (!def) return;
    const p = sematan(), ada = p.includes(def.id);
    store.set("peh:sematan", ada ? p.filter((x) => x !== def.id) : [def.id, ...p]);
    renderLibrary();
    document.querySelectorAll("[data-semat]").forEach((b) => { b.outerHTML = tombolSemat(!ada); });
    toast(ada ? `Sematan dilepas: ${def.judul}.` : `Disematkan di atas daftar: ${def.judul}.`);
  }
  const tombolSemat = (pin) => `<button type="button" class="icon-btn semat" data-semat aria-pressed="${pin}" aria-label="Sematkan di atas daftar kegiatan" title="${pin ? "Lepas sematan" : "Sematkan di atas daftar kegiatan"}">${pin ? IKON.semat : IKON.sematGaris}</button>`;

  /* ---------- Tampilan utama: beranda atau kegiatan ---------- */
  function renderView() {
    const mv = $("mainView");
    mv.dataset.v = view;
    if (view === "beranda") renderHome(); else renderKegiatan();
    pasangGulir();
  }
  function pasangGulir() {
    const sc = $("viewScroll"), bar = $("viewBar");
    if (!sc || !bar) return;
    let jadwal = 0;
    const cek = () => {
      jadwal = 0;
      const atas = sc.querySelector(".hero, .home-head");
      bar.classList.toggle("solid", sc.scrollTop > (atas ? Math.max(24, atas.offsetTop + atas.offsetHeight - 64) : 24));
    };
    sc.addEventListener("scroll", () => { if (!jadwal) jadwal = requestAnimationFrame(cek); }, { passive: true });
  }

  function renderHome() {
    const mv = $("mainView");
    mv.removeAttribute("style");
    mv.innerHTML = `<div class="view-bar" id="viewBar"><div class="chips" id="homeChips" role="group" aria-label="Saring menurut kelompok"></div></div>
      <div class="view-scroll" id="viewScroll" tabindex="-1"><div class="home" id="homeIsi"></div></div>`;
    isiHome();
    document.title = "PEH Tambora";
  }
  const tilePintas = (k) => { const w = warnaKegiatan(k); return `<a class="sc" href="#${k.id}" data-h="${w.h}" data-s="${w.s}%">${sampul(k)}<span class="sc-t">${esc(k.judul)}</span><span class="dot-play" aria-hidden="true">${IKON.putar}</span></a>`; };
  const kartu = (k) => `<a class="kcard" href="#${k.id}"><span class="kc-art">${sampul(k, "fill")}<span class="dot-play" aria-hidden="true">${IKON.putar}</span></span><span class="kc-t">${esc(k.judul)}</span><span class="kc-s">${esc(k.ringkas || "")}</span></a>`;
  function isiHome() {
    const box = $("homeIsi");
    if (!box) return;
    isiChip($("homeChips"), chipKelompok(true));
    const isi = KEGIATAN.filter(cocok);
    const baru = terakhir().map(cariDef).filter((k) => k && cocok(k)).slice(0, 8);
    const [judulPintas, pintas] = baru.length ? ["Terakhir dibuka", baru] : ["Coba dengan data contoh LPK", isi.filter((k) => k.contoh).slice(0, 8)];
    box.innerHTML = `<header class="home-head"><h1>Kegiatan teknis PEH</h1><p>Balai Taman Nasional Tambora. Pilih kegiatan untuk mengisi data lapangan, menghitung analisis, lalu menyusun RPK dan LPK. Semua data diolah dan disimpan di browser ini.</p></header>
      ${pintas.length ? `<section aria-labelledby="hPintas"><h2 id="hPintas">${judulPintas}</h2><div class="shortcuts">${pintas.map(tilePintas).join("")}</div></section>` : ""}
      ${daftarKelompok().map((g, i) => { const d = isi.filter((k) => kelompokOf(k) === g); return d.length ? `<section aria-labelledby="hKel${i}"><h2 id="hKel${i}">${esc(g)} <span class="h-n">${d.length} kegiatan</span></h2><div class="cards">${d.map(kartu).join("")}</div></section>` : ""; }).join("")}
      ${isi.length ? "" : `<div class="empty"><h2>Tidak ada kegiatan yang cocok</h2><p>Tidak ada kegiatan${saring.q ? ` untuk “${esc(saring.q)}”` : ""}${saring.kel ? ` di kelompok ${esc(saring.kel)}` : ""}.</p><p><button type="button" class="btn" id="hapusSaring">Hapus pencarian dan saringan</button></p></div>`}`;
    const mv = $("mainView"), w = pintas[0] ? warnaKegiatan(pintas[0]) : null;
    if (w) { mv.style.setProperty("--h", w.h); mv.style.setProperty("--s", w.s + "%"); }
  }

  function renderKegiatan() {
    const mv = $("mainView"), pj = def.judul.length;
    mv.setAttribute("style", gaya(def));
    mv.innerHTML = `<div class="view-bar" id="viewBar">
        <div class="vb-mini"><button type="button" class="play sm" data-aksi><span class="play-c"></span><span class="vh"></span></button><span class="vb-t" aria-hidden="true">${esc(def.judul)}</span></div>
        <div class="chips" role="tablist" aria-label="Tahap kegiatan">${TAHAP.map((t) => `<button type="button" role="tab" class="chip tab" id="tab-${t.id}" data-tab="${t.id}" aria-controls="main" title="${esc(t.ket)}">${esc(t.label)}</button>`).join("")}</div>
      </div>
      <div class="view-scroll" id="viewScroll" tabindex="-1">
        <header class="hero">${sampul(def, "xl")}<div class="hero-txt"><p class="hero-kind">Kegiatan teknis PEH • ${esc(kelompokOf(def))}</p><h1 class="hero-title ${pj <= 30 ? "t1" : pj <= 45 ? "t2" : pj <= 62 ? "t3" : "t4"}">${esc(def.judul)}</h1><p class="hero-desc">${esc(def.ringkas || "")}</p><p class="hero-meta" id="heroMeta"></p></div></header>
        <div class="after-hero"><div class="actions" id="actions"></div><div id="main" class="content" role="tabpanel"></div></div>
      </div>`;
    const tl = mv.querySelector('[role="tablist"]');
    tl.addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) setTahap(TAHAP.findIndex((t) => t.id === b.dataset.tab)); });
    tl.addEventListener("keydown", (e) => {
      const i = TAHAP.findIndex((t) => t.id === tab), n = TAHAP.length;
      const j = { ArrowRight: (i + 1) % n, ArrowLeft: (i + n - 1) % n, Home: 0, End: n - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      setTahap(j);
      $("tab-" + TAHAP[j].id).focus();
    });
    renderMain();
  }
  function metaKegiatan() {
    const I = S.identitas || {}, lok = I.resort || I.lokasi, per = L.validISO(I.mulai) ? L.periodeSd(I.mulai, I.selesai) : "";
    return [`<b>${esc(lok || "Lokasi belum diisi")}</b>`, per && esc(per), `${jumlahBaris(S)} baris data`, S.sumber && esc(S.sumber)].filter(Boolean).join(" • ");
  }
  function setTahap(j) {
    if (!def || j < 0 || j >= TAHAP.length) return;
    tab = TAHAP[j].id;
    if (view !== "kegiatan") { location.hash = hashFor(def.id, tab); return; }
    history.replaceState(null, "", hashFor(def.id, tab));
    renderMain();
  }

  /* ---------- Isi tab kegiatan ---------- */
  function renderMain() {
    if (!def || view !== "kegiatan" || !$("main")) return;
    document.body.dataset.tab = tab;
    document.querySelectorAll(".chip.tab").forEach((b) => { const on = b.dataset.tab === tab; b.classList.toggle("on", on); b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
    const main = $("main"), hasil = def.hitung(S), kertas = tab === "rpk" || tab === "lpk";
    main.setAttribute("aria-labelledby", "tab-" + tab);
    main.classList.toggle("is-paper", kertas);
    $("heroMeta").innerHTML = metaKegiatan();
    renderAksi();
    if (tab === "data") {
      main.innerHTML = "";
      main.appendChild(def.panelData(S, hasil, () => changed(false), { tableEditor, div }));
    } else if (tab === "hasil") {
      main.innerHTML = def.hasilHtml(hasil, S);
    } else {
      // RPK atau LPK: narasi otomatis + suntingan tersimpan (terpisah untuk RPK dan LPK)
      const isRPK = tab === "rpk", nKey = isRPK ? "notesRPK" : "notes";
      S[nKey] = S[nKey] || {};
      const notes = { ...(isRPK ? def.narasiRPK(hasil, S) : def.narasi(hasil, S)), ...S[nKey] };
      main.innerHTML = `<article class="paper" id="report">${isRPK ? def.rpk(hasil, S, notes) : def.lpk(hasil, S, notes)}</article>`;
      $("report").addEventListener("input", (e) => {
        const n = e.target.closest("[data-note]");
        if (!n) return;
        S[nKey][n.dataset.note] = n.innerText.replace(/\n{3,}/g, "\n\n").replace(/\n$/, "");
        changed(false);
      });
    }
    renderPlayer();
    document.title = `${def.judul} | PEH Tambora`;
  }

  // Aksi utama layar ini: tombol hijau besar, tombol di bilah judul saat digulir, dan tombol putih di bilah bawah
  function aksiUtama() {
    if (!def) return null;
    if (view !== "kegiatan") return { ikon: IKON.putar, label: `Buka ${def.judul}`, pendek: "Buka kegiatan", jalan: () => { location.hash = hashFor(def.id, tab); } };
    if (tab === "data") return { id: "smartBtn", ikon: IKON.unggah, label: "Muat file patroli SMART (.zip atau .xml)", pendek: "Muat patroli SMART", jalan: () => $("smartFile").click() };
    if (tab === "hasil") return { id: "csvBtn", ikon: IKON.unduh, label: "Unduh hasil analisis (CSV)", pendek: "Unduh hasil (CSV)", jalan: unduhCSV };
    const j = tab.toUpperCase();
    return { id: "docxBtn", ikon: IKON.unduh, label: `Unduh ${j} Word (.docx)`, pendek: `Unduh ${j} Word`, jalan: unduhDocx };
  }
  const TIP = {
    rpk: "RPK disusun sebelum kegiatan: metode dan rumus analisis sudah lengkap tanpa menunggu data lapangan. Teks berlatar kuning bisa disunting langsung dan tersimpan di browser ini.",
    data: "",
    hasil: "Angka di sini dipakai langsung di LPK. Ubah data di tab Data atau parameter metode di panel Isian.",
    lpk: "Teks berlatar kuning bisa disunting langsung dan tersimpan di browser ini."
  };
  function renderAksi() {
    const box = $("actions");
    if (!box) return;
    const a = aksiUtama(), kertas = tab === "rpk" || tab === "lpk";
    box.innerHTML = `<button type="button" class="play" id="${a.id}" data-aksi title="${esc(a.label)}"><span class="play-c">${a.ikon}</span><span class="play-t">${esc(a.pendek)}</span></button>
      ${tombolSemat(sematan().includes(def.id))}
      ${tab === "data" && def.contoh ? `<button type="button" class="btn" id="contohAksi" title="${esc(def.contoh.nama)}">Muat data contoh</button>` : ""}
      ${kertas ? `<button type="button" class="btn" id="printBtn">${IKON.cetak}Cetak / PDF</button><button type="button" class="btn ghost" id="resetNotes">${IKON.ulang}Kembalikan narasi otomatis</button>` : ""}
      <p class="act-tip" id="lpkTip">${esc(TIP[tab])}</p>`;
    const mini = document.querySelector(".vb-mini .play");
    if (mini) { mini.querySelector(".play-c").innerHTML = a.ikon; mini.querySelector(".vh").textContent = a.label; mini.title = a.label; }
    if ($("contohAksi")) $("contohAksi").addEventListener("click", tawarContoh);
    if (!kertas) return;
    $("printBtn").addEventListener("click", () => window.print());
    $("resetNotes").addEventListener("click", async () => {
      const j = tab.toUpperCase();
      if (!(await tanya(`Kembalikan narasi ${j} otomatis?`, `Semua suntingan teks berlatar kuning pada ${j} ini akan dihapus dan diganti teks otomatis.`, "Kembalikan"))) return;
      S[tab === "rpk" ? "notesRPK" : "notes"] = {};
      changed();
      toast(`Narasi ${j} kembali ke teks otomatis.`);
    });
  }
  function unduhCSV() {
    X.csv(def.csvHasil(def.hitung(S), S), `analisis_${def.id}_${X.safeName(S.identitas.lokasi || "")}.csv`);
    toast("Hasil analisis (CSV) sudah diunduh.");
  }
  let sibuk = false;
  async function unduhDocx() {
    const rep = $("report");
    if (!rep || sibuk) return;
    sibuk = true;
    const jenis = tab.toUpperCase(), tip = $("lpkTip"), tombol = [...document.querySelectorAll("[data-aksi]")];
    const lapor = (m) => { if (tip) tip.textContent = m; };
    const ikonLama = tombol.map((b) => { const c = b.querySelector(".play-c") || b; const h = c.innerHTML; c.innerHTML = IKON.muat; b.disabled = true; b.setAttribute("aria-busy", "true"); return [c, h]; });
    try {
      await X.docx(rep, lapor, { title: `${jenis} ${S.identitas.judul}`, fileName: `${jenis}_${X.safeName(def.id)}_${X.safeName(S.identitas.nomorST || S.identitas.mulai || "")}.docx` });
      lapor("File Word sudah diunduh. Saat dibuka, pilih Yes untuk memperbarui daftar isi.");
      toast(`${jenis} Word sudah diunduh.`);
    } catch (e) { console.error(e); lapor("Gagal membuat Word: " + e.message); toast("Gagal membuat Word: " + e.message, "err"); }
    ikonLama.forEach(([c, h]) => { c.innerHTML = h; });
    tombol.forEach((b) => { b.disabled = false; b.removeAttribute("aria-busy"); });
    sibuk = false;
  }

  /* ---------- Bilah kegiatan aktif (bawah) ---------- */
  const subBilah = () => `${view === "kegiatan" ? TAHAP.find((t) => t.id === tab).label + " • " : ""}${kelompokOf(def)} • ${ketData(def)}`;
  function renderPlayer() {
    const pl = $("player");
    if (!def) {
      pl.removeAttribute("style");
      pl.innerHTML = `<div class="np"><span class="art sm kosong" aria-hidden="true"></span><div class="np-txt"><p class="np-t">Belum ada kegiatan yang dibuka</p><p class="np-s">Pilih kegiatan dari daftar</p></div></div>`;
      sinkronTombol();
      return;
    }
    const i = TAHAP.findIndex((t) => t.id === tab), a = aksiUtama(), n = TAHAP.length;
    const lompat = (j, arah) => (j >= 0 && j < n ? `aria-label="Langkah ${arah}: ${TAHAP[j].label}" title="Langkah ${arah}: ${TAHAP[j].label}"` : `disabled aria-label="Tidak ada langkah ${arah}"`);
    pl.setAttribute("style", gaya(def));
    pl.innerHTML = `<div class="np">
        <a class="np-art" href="${hashFor(def.id, tab)}" tabindex="-1" aria-hidden="true">${sampul(def, "sm")}</a>
        <div class="np-txt"><a class="np-t" href="${hashFor(def.id, tab)}">${esc(def.judul)}</a><p class="np-s">${esc(subBilah())}</p></div>
        ${tombolSemat(sematan().includes(def.id))}
      </div>
      <div class="ctl">
        <div class="ctl-btns">
          <button type="button" class="icon-btn" data-tahap="${i - 1}" ${lompat(i - 1, "sebelumnya")}>${IKON.mundur}</button>
          <button type="button" class="play-w" data-aksi aria-label="${esc(a.label)}" title="${esc(a.label)}">${a.ikon}</button>
          <button type="button" class="icon-btn" data-tahap="${i + 1}" ${lompat(i + 1, "berikutnya")}>${IKON.maju}</button>
        </div>
        <div class="prog"><span class="prog-l">Langkah ${i + 1}</span><div class="prog-bar"><span class="prog-fill" style="width:${((i + 1) / n) * 100}%"></span>${TAHAP.map((t, j) => `<button type="button" class="prog-seg" data-tahap="${j}" aria-label="Langkah ${j + 1}: ${t.label}" title="${t.label}"${j === i ? ' aria-current="step"' : ""}></button>`).join("")}</div><span class="prog-r">dari ${n}</span></div>
      </div>
      <div class="extra">
        <button type="button" class="icon-btn" id="panelBtn" aria-label="Panel isian" title="Tampilkan atau sembunyikan panel isian">${IKON.isian}</button>
        <div class="zoom"><button type="button" class="icon-btn" id="zoomBtn" aria-label="Pas lebar pratinjau">${IKON.zoom}</button><input type="range" id="zoomIn" min="40" max="150" step="5" aria-label="Zoom pratinjau RPK dan LPK"><span class="zoom-v" id="zoomVal" aria-hidden="true"></span></div>
      </div>`;
    sinkronTombol();
    terapkanZoom();
  }

  /* ---------- Zoom pratinjau kertas ---------- */
  const LEBAR_KERTAS = 820;
  function zoomEfektif() {
    if (ui.zoom != null) return ui.zoom / 100;
    const m = $("main");
    if (!m) return 1;
    const cs = getComputedStyle(m), w = m.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return Math.max(0.4, Math.min(1, Math.floor((w / LEBAR_KERTAS) * 100) / 100));
  }
  function terapkanZoom() {
    const m = $("main"), kertas = !!(m && m.classList.contains("is-paper")) && view === "kegiatan" && !ponsel();
    const z = kertas ? zoomEfektif() : 1, pct = Math.round(z * 100);
    if (m) m.style.setProperty("--zoom", z);
    const r = $("zoomIn"), v = $("zoomVal"), zb = $("zoomBtn");
    if (!r) return;
    const ket = kertas ? "" : " (berlaku di tab RPK dan LPK)";
    r.disabled = zb.disabled = !kertas;
    r.value = pct;
    r.style.setProperty("--isi", ((pct - 40) / 110) * 100 + "%");
    r.setAttribute("aria-valuetext", ui.zoom == null ? `Pas lebar, ${pct} persen` : `${pct} persen`);
    r.title = `Zoom pratinjau${ket}`;
    zb.title = (ui.zoom == null ? "Pas lebar aktif; klik untuk ukuran 100%" : "Klik untuk pas lebar") + ket;
    zb.setAttribute("aria-pressed", String(ui.zoom == null));
    v.textContent = kertas ? (ui.zoom == null ? "Pas" : pct + "%") : "";
  }

  /* ---------- Panel dan daftar sebagai laci (layar sedang dan ponsel) ---------- */
  const panelTerbuka = () => (lebar() ? !ui.panelOff : document.body.classList.contains("drawer-panel"));
  function togglePanel(buka = !panelTerbuka()) {
    if (lebar()) { ui.panelOff = !buka; simpanUI(); terapkanUI(); terapkanZoom(); }
    else bukaLaci("panel", buka);
  }
  let pemicu = null;
  function bukaLaci(nama, buka, opsi = {}) {
    const b = document.body;
    if (lebar()) return;
    b.classList.remove(nama === "lib" ? "drawer-panel" : "drawer-lib");
    b.classList.toggle("drawer-" + nama, buka);
    $("scrim").hidden = !b.classList.contains("drawer-lib") && !b.classList.contains("drawer-panel");
    terapkanUI();
    if (buka) {
      if (opsi.fokus === false) return;
      pemicu = document.activeElement;
      const el = nama === "lib" ? $("libList").querySelector("a") || $("libClose") : $("panelClose");
      if (el) el.focus();
    } else if (opsi.kembali !== false && pemicu && document.contains(pemicu)) { pemicu.focus(); pemicu = null; }
  }
  function tutupLaci(opsi) { ["lib", "panel"].forEach((n) => { if (document.body.classList.contains("drawer-" + n)) bukaLaci(n, false, opsi); }); }
  function terapkanUI() {
    const b = document.body, wide = lebar();
    b.classList.toggle("lib-ciut", wide ? ui.libMini : !ponsel() && !b.classList.contains("drawer-lib"));
    b.classList.toggle("panel-off", wide && ui.panelOff);
    sinkronTombol();
  }
  function sinkronTombol() {
    const b = document.body, wide = lebar(), libBuka = wide ? !ui.libMini : b.classList.contains("drawer-lib");
    const t = $("libToggle");
    t.setAttribute("aria-expanded", String(libBuka));
    t.title = wide ? (ui.libMini ? "Luaskan daftar kegiatan" : "Ciutkan daftar kegiatan") : (libBuka ? "Tutup daftar kegiatan" : "Buka daftar kegiatan");
    $("tbLib").setAttribute("aria-expanded", String(b.classList.contains("drawer-lib")));
    $("tbPanel").setAttribute("aria-expanded", String(b.classList.contains("drawer-panel")));
    const pb = $("panelBtn");
    if (pb) pb.setAttribute("aria-pressed", String(panelTerbuka()));
    const rumah = view === "beranda";
    ["homeBtn", "tbHome"].forEach((id) => { const el = $(id); if (rumah) el.setAttribute("aria-current", "page"); else el.removeAttribute("aria-current"); });
    $("homeBtn").innerHTML = rumah ? IKON.rumahIsi : IKON.rumah;
    $("tbHome").querySelector(".tb-ic").innerHTML = rumah ? IKON.rumahIsi : IKON.rumah;
  }

  /* ---------- Alamat halaman ---------- */
  function rute() {
    let h = location.hash.replace(/^#/, "");
    try { h = decodeURIComponent(h); } catch (e) { /* biarkan apa adanya */ }
    if (!h || h === "beranda") return { view: "beranda" };
    const [id, t] = h.split("/");
    if (!cariDef(id)) return null;
    return { view: "kegiatan", id, tab: TAHAP.some((x) => x.id === t) ? t : null };
  }
  function ikutiRute(awal = false) {
    const r = rute();
    // Jangkar lain (mis. tautan di dalam dokumen) diabaikan; alamat tak dikenal saat dibuka diarahkan ke beranda
    if (!r) { if (awal) { history.replaceState(null, "", location.pathname + location.search); ikutiRute(); } return; }
    const dariLaci = document.body.classList.contains("drawer-lib") || document.body.classList.contains("drawer-panel");
    tutupLaci({ kembali: false });
    if (r.view === "kegiatan") {
      if (!def || def.id !== r.id) pilihKegiatan(r.id);
      if (r.tab) tab = r.tab;
      view = "kegiatan";
      store.set("peh:terakhir", [def.id, ...terakhir().filter((x) => x !== def.id)]);
      const kanon = hashFor(def.id, tab);
      if (location.hash !== kanon) history.replaceState(null, "", kanon);
    } else view = "beranda";
    document.body.dataset.view = view;
    renderLibrary();
    renderView();
    if (view === "beranda") renderPlayer();
    const sc = $("viewScroll");
    if (dariLaci && !awal && sc) sc.focus({ preventScroll: true });
  }

  /* ---------- Peristiwa ---------- */
  function pasangPeristiwa() {
    document.addEventListener("click", (e) => {
      const t = e.target;
      if (!t.closest) return;
      if (t.closest("[data-aksi]")) { const a = aksiUtama(); if (a) a.jalan(); return; }
      if (t.closest("[data-semat]")) { toggleSemat(); return; }
      const st = t.closest("[data-tahap]");
      if (st) { setTahap(Number(st.dataset.tahap)); return; }
      const kb = t.closest("[data-kel]");
      if (kb) { pilihKelompok(kb); return; }
      if (t.closest("#hapusSaring")) { saring.kel = ""; $("cari").value = ""; saring.q = ""; $("cariHapus").hidden = true; renderLibrary(); isiHome(); return; }
      if (t.closest("#panelBtn")) { togglePanel(); return; }
      if (t.closest("#zoomBtn")) { ui.zoom = ui.zoom == null ? 100 : null; simpanUI(); terapkanZoom(); return; }
      if (t.closest(".lib-item")) setTimeout(() => tutupLaci({ kembali: false }), 0);
    });
    const cari = $("cari");
    cari.addEventListener("input", () => {
      saring.q = cari.value.trim();
      $("cariHapus").hidden = !cari.value;
      renderLibrary();
      if (view === "beranda") isiHome();
      else if (!lebar() && saring.q && !document.body.classList.contains("drawer-lib")) bukaLaci("lib", true, { fokus: false });
    });
    cari.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); const k = urutan(KEGIATAN.filter(cocok))[0]; if (k) location.hash = "#" + k.id; }
      else if (e.key === "Escape" && cari.value) { e.stopPropagation(); cari.value = ""; cari.dispatchEvent(new Event("input")); }
    });
    $("cariHapus").addEventListener("click", () => { cari.value = ""; cari.dispatchEvent(new Event("input")); cari.focus(); });
    $("libToggle").addEventListener("click", () => {
      if (lebar()) { ui.libMini = !ui.libMini; simpanUI(); terapkanUI(); terapkanZoom(); }
      else bukaLaci("lib", !document.body.classList.contains("drawer-lib"));
    });
    $("libClose").addEventListener("click", () => bukaLaci("lib", false));
    $("urut").addEventListener("change", (e) => { ui.urut = e.target.value; simpanUI(); renderLibrary(); });
    $("panelClose").addEventListener("click", () => togglePanel(false));
    $("tbLib").addEventListener("click", () => bukaLaci("lib", !document.body.classList.contains("drawer-lib")));
    $("tbPanel").addEventListener("click", () => bukaLaci("panel", !document.body.classList.contains("drawer-panel")));
    $("scrim").addEventListener("click", () => tutupLaci());
    $("smartFile").addEventListener("change", (e) => { const f = [...e.target.files]; e.target.value = ""; imporSMART(f); });
    $("player").addEventListener("input", (e) => { if (e.target.id !== "zoomIn") return; ui.zoom = Number(e.target.value); simpanUI(); terapkanZoom(); });
    $("mainView").addEventListener("mouseover", (e) => {
      const sc = view === "beranda" && e.target.closest && e.target.closest(".sc");
      if (sc) { $("mainView").style.setProperty("--h", sc.dataset.h); $("mainView").style.setProperty("--s", sc.dataset.s); }
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !document.querySelector("dialog[open]")) tutupLaci(); });
    const ubahLayar = () => { tutupLaci({ kembali: false }); terapkanUI(); terapkanZoom(); };
    ["(min-width: 1100px)", "(max-width: 760px)"].forEach((q) => { const m = window.matchMedia(q); if (m.addEventListener) m.addEventListener("change", ubahLayar); else m.addListener(ubahLayar); });
    if (window.ResizeObserver) new ResizeObserver(() => { if (ui.zoom == null) terapkanZoom(); }).observe($("mainView"));
    // File yang diseret ke mana saja di halaman kegiatan dibaca sebagai patroli SMART (browser tidak membuka file itu)
    window.addEventListener("dragover", (e) => { if (e.dataTransfer && [...e.dataTransfer.types].includes("Files")) e.preventDefault(); });
    window.addEventListener("drop", (e) => {
      if (!e.dataTransfer || !e.dataTransfer.files.length || (e.target.matches && e.target.matches('input[type="file"]'))) return;
      e.preventDefault();
      if (e.target.closest && e.target.closest(".drop")) return;
      const f = [...e.dataTransfer.files].filter((x) => /\.(zip|xml)$/i.test(x.name));
      if (view !== "kegiatan" || !def) toast("Buka kegiatan yang sesuai dulu, lalu seret file patroli SMART ke halamannya.", "err");
      else if (!f.length) toast("Yang bisa diseret ke sini hanya file patroli SMART (.zip atau .xml). Untuk CSV, pakai tombol Impor CSV di tabel.", "err");
      else imporSMART(f);
    });
    window.addEventListener("peh:redraw", () => { renderMain(); renderLibrary(); });
    // simpan segera saat halaman ditutup/dimuat ulang (penyimpanan biasa ditunda 0,3 detik)
    window.addEventListener("pagehide", () => simpan());
    window.addEventListener("hashchange", () => ikutiRute());
  }

  function init() {
    const tersimpan = store.get("peh:ui");
    if (tersimpan && typeof tersimpan === "object") ui = { ...ui, ...tersimpan };
    $("cariIkon").innerHTML = IKON.cari;
    $("cariHapus").innerHTML = IKON.tutup;
    $("libToggle").innerHTML = `${IKON.daftar}<span>Kegiatan</span>`;
    $("libClose").innerHTML = IKON.tutup;
    $("panelClose").innerHTML = IKON.tutup;
    $("tbLib").querySelector(".tb-ic").innerHTML = IKON.daftar;
    $("tbPanel").querySelector(".tb-ic").innerHTML = IKON.isian;
    $("urut").value = ui.urut;
    pasangPeristiwa();
    const r = rute();
    if (r && r.view === "kegiatan") tab = r.tab || "data";
    else if (terakhir()[0]) pilihKegiatan(terakhir()[0]); // konteks bilah bawah dan panel isian di beranda
    if (!def) renderSide();
    tandaSimpan(store.bisa() ? "awal" : "gagal");
    terapkanUI();
    ikutiRute(true);
  }
  PEH.init = init;
  PEH.util = { store, clone, fieldGrid, field, tableEditor, card, div };
})();
