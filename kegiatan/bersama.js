/*
 * Bahan bersama konfigurasi kegiatan PEH (dipakai kegiatan/<id>/<id>.js lewat window.PEHKeg):
 * kolom isian yang berulang, pemisah nama jenis dari kamus SMART, paragraf kawasan, dan daftar pilihan.
 */
(function () {
  "use strict";
  const L = window.PEHLaporan;

  // Paragraf umum kawasan TN Tambora (sumber: LPK teknis Balai 2020 sampai 2026)
  const TN = "Taman Nasional (TN) Tambora ditetapkan melalui Keputusan Menteri Lingkungan Hidup dan Kehutanan Nomor SK.111/Menlhk-II/2015 tanggal 7 April 2015 tentang perubahan fungsi kawasan Cagar Alam, Suaka Margasatwa, dan Taman Buru Gunung Tambora menjadi taman nasional seluas 71.645,64 ha. Kawasan ini berada di Kabupaten Bima dan Kabupaten Dompu, Provinsi Nusa Tenggara Barat, dan tersusun atas tiga tipe ekosistem utama, yaitu hutan musim, hutan hujan tropis, dan savana, yang menjadi habitat beragam jenis tumbuhan dan satwa liar.";

  // Label jenis dari kamus SMART: "Nama - Nama ilmiah" (nama bisa memuat " - " juga)
  function pisahJenis(s) {
    const p = String(s || "").split(" - ").map((x) => x.trim()).filter(Boolean);
    if (p.length < 2) return [p[0] || "", ""];
    const akhir = p[p.length - 1];
    return /^[A-Z][a-z-]+( [a-z(]|$| sp)/.test(akhir) ? [p.slice(0, -1).join(" - "), akhir] : [p.join(" - "), ""];
  }
  const jenisDari = (v, ...keys) => { for (const k of keys) { const s = v(k); if (s) return pisahJenis(s); } return ["", ""]; };

  // Daftar jenis TN Tambora (js/core/taksa.js): usulan nama, nama ilmiah, famili, status perlindungan, invasif
  // Status CITES di daftar jenis ("Appendix II", "Non Appendix", "Not Evaluated") menjadi label laporan
  const citesLabel = (v) => { const s = String(v || "").trim(), m = s.match(/^appendix\s+(I{1,3})$/i); return m ? `Apendiks ${m[1].toUpperCase()}` : /^non\s*appendix$/i.test(s) ? "Tidak terdaftar" : /^not\s*evaluated$/i.test(s) ? "" : s; };
  const TAKSA = (window.PEH_TAKSA || []).map((r) => ({ nama: r[0], latin: r[1], famili: r[2], kelompok: r[3], habitus: r[4], p106: r[5] === "D" ? "Dilindungi" : "", iucn: r[6], cites: citesLabel(r[7]), invasif: !!r[8], lokal: r[9] || [] }));
  const idxTaksa = new Map();
  TAKSA.forEach((t) => [t.nama, t.latin, ...t.lokal].filter(Boolean).forEach((k) => { const kk = k.toLowerCase(); if (!idxTaksa.has(kk)) idxTaksa.set(kk, t); }));
  const taksa = {
    semua: TAKSA,
    cari: (s) => idxTaksa.get(String(s || "").trim().toLowerCase()) || null,
    // Kamus nama → nama ilmiah untuk kolom jenis; kelompok: "Aves", "Flora", "Anggrek", "Mamalia", "Fauna lain"
    kamus(...kel) {
      const o = {};
      TAKSA.filter((t) => !kel.length || kel.includes(t.kelompok)).forEach((t) => { if (t.nama && !(t.nama in o)) o[t.nama] = t.latin; t.lokal.forEach((l) => { if (!(l in o)) o[l] = t.latin; }); if (!t.nama && t.latin && !(t.latin in o)) o[t.latin] = t.latin; });
      return o;
    }
  };

  // Kolom yang berulang di banyak tabel isian
  const KOL = {
    tanggal: { key: "tanggal", label: "Tanggal", type: "date" },
    waktu: { key: "waktu", label: "Jam", w: 4.5 },
    x: { key: "x", label: "X (bujur)", type: "number", w: 6.5 },
    y: { key: "y", label: "Y (lintang)", type: "number", w: 6.5 },
    ketinggian: { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number", w: 4.5 },
    keterangan: { key: "keterangan", label: "Keterangan", w: 10 },
    transek: { key: "transek", label: "Transek/Jalur", w: 5, tengah: true },
    plot: { key: "plot", label: "Plot", w: 4.5, tengah: true },
    petak: { key: "petak", label: "Petak", w: 4.5, tengah: true },
    jumlah: { key: "n", label: "Jumlah", type: "number", w: 3.5 },
    diameter: { key: "diameter", label: "Diameter (cm)", type: "number", w: 4.5 },
    tinggi: { key: "tinggi", label: "Tinggi (m)", type: "number", w: 4 }
  };
  const TINGKAT = ["Semai", "Pancang", "Tiang", "Pohon", "Tumbuhan bawah"];
  // Kamus per kelompok taksa dibuat sekali; daftar usulannya dipakai bersama semua tabel
  const KAMUS = {}, DAFTAR = new WeakMap();
  const kamus = (...kel) => (KAMUS[kel.join(",")] = KAMUS[kel.join(",")] || taksa.kamus(...kel));
  const daftarDari = (k) => { if (!DAFTAR.has(k)) DAFTAR.set(k, Object.keys(k).sort((a, b) => a.localeCompare(b, "id"))); return DAFTAR.get(k); };
  const kolJenis = (judul, km) => [
    { key: "jenis", label: judul || "Nama jenis", w: 10, list: km ? daftarDari(km) : undefined, onSet: km ? (r, v) => { const l = km[String(v).trim()]; if (l) r.latin = l; } : undefined },
    { key: "latin", label: "Nama ilmiah", w: 10, latin: true }
  ];
  const kolVegetasi = (ekstra = []) => [KOL.petak, { key: "tingkat", label: "Tingkat", options: TINGKAT, w: 6 }, ...kolJenis("Nama jenis tumbuhan", kamus("Flora")), KOL.jumlah, KOL.diameter, ...ekstra];
  // Perlu kotak pilihan: SMART memberi label teks bebas; "Ya"/"Tidak" untuk atribut boolean
  const yaTidak = (o, key) => (o.attr[key] ? (o.attr[key].value === true || o.attr[key].value === "true" ? "Ya" : "Tidak") : "");
  const dasarObs = (o) => ({ tanggal: o.tanggal || "", waktu: String(o.waktu || "").replace(":", "."), x: o.x ?? "", y: o.y ?? "" });

  // Baris vegetasi dari observasi SMART (dipakai banyak kegiatan)
  const petaVegetasi = (o, v) => { const [jenis, latin] = jenisDari(v, "jenistumbuhan"); return { ...dasarObs(o), petak: String(v("noplot") || ""), tingkat: v("tingkatpertumbuhan"), jenis, latin, n: Number(v("jumlah")) || 1, diameter: v("dbhpohoncm"), keliling: v("kelilingcm"), tinggi: v("tinggipohonm"), keterangan: v("keterangan") }; };
  const inputVegetasi = (rows, P) => ({ mode: "petak", rows: (rows || []).map((r) => ({ ...r, n: r.n === "" || r.n === undefined ? 1 : r.n })), luas: { semai: P.luasSemai, pancang: P.luasPancang, tiang: P.luasTiang, pohon: P.luasPohon, "tumbuhan bawah": P.luasSemai }, nPetak: P.nPetak });
  const optVegetasi = (P) => ({ luas: { semai: P.luasSemai, pancang: P.luasPancang, tiang: P.luasTiang, pohon: P.luasPohon } });
  const paramVegetasi = (def = {}) => [
    { key: "nPetak", label: "Jumlah petak contoh (kosong = dari data)", type: "number", half: true, def: def.nPetak ?? "" },
    { key: "luasSemai", label: "Luas petak semai (m²)", type: "number", half: true, def: def.semai ?? 4 },
    { key: "luasPancang", label: "Luas petak pancang (m²)", type: "number", half: true, def: def.pancang ?? 25 },
    { key: "luasTiang", label: "Luas petak tiang (m²)", type: "number", half: true, def: def.tiang ?? 100 },
    { key: "luasPohon", label: "Luas petak pohon (m²)", type: "number", half: true, def: def.pohon ?? 400 }
  ];
  const paramKriteriaH = { key: "kriteriaH", label: "Kriteria keanekaragaman H′", options: [["template", "Template Balai: ≤2 rendah, 2–3 sedang, ≥3 tinggi"], ["krebs", "Krebs: <1 rendah, 1–3 sedang, >3 tinggi"]], def: "template" };
  const paramMetodeID = { key: "metodeID", label: "Rumus indeks dispersi", options: [["template", "Template Analisa data.xlsx"], ["unit", "Per unit pengamatan (Ludwig dan Reynolds)"]], def: "template" };
  const paramSistem = { key: "sistem", label: "Sistem koordinat", options: [["geo", "Geografis (derajat desimal)"], ["utm", "UTM (meter)"]], def: "geo" };

  // Tabel ringkas dari baris isian (untuk tabel lokasi/plot di bagian Hasil): cols [{ key, label, type, d }]
  function specDari(rows, cols) {
    const C = window.PEHModul.cell, esc = L.esc;
    return { head: ["No", ...cols.map((c) => c.label)], rows: rows.map((r, i) => [C.k(i + 1), ...cols.map((c) => {
      const v = r[c.key];
      if (c.type === "number") return v === "" || v === undefined || v === null || !Number.isFinite(Number(v)) ? C.k("-") : C.n(Number(v), c.d ?? 0);
      if (c.type === "date") return C.k(v ? esc(L.tglPanjang(v)) : "-");
      return c.tengah ? C.k(esc(v || "-")) : C.t(esc(v || "-"));
    })]) };
  }
  // Rentang angka "a sampai b"
  const rentang = (vals, d = 0) => { const v = vals.map(Number).filter((x) => Number.isFinite(x) && x !== 0); if (!v.length) return ""; const a = Math.min(...v), b = Math.max(...v); return a === b ? L.num(a, d) : `${L.num(a, d)} sampai ${L.num(b, d)}`; };
  // "Nama (Nama ilmiah)", tanpa mengulang bila keduanya sama
  const namaJenis = (r) => { const j = String(r.jenis || "").trim(), l = String(r.latin || "").trim(); return !l || j.toLowerCase() === l.toLowerCase() ? j || l : !j ? l : `${j} (${l})`; };
  // Status perlindungan jenis yang tercatat (P.106/2018) dari daftar jenis TN Tambora
  const dilindungi = (rows) => [...new Map((rows || []).map((r) => [String(r.latin || r.jenis || "").trim().toLowerCase(), r])).values()].filter((r) => { const t = taksa.cari(r.latin) || taksa.cari(r.jenis); return t && t.p106; }).map(namaJenis);

  // Posisi satwa dari posisi pengamat, jarak (m), dan azimuth (derajat dari utara)
  function proyeksi(x, y, jarak, azimuth, sistem) {
    const X = Number(x), Y = Number(y), d = Number(jarak), a = (Number(azimuth) * Math.PI) / 180;
    if (![X, Y, d, a].every(Number.isFinite)) return null;
    if (sistem === "utm") return { x: X + d * Math.sin(a), y: Y + d * Math.cos(a) };
    return { x: X + (d * Math.sin(a)) / (111320 * Math.cos((Y * Math.PI) / 180)), y: Y + (d * Math.cos(a)) / 110574 };
  }
  // Kecocokan baris dengan jenis sasaran (nama, nama ilmiah, atau nama lokal di daftar jenis TN Tambora)
  const sasaran = (r, target) => { const t = taksa.cari(target); return cocok(r, target) || (!!t && [t.nama, t.latin, ...t.lokal].filter(Boolean).some((s) => cocok(r, s))); };
  // Jumlah individu per unit tanpa hitung ganda: maksimum individu per unit (perjumpaan berulang pada individu yang sama)
  const maksPerUnit = (rows, unitKey = "plot") => { const m = new Map(); rows.forEach((r) => { const u = String(r[unitKey] ?? "").trim() || "-", n = Number(r.n) || 1; const o = m.get(u); if (!o || n > o.n) m.set(u, { ...r, n }); }); return [...m.values()]; };

  // Jumlah baris data yang terisi (untuk narasi)
  const terisi = (rows, ...keys) => (rows || []).filter((r) => keys.some((k) => String(r[k] ?? "").trim()));
  const unik = (rows, key) => [...new Set((rows || []).map((r) => String(r[key] ?? "").trim()).filter(Boolean))];
  const cocok = (r, target) => { const t = String(target || "").trim().toLowerCase(); if (!t) return true; return [r.jenis, r.latin].some((s) => String(s || "").toLowerCase().includes(t)); };
  // Wilayah kerja dalam kalimat
  const resor = (x) => (x.I.resort ? `${/^resor/i.test(x.I.resort) ? "" : "Resor "}${x.I.resort}` : x.lokasi);
  // Jenis yang dinyatakan invasif di LPK IAS Balai (Doropeti, Pancasila, dan Kawinda Toi 2023, termasuk temuan SPTN Wilayah I Kore 2020)
  const JAI_LPK = ["Ageratum conyzoides", "Bidens pilosa", "Chromolaena odorata", "Crassocephalum crepidioides", "Emilia sonchifolia", "Euphorbia hirta", "Hyptis capitata", "Imperata cylindrica", "Lantana camara", "Mimosa diplotricha", "Momordica balsamina", "Psidium guajava", "Solanum torvum", "Themeda arguens", "Acacia auriculiformis"];
  // Famili menurut genus untuk jenis yang belum tercatat familinya di daftar jenis TN Tambora (jenis invasif, tumbuhan dan satwa umum)
  const FAMILI = { ageratum: "Asteraceae", bidens: "Asteraceae", chromolaena: "Asteraceae", crassocephalum: "Asteraceae", emilia: "Asteraceae", euphorbia: "Euphorbiaceae", jatropha: "Euphorbiaceae", hyptis: "Lamiaceae", imperata: "Poaceae", themeda: "Poaceae", ischaemum: "Poaceae", cyperus: "Cyperaceae", lantana: "Verbenaceae", mimosa: "Fabaceae", acacia: "Fabaceae", crotalaria: "Fabaceae", momordica: "Cucurbitaceae", psidium: "Myrtaceae", solanum: "Solanaceae", anacardium: "Anacardiaceae",
    crypteronia: "Crypteroniaceae", celtis: "Cannabaceae", trema: "Cannabaceae", biophytum: "Oxalidaceae", vitex: "Lamiaceae", elaeocarpus: "Elaeocarpaceae",
    rusa: "Cervidae", cervus: "Cervidae", muntiacus: "Cervidae", sus: "Suidae", macaca: "Cercopithecidae", paradoxurus: "Viverridae", pteropus: "Pteropodidae", hystrix: "Hystricidae", varanus: "Varanidae", python: "Pythonidae" };
  const familiDari = (r, t) => (t && t.famili) || FAMILI[String(r.latin || "").trim().split(/\s+/)[0].toLowerCase()] || "";
  const kunciJenis = (s) => String(s || "").trim().toLowerCase().split(/\s+/).slice(0, 2).join(" ");
  const SET_JAI = new Set([...JAI_LPK, ...taksa.semua.filter((t) => t.invasif).map((t) => t.latin)].map(kunciJenis).filter((x) => x.includes(" ")));
  const dikenalInvasif = (r) => { const t = taksa.cari(r.latin) || taksa.cari(r.jenis); return SET_JAI.has(kunciJenis(r.latin)) || (!!t && (t.invasif || SET_JAI.has(kunciJenis(t.latin)))); };
  // Daftar pilihan yang dipakai beberapa kegiatan: zona pengelolaan dan tipe ekosistem peta Balai
  // Enam resor TN Tambora (batas resor pada repo dashboard SMART)
  const RESOR = ["Resor Doro Ncanga", "Resor Doropeti", "Resor Kawinda Toi", "Resor Oi Katupa", "Resor Pancasila", "Resor Piong"];
  const ZONA = ["Zona Inti", "Zona Rimba", "Zona Pemanfaatan", "Zona Tradisional", "Zona Rehabilitasi", "Zona Khusus"];
  const EKOSISTEM = ["Hutan pamah (dataran rendah)", "Hutan musim/kering", "Hutan hujan tropis dataran rendah", "Hutan pegunungan bawah", "Hutan pegunungan atas", "Sub alpin", "Savana", "Riparian", "Ekosistem lainnya"];
  const SARAN_UMUM = {
    kapasitas: "Perlu peningkatan kapasitas pelaksana dalam metode survei lapangan, identifikasi jenis, dan pengolahan data",
    alat: "Perlu dukungan peralatan yang memadai (GPS, kamera dengan lensa panjang, binokuler, dan perangkat SMART Mobile) agar data lebih lengkap dan akurat",
    berkala: "Kegiatan perlu dilakukan secara berkala pada musim yang berbeda agar perubahan populasi dan sebaran dapat dipantau dari waktu ke waktu",
    pengamanan: "Perlu pengamanan kawasan dari gangguan perburuan, pembalakan, dan kebakaran hutan melalui patroli rutin bersama masyarakat",
    smart: "Data lapangan dicatat dengan SMART Mobile pada kategori Metode Teknis agar langsung tersimpan di basis data Balai dan dapat diolah ulang"
  };

  window.PEHKeg = { TN, pisahJenis, jenisDari, taksa, kamus, KOL, TINGKAT, kolJenis, kolVegetasi, yaTidak, dasarObs, petaVegetasi, inputVegetasi, optVegetasi, paramVegetasi, paramKriteriaH, paramMetodeID, paramSistem, terisi, unik, cocok, resor, specDari, rentang, dilindungi, namaJenis, proyeksi, sasaran, maksPerUnit, SARAN_UMUM, ZONA, EKOSISTEM, RESOR, dikenalInvasif, familiDari, kunciJenis, cap1: L.cap1 };
})();
