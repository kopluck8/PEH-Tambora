/*
 * Kegiatan: Identifikasi dan Inventarisasi Jenis Burung (kombinasi titik hitung dan transek jalur).
 * Acuan: LPK burung Resor Doro Ncanga, Oi Katupa, Doropeti, Piong, dan Pancasila tahun 2023.
 * Data SMART: kategori metodeteknis.inventarisasiburung. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const AKT = ["Terbang", "Bertengger", "Makan", "Berkicau", "Soaring", "Bersarang", "Istirahat", "Mandi"];
  const HABITAT = ["Hutan hujan", "Hutan musim", "Savana", "Semak belukar", "Kebun/ladang masyarakat", "Hutan pegunungan", "Tepi sungai"];
  const KAMUS = K.kamus("Aves");
  const nPlotOf = (S, P) => Number(P.nPlot) || K.unik(S.data.plot, "kode").length || K.unik(S.data.perjumpaan, "plot").length;
  const bentukTxt = (P) => (P.bentuk === "lingkaran" ? `lingkaran berjari-jari ${L.num(Number(P.ukuran) || 0)} m` : `bujur sangkar bersisi ${L.num(Number(P.ukuran) || 0)} m`);

  window.PEH.kegiatan({
    id: "burung", kode: "BURUNG",
    judul: "Identifikasi dan Inventarisasi Jenis Burung",
    kelompok: "Satwa",
    ringkas: "Titik hitung dan transek jalur. Kepadatan populasi, keanekaragaman Shannon-Wiener, kemerataan, kekayaan jenis, dominansi, pendugaan kekayaan jenis, dan aktivitas burung.",
    objek: "burung", objekPeta: "plot pengamatan dan titik perjumpaan burung",
    kategoriSMART: "metodeteknis.inventarisasiburung.",
    contoh: (window.PEH_CONTOH || {}).burung,
    alat: [{ nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "2", satuan: "unit" }, { nama: "Kamera dengan lensa tele", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Buku panduan lapangan burung Wallacea", jumlah: "1", satuan: "buah" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }, { nama: "Peta kerja", jumlah: "1", satuan: "lembar" }],
    tabel: [
      { key: "plot", judul: "Plot Pengamatan", ket: "Satu baris untuk satu plot atau titik hitung, termasuk plot tanpa perjumpaan.",
        kolom: [{ key: "kode", label: "Kode plot", w: 5, tengah: true }, KOL.tanggal, KOL.x, KOL.y, KOL.ketinggian, { key: "habitat", label: "Tipe habitat", list: HABITAT, w: 8 }, KOL.keterangan],
        smart: { sub: "titikpengamatan", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), ketinggian: v("ketinggianmdpl"), habitat: v("tipetutupanlahan"), keterangan: v("keterangan") }) } },
      { key: "perjumpaan", judul: "Perjumpaan Burung", ket: "Satu baris untuk satu jenis pada satu perjumpaan. Ketik nama jenis untuk memilih dari daftar burung TN Tambora; nama ilmiah terisi otomatis.",
        kolom: [KOL.tanggal, KOL.waktu, { ...KOL.plot, label: "Plot/titik" }, ...K.kolJenis("Nama jenis burung", KAMUS), { ...KOL.jumlah, label: "Jumlah individu" }, { key: "jarak", label: "Jarak (m)", type: "number", w: 4 }, { key: "azimuth", label: "Azimuth (°)", type: "number", w: 4 }, { key: "aktivitas", label: "Aktivitas", list: AKT, w: 7 }, KOL.keterangan],
        smart: { sub: "perjumpaanburung", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenissatwa"); return { ...K.dasarObs(o), plot: String(v("noplot") || ""), jenis, latin, n: Number(v("jumlah")) || 1, jarak: v("jarakkesatwam"), azimuth: v("azimuth"), aktivitas: v("aktivitassatwa"), keterangan: v("keterangan") }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", plot: last.plot || "", n: 1 }) }
    ],
    parameter: [
      { key: "bentuk", label: "Bentuk plot", options: [["persegi", "Bujur sangkar"], ["lingkaran", "Lingkaran"]], half: true, def: "persegi" },
      { key: "ukuran", label: "Sisi/jari-jari plot (m)", type: "number", half: true, def: 500 },
      { key: "nPlot", label: "Jumlah plot (kosong = dari tabel plot)", type: "number", half: true, def: "" },
      { key: "pi", label: "Nilai π", type: "number", step: "any", half: true, def: 3.14 },
      K.paramKriteriaH
    ],
    paramInfo: "LPK burung Balai memakai plot bujur sangkar bersisi 500 m. Perjumpaan yang jaraknya melewati batas plot tidak dihitung dalam kepadatan.",
    modul: [
      { m: "titik", id: "kepadatan", judulMetode: "Kepadatan Populasi",
        input: (S, P) => ({ rows: S.data.perjumpaan.map((r) => ({ ...r, unit: r.plot })), nPlot: nPlotOf(S, P), bentuk: P.bentuk, ukuran: P.ukuran, pi: P.pi }), opt: (P) => ({ bentuk: P.bentuk, pi: P.pi }) },
      { m: "komunitas", id: "keragaman", judul: "Keanekaragaman, Kemerataan, dan Kekayaan Jenis", input: (S) => ({ rows: S.data.perjumpaan }), opt: (P) => ({ kriteriaH: P.kriteriaH, indeks: ["H", "E", "R", "Di"] }) },
      { m: "penduga", id: "penduga", input: (S) => ({ rows: S.data.perjumpaan.map((r) => ({ jenis: r.jenis, latin: r.latin, unit: r.plot || r.tanggal, n: r.n })), units: K.unik(S.data.plot, "kode") }) },
      { m: "persen", id: "aktivitas", judul: "Aktivitas Burung saat Perjumpaan", input: (S) => ({ items: S.data.perjumpaan.filter((r) => String(r.aktivitas || "").trim()).map((r) => [r.aktivitas, 1]) }), opt: { label: "aktivitas" } }
    ],
    lokasiTabel: (S) => ({ cap: "Plot Pengamatan Burung", spec: K.specDari(K.terisi(S.data.plot, "kode", "x"), [{ key: "kode", label: "Kode Plot", tengah: true }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "habitat", label: "Tipe Habitat" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;"],
      latar: (x) => [K.TN,
        "Indonesia dihuni sekitar 1.539 jenis burung atau 17% dari seluruh jenis burung di dunia, dan sekitar 381 jenis di antaranya endemik (Sujatnika dkk., 1995 dalam Supriatna, 2010). Burung berperan sebagai penyerbuk, pemencar biji, dan pengendali serangga, serta peka terhadap perubahan habitat sehingga keberadaannya dapat menjadi petunjuk kondisi ekosistem.",
        `Data jenis, status perlindungan, dan populasi burung diperlukan sebagai dasar pengelolaan keanekaragaman hayati kawasan. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah mengumpulkan data jenis, status perlindungan, dan populasi burung di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Tersedianya data jenis burung di kawasan TN Tambora beserta status perlindungannya;", "2. Tersedianya data demografi burung (jumlah individu, kepadatan, dan sebaran);", "3. Tersedianya data pendukung pengelolaan keanekaragaman hayati, khususnya jenis burung dan habitatnya."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Pengambilan data titik lokasi, waktu perjumpaan, jenis, jumlah individu, jarak dan azimuth, serta aktivitas burung;", "2. Identifikasi jenis dan status perlindungannya;", "3. Analisis kepadatan populasi, keanekaragaman, kemerataan, kekayaan, dan dominansi jenis;", "4. Pendugaan kelengkapan inventarisasi jenis burung."],
      metode: (x) => [`Pengumpulan data menggunakan kombinasi metode titik hitung (point count) dan metode jalur (line transect). Pada metode jalur, pengamat berjalan dan mencatat semua kontak dengan burung di sepanjang jalur yang dilalui (Bibby dkk., 2000). Pada metode titik hitung, pengamat berhenti di titik tertentu lalu mencatat semua burung yang terlihat atau terdengar dalam rentang waktu tertentu (Helvoort, 1981 dalam Christiani, 2014).`,
        `Plot pengamatan berbentuk ${bentukTxt(x.P)}. Pada setiap perjumpaan dicatat waktu, jenis, jumlah individu, jarak dan azimuth dari pengamat, aktivitas, serta koordinat lokasi. Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Inventarisasi Burung atau pada tally sheet.`],
      lokasi: (x) => { const hab = K.unik(x.D.plot, "habitat"), alt = K.rentang(x.D.plot.map((r) => r.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${hab.length ? ` Lokasi pengamatan mencakup tipe habitat ${x.daftarKata(hab.map((h) => h.toLowerCase()))}` : ""}${alt ? `${hab.length ? "," : " Lokasi pengamatan berada"} pada ketinggian ${alt} mdpl` : ""}${hab.length || alt ? "." : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Plot pengamatan ditempatkan pada tipe habitat burung yang mewakili wilayah tersebut, di sepanjang jalur pengamatan.`,
      hasilLokasi: (x) => { const n = nPlotOf(x.S, x.P); return n ? `Pengamatan dilakukan pada ${x.nTxt(n)} plot berbentuk ${bentukTxt(x.P)} di ${x.lokasi}.` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const k = x.A.keragaman, p = x.A.penduga, out = [];
        if (!k || k.kosong) return "";
        out.push(`Nilai keanekaragaman jenis burung tergolong ${k.kritH.toLowerCase()} (H′ = ${L.num(k.H, 2)}). Keanekaragaman berhubungan dengan banyaknya jenis penyusun komunitas dan kemerataan jumlah individunya; komunitas yang tersusun oleh banyak jenis dengan kelimpahan yang hampir sama memiliki keanekaragaman tinggi (Soegianto, 1994).`);
        const d = K.dilindungi(x.D.perjumpaan);
        if (d.length) out.push(`Sebanyak ${x.nTxt(d.length)} jenis yang dijumpai termasuk satwa dilindungi menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018, yaitu ${x.daftarKata(d)}.`);
        if (p && !p.kosong) out.push(p.lengkap < 80 ? `Kelengkapan inventarisasi sekitar ${L.num(p.lengkap, 0)}%, sehingga masih ada jenis yang belum tercatat; pengamatan lanjutan pada musim dan lokasi lain akan menambah daftar jenis.` : `Kelengkapan inventarisasi sekitar ${L.num(p.lengkap, 0)}%, sehingga sebagian besar jenis burung di lokasi pengamatan diduga sudah tercatat.`);
        return out;
      },
      saran: () => ["Perlu pengamatan yang lebih intensif dan eksplorasi yang lebih teliti terhadap jenis-jenis yang dijumpai, termasuk pada musim yang berbeda", K.SARAN_UMUM.alat, K.SARAN_UMUM.kapasitas,
        "Perlu peningkatan kondusivitas kawasan melalui pengamanan dari segala bentuk gangguan dan penyadartahuan masyarakat yang beraktivitas di sekitar kawasan", "Data jenis burung, terutama jenis yang dilindungi, perlu dihimpun dan dipublikasikan kepada masyarakat"],
      simpulanAwal: (x) => { const n = nPlotOf(x.S, x.P); return `Pengumpulan data menggunakan kombinasi metode titik hitung dan transek jalur${n ? ` pada ${x.nTxt(n)} plot pengamatan` : ""}`; }
    }
  });
})();
