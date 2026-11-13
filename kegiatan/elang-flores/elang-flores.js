/*
 * Kegiatan: Monitoring Satwa Kunci Elang Flores (Nisaetus floris).
 * Acuan: LPK monitoring elang flores Resor Oi Katupa, Doropeti, Doro Ncanga, Pancasila, dan Kawinda Toi tahun 2021 sampai 2026.
 * Data SMART: kategori metodeteknis.monitoringelangflores. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  // Label aktivitas mengikuti pilihan atribut aktivitasraptor di Data Model
  const AKT = ["Terbang", "Soaring (terbang mengapung)", "Bertengger", "Makan", "Bersuara", "Bersarang", "Membawa material sarang", "Kawin", "Diserang/menyerang burung lain"];
  const HABITAT = ["Hutan hujan", "Hutan musim", "Hutan sub pegunungan", "Hutan pegunungan", "Savana", "Semak belukar", "Tepi sungai", "Kebun/ladang masyarakat"];
  const KONDISI = ["Aktif (ada telur/anakan/induk)", "Aktif (material baru)", "Tidak aktif", "Rusak/jatuh"];
  const AVES = K.kamus("Aves"), FLORA = K.kamus("Flora");
  const target = (S) => S.param.target || "Elang flores";
  const temuan = (S) => S.data.perjumpaan.filter((r) => K.sasaran(r, target(S)));
  const plotKoord = (S) => new Map(S.data.plot.filter((p) => String(p.kode || "").trim()).map((p) => [String(p.kode).trim(), p]));
  const nPlotOf = (S, P) => Number(P.nPlot) || K.unik(S.data.plot, "kode").length || K.unik(S.data.perjumpaan, "plot").length;
  const objek = (S) => { const t = K.taksa.cari(target(S)); return (t && t.nama ? t.nama : target(S)).toLowerCase(); };
  const radiusTxt = (P) => `${L.num(Number(P.ukuran) || 0)} m`;
  // Koordinat titik perjumpaan untuk wilayah jelajah
  function titikJelajah(S, P) {
    const pk = plotKoord(S);
    return temuan(S).map((r) => {
      const p = pk.get(String(r.plot || "").trim()) || {};
      const x = r.x !== "" && r.x !== undefined ? r.x : p.x, y = r.y !== "" && r.y !== undefined ? r.y : p.y;
      const pos = P.titikMCP === "satwa" ? K.proyeksi(x, y, r.jarak, r.azimuth, P.sistem) : null;
      return { x: pos ? pos.x : x, y: pos ? pos.y : y, label: [r.plot, r.tanggal && L.tglPanjang(r.tanggal), r.waktu].filter(Boolean).join(", ") };
    });
  }

  window.PEH.kegiatan({
    id: "elang-flores", kode: "ELFLO",
    judul: "Monitoring Satwa Kunci Elang Flores",
    ringkas: "Titik pengamatan (IPA) di sepanjang jalur. Kepadatan populasi, struktur populasi, pola sebaran, wilayah jelajah (MCP), aktivitas, burung lain di habitatnya, pohon sarang, dan vegetasi sekitar sarang.",
    objek: "elang flores", objekPeta: "plot pengamatan, titik perjumpaan elang flores, dan pohon sarang",
    kategoriSMART: "metodeteknis.monitoringelangflores.",
    contoh: (window.PEH_CONTOH || {})["elang-flores"],
    alat: [{ nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "2", satuan: "unit" }, { nama: "Kamera dengan lensa tele", jumlah: "1", satuan: "unit" }, { nama: "Kompas", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Rangefinder", jumlah: "1", satuan: "unit" }, { nama: "Peta kerja", jumlah: "1", satuan: "lembar" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }, { nama: "Perlengkapan lapangan (tenda, matras, sleeping bag)", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "plot", judul: "Plot Pengamatan", ket: "Satu baris untuk satu titik pengamatan (pusat plot lingkaran), termasuk plot tanpa perjumpaan.",
        kolom: [{ key: "kode", label: "Kode plot", w: 5, tengah: true }, KOL.tanggal, KOL.x, KOL.y, KOL.ketinggian, { key: "habitat", label: "Tipe habitat", list: HABITAT, w: 8 }, { key: "jarakSarang", label: "Jarak ke sarang (m)", type: "number", w: 4.5 }, KOL.keterangan],
        smart: { sub: "titikpengamatan", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), ketinggian: v("ketinggianmdpl"), habitat: v("tipetutupanlahan"), jarakSarang: v("jaraksarangm"), keterangan: v("keterangan") }) } },
      { key: "perjumpaan", judul: "Perjumpaan Satwa", ket: "Satu baris untuk satu perjumpaan. Catat elang flores dan burung lain yang dijumpai di plot. X dan Y diisi koordinat titik pengamat (otomatis dari SMART).",
        kolom: [KOL.tanggal, KOL.waktu, KOL.plot, ...K.kolJenis("Nama jenis", AVES), { ...KOL.jumlah, label: "Jumlah individu" }, { key: "dewasa", label: "Dewasa", type: "number", w: 3.5 }, { key: "muda", label: "Remaja", type: "number", w: 3.5 }, { key: "jantan", label: "Jantan", type: "number", w: 3.5 }, { key: "betina", label: "Betina", type: "number", w: 3.5 },
          { key: "jarak", label: "Jarak (m)", type: "number", w: 4 }, { key: "azimuth", label: "Azimuth (°)", type: "number", w: 4 }, { key: "aktivitas", label: "Aktivitas", list: AKT, w: 8 }, { key: "ruang", label: "Penggunaan ruang", options: ["Top", "Middle", "Low"], w: 5 }, { key: "tipeRuang", label: "Tipe ruang", options: ["Terbuka", "Tertutup"], w: 5 }, KOL.x, KOL.y, KOL.keterangan],
        smart: { sub: "perjumpaansatwa", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenissatwa"); const d = Number(v("jumlahdewasa")) || 0, a = Number(v("jumlahanakan")) || 0; return { ...K.dasarObs(o), plot: String(v("noplot") || ""), jenis, latin, n: Number(v("jumlah")) || d + a || 1, dewasa: v("jumlahdewasa"), muda: v("jumlahanakan"), jantan: v("jumlahjantan"), betina: v("jumlahbetina"), jarak: v("jarakkesatwam"), azimuth: v("azimuth"), aktivitas: v("aktivitasraptor"), ruang: v("stratatajuk"), tipeRuang: v("tiperuang"), keterangan: v("keterangan") }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", plot: last.plot || "", x: last.x ?? "", y: last.y ?? "", n: 1 }) },
      { key: "sarang", judul: "Pohon Sarang", ket: "Satu baris untuk satu pohon sarang yang diperiksa.",
        kolom: [{ key: "kode", label: "Kode sarang", w: 5, tengah: true }, KOL.tanggal, KOL.x, KOL.y, ...K.kolJenis("Jenis pohon sarang", FLORA), { key: "tinggiPohon", label: "Tinggi pohon (m)", type: "number", w: 4 }, { key: "tinggiSarang", label: "Tinggi sarang (m)", type: "number", w: 4 }, KOL.diameter, { key: "kondisi", label: "Kondisi sarang", list: KONDISI, w: 9 }, { key: "jarakAir", label: "Jarak ke sumber air (m)", type: "number", w: 4.5 }, KOL.keterangan],
        smart: { sub: "pohonsarang", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); return { ...K.dasarObs(o), kode: v("kodesarang") || o.wpId || "", jenis, latin, tinggiPohon: v("tinggipohonm"), tinggiSarang: v("tinggisarangm"), diameter: v("dbhpohoncm"), kondisi: v("kondisisarang"), jarakAir: v("jaraksumberairm"), keterangan: v("keterangan") }; } } },
      { key: "vegetasi", judul: "Vegetasi Sekitar Sarang", ket: "Analisis vegetasi pada petak bersarang di sekitar pohon sarang. Satu baris untuk satu individu (atau isi jumlah untuk semai dan pancang).",
        kolom: K.kolVegetasi([KOL.tinggi]), smart: { sub: "vegetasi", map: (o, v) => K.petaVegetasi(o, v) },
        baruBaris: (last) => ({ petak: last.petak || "", tingkat: last.tingkat || "", n: 1 }) }
    ],
    parameter: [
      { key: "target", label: "Jenis sasaran (nama atau nama ilmiah)", def: "Elang flores" },
      { key: "hitungN", label: "Jumlah individu untuk kepadatan", options: [["maks", "Maksimum individu per plot (perjumpaan berulang tidak dijumlahkan)"], ["jumlah", "Jumlah seluruh catatan perjumpaan"]], def: "maks" },
      { key: "ukuran", label: "Jari-jari plot (m)", type: "number", half: true, def: 500 },
      { key: "nPlot", label: "Jumlah plot (kosong = dari tabel plot)", type: "number", half: true, def: "" },
      { key: "pi", label: "Nilai π", type: "number", step: "any", half: true, def: 3.14 },
      { ...K.paramMetodeID, def: "unit" }, K.paramKriteriaH, K.paramSistem,
      { key: "titikMCP", label: "Titik wilayah jelajah", options: [["pengamat", "Koordinat titik pengamat (seperti LPK Balai)"], ["satwa", "Posisi satwa dari jarak dan azimuth"]], def: "pengamat" },
      { key: "luasHabitat", label: "Luas habitat sesuai (km², opsional)", type: "number", step: "any", half: true, def: "" },
      { key: "jelajahPasangan", label: "Jelajah satu pasangan (km²)", type: "number", step: "any", half: true, def: 38.5 },
      ...K.paramVegetasi()
    ],
    paramInfo: "Plot lingkaran berjari-jari 500 m (78,5 ha per plot) dengan jarak antartitik 1.000 m mengikuti LPK Balai. Perjumpaan berulang pada individu yang sama di satu plot dihitung sekali (nilai maksimum).",
    modul: [
      { m: "titik", id: "kepadatan", judulMetode: "Kepadatan Populasi", objek: "elang flores",
        input: (S, P) => { const t = temuan(S).map((r) => ({ ...r, unit: r.plot })); return { rows: P.hitungN === "jumlah" ? t : K.maksPerUnit(t.filter((r) => !(Number(r.jarak) > Number(P.ukuran))), "unit"), nPlot: nPlotOf(S, P), bentuk: "lingkaran", ukuran: P.ukuran, pi: P.pi }; },
        opt: (P) => ({ bentuk: "lingkaran", pi: P.pi }) },
      { m: "struktur", id: "struktur", objek: "elang flores", input: (S) => ({ rows: K.maksPerUnit(temuan(S), "plot") }) },
      { m: "dispersi", id: "sebaran", judul: "Pola Sebaran", objek: "elang flores",
        input: (S, P) => { const t = temuan(S).map((r) => ({ ...r, unit: r.plot })); return { rows: P.hitungN === "jumlah" ? t : K.maksPerUnit(t, "unit"), units: K.unik(S.data.plot, "kode"), nUnit: Number(P.nPlot) || 0 }; },
        opt: (P) => ({ metodeID: P.metodeID, unitLabel: "plot" }) },
      { m: "mcp", id: "jelajah", objek: "elang flores", input: (S, P) => ({ titik: titikJelajah(S, P), sistem: P.sistem, luasHabitat: P.luasHabitat, jelajahPasangan: P.jelajahPasangan }),
        opt: (P) => ({ pasangan: !!Number(P.luasHabitat), acuanJelajah: "Raharjaningtrah dan Zaini (2004): sekitar 38,5 km²" }) },
      { m: "persen", id: "aktivitas", judul: "Aktivitas Elang Flores saat Perjumpaan", objek: "elang flores", input: (S) => ({ items: temuan(S).filter((r) => String(r.aktivitas || "").trim()).map((r) => [r.aktivitas, 1]) }), opt: { label: "aktivitas" } },
      { m: "komunitas", id: "burung", opsional: true, judul: "Keanekaragaman Jenis Burung di Habitat Elang Flores", objek: "burung",
        input: (S) => ({ rows: K.unik(S.data.perjumpaan, "jenis").length > 1 ? S.data.perjumpaan : [] }), opt: (P) => ({ kriteriaH: P.kriteriaH, indeks: ["H", "E", "R", "Di"] }) },
      { m: "sarang", id: "sarang", opsional: true, objek: "elang flores", input: (S) => ({ rows: S.data.sarang.map((r) => ({ ...r, jumlahSarang: 1 })) }) },
      { m: "vegetasi", id: "vegetasi", opsional: true, judul: "Vegetasi Sekitar Pohon Sarang", objek: "vegetasi sekitar sarang", input: (S, P) => K.inputVegetasi(S.data.vegetasi, P), opt: (P) => K.optVegetasi(P) }
    ],
    lokasiTabel: (S) => ({ cap: "Plot Pengamatan Elang Flores", spec: K.specDari(K.terisi(S.data.plot, "kode", "x"), [{ key: "kode", label: "Kode Plot", tengah: true }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "habitat", label: "Tipe Habitat" }, { key: "jarakSarang", label: "Jarak ke Sarang (m)", type: "number" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;"],
      latar: (x) => ["Elang merupakan burung pemangsa (raptor) yang berada di puncak rantai makanan dan berperan mengendalikan ekosistem, sehingga keberadaannya dapat menjadi petunjuk baik buruknya kondisi ekosistem. Elang flores (Nisaetus floris Hartert, 1898) adalah raptor endemik Kepulauan Sunda Kecil yang hanya hidup di Pulau Flores, Sumbawa, Lombok, dan pulau kecil di sekitarnya. Jenis ini berstatus kritis (Critically Endangered) menurut IUCN, dilindungi menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018, dan termasuk satwa prioritas nasional yang populasinya ditargetkan meningkat.",
        "Wilayah jelajah elang flores diperkirakan sekitar 38,5 km² (Raharjaningtrah dan Zaini, 2004) sampai 40 km² (Gjershaug dkk., 2004), dan populasinya di alam diperkirakan tidak lebih dari 100 pasang. " + K.TN,
        `Pemantauan populasi, sebaran, dan sarang elang flores diperlukan untuk menilai keberhasilan pengelolaan kawasan. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah mengetahui populasi dan perilaku elang flores di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Memperoleh data perjumpaan elang flores;", "2. Memperoleh dugaan kepadatan dan struktur populasi elang flores;", "3. Mengetahui pola sebaran dan wilayah jelajah elang flores;", "4. Mengetahui kondisi pohon sarang dan vegetasi di sekitarnya."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Pengambilan data titik lokasi, waktu perjumpaan, jumlah individu (kelas umur dan jenis kelamin bila teramati), jarak dan azimuth, serta aktivitas elang flores;", "2. Pencatatan jenis burung lain yang dijumpai pada plot pengamatan;", "3. Pemeriksaan pohon sarang dan analisis vegetasi di sekitarnya;", "4. Analisis kepadatan populasi, pola sebaran, dan wilayah jelajah;", "5. Penghimpunan informasi bio-ekologi elang flores dari literatur, petugas, dan masyarakat setempat."],
      metode: (x) => [`Pengumpulan data menggunakan kombinasi metode Index Point Abundance (IPA) dan metode jalur (line transect). Pada metode jalur pengamat terus berjalan dan mencatat semua kontak dengan burung di sepanjang jalur (Robertson dan Liley, 2000; Bibby dkk., 2000). Pada metode IPA pengamat berdiri di titik tertentu dan mencatat semua perjumpaan dalam rentang waktu tertentu (Helvoort, 1981 dalam Christiani, 2014).`,
        `Titik pengamatan diletakkan di sepanjang jalur dengan radius pengamatan ${radiusTxt(x.P)}, sehingga jarak antartitik pengamatan ${L.num((Number(x.P.ukuran) || 0) * 2)} m. Pengamatan di setiap titik dilakukan sekitar 15 menit pada pagi dan sore hari saat raptor aktif. Pada setiap perjumpaan dicatat waktu, koordinat titik pengamat, jumlah individu beserta kelas umur dan jenis kelaminnya, jarak dan azimuth, aktivitas, penggunaan ruang, dan tipe habitat. Pohon sarang yang dijumpai diperiksa kondisinya dan vegetasi di sekitarnya dianalisis dengan petak bersarang.`,
        "Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Monitoring Elang Flores atau pada tally sheet."],
      lokasi: (x) => { const hab = K.unik(x.D.plot, "habitat"), alt = K.rentang(x.D.plot.map((r) => r.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${hab.length ? ` Plot pengamatan berada pada tipe habitat ${x.daftarKata(hab.map((h) => h.toLowerCase()))}` : ""}${alt ? `${hab.length ? "," : " Plot pengamatan berada"} pada ketinggian ${alt} mdpl` : ""}${hab.length || alt ? "." : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Titik pengamatan ditempatkan di sekitar sarang dan lokasi perjumpaan elang flores dari monitoring sebelumnya, di sepanjang jalur pengamatan.`,
      hasilLokasi: (x) => { const n = nPlotOf(x.S, x.P), lu = Math.PI * Math.pow((Number(x.P.ukuran) || 0) / 100, 2); return n ? `Pengamatan dilakukan pada ${x.nTxt(n)} plot lingkaran berjari-jari ${radiusTxt(x.P)} (sekitar ${L.num(lu, 1)} ha per plot) di ${x.lokasi}.` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const t = temuan(x.S), out = [];
        if (!t.length) return `Selama pengamatan tidak dijumpai ${objek(x.S)}. Ketiadaan perjumpaan belum tentu berarti jenis ini tidak ada; elang flores sangat peka terhadap gangguan dan dapat menghindari pengamat, terutama saat cuaca berkabut atau hujan.`;
        const plotT = K.unik(t, "plot");
        out.push(`Elang flores dijumpai pada ${x.nTxt(plotT.length)} dari ${x.nTxt(nPlotOf(x.S, x.P) || plotT.length)} plot pengamatan. Kepadatan populasi berkaitan erat dengan teritori dan wilayah jelajah; sarang merupakan inti teritori sehingga perjumpaan cenderung terkumpul di sekitar pohon sarang.`);
        const s = x.A.sarang;
        if (s && !s.kosong) out.push(`Pohon sarang yang diperiksa berjumlah ${x.nTxt(s.pohon)}. Pemantauan kondisi sarang secara berkala diperlukan untuk memastikan keberhasilan berbiak elang flores.`);
        const j = x.A.jelajah;
        if (j && !j.kosong && j.km2 < 38.5) out.push(`Luas poligon cembung minimum (${L.num(j.km2, 2)} km²) lebih kecil dari perkiraan wilayah jelajah elang flores (38,5 km²), karena titik perjumpaan hanya mewakili lokasi pengamatan selama kegiatan.`);
        return out;
      },
      saran: () => ["Pemantauan sarang perlu dilakukan secara khusus untuk memastikan status sarang (masih dipakai, rusak, atau berpindah ke lokasi lain)", "Durasi pengamatan per plot perlu diperpanjang (30 sampai 60 menit) dan dapat dilengkapi metode playback suara untuk meningkatkan peluang perjumpaan", K.SARAN_UMUM.pengamanan,
        "Informasi pergerakan elang flores dari masyarakat dan petugas yang lama berdomisili di sekitar lokasi perlu dihimpun", K.SARAN_UMUM.berkala],
      simpulanAwal: (x) => { const n = nPlotOf(x.S, x.P); return `Pengumpulan data menggunakan kombinasi metode Index Point Abundance dan metode jalur${n ? ` pada ${x.nTxt(n)} plot pengamatan berjari-jari ${radiusTxt(x.P)}` : ""}`; }
    }
  });
})();
