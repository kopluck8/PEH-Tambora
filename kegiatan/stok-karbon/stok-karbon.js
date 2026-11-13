/*
 * Kegiatan: Pengumpulan Data Penghitungan Stok Karbon (lima pool karbon, SNI 7724:2011).
 * Acuan: LPK stok karbon SPTN Wilayah I Kore (ST.1466) dan SPTN Wilayah II Pekat (ST.1472), September 2025.
 * Data SMART: kategori metodeteknis.stokkarbon. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const TIPE = ["Hutan pamah (dataran rendah)", "Hutan pegunungan bawah", "Hutan pegunungan atas", "Sub-alpin", "Hutan musim", "Savana"];
  const KOMPONEN = ["Serasah", "Nekromas", "Tumbuhan bawah"];
  const KELAS_KM = ["<0.6 cm (10-12 m)", "0.6-2.5 cm (7-10 m)", "2.5-7.5 cm (2-7 m)", ">7.5 cm sound (2-12 m)", ">7.5 cm rotten (2-12 m)"];
  const LAPISAN = ["0-5", "5-10", "10-15", "15-20", "20-25", "25-30"];
  const KAMUS = K.kamus("Flora");
  const kolTr = { ...KOL.transek, key: "transek", label: "Transek", w: 4 };
  const kolPlot = { ...KOL.plot, label: "Plot ID", w: 5 };
  const angka = (key, label, w = 5) => ({ key, label, type: "number", w });
  const hidup = (r) => !/mati/i.test(String(r.hidup || ""));
  // Berat jenis kayu mati (kg/m³) dari berat kering dan volume contoh, bila belum diisi
  const bjKM = (r) => Number(r.bj) || (Number(r.vs) > 0 && Number(r.bks) > 0 ? (Number(r.bks) / Number(r.vs)) * 1000 : 0);
  const jari = (S, P, tk) => { const r = S.data.pohon.find((x) => String(x.tingkat || "").toLowerCase() === tk && Number(x.radius) > 0); return r ? Number(r.radius) : tk === "pancang" ? 2 : Number(P.radius) || 10; };
  const luasLingkaran = (r) => Math.PI * r * r;
  const nPlot = (S) => K.unik(S.data.plot, "plot").length || new Set(S.data.pohon.map((r) => `${r.transek}|${r.plot}`)).size;

  window.PEH.kegiatan({
    id: "stok-karbon", kode: "KARBON",
    judul: "Pengumpulan Data Penghitungan Stok Karbon",
    ringkas: "Plot lingkaran bersarang di sepanjang transek. Cadangan karbon lima pool (atas permukaan, bawah permukaan, serasah/nekromas/tumbuhan bawah, kayu mati, tanah) dan komposisi tegakan.",
    objek: "tegakan", objekPeta: "transek dan plot ukur karbon",
    kategoriSMART: "metodeteknis.stokkarbon.",
    contoh: (window.PEH_CONTOH || {})["stok-karbon"],
    alat: [{ nama: "Soil ring sampler", jumlah: "1", satuan: "set" }, { nama: "Timbangan digital", jumlah: "1", satuan: "unit" }, { nama: "Phi band dan kaliper digital", jumlah: "1", satuan: "set" }, { nama: "Roll meter 50 m dan tali kuadran", jumlah: "1", satuan: "set" }, { nama: "Bingkai serasah 1 m × 1 m", jumlah: "1", satuan: "buah" }, { nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Kantong plastik dan plastik ziplock", jumlah: "1", satuan: "set" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "plot", judul: "Plot Ukur", ket: "Satu baris untuk satu plot lingkaran.",
        kolom: [kolTr, kolPlot, { key: "tipe", label: "Tipe ekosistem", list: TIPE, w: 9 }, { key: "lokasi", label: "Lokasi", w: 7 }, KOL.x, KOL.y, KOL.ketinggian, KOL.keterangan],
        smart: { sub: "plotukur", map: (o, v) => ({ ...K.dasarObs(o), transek: String(v("notransek") || ""), plot: String(v("noplot") || o.wpId || ""), tipe: v("tipeekosistem"), ketinggian: v("ketinggianmdpl"), keterangan: v("keterangan") }) } },
      { key: "pohon", judul: "Tegakan (Pancang, Tiang, Pohon)", ket: "Satu baris untuk satu batang. Pancang diukur pada jari-jari 2 m, tiang dan pohon pada jari-jari 10 m. Tulis Mati pada kolom Kondisi untuk pohon mati berdiri.",
        kolom: [KOL.tanggal, kolTr, kolPlot, { key: "tingkat", label: "Tingkat", options: ["Pancang", "Tiang", "Pohon"], w: 6 }, ...K.kolJenis("Nama jenis", KAMUS), angka("dbh", "DBH (cm)", 4.5), angka("tinggi", "Tinggi (m)", 4), angka("radius", "Jari-jari plot (m)", 4), { key: "hidup", label: "Kondisi", options: ["Hidup", "Mati"], w: 5 }],
        smart: { sub: "tegakan", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); return { tanggal: o.tanggal || "", transek: String(v("notransek") || ""), plot: String(v("noplot") || ""), tingkat: v("tingkatpertumbuhan"), jenis, latin, dbh: v("dbhpohoncm"), tinggi: v("tinggipohonm"), radius: v("jarijariplotm"), hidup: v("kondisipohon") || "Hidup" }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", transek: last.transek || "", plot: last.plot || "", tingkat: last.tingkat || "", radius: last.radius || "", hidup: "Hidup" }) },
      { key: "sntb", judul: "Serasah, Nekromas, dan Tumbuhan Bawah", ket: "Satu baris untuk satu komponen pada bingkai 1 m × 1 m. Berat kering dan %C diisi setelah analisis laboratorium.",
        kolom: [KOL.tanggal, kolTr, kolPlot, { key: "komponen", label: "Komponen", options: KOMPONEN, w: 7 }, { key: "kode", label: "Kode sampel", w: 6 }, angka("bbt", "Berat basah total (g)"), angka("bbs", "Berat basah sampel (g)"), angka("bks", "Berat kering sampel (g)"), angka("persenC", "%C", 4)],
        smart: { sub: "serasah", map: (o, v) => ({ tanggal: o.tanggal || "", transek: String(v("notransek") || ""), plot: String(v("noplot") || ""), komponen: v("komponenserasah"), kode: v("kodesampel"), bbt: v("beratbasahtotalg"), bbs: v("beratbasahsampelg") }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", transek: last.transek || "", plot: last.plot || "" }) },
      { key: "kayuMati", judul: "Kayu Mati (Planar Intersect)", ket: "Satu baris untuk satu potongan kayu mati yang menyentuh garis kuadran. Volume per hektare boleh dikosongkan; aplikasi menghitungnya dari diameter dan panjang transek.",
        kolom: [KOL.tanggal, kolTr, kolPlot, { key: "kuadran", label: "Kuadran", options: ["A", "B", "C", "D"], w: 4 }, { key: "kelas", label: "Kelas diameter", options: KELAS_KM, w: 9 }, { key: "kode", label: "Kode sampel", w: 6 }, angka("diameter", "Diameter (cm)", 4.5), angka("panjang", "Panjang transek (m)", 4.5), angka("vol", "Volume (m³/ha)", 5), angka("vs", "Volume sampel (cm³)"), angka("bks", "Berat kering sampel (g)"), angka("persenC", "%C", 4)],
        smart: { sub: "kayumati", map: (o, v) => ({ tanggal: o.tanggal || "", transek: String(v("notransek") || ""), plot: String(v("noplot") || ""), kuadran: v("kuadran"), kelas: v("kelasdiameter"), kode: v("kodesampel"), diameter: v("diametercm"), panjang: v("panjangtransekm") }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", transek: last.transek || "", plot: last.plot || "", kuadran: last.kuadran || "" }) },
      { key: "tanah", judul: "Contoh Tanah", ket: "Satu baris untuk satu lapisan kedalaman (0-30 cm, enam lapisan).",
        kolom: [KOL.tanggal, kolTr, kolPlot, { key: "lapisan", label: "Lapisan (cm)", options: LAPISAN, w: 5 }, { key: "kode", label: "Kode sampel", w: 6 }, angka("kd", "Kd (cm)", 4), angka("vol", "Volume tanah (cm³)"), angka("bks", "Berat kering sampel (g)"), angka("persenC", "%C", 4)],
        smart: { sub: "contohtanah", map: (o, v) => ({ tanggal: o.tanggal || "", transek: String(v("notransek") || ""), plot: String(v("noplot") || ""), lapisan: v("lapisantanah"), kode: v("kodesampel"), kd: v("kedalamancm"), vol: v("volumetanahcm3") }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", transek: last.transek || "", plot: last.plot || "", vol: last.vol || "" }) }
    ],
    parameter: [
      { key: "agregasi", label: "Cara agregasi", options: [["template", "Seperti LPK ST.1472: jumlah per transek, lalu rerata"], ["rerata", "Per hektare per plot, lalu rerata antarplot"]], def: "template" },
      { key: "bcefTetap", label: "BCEF tetap (kosong = kelas IPCC 2006)", type: "number", step: "any", half: true, def: "" },
      { key: "cf", label: "Fraksi karbon bawaan (%C)", type: "number", step: "any", half: true, def: 0.47 },
      { key: "nap", label: "Nisbah akar pucuk (NAP)", type: "number", step: "any", half: true, def: 1 / 3 },
      { key: "nKuadran", label: "Jumlah kuadran kayu mati", type: "number", half: true, def: 4 },
      { key: "radius", label: "Jari-jari plot tiang/pohon (m)", type: "number", step: "any", half: true, def: 10 },
      { key: "bingkai", label: "Luas bingkai serasah (m²)", type: "number", step: "any", half: true, def: 1 }
    ],
    paramInfo: "Fraksi karbon dan NAP dipakai bila %C laboratorium belum diisi. LPK ST.1472 memakai NAP 1/3, %C 0,47 untuk tegakan, dan BCEF bawaan IPCC menurut kelas volume tegakan.",
    modul: [
      { m: "karbon", id: "karbon", judul: "Cadangan Karbon Lima Pool", judulMetode: "Cadangan Karbon",
        input: (S) => ({ pohon: S.data.pohon, sntb: S.data.sntb, kayuMati: S.data.kayuMati.map((r) => ({ ...r, bj: bjKM(r) })), tanah: S.data.tanah }),
        opt: (P) => ({ agregasi: P.agregasi, bcef: P.bcefTetap === "" || P.bcefTetap === undefined ? "ipcc" : P.bcefTetap, cf: P.cf, nap: P.nap, nKuadran: P.nKuadran, radius: P.radius, bingkai: P.bingkai }) },
      { m: "vegetasi", id: "vegetasi", judul: "Struktur dan Komposisi Tegakan", objek: "tegakan",
        input: (S, P) => ({ mode: "petak", rows: S.data.pohon.filter(hidup).map((r) => ({ petak: `${r.transek}|${r.plot}`, tingkat: r.tingkat, jenis: r.jenis, latin: r.latin, n: 1, diameter: r.dbh })),
          luas: { pancang: luasLingkaran(jari(S, P, "pancang")), tiang: luasLingkaran(jari(S, P, "tiang")), pohon: luasLingkaran(jari(S, P, "pohon")) }, nPetak: nPlot(S) }),
        opt: (P, S) => ({ luas: { semai: 0, pancang: luasLingkaran(jari(S, P, "pancang")), tiang: luasLingkaran(jari(S, P, "tiang")), pohon: luasLingkaran(jari(S, P, "pohon")) },
          ukuranTxt: { semai: "bingkai 1 m × 1 m (diambil sebagai tumbuhan bawah)", pancang: `lingkaran berjari-jari ${L.num(jari(S, P, "pancang"))} m`, tiang: `lingkaran berjari-jari ${L.num(jari(S, P, "tiang"))} m`, pohon: `lingkaran berjari-jari ${L.num(jari(S, P, "pohon"))} m` } }) }
    ],
    judulLokasi: "Lokasi, Transek, dan Plot Ukur",
    lokasiTabel: (S) => ({ cap: "Lokasi Plot Ukur Karbon", spec: K.specDari(K.terisi(S.data.plot, "plot"), [{ key: "transek", label: "Transek", tengah: true }, { key: "plot", label: "Plot ID", tengah: true }, { key: "tipe", label: "Tipe Ekosistem" }, { key: "x", label: "Bujur", type: "number", d: 4 }, { key: "y", label: "Lintang", type: "number", d: 4 }, { key: "ketinggian", label: "Elevasi (mdpl)", type: "number" }]) }),
    teks: {
      dasar: ["Peraturan Presiden Republik Indonesia Nomor 98 Tahun 2021 tentang Penyelenggaraan Nilai Ekonomi Karbon untuk Pencapaian Target Kontribusi yang Ditetapkan secara Nasional dan Pengendalian Emisi Gas Rumah Kaca dalam Pembangunan Nasional;", "Standar Nasional Indonesia (SNI) 7724:2011 tentang Pengukuran dan Penghitungan Cadangan Karbon, Pengukuran Lapangan untuk Penaksiran Cadangan Karbon Hutan;"],
      latar: (x) => [K.TN,
        "Perubahan iklim global sebagian besar disebabkan oleh meningkatnya konsentrasi gas rumah kaca di atmosfer, terutama karbon dioksida (CO₂). Hutan menyerap karbon melalui fotosintesis dan menyimpannya dalam biomassa serta bahan organik tanah, sehingga cadangan karbon hutan menjadi bagian penting dari upaya mitigasi perubahan iklim. Pada ekosistem hutan, lebih dari separuh karbon tersimpan di dalam tanah, dan di lingkar Gunung Tambora karbon organik tanah meningkat seiring perkembangan tanah pada material piroklastik pascaerupsi.",
        `Data cadangan karbon yang terukur diperlukan untuk perencanaan pengelolaan kawasan dan pelaksanaan nilai ekonomi karbon. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah mengumpulkan data lapangan biomassa, serasah, kayu mati, dan karbon tanah di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Tersedianya data lapangan tegakan, serasah, nekromas, tumbuhan bawah, kayu mati, dan tanah pada plot ukur permanen;", "2. Diketahuinya cadangan karbon pada setiap pool (atas permukaan, bawah permukaan, serasah/nekromas/tumbuhan bawah, kayu mati, dan tanah);", "3. Tersedianya data ilmiah untuk kebijakan pengelolaan karbon di kawasan TN Tambora."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Pengukuran parameter tegakan (jenis, diameter, dan tinggi) pada plot ukur;", "2. Pengukuran tumbuhan mati (nekromas dan kayu mati);", "3. Pengambilan contoh serasah, tumbuhan bawah, dan tanah untuk analisis kadar karbon;", "4. Penghitungan cadangan karbon per plot, per transek, dan per pool;", "5. Dokumentasi, analisis, dan pelaporan hasil kegiatan."],
      metode: (x) => [`Pengukuran mengacu pada SNI 7724:2011. Setiap lokasi terdiri atas dua transek yang memotong kontur, dan setiap transek berisi enam plot ukur permanen berbentuk lingkaran dengan jarak antarplot 50 m (Kauffman dkk., 2016). Pohon (DBH lebih dari 20 cm) dan tiang (DBH 5 sampai 20 cm) diukur pada jari-jari ${L.num(Number(x.P.radius) || 10)} m, sedangkan pancang (DBH 2 sampai 5 cm) pada plot bersarang berjari-jari 2 m. Pada setiap batang dicatat jenis, diameter setinggi dada, tinggi, dan kondisinya.`,
        "Serasah, nekromas, serta semai dan tumbuhan bawah diambil seluruhnya pada bingkai 1 m × 1 m yang diletakkan acak di dalam plot, lalu ditimbang berat basah total dan berat basah contohnya. Kayu mati diukur dengan metode planar intersect pada empat sub-transek sepanjang 12 m (kuadran A, B, C, dan D). Contoh tanah mineral diambil dengan ring sampler pada enam lapisan kedalaman dari 0 sampai 30 cm di titik yang belum terinjak.",
        "Contoh serasah, kayu mati, dan tanah dikeringkan dan dianalisis kadar karbon organiknya di laboratorium. Data lapangan dicatat dengan SMART Mobile pada kategori Metode Teknis > Penghitungan Stok Karbon atau pada tally sheet."],
      anPengantar: () => "Data hasil pengukuran lapangan dan analisis laboratorium dihitung per plot, per transek, dan per pool karbon dengan persamaan sebagai berikut.",
      lokasi: (x) => { const tp = K.unik(x.D.plot, "tipe"), alt = K.rentang(x.D.plot.map((r) => r.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${tp.length ? ` Plot ukur berada pada tipe ekosistem ${x.daftarKata(tp.map((s) => s.toLowerCase()))}` : ""}${alt ? `${tp.length ? "," : " Plot ukur berada"} pada ketinggian ${alt} mdpl` : ""}${tp.length || alt ? "." : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Transek dibuat memotong kontur pada tipe ekosistem yang mewakili wilayah tersebut, masing-masing berisi enam plot ukur permanen.`,
      hasilLokasi: (x) => { const n = nPlot(x.S), tr = K.unik(x.D.plot.length ? x.D.plot : x.D.pohon, "transek").length; return n ? `Pengukuran dilakukan pada ${x.nTxt(n)} plot ukur${tr ? ` di ${x.nTxt(tr)} transek` : ""} di ${x.lokasi}.` : `Pengukuran dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const k = x.A.karbon, out = [];
        if (!k || k.kosong) return "";
        const p = k.pool, porsi = (v) => L.num((v / k.total) * 100, 1);
        out.push(`Karbon tanah menyumbang ${porsi(p.CT.nilai)}% dari total cadangan karbon, sedangkan karbon atas permukaan ${porsi(p.CAP.nilai)}%. Besarnya porsi karbon tanah sejalan dengan pengamatan bahwa lebih dari separuh karbon ekosistem hutan tersimpan di dalam tanah, sehingga perlindungan tanah dari erosi dan kebakaran ikut menjaga cadangan karbon kawasan.`);
        const kosongC = ["sntb", "kayuMati", "tanah"].filter((t) => x.D[t].length && x.D[t].some((r) => r.persenC === "" || r.persenC === undefined));
        if (kosongC.length) out.push("Sebagian contoh belum memiliki hasil uji %C laboratorium sehingga dihitung dengan fraksi karbon bawaan; nilai akhir perlu diperbarui setelah hasil laboratorium tersedia.");
        return out;
      },
      saran: () => ["Hasil uji laboratorium contoh tanah dan biomassa perlu dilengkapi agar cadangan karbon dapat dibandingkan antartipe ekosistem", "Kegiatan serupa perlu diperluas ke tipe ekosistem lain di TN Tambora (hutan pegunungan bawah, hutan pegunungan atas, dan sub-alpin)", K.SARAN_UMUM.kapasitas,
        "Hasil penghitungan cadangan karbon dijadikan acuan dalam rencana pengelolaan kawasan, terutama mitigasi perubahan iklim dan rehabilitasi hutan", "Kerja sama dengan lembaga penelitian dan perguruan tinggi perlu dilanjutkan untuk memperkuat basis data karbon kawasan"],
      simpulanAwal: (x) => { const n = nPlot(x.S); return `Pengukuran cadangan karbon dilakukan dengan plot lingkaran bersarang${n ? ` pada ${x.nTxt(n)} plot ukur` : ""} mengikuti SNI 7724:2011`; }
    }
  });
})();
