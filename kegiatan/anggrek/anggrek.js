/*
 * Kegiatan: Identifikasi Jenis Anggrek (transek jalur dengan plot pengamatan).
 * Acuan: LPK identifikasi anggrek Resor Doropeti (2022), Oi Katupa (2021), Piong, Kawinda Toi, Doro Ncanga, dan Pancasila.
 * Data SMART: kategori metodeteknis.identifikasianggrek. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const HIDUP = ["Epifit", "Terestrial", "Litofit"];
  const FENOLOGI = ["Vegetatif", "Kuncup", "Berbunga", "Berbuah"];
  const HABITAT = ["Hutan hujan", "Hutan musim", "Hutan pegunungan", "Hutan cemara", "Savana", "Tepi sungai", "Lembah", "Punggung bukit"];
  const KAMUS = K.kamus("Anggrek"), KAMUS_POHON = K.kamus("Flora");
  const genus = (r) => { const g = String(r.latin || "").trim().split(/\s+/)[0] || ""; return /^[A-Z][a-z]+$/.test(g) ? g : ""; };
  const plotIsi = (S) => K.terisi(S.data.plot, "kode");
  const unitDari = (r) => String(r.plot || r.jalur || "").trim();

  window.PEH.kegiatan({
    id: "anggrek", kode: "ANGGREK",
    judul: "Identifikasi Jenis Anggrek",
    ringkas: "Transek jalur dengan plot pengamatan. Daftar jenis per genus, kelimpahan, distribusi, INP, keanekaragaman Shannon-Wiener, pendugaan kekayaan jenis, cara hidup, pohon inang, dan fenologi.",
    objek: "anggrek", objekPeta: "jalur pengamatan dan titik temuan anggrek",
    kategoriSMART: "metodeteknis.identifikasianggrek.",
    contoh: (window.PEH_CONTOH || {}).anggrek,
    alat: [{ nama: "Peta kerja", jumlah: "1", satuan: "lembar" }, { nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Kamera dengan lensa makro", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Plastik zip, gunting, cutter, dan penggaris", jumlah: "1", satuan: "set" }, { nama: "Alkohol 70% dan kertas koran untuk herbarium", jumlah: "1", satuan: "set" }, { nama: "Buku panduan anggrek (The Orchids of Java) dan daftar jenis anggrek", jumlah: "1", satuan: "set" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "plot", judul: "Plot Pengamatan", ket: "Satu baris untuk satu plot atau titik pengamatan di sepanjang jalur, termasuk plot tanpa temuan.",
        kolom: [{ key: "kode", label: "Kode plot", w: 4.5, tengah: true }, { key: "jalur", label: "Jalur", w: 7 }, { key: "grid", label: "Grid", w: 3.5, tengah: true }, KOL.tanggal, KOL.x, KOL.y, KOL.ketinggian, { key: "habitat", label: "Tipe hutan", list: HABITAT, w: 8 }, KOL.keterangan],
        smart: { sub: "plotpengamatan", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), jalur: v("notransek") || v("lokasi"), grid: v("kodegrid"), ketinggian: v("ketinggianmdpl"), habitat: v("tipetutupanlahan"), keterangan: v("keterangan") }) } },
      { key: "temuan", judul: "Temuan Anggrek", ket: "Satu baris untuk satu jenis pada satu titik temuan. Ketik nama jenis untuk memilih dari daftar anggrek TN Tambora.",
        kolom: [KOL.tanggal, { ...KOL.plot, label: "Plot" }, ...K.kolJenis("Nama jenis anggrek", KAMUS), { ...KOL.jumlah, label: "Jumlah (individu/rumpun)" }, { key: "caraHidup", label: "Cara hidup", options: HIDUP, w: 5 },
          { key: "inang", label: "Pohon inang", list: Object.keys(KAMUS_POHON).sort((a, b) => a.localeCompare(b, "id")), w: 8 }, { key: "tinggiTempel", label: "Tinggi tempel (m)", type: "number", w: 4 }, { key: "fenologi", label: "Fenologi", options: FENOLOGI, w: 5 }, KOL.ketinggian, KOL.x, KOL.y, { key: "keterangan", label: "Keterangan (foto, herbarium)", w: 10 }],
        smart: { sub: "temuananggrek", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); return { ...K.dasarObs(o), plot: String(v("noplot") || ""), jenis, latin, n: Number(v("jumlah")) || 1, caraHidup: v("carahidup"), inang: v("pohoninang"), tinggiTempel: v("tinggitempelm"), fenologi: v("fenologi"), ketinggian: v("ketinggianmdpl"), keterangan: v("keterangan") }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", plot: last.plot || "", n: 1 }) }
    ],
    parameter: [
      { key: "luasPlot", label: "Luas plot pengamatan (m²)", type: "number", half: true, def: 400 },
      { key: "nPlot", label: "Jumlah plot (kosong = dari tabel plot)", type: "number", half: true, def: "" },
      { ...K.paramKriteriaH, def: "krebs" }
    ],
    paramInfo: "LPK anggrek Balai mengamati 2,5 sampai 10 m ke kanan dan kiri jalur; plot 20 m × 20 m setara 400 m². Kriteria H′ bawaan mengikuti LPK anggrek: H′ ≤ 1 rendah, 1 sampai 3 sedang, H′ ≥ 3 tinggi.",
    modul: [
      { m: "daftar", id: "jenis", judul: "Jenis Anggrek yang Ditemukan", input: (S) => ({ rows: S.data.temuan.map((r) => ({ ...r, famili: genus(r), unit: unitDari(r) })) }),
        opt: { kelompok: "genus", satuan: "individu/rumpun", kolom: [{ key: "caraHidup", label: "Cara Hidup" }, { key: "fenologi", label: "Fenologi" }, { key: "inang", label: "Pohon Inang" }] } },
      { m: "kelimpahan", id: "kelimpahan", input: (S, P) => ({ rows: S.data.temuan.map((r) => ({ ...r, unit: unitDari(r) })), units: plotIsi(S).map((p) => p.kode), nUnit: P.nPlot, luasUnit: P.luasPlot }), opt: { H: false } },
      { m: "komunitas", id: "keragaman", judul: "Keanekaragaman, Kemerataan, dan Kekayaan Jenis Anggrek", input: (S) => ({ rows: S.data.temuan }), opt: (P) => ({ kriteriaH: P.kriteriaH, indeks: ["H", "E", "R"] }) },
      { m: "penduga", id: "penduga", opsional: true, input: (S) => ({ rows: S.data.temuan.map((r) => ({ jenis: r.jenis, latin: r.latin, unit: unitDari(r) || r.tanggal, n: r.n })), units: plotIsi(S).map((p) => p.kode) }) },
      { m: "persen", id: "carahidup", judul: "Cara Hidup Anggrek", input: (S) => ({ items: S.data.temuan.filter((r) => String(r.caraHidup || "").trim()).map((r) => [r.caraHidup, Number(r.n) || 1]) }), opt: { label: "cara hidup", satuan: "individu/rumpun", cap: "Persentase Individu Anggrek menurut Cara Hidup" } },
      { m: "persen", id: "inang", opsional: true, judul: "Pohon Inang Anggrek Epifit", input: (S) => ({ items: S.data.temuan.filter((r) => String(r.inang || "").trim()).map((r) => [r.inang, 1]) }), opt: { label: "pohon inang", cap: "Pohon Inang Anggrek Epifit" } },
      { m: "persen", id: "fenologi", opsional: true, judul: "Fenologi Anggrek saat Pengamatan", input: (S) => ({ items: S.data.temuan.filter((r) => String(r.fenologi || "").trim()).map((r) => [r.fenologi, 1]) }), opt: { label: "fase fenologi", cap: "Fase Fenologi Anggrek saat Pengamatan" } }
    ],
    lokasiTabel: (S) => ({ cap: "Plot Pengamatan Anggrek", spec: K.specDari(plotIsi(S), [{ key: "kode", label: "Kode Plot", tengah: true }, { key: "jalur", label: "Jalur" }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "habitat", label: "Tipe Hutan" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;"],
      latar: (x) => [K.TN,
        "Anggrek (Orchidaceae) merupakan famili terbesar tumbuhan berbunga, sekitar 7 sampai 10% dari seluruh tumbuhan berbunga, dengan keanekaragaman yang terkonsentrasi di daerah tropis dan subtropis. Indonesia memiliki sekitar 5.000 dari sekitar 26.000 jenis anggrek dunia. Beberapa jenis anggrek dilindungi berdasarkan Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018. Menurut tempat hidupnya, anggrek dikelompokkan menjadi anggrek terestrial yang tumbuh di tanah dan anggrek epifit yang menempel pada tumbuhan lain.",
        `Data jenis anggrek di TN Tambora belum lengkap. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil} sebagai upaya mengenali dan mendeskripsikan anggrek alam di kawasan, sekaligus menunjang penelitian, pengembangan kawasan, dan pelestarian sumber daya alam.`],
      maksud: (x) => [`Maksud kegiatan ini adalah mengetahui jenis-jenis anggrek di ${x.wil}. Tujuan kegiatan ini adalah:`, "1. Mengidentifikasi jenis anggrek di lokasi kegiatan;", "2. Menganalisis kelimpahan dan persebaran anggrek;", "3. Tersedianya data spasial persebaran anggrek."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Persiapan: pengumpulan data dan informasi lokasi yang menjadi habitat anggrek;", "2. Pengambilan data lapangan dengan transek jalur: titik koordinat, jenis, jumlah individu atau rumpun, cara hidup, pohon inang, fenologi, dokumentasi, dan sampel herbarium;", "3. Identifikasi jenis dengan buku panduan dan literatur;", "4. Analisis kelimpahan, distribusi, dan keanekaragaman jenis;", "5. Pelaporan."],
      metode: () => ["Identifikasi anggrek dilakukan dengan metode transek jalur. Jalur diletakkan secara purposif, misalnya pada jalur pendakian atau jalan setapak, terutama pada ketinggian di atas 500 mdpl dan tipe ekosistem hutan hujan tropis dan hutan musim. Pengamatan dilakukan pada jarak 2,5 sampai 10 m ke kanan dan kiri jalur, untuk anggrek terestrial maupun epifit.",
        "Setiap temuan dicatat koordinat, jenis, jumlah individu atau rumpun, cara hidup, pohon inang dan ketinggian tempel untuk anggrek epifit, fenologi, serta kondisi tempat tumbuh (lembap atau kering, tepi sungai, lembah, punggung bukit). Bunga, daun, batang, dan bagian lain didokumentasikan sedetail mungkin dan bila memungkinkan diambil sampel untuk herbarium. Jenis diidentifikasi dengan buku panduan seperti The Orchids of Java (Comber, 1990) dan literatur lain.",
        "Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Identifikasi Anggrek atau pada tally sheet."],
      lokasi: (x) => { const hab = K.unik(x.D.plot, "habitat"), alt = K.rentang([...x.D.plot, ...x.D.temuan].map((r) => r.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${hab.length ? ` Jalur pengamatan melintasi ${x.daftarKata(hab.map((h) => h.toLowerCase()))}` : ""}${alt ? `${hab.length ? "" : " Lokasi pengamatan berada"} pada ketinggian ${alt} mdpl` : ""}${hab.length || alt ? "." : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Jalur pengamatan dipilih pada areal yang mulai dijumpai habitat anggrek, terutama pada ketinggian di atas 500 mdpl, dengan mengikuti jalur setapak yang sudah ada.`,
      hasilLokasi: (x) => { const p = plotIsi(x.S), jl = K.unik(p, "jalur"), alt = K.rentang([...x.D.plot, ...x.D.temuan].map((r) => r.ketinggian)); return p.length ? `Pengamatan dilakukan pada ${x.nTxt(p.length)} plot${jl.length ? ` di ${x.nTxt(jl.length)} jalur (${x.daftarKata(jl)})` : ""}${alt ? ` pada ketinggian ${alt} mdpl` : ""}.` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const out = [], ch = x.A.carahidup, ig = x.A.inang;
        if (ch && !ch.kosong) out.push(`Menurut cara hidupnya, anggrek yang ditemukan didominasi anggrek ${ch.rows[0].k.toLowerCase()} (${L.num(ch.rows[0].p, 1)}% individu). Anggrek epifit banyak ditemukan karena hidupnya berhubungan dengan pohon inang yang memudahkan memperoleh cahaya matahari.`);
        if (ig && !ig.kosong) out.push(`Anggrek epifit paling sering ditemukan menempel pada ${x.daftarKata(ig.rows.slice(0, 3).map((r) => r.k))}.`);
        const d = K.dilindungi(x.D.temuan);
        if (d.length) out.push(`Sebanyak ${x.nTxt(d.length)} jenis yang ditemukan termasuk tumbuhan dilindungi menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018, yaitu ${x.daftarKata(d)}.`);
        if (K.terisi(x.D.temuan, "jenis", "latin").length) out.push("Keberadaan jenis anggrek alam dapat menjadi sumber genetik untuk budidaya tanaman hias bernilai ekonomi tinggi, sehingga data jenis dan lokasinya perlu dijaga sebagai bahan pengelolaan dan pemanfaatan lestari.");
        return out;
      },
      saran: () => ["Perlu pembuatan herbarium dan koleksi foto rujukan untuk membantu identifikasi dan pengenalan jenis anggrek", "Area pengamatan perlu diperluas ke lokasi berpotensi yang belum terjangkau, termasuk pada musim berbunga agar identifikasi sampai tingkat jenis lebih mudah", "Anggrek alam dapat dikembangkan dalam rumah kaca atau persemaian sebagai unit percontohan dan sarana pengenalan jenis", K.SARAN_UMUM.kapasitas, K.SARAN_UMUM.smart],
      simpulanAwal: (x) => { const p = plotIsi(x.S); return p.length ? `Identifikasi anggrek dilakukan pada ${x.nTxt(p.length)} plot pengamatan di ${x.lokasi}` : ""; }
    }
  });
})();
