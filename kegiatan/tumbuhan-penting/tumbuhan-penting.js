/*
 * Kegiatan: Identifikasi Penyebaran dan Inventarisasi Tumbuhan Penting.
 * Acuan: LPK identifikasi penyebaran dan inventarisasi tumbuhan penting Resor Doro Ncanga dan Resor Doropeti (2020).
 * Data SMART: kategori metodeteknis.inventarisasitumbuhanpenting. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const IUCN = ["CR", "EN", "VU", "NT", "LC", "DD", "NE"];
  const CITES = ["Apendiks I", "Apendiks II", "Apendiks III", "Tidak terdaftar"];
  const ENDEMIK = ["Endemik TN Tambora", "Endemik Pulau Sumbawa", "Endemik Nusa Tenggara", "Endemik Indonesia", "Bukan endemik"];
  const MANFAAT = ["Obat", "Pangan", "Kayu", "Tanaman hias", "Pakan ternak", "Pakan satwa liar", "Bahan kerajinan", "Ritual atau budaya", "Lainnya"];
  const ANCAMAN = new Set(["CR", "EN", "VU", "NT"]);
  const KAMUS = K.kamus("Flora");
  const kunci = (r) => K.kunciJenis(r.latin) || String(r.jenis || "").trim().toLowerCase();
  const petakIsi = (S) => K.terisi(S.data.petak, "kode");
  const vegIsi = (S) => K.terisi(S.data.vegetasi, "jenis", "latin").map((r) => ({ ...r, tingkat: String(r.tingkat || "").trim() || "Tumbuhan bawah" }));
  const nPetak = (S, P) => Number(P.nPetak) || petakIsi(S).length || "";
  // Status dari daftar jenis TN Tambora (js/core/taksa.js) untuk isian otomatis
  const statusTaksa = (r) => { const t = K.taksa.cari(r.latin) || K.taksa.cari(r.jenis); return t ? { famili: t.famili || "", iucn: t.iucn || "", p106: t.p106 || "", cites: t.cites || "" } : {}; };
  const isiStatus = (r) => { const t = statusTaksa(r); ["famili", "iucn", "p106", "cites"].forEach((k) => { if (!String(r[k] || "").trim() && t[k]) r[k] = t[k]; }); };
  const atributPenting = (r) => {
    const out = [], iu = String(r.iucn || "").trim();
    if (ANCAMAN.has(iu)) out.push(`IUCN ${iu}`);
    if (/^dilindungi/i.test(String(r.p106 || "").trim())) out.push("dilindungi");
    if (/apendiks/i.test(String(r.cites || ""))) out.push(`CITES ${r.cites}`);
    if (/^endemik/i.test(String(r.endemik || "").trim())) out.push(String(r.endemik).trim().toLowerCase());
    if (String(r.manfaat || "").trim() || String(r.kategori || "").trim()) out.push("bernilai ekonomi");
    return out;
  };
  // Tumbuhan penting: semua baris tabel status (pilihan tim) ditambah jenis di petak yang berstatus konservasi menurut daftar jenis TN Tambora
  function daftarPenting(S) {
    const m = new Map();
    K.terisi(S.data.penting, "jenis", "latin").forEach((r) => m.set(kunci(r), { ...r }));
    vegIsi(S).forEach((r) => { const k = kunci(r); if (m.has(k)) return; const st = { jenis: r.jenis, latin: r.latin, ...statusTaksa(r), endemik: "", manfaat: "", kategori: "" }; if (atributPenting(st).length) m.set(k, st); });
    return [...m.values()];
  }
  const kolPenting = [...K.kolJenis("Nama jenis", KAMUS).map((c) => (c.key === "jenis" ? { ...c, onSet: (r, v) => { if (c.onSet) c.onSet(r, v); isiStatus(r); } } : { ...c, onSet: (r) => isiStatus(r) })),
    { key: "famili", label: "Famili", w: 7 }, { key: "iucn", label: "Status IUCN", options: IUCN, w: 5 }, { key: "p106", label: "P.106/2018", options: ["Dilindungi", "Tidak Dilindungi"], w: 5 }, { key: "cites", label: "CITES", options: CITES, w: 5 },
    { key: "endemik", label: "Endemisitas", options: ENDEMIK, w: 7 }, { key: "kategori", label: "Kategori manfaat", list: MANFAAT, w: 6 }, { key: "manfaat", label: "Nilai ekonomi atau manfaat", w: 12 }, { key: "deskripsi", label: "Deskripsi habitat dan morfologi", w: 16 }, KOL.keterangan];

  window.PEH.kegiatan({
    id: "tumbuhan-penting", kode: "TUMPEN",
    judul: "Identifikasi Penyebaran dan Inventarisasi Tumbuhan Penting",
    ringkas: "Garis berpetak pada jalur pengamatan. Intensitas sampling, analisis vegetasi (K, F, D, INP, H′) per tingkat pertumbuhan, dan daftar tumbuhan penting menurut nilai ekologis, nilai ekonomi, endemisitas, serta status IUCN, CITES, dan P.106/2018.",
    objek: "tumbuhan", objekPeta: "petak contoh dan titik temuan tumbuhan penting",
    kategoriSMART: "metodeteknis.inventarisasitumbuhanpenting.",
    contoh: (window.PEH_CONTOH || {})["tumbuhan-penting"],
    alat: [{ nama: "Peta kerja", jumlah: "1", satuan: "lembar" }, { nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Kamera", jumlah: "1", satuan: "unit" }, { nama: "Meteran dan tali rafia untuk petak contoh", jumlah: "1", satuan: "set" }, { nama: "Pita ukur diameter (phi band) atau meteran jahit", jumlah: "1", satuan: "buah" }, { nama: "Parang", jumlah: "1", satuan: "buah" }, { nama: "Alat dan bahan herbarium (kertas koran, alkohol 70%, plastik)", jumlah: "1", satuan: "set" }, { nama: "Buku panduan pengenalan jenis tumbuhan", jumlah: "1", satuan: "buah" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "petak", judul: "Petak Contoh", ket: "Satu baris untuk satu petak contoh, termasuk petak yang hanya berisi tumbuhan bawah.",
        kolom: [{ key: "kode", label: "Kode petak", w: 4.5, tengah: true }, { key: "jalur", label: "Jalur atau blok", w: 7 }, KOL.tanggal, KOL.x, KOL.y, KOL.ketinggian, { key: "ekosistem", label: "Tipe ekosistem", list: K.EKOSISTEM, w: 8 }, KOL.keterangan],
        smart: { sub: "petakcontoh", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), jalur: v("jalurpengamatan"), ketinggian: v("ketinggianmdpl"), ekosistem: v("tipeekosistem"), keterangan: v("keterangan") }) } },
      { key: "vegetasi", judul: "Data Vegetasi Petak Contoh", ket: "Satu baris untuk satu jenis pada satu petak dan tingkat pertumbuhan. Isi diameter untuk tiang dan pohon. Tingkat yang dikosongkan dianggap tumbuhan bawah.",
        kolom: K.kolVegetasi([KOL.keterangan]),
        smart: { sub: "vegetasi", map: K.petaVegetasi },
        baruBaris: (last) => ({ petak: last.petak || "", tingkat: last.tingkat || "", n: 1 }) },
      { key: "penting", judul: "Status dan Nilai Penting Jenis", ket: "Satu baris untuk satu jenis yang dinilai penting. Status IUCN, CITES, dan P.106 terisi otomatis dari daftar jenis TN Tambora bila tersedia; lengkapi endemisitas, nilai ekonomi, dan deskripsinya. Kode IUCN: CR kritis, EN terancam, VU rentan, NT hampir terancam, LC risiko rendah, DD kurang data, NE belum dievaluasi.",
        kolom: kolPenting, tanpaTally: true,
        smart: { sub: "statusjenis", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); const r = { jenis, latin, famili: "", iucn: v("statusiucn"), p106: v("status"), cites: v("statuscites"), endemik: v("endemisitas"), kategori: v("kategorimanfaat"), manfaat: v("nilaiekonomi"), deskripsi: "", keterangan: v("keterangan") }; isiStatus(r); return r; } } }
    ],
    parameter: [
      { key: "panjangJalur", label: "Panjang jalur pengamatan (m)", type: "number", half: true, def: "" },
      { key: "lebarJalur", label: "Lebar jalur (m)", type: "number", half: true, def: 20 },
      { key: "luasPopulasi", label: "Luas populasi (ha, bila bukan jalur)", type: "number", half: true, def: "" },
      { key: "IS", label: "Intensitas sampling rencana (%)", type: "number", half: true, def: "" },
      ...K.paramVegetasi(),
      { ...K.paramKriteriaH, def: "krebs" }
    ],
    paramInfo: "Luas populasi jalur = panjang × lebar jalur. Intensitas sampling dipakai untuk menghitung rencana jumlah petak di RPK; intensitas aktual dihitung dari jumlah petak yang diukur dan luas petak pohon.",
    modul: [
      { m: "sampling", id: "sampling", opsional: true, input: (S, P) => ({ panjang: P.panjangJalur, lebar: P.lebarJalur, luasHa: P.luasPopulasi, luasPetak: P.luasPohon, IS: P.IS, nPetak: nPetak(S, P) }) },
      { m: "vegetasi", id: "vegetasi", input: (S, P) => K.inputVegetasi(vegIsi(S), { ...P, nPetak: nPetak(S, P) }),
        opt: (P, S) => { const set = new Set(daftarPenting(S).map(kunci)); return { ...K.optVegetasi(P), kriteriaH: P.kriteriaH, tanda: (x) => set.has(kunci(x)), tandaKet: "* tumbuhan penting" }; } },
      { m: "daftar", id: "penting", judul: "Jenis Tumbuhan Penting", objek: "tumbuhan penting",
        input: (S, P, A) => {
          const veg = vegIsi(S), v = A.vegetasi || {}, puncak = new Map();
          (v.per || []).forEach((t) => t.rows.forEach((x, i) => { const k = kunci(x), o = puncak.get(k); if (!o || x.INP > o.INP) puncak.set(k, { INP: x.INP, tingkat: t.tingkat, dominan: i === 0 }); }));
          return { rows: daftarPenting(S).map((r) => {
            const vs = veg.filter((x) => kunci(x) === kunci(r)), pk = puncak.get(kunci(r));
            return { jenis: r.jenis, latin: r.latin, famili: r.famili || statusTaksa(r).famili || "", n: vs.reduce((s, x) => s + (Number(x.n) || 1), 0), unit: vs.length ? [...new Set(vs.map((x) => String(x.petak || "").trim()).filter(Boolean))].join(", ") : "di luar petak",
              tingkat: [...new Set(vs.map((x) => x.tingkat))].join(", "), inp: pk ? `${L.num(pk.INP, 2)} (${pk.tingkat})` : "", iucn: r.iucn, p106: r.p106, cites: r.cites, endemik: r.endemik, manfaat: [r.kategori, r.manfaat].filter((s) => String(s || "").trim()).join(": ") };
          }) };
        },
        opt: { satuan: "individu dalam petak", kolom: [{ key: "inp", label: "INP Tertinggi (%)" }, { key: "iucn", label: "IUCN" }, { key: "p106", label: "P.106/2018" }, { key: "cites", label: "CITES" }, { key: "endemik", label: "Endemisitas" }, { key: "manfaat", label: "Nilai Ekonomi" }] } },
      { m: "persen", id: "manfaat", opsional: true, judul: "Kategori Manfaat Tumbuhan Penting", objek: "tumbuhan penting", input: (S) => ({ items: K.terisi(S.data.penting, "jenis", "latin").filter((r) => String(r.kategori || "").trim()).map((r) => [r.kategori, 1]) }),
        opt: { label: "kategori manfaat", satuan: "jenis", cap: "Kategori Manfaat Jenis Tumbuhan Penting" } },
      { m: "deskripsi", id: "deskripsi", opsional: true, judul: "Deskripsi Jenis Tumbuhan Penting", objek: "tumbuhan penting",
        input: (S, P, A) => {
          const pk = new Map(((A.penting || {}).baris || []).map((b) => [kunci(b), b]));
          return { rows: K.terisi(S.data.penting, "jenis", "latin").map((r) => { const b = pk.get(kunci(r)) || {}; return { jenis: r.jenis, latin: r.latin, famili: r.famili || statusTaksa(r).famili || "", deskripsi: r.deskripsi,
            atribut: [["status IUCN", r.iucn], ["P.106/2018", r.p106], ["CITES", r.cites], ["endemisitas", r.endemik], ["nilai ekonomi", String(r.manfaat || "").trim() || String(r.kategori || "").trim().toLowerCase()], ["INP tertinggi", b.inp ? `${b.inp.replace(" (", "% (")}` : ""]] }; }) };
        } }
    ],
    lokasiTabel: (S) => ({ cap: "Lokasi Petak Contoh", spec: K.specDari(petakIsi(S), [{ key: "kode", label: "Kode Petak", tengah: true }, { key: "jalur", label: "Jalur atau Blok" }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "ekosistem", label: "Tipe Ekosistem" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;", "Peraturan Direktur Jenderal Konservasi Sumber Daya Alam dan Ekosistem Nomor P.10/KSDAE/SET/KSA.0/9/2016 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;"],
      latar: (x) => [K.TN,
        "Potensi TN Tambora sangat beragam dan perlu dikaji secara rutin, salah satunya melalui identifikasi penyebaran dan inventarisasi tumbuhan penting di wilayah kerja setiap resor. Inventarisasi tumbuhan adalah kegiatan untuk memperoleh data dan informasi mengenai jenis, populasi, sebaran, dan status konservasi tumbuhan, berupa endemisitas, jumlah individu, kepadatan populasi, kondisi habitat, dan keterancaman terhadap kepunahan, sebagai bahan perencanaan pengelolaan kawasan.",
        `Tumbuhan penting dapat dilihat dari beberapa sudut pandang, yaitu nilai ekologis (indeks nilai penting di dalam komunitas), nilai ekonomi, endemisitas, dan status konservasi menurut IUCN, CITES, dan Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018. Suatu jenis tidak harus memenuhi semua kriteria tersebut untuk dikategorikan sebagai tumbuhan penting. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah memperoleh data dan informasi tentang keberadaan, jumlah, dan sebaran tumbuhan penting di ${x.wil}. Tujuan kegiatan ini adalah:`, "1. Mengetahui komposisi dan struktur vegetasi pada setiap tingkat pertumbuhan;", "2. Mengidentifikasi jenis tumbuhan penting berdasarkan nilai ekologis, nilai ekonomi, endemisitas, dan status konservasinya;", "3. Memetakan sebaran tumbuhan penting sebagai bahan perencanaan pengelolaan dan pemantauan perubahan sumber daya hutan."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Persiapan: penentuan jalur dan blok pengamatan serta jumlah petak contoh berdasarkan intensitas sampling;", "2. Pengambilan data vegetasi pada petak contoh untuk tingkat semai, pancang, tiang, pohon, dan tumbuhan bawah;", "3. Identifikasi jenis, status konservasi, endemisitas, dan nilai ekonomi dari literatur, IUCN Red List, CITES, P.106/2018, dan informasi masyarakat;", "4. Analisis vegetasi dan penentuan jenis tumbuhan penting;", "5. Pelaporan."],
      metode: (x) => ["Pengambilan data menggunakan metode garis berpetak. Petak contoh diletakkan berselang-seling di kanan dan kiri jalur secara sistematis, misalnya setiap 500 m di sepanjang jalur pendakian. Jumlah petak ditentukan dari luas populasi dan intensitas sampling.",
        `Petak contoh dibuat bersarang menurut tingkat pertumbuhan: semai (anakan setinggi kurang dari 1,5 m) dan tumbuhan bawah pada petak ${L.num(Number(x.P.luasSemai) || 4)} m², pancang (tinggi 1,5 m atau lebih dan diameter kurang dari 10 cm) pada petak ${L.num(Number(x.P.luasPancang) || 25)} m², tiang (diameter 10 sampai 19 cm) pada petak ${L.num(Number(x.P.luasTiang) || 100)} m², dan pohon (diameter 20 cm atau lebih) pada petak ${L.num(Number(x.P.luasPohon) || 400)} m². Parameter yang dicatat adalah jenis, jumlah individu, dan diameter setinggi dada untuk tiang dan pohon. Jenis yang belum dikenali ditanyakan kepada masyarakat pendamping dan didokumentasikan.`,
        "Setiap jenis kemudian dideskripsikan habitat dan morfologinya, serta dilengkapi status konservasi menurut IUCN dan CITES, status perlindungan menurut P.106/MENLHK/SETJEN/KUM.1/12/2018, status endemisitas, dan nilai ekonominya. Kategori keterancaman IUCN yang dipakai adalah Critically Endangered (CR, kritis), Endangered (EN, terancam), Vulnerable (VU, rentan), Near Threatened (NT, hampir terancam), Least Concern (LC, risiko rendah), Data Deficient (DD, kurang data), dan Not Evaluated (NE, belum dievaluasi). Suatu tumbuhan disebut endemik bila hanya ditemukan di satu wilayah tertentu dan tidak ditemukan di tempat lain. Nilai ekonomi adalah potensi pemanfaatan bagian tumbuhan, misalnya sebagai obat, pangan, kayu, atau tanaman hias.",
        "Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Inventarisasi Tumbuhan Penting atau pada tally sheet."],
      lokasi: (x) => { const pk = petakIsi(x.S), eko = K.unik(pk, "ekosistem"), alt = K.rentang(pk.map((p) => p.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${alt ? ` Petak contoh berada pada ketinggian ${alt} mdpl` : ""}${eko.length ? `${alt ? " dan mencakup" : " Petak contoh mencakup"} ekosistem ${x.daftarKata(eko.map((e) => e.toLowerCase()))}` : ""}${alt || eko.length ? "." : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}, terutama di sepanjang jalur pendakian dan jalur pengamatan yang mewakili tipe ekosistem di wilayah kerja tersebut.`,
      hasilLokasi: (x) => { const pk = petakIsi(x.S), lok = x.lokasi.toLowerCase(), jl = K.unik(pk, "jalur").filter((j) => !lok.includes(j.toLowerCase())); return pk.length ? `Sebanyak ${x.nTxt(pk.length)} petak contoh diukur di ${x.lokasi}${jl.length ? ` pada ${x.daftarKata(jl)}` : ""}.` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const out = [], dp = daftarPenting(x.S), nm = K.namaJenis, v = x.A.vegetasi;
        if (v && !v.kosong && v.per.length > 1) { const hs = v.per.map((t) => t.H), hi = v.per.reduce((a, b) => (b.H > a.H ? b : a)), lo = v.per.reduce((a, b) => (b.H < a.H ? b : a)); out.push(`Indeks keanekaragaman Shannon-Wiener berkisar ${L.num(Math.min(...hs), 2)} sampai ${L.num(Math.max(...hs), 2)}, tertinggi pada tingkat ${hi.tingkat} dan terendah pada tingkat ${lo.tingkat}.`); }
        if (dp.length) {
          const grup = [["dilindungi menurut P.106/2018", (r) => /^dilindungi/i.test(String(r.p106 || ""))], ["berstatus terancam atau hampir terancam menurut IUCN", (r) => ANCAMAN.has(String(r.iucn || "").trim())], ["terdaftar dalam apendiks CITES", (r) => /apendiks/i.test(String(r.cites || ""))], ["endemik", (r) => /^endemik/i.test(String(r.endemik || ""))], ["memiliki nilai ekonomi atau manfaat bagi masyarakat", (r) => String(r.manfaat || "").trim() || String(r.kategori || "").trim()]];
          const isi = grup.map(([lab, f]) => [lab, dp.filter(f).map(nm)]).filter(([, a]) => a.length);
          out.push(`Pengkategorian tumbuhan penting tidak mengharuskan suatu jenis memenuhi semua kriteria. Dari ${x.nTxt(dp.length)} jenis tumbuhan penting, ${isi.length ? isi.map(([lab, a]) => `${x.daftarKata(a)} ${lab}`).join("; ") : "seluruhnya dinilai penting oleh tim berdasarkan peran ekologisnya"}.`);
        }
        const inv = [...new Set(vegIsi(x.S).filter((r) => K.dikenalInvasif(r)).map(nm))];
        if (inv.length) out.push(`Di petak contoh juga ditemukan jenis asing invasif, yaitu ${x.daftarKata(inv)}. Keberadaan jenis tersebut memerlukan pembinaan habitat agar sebarannya tidak meluas dan mendesak jenis asli.`);
        return out;
      },
      saran: () => ["Inventarisasi tumbuhan penting perlu diperluas ke lokasi lain selain jalur pendakian", "Jenis tumbuhan penting, terutama yang dilindungi, terancam, atau endemik, perlu dipantau populasinya secara berkala dan dilindungi habitatnya", "Perlu perlindungan kawasan dari kebakaran hutan dan pembinaan habitat pada areal yang didominasi jenis asing invasif", "Perlu pembuatan herbarium dan koleksi foto rujukan untuk membantu identifikasi jenis", K.SARAN_UMUM.smart],
      simpulanAwal: (x) => { const pk = petakIsi(x.S); return pk.length ? `Inventarisasi dilakukan pada ${x.nTxt(pk.length)} petak contoh di ${x.lokasi}` : ""; }
    }
  });
})();
