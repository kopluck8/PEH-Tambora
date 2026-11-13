/*
 * Kegiatan: Identifikasi dan Kajian Lokasi Pelepasliaran Satwa (burung).
 * Acuan: LPK identifikasi dan kajian lokasi pelepasliaran satwa SPTN Wilayah I Kore dan SPTN Wilayah II Pekat (2024).
 * Data SMART: kategori metodeteknis.kajianpelepasliaran. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const GUILD = ["Pemakan buah", "Pemakan biji", "Pemakan biji dan buah", "Pemakan serangga", "Pemakan buah dan serangga", "Pemakan nektar", "Pemakan daging (raptor)", "Pemakan ikan", "Pemakan campuran"];
  const AKT = ["Bertengger", "Mencari makan", "Terbang", "Membuat sarang", "Bersosialisasi", "Berkicau", "Istirahat"];
  const HABITAT = ["Terestrial", "Akuatik", "Terestrial dan akuatik"];
  const FAKTOR = ["Ekologi", "Ekonomi", "Kelembagaan"];
  const AVES = K.kamus("Aves"), FLORA = K.kamus("Flora");
  // Kriteria dan parameter fungsi pohon sebagai penarik burung (Handayani, 2015); urutan pilihan = skor 1, 2, 3
  const FP = [
    { k: "K1", label: "Bunga dan nektar", par: [["nektar", "Nektar", ["Sedikit", "Sedang", "Banyak"]], ["mahkota", "Mahkota bunga", ["Kecil", "Sedang", "Besar"]], ["ukBunga", "Ukuran bunga", ["Kecil", "Sedang", "Besar"]]] },
    { k: "K2a", label: "Buah berdaging", par: [["luarBuah", "Lapisan luar buah berdaging", ["Tebal", "Sedang", "Tipis"]], ["dagingBuah", "Lapisan buah berdaging", ["Keras", "Sedang", "Lunak"]], ["ukBuah", "Ukuran buah berdaging", ["Besar", "Sedang", "Kecil"]]] },
    { k: "K2b", label: "Buah kering atau biji", par: [["kulitBiji", "Lapisan kulit buah kering", ["Tebal", "Sedang", "Tipis"]], ["ukBiji", "Ukuran biji", ["Besar", "Sedang", "Kecil"]], ["lokBiji", "Lokasi biji", ["Dalam", "Tengah", "Luar"]]] },
    { k: "K3", label: "Arsitektur pohon", par: [["tajuk", "Bentuk tajuk", ["Kolumnar, fastigiate, atau bulat", "Piramidal", "Menjuntai atau picturesque"]], ["cabang", "Bentuk percabangan", ["Horizontal", "Vertikal", "Berliku atau menjuntai"]], ["ukDaun", "Ukuran daun", ["Besar", "Sedang", "Kecil"]]] }
  ];
  const skorPar = (opts, v) => { const i = opts.indexOf(String(v || "").trim()); return i < 0 ? null : i + 1; };
  // Skor kriteria = rata-rata skor parameternya; kosong bila tidak ada parameter yang diisi
  const skorKriteria = (r, g) => { const v = g.par.map(([key, , o]) => skorPar(o, r[key])).filter((x) => x !== null); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0; };
  const nilaiPohon = (r) => { const [k1, k2a, k2b, k3] = FP.map((g) => skorKriteria(r, g)); return [k1, Math.max(k2a, k2b), k3]; };
  const lokasiIsi = (S) => K.terisi(S.data.lokasi, "kode", "nama");
  const namaLokasi = (S, kode) => { const l = (S.data.lokasi || []).find((x) => String(x.kode || "").trim() === String(kode || "").trim()); return (l && String(l.nama || "").trim()) || String(kode || "").trim(); };
  const burungIsi = (S) => K.terisi(S.data.burung, "jenis", "latin");
  // "Terestrial dan akuatik" dipecah menjadi komponennya agar narasi tidak mengulang kata
  const habitatKomponen = (lk) => [...new Set(lk.flatMap((l) => String(l.habitat || "").toLowerCase().split(/\s+dan\s+|,\s*/).map((h) => h.trim()).filter(Boolean)))];
  const habitatPerLokasi = (lk, daftarKata) => {
    const g = new Map();
    lk.forEach((l) => { const h = String(l.habitat || "").trim().toLowerCase(); if (h) { if (!g.has(h)) g.set(h, []); g.get(h).push(l.nama || l.kode); } });
    const grp = [...g.entries()];
    if (!grp.length) return "";
    if (grp.length === 1 && grp[0][1].length > 1 && grp[0][1].length === lk.length) return `Seluruh lokasi pengamatan memiliki tipe habitat ${grp[0][0]}.`;
    return `${grp.map(([h, nama]) => `${daftarKata(nama)} memiliki tipe habitat ${h}`).join(grp.length === 2 ? ", sedangkan " : "; ")}.`;
  };
  const kunci = (r) => K.kunciJenis(r.latin) || String(r.jenis || "").trim().toLowerCase();
  // Satu baris per jenis burung: atribut dari isian pertama, status dari daftar jenis TN Tambora
  const perJenis = (S) => { const m = new Map(); burungIsi(S).forEach((r) => { const k = kunci(r); if (!m.has(k)) m.set(k, { ...r, n: 0, lok: new Set() }); const o = m.get(k); o.n += Number(r.n) || 1; if (!o.guild && r.guild) o.guild = r.guild; if (r.lokasi) o.lok.add(namaLokasi(S, r.lokasi)); }); return [...m.values()]; };

  window.PEH.kegiatan({
    id: "pelepasliaran", kode: "LEPAS",
    judul: "Identifikasi dan Kajian Lokasi Pelepasliaran Satwa",
    ringkas: "Transek garis dan daftar MacKinnon untuk burung, penilaian fungsi pohon sebagai penarik burung (Handayani, 2015), komposisi guild, kelimpahan relatif, dan skoring kesesuaian lokasi pelepasliaran.",
    objek: "burung", objekPeta: "lokasi pengamatan dan calon lokasi pelepasliaran",
    kategoriSMART: "metodeteknis.kajianpelepasliaran.",
    contoh: (window.PEH_CONTOH || {}).pelepasliaran,
    alat: [{ nama: "Peta kerja elektronik (Avenza Maps) dan GPS", jumlah: "1", satuan: "set" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Kamera DSLR dan kamera saku", jumlah: "1", satuan: "set" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Meteran, pita meter, tali, dan parang", jumlah: "1", satuan: "set" }, { nama: "Buku panduan lapangan burung Wallacea", jumlah: "1", satuan: "buah" }, { nama: "Tally sheet identifikasi burung dan vegetasi, alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "lokasi", judul: "Lokasi Pengamatan", ket: "Satu baris untuk satu titik atau calon lokasi pelepasliaran yang diamati.",
        kolom: [{ key: "kode", label: "Kode", w: 4, tengah: true }, { key: "nama", label: "Nama lokasi", w: 10 }, KOL.tanggal, KOL.x, KOL.y, KOL.ketinggian, { key: "ekosistem", label: "Tipe ekosistem", list: K.EKOSISTEM, w: 8 }, { key: "habitat", label: "Tipe habitat", options: HABITAT, w: 7 }, KOL.keterangan],
        smart: { sub: "lokasipengamatan", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), nama: v("lokasi"), ketinggian: v("ketinggianmdpl"), ekosistem: v("tipeekosistem"), habitat: v("tipehabitat"), keterangan: v("keterangan") }) } },
      { key: "burung", judul: "Perjumpaan Burung", ket: "Satu baris untuk satu jenis pada satu perjumpaan. Daftar MacKinnon: nomor daftar tempat jenis dicatat (setiap daftar berisi sejumlah jenis berbeda, lalu daftar baru dimulai).",
        kolom: [KOL.tanggal, KOL.waktu, { key: "lokasi", label: "Lokasi", w: 4, tengah: true }, { key: "daftar", label: "Daftar MacKinnon ke-", type: "number", w: 4 }, ...K.kolJenis("Nama jenis burung", AVES), { ...KOL.jumlah, label: "Jumlah individu" }, { key: "jarak", label: "Jarak (m)", type: "number", w: 4 }, { key: "guild", label: "Guild pakan", list: GUILD, w: 8 }, { key: "aktivitas", label: "Aktivitas", list: AKT, w: 7 }, KOL.keterangan],
        smart: { sub: "perjumpaanburung", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenissatwa"); return { ...K.dasarObs(o), lokasi: String(v("noplot") || ""), daftar: v("daftarmackinnon"), jenis, latin, n: Number(v("jumlah")) || 1, jarak: v("jarakkesatwam"), guild: v("guildburung"), aktivitas: v("aktivitassatwa"), keterangan: v("keterangan") }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", lokasi: last.lokasi || "", daftar: last.daftar || "", n: 1 }) },
      { key: "pohon", judul: "Penilaian Fungsi Pohon sebagai Penarik Burung", ket: "Satu baris untuk satu jenis pohon penghasil pakan. Isi parameter bunga, salah satu kelompok buah (berdaging atau kering), dan arsitektur pohon; parameter yang tidak ada dikosongkan.",
        kolom: [{ key: "lokasi", label: "Lokasi", w: 4, tengah: true }, ...K.kolJenis("Nama jenis pohon", FLORA), ...FP.flatMap((g) => g.par.map(([key, label, o]) => ({ key, label, options: o, w: 6 }))), KOL.keterangan],
        smart: { sub: "fungsipohon", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); return { lokasi: String(v("noplot") || ""), jenis, latin, nektar: v("nektarbunga"), mahkota: v("mahkotabunga"), ukBunga: v("ukuranbunga"), luarBuah: v("lapisanluarbuah"), dagingBuah: v("lapisanbuah"), ukBuah: v("ukuranbuah"), kulitBiji: v("lapisankulitbiji"), ukBiji: v("ukuranbiji"), lokBiji: v("lokasibiji"), tajuk: v("bentuktajuk"), cabang: v("bentukpercabangan"), ukDaun: v("ukurandaun"), keterangan: v("keterangan") }; } } },
      { key: "skorLokasi", judul: "Skoring Kesesuaian Lokasi (opsional)", ket: "Satu baris untuk satu kriteria pada satu lokasi. Kriteria dikelompokkan dalam faktor ekologi, ekonomi, dan kelembagaan; nilai lokasi adalah rata-rata skor seluruh kriterianya.",
        kolom: [{ key: "lokasi", label: "Lokasi", w: 8 }, { key: "faktor", label: "Faktor", options: FAKTOR, w: 6 }, { key: "kriteria", label: "Kriteria", w: 14 }, { key: "skor", label: "Skor", type: "number", w: 4 }, KOL.keterangan],
        tanpaTally: true }
    ],
    parameter: [
      { key: "ukuranDaftar", label: "Jumlah jenis per daftar MacKinnon", type: "number", half: true, def: 10 },
      { ...K.paramKriteriaH, half: true }
    ],
    paramInfo: "Skor kriteria fungsi pohon adalah rata-rata skor parameternya (1 sampai 3). Kriteria buah memakai buah berdaging atau buah kering, mana yang lebih tinggi. Skor total tiga kriteria (maksimal 9) dibandingkan dengan skor maksimal, lalu dikelompokkan menurut Handayani (2015).",
    modul: [
      { m: "daftar", id: "jenis", judul: "Keanekaragaman Jenis Burung",
        input: (S) => ({ rows: perJenis(S).map((r) => { const t = K.taksa.cari(r.latin) || K.taksa.cari(r.jenis) || {}; return { jenis: r.jenis, latin: r.latin, famili: t.famili || "", n: r.n, unit: [...r.lok].join(", "), iucn: t.iucn || "", p106: t.p106 || "Tidak dilindungi", cites: t.cites || "", guild: r.guild || "" }; }) }),
        opt: { kolom: [{ key: "iucn", label: "IUCN" }, { key: "p106", label: "P.106/2018" }, { key: "guild", label: "Guild" }] },
        // Satu butir simpulan untuk jumlah jenis, keanekaragaman, dan jenis dilindungi (modul kelimpahan tidak menambah butir sendiri)
        simpulan: (r, c, x) => { const kl = x.A.kelimpahan, lind = r.baris.filter((b) => /^dilindungi$/i.test(b.p106)); return `Teridentifikasi ${x.nTxt(r.S)} jenis burung dari ${r.famili.length} famili dengan jumlah ${L.num(r.N)} individu${kl && !kl.kosong ? `; keanekaragaman jenisnya tergolong ${kl.kritH.toLowerCase()} (H′ = ${L.num(kl.H, 2)})` : ""}${lind.length ? `; ${x.nTxt(lind.length)} jenis di antaranya dilindungi menurut Permen LHK Nomor P.106/2018, yaitu ${x.daftarKata(lind.map((b) => K.namaJenis(b)))}` : ""}`; } },
      { m: "komunitas", id: "kelimpahan", judul: "Kelimpahan Relatif dan Keanekaragaman Burung", input: (S) => ({ rows: burungIsi(S) }), opt: (P) => ({ kriteriaH: P.kriteriaH, indeks: ["H", "Di"] }), simpulan: false },
      { m: "persen", id: "guild", judul: "Komposisi Guild Burung", input: (S) => ({ items: perJenis(S).filter((r) => String(r.guild || "").trim()).map((r) => [r.guild, 1]) }), opt: { label: "guild", satuan: "jenis", cap: "Komposisi Guild Jenis Burung" },
        simpulan: (r, c, x) => { const atas = r.rows.filter((g) => g.x === r.rows[0].x); return `Guild dengan jumlah jenis terbanyak adalah ${x.daftarKata(atas.map((g) => g.k.toLowerCase()))} (${atas.length > 1 ? "masing-masing " : ""}${L.num(atas[0].x)} jenis atau ${L.num(atas[0].p, 1)}%)`; } },
      { m: "penduga", id: "penduga", opsional: true, judul: "Pendugaan Kekayaan Jenis dari Daftar MacKinnon",
        input: (S) => { const rows = burungIsi(S), adaDaftar = rows.some((r) => String(r.daftar || "").trim()); return { rows: rows.map((r) => ({ jenis: r.jenis, latin: r.latin, n: r.n, unit: adaDaftar ? `Daftar ${r.daftar || "-"}` : namaLokasi(S, r.lokasi) || r.tanggal })), units: [] }; } },
      { m: "skor", id: "fungsipohon", judul: "Fungsi Pohon sebagai Penarik Burung", objek: "jenis pohon",
        input: (S) => ({ rows: K.terisi(S.data.pohon, "jenis", "latin").map((r) => ({ nama: r.jenis || r.latin, latin: r.latin, nilai: nilaiPohon(r) })) }),
        opt: { kriteria: [{ label: "K1 Bunga dan nektar", maks: 3 }, { label: "K2 Buah", maks: 3 }, { label: "K3 Arsitektur pohon", maks: 3 }], kelas: [[81, "Sangat baik"], [61, "Baik"], [41, "Kurang baik"], [0, "Buruk"]], acuan: "Handayani, 2015", latin: true, labelNama: "Nama jenis", desimal: 2, satuan: "jenis", kataKelas: "berfungsi", cap: "Penilaian Fungsi Pohon sebagai Penarik Burung",
          narMetode: "Fungsi pohon sebagai sumber pakan, tempat berlindung, dan tempat bersarang burung dinilai dengan kriteria dan parameter menurut Handayani (2015). Setiap parameter diberi skor 1 sampai 3: bunga dan nektar (banyaknya nektar, ukuran mahkota, dan ukuran bunga), buah berdaging (lapisan luar, kekerasan lapisan buah, dan ukuran buah), buah kering atau biji (lapisan kulit, ukuran biji, dan letak biji), serta arsitektur pohon (bentuk tajuk, bentuk percabangan, dan ukuran daun).",
          metodeTambahan: "Skor setiap kriteria adalah rata-rata skor parameternya. Kriteria buah memakai buah berdaging atau buah kering sesuai jenis buahnya, sehingga skor maksimal tiga kriteria adalah 9. Skor akhir dinyatakan dalam persentase skor aktual terhadap skor maksimal." } },
      { m: "kesesuaian", id: "kesesuaian", opsional: true, judul: "Kesesuaian Lokasi Pelepasliaran", objek: "lokasi pelepasliaran",
        input: (S) => ({ rows: K.terisi(S.data.skorLokasi, "lokasi").map((r) => ({ lokasi: namaLokasi(S, r.lokasi), faktor: r.faktor, kriteria: r.kriteria, skor: r.skor })) }), opt: { faktor: ["ekologi", "ekonomi", "kelembagaan"], cap: "Nilai Skoring Kesesuaian Lokasi Pelepasliaran" } }
    ],
    lokasiTabel: (S) => ({ cap: "Lokasi Pengamatan", spec: K.specDari(lokasiIsi(S), [{ key: "kode", label: "Kode", tengah: true }, { key: "nama", label: "Nama Lokasi" }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "ekosistem", label: "Tipe Ekosistem" }, { key: "habitat", label: "Tipe Habitat" }]) }),
    teks: {
      dasar: ["Peraturan Pemerintah Nomor 7 Tahun 1999 tentang Pengawetan Jenis Tumbuhan dan Satwa;", "Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;", "Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor 17 Tahun 2024 tentang Penyelamatan Jenis Satwa;"],
      latar: (x) => [K.TN,
        "Pelepasliaran satwa merupakan salah satu tahap program konservasi untuk mengembalikan satwa hasil rehabilitasi atau penyelamatan ke habitat alaminya. Keberhasilan satwa beradaptasi di lingkungan baru bergantung pada ketersediaan pakan, keberadaan predator, kondisi habitat, dan rendahnya gangguan manusia. Karena itu, sebelum pelepasliaran perlu dilakukan identifikasi dan kajian untuk memastikan lokasinya memenuhi syarat ekologis bagi satwa yang akan dilepaskan.",
        `Ekosistem TN Tambora yang beragam, meliputi hutan hujan tropis, savana, dan daerah aliran sungai, menjadi habitat berbagai jenis burung dan satwa liar lain, dan vegetasinya menyediakan pakan alami. Untuk mengidentifikasi area yang paling sesuai bagi pelepasliaran, khususnya burung, dilaksanakan kegiatan ${x.judul} di ${x.wil}. Kajian mencakup keanekaragaman burung, potensi sumber pakan, dan karakteristik vegetasi yang mendukung kehidupan satwa setelah dilepasliarkan.`],
      maksud: (x) => [`Maksud kegiatan ini adalah menentukan lokasi yang tepat bagi pelepasliaran satwa, khususnya burung, berdasarkan kondisi ekologis, keanekaragaman hayati, dan potensi sumber daya di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Mengidentifikasi keanekaragaman jenis burung di titik pengamatan untuk mengetahui potensi habitat dan kelimpahannya;", "2. Menganalisis potensi pakan alami (buah, biji, nektar, dan serangga) yang mendukung kelangsungan hidup burung setelah dilepasliarkan;", "3. Menilai kesesuaian vegetasi dan tipe habitat di lokasi pengamatan;", "4. Menganalisis fungsi pohon sebagai penarik burung berdasarkan bunga, nektar, buah, dan arsitektur pohonnya;", "5. Memberikan rekomendasi lokasi pelepasliaran terbaik berdasarkan hasil kajian."],
      ruanglingkup: (x) => ["Ruang lingkup kegiatan ini meliputi:", `1. Penentuan titik pengamatan dan calon lokasi pelepasliaran di ${x.wil};`, "2. Pengambilan data burung, vegetasi pohon penghasil pakan, potensi pakan, dan tipe habitat;", "3. Analisis keanekaragaman dan kelimpahan burung, komposisi guild, fungsi pohon sebagai penarik burung, serta skoring kesesuaian lokasi;", "4. Pelaporan."],
      metode: (x) => [`Data burung dikumpulkan dengan metode transek garis (line transect), yaitu jalur pengamatan tanpa lebar tertentu. Pengamat berjalan di sepanjang jalur, mengamati kedua sisinya, dan mengukur jarak antara burung yang terlihat dan posisi pengamat (Soegianto, 1994). Jenis yang teridentifikasi dicatat dalam daftar MacKinnon: setiap jenis dicatat satu kali pada setiap daftar, satu daftar berisi ${L.num(Number(x.P.ukuranDaftar) || 10)} jenis, dan jenis berikutnya dicatat pada daftar baru. Guild pakan dan aktivitas burung dicatat dari pengamatan langsung.`,
        "Data vegetasi mencakup jenis pohon di lokasi, keberadaan nektar, karakteristik bunga, dan jenis buah (berdaging atau kering) beserta ketebalan lapisan luar, kekerasan kulit buah, dan ukuran bijinya, serta struktur pohon berupa bentuk tajuk, pola percabangan, dan ukuran daun. Potensi pakan dan tipe habitat diidentifikasi langsung di lokasi dengan metode Visual Encounter Survey (VES), yaitu menyusuri jalur atau habitat tertentu sambil mencatat sumber pakan dan satwa yang terlihat.",
        "Kesesuaian lokasi pelepasliaran dinilai dengan skoring terhadap setiap titik pengamatan yang mempertimbangkan faktor ekologi, ekonomi, dan kelembagaan. Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Kajian Lokasi Pelepasliaran Satwa atau pada tally sheet."],
      lokasi: (x) => { const lk = lokasiIsi(x.S).map((l) => l.nama || l.kode), eko = K.unik(x.D.lokasi, "ekosistem"); return `Kegiatan dilaksanakan di ${x.lokasi}.${lk.length ? ` Titik pengamatan meliputi ${x.daftarKata(lk)}.` : ""}${eko.length ? ` Lokasi pengamatan mencakup ekosistem ${x.daftarKata(eko.map((e) => e.toLowerCase()))}.` : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}, pada titik pengamatan yang dipilih sebagai calon lokasi pelepasliaran berdasarkan tipe habitat, ketersediaan pakan, sumber air, dan aksesibilitas pengawasan.`,
      hasilLokasi: (x) => { const lk = lokasiIsi(x.S), hab = habitatPerLokasi(lk, x.daftarKata); return lk.length ? `Pengamatan dilakukan di ${x.nTxt(lk.length)} titik lokasi, yaitu ${x.daftarKata(lk.map((l) => l.nama || l.kode))}.${hab ? ` ${hab}` : ""}` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const out = [], g = x.A.guild, kl = x.A.kelimpahan, fp = x.A.fungsipohon, sl = x.A.kesesuaian;
        if (kl && !kl.kosong && g && !g.kosong) out.push(`Komposisi guild menunjukkan ${g.rows[0].k.toLowerCase()} sebagai kelompok terbanyak (${L.num(g.rows[0].p, 1)}% jenis). Kelimpahan dan komposisi guild mengindikasikan ketersediaan pakan di lokasi pengamatan, karena keberadaan burung sangat dipengaruhi ketersediaan sumber makanan.`);
        if (fp && !fp.kosong) { const baik = fp.baris.filter((b) => /baik/i.test(b.kelas) && !/kurang/i.test(b.kelas)).slice(0, 3); if (baik.length) out.push(`Pohon dengan fungsi baik atau sangat baik sebagai penarik burung, misalnya ${x.daftarKata(baik.map((b) => K.namaJenis({ jenis: b.nama, latin: b.latin })))}, berperan sebagai penyedia pakan berupa buah, biji, dan nektar serta tempat berlindung dan bersarang.`); }
        const komp = habitatKomponen(lokasiIsi(x.S));
        if (komp.length) out.push(`Keanekaragaman burung dipengaruhi oleh keragaman tipe habitat. Lokasi pengamatan mencakup habitat ${x.daftarKata(komp)}, yang dapat mendukung kehidupan burung ${komp.includes("akuatik") ? "terestrial, arboreal, semi-arboreal, dan semi-akuatik" : "terestrial, arboreal, dan semi-arboreal"}.`);
        if (sl && !sl.kosong) out.push(`Lokasi dengan nilai skoring tertinggi adalah ${x.daftarKata(sl.lokasi.slice(0, Math.min(2, sl.lokasi.length)).map((l) => `${l.lokasi} (${L.num(l.nilai, 2)})`))}. Selain faktor ekologi, faktor keamanan dari kehadiran petugas dan ancaman perburuan menjadi pertimbangan penting dalam memilih lokasi pelepasliaran.`);
        return out;
      },
      saran: (x) => { const sl = x.A.kesesuaian; return [sl && !sl.kosong ? `Pelepasliaran burung direkomendasikan di ${x.daftarKata(sl.lokasi.slice(0, Math.min(2, sl.lokasi.length)).map((l) => l.lokasi))} karena memiliki nilai skoring kesesuaian tertinggi` : "Pelepasliaran burung direkomendasikan di lokasi dengan habitat dan ketersediaan pakan terbaik", "Perlu observasi lanjutan tentang metode habituasi burung sebelum dilepasliarkan dan frekuensi temuan satwa liar di luar kawasan", "Kerja sama dengan para pihak dan masyarakat sekitar perlu diperkuat untuk mendukung keberlanjutan pelepasliaran dan pengamanan lokasi", K.SARAN_UMUM.smart]; },
      simpulanAwal: (x) => { const lk = lokasiIsi(x.S); return lk.length ? `Kajian dilakukan di ${x.nTxt(lk.length)} titik lokasi pengamatan di ${x.lokasi}` : ""; }
    }
  });
})();
