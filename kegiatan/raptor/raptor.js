/*
 * Kegiatan: Inventarisasi dan Sebaran Raptor (metode point count).
 * Kalkulator mengikuti template "Analisa data.xlsx"; LPK mengikuti contoh LPK Resort Piong Juni 2021
 * dengan susunan Memorandum M.57 (laporan kegiatan keteknisan).
 * Data SMART: kategori metodeteknis.inventarisasiraptor. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const L = window.PEHLaporan, A_ = window.PEHRaptorAnalisis;
  const { esc, num, nTxt, para, noteBlock, olList, numbering, tglPanjang, periodeSd, jumlahHari, addDays, validISO, cap1, sci } = L;
  const KAT = "metodeteknis.inventarisasiraptor.";

  /* ---------- Daftar usulan isian ---------- */
  const JENIS = Object.values((window.PEH_JENIS_RAPTOR || { items: {} }).items).filter((v) => v.includes(" - ")).map((v) => { const [j, l] = v.split(" - "); return { jenis: j.trim(), latin: l.trim() }; });
  const LATIN = new Map(JENIS.map((x) => [x.jenis.toLowerCase(), x.latin]));
  const pilihan = (key) => ((window.PEH_DATAMODEL.atribut.find((a) => a.key === key) || {}).pilihan || []).map((o) => o.in);
  const AKTIVITAS = ["Soaring", "Gliding", "Display", "Hovering", "Diving", "Perch hunting", "Ambush hunting", "Bertengger", "Terbang", "Bertengger kemudian terbang", "Kawin", "Bersarang", "Makan"];
  const KOLOM = [
    { key: "tanggal", label: "Tanggal", type: "date" },
    { key: "waktu", label: "Jam", w: 4.5 },
    { key: "plot", label: "Plot", w: 4.5 },
    { key: "jenis", label: "Jenis (nama Indonesia)", list: JENIS.map((x) => x.jenis), w: 11, onSet: (r, v) => { const l = LATIN.get(String(v).toLowerCase()); if (l) r.latin = l; } },
    { key: "latin", label: "Nama ilmiah", w: 10 },
    { key: "dewasa", label: "Dewasa", type: "number", w: 3.5 },
    { key: "anakan", label: "Anak", type: "number", w: 3.5 },
    { key: "jantan", label: "♂", type: "number", w: 3, title: "Jumlah jantan (opsional)" },
    { key: "betina", label: "♀", type: "number", w: 3, title: "Jumlah betina (opsional)" },
    { key: "jarak", label: "Jarak (m)", type: "number", w: 4.5 },
    { key: "azimuth", label: "Azimuth (°)", type: "number", w: 4 },
    { key: "aktivitas", label: "Aktivitas", list: AKTIVITAS, w: 8 },
    { key: "ruang", label: "Penggunaan ruang", list: ["Top", "Tajuk", "Bawah tajuk", "Permukaan tanah"], w: 6 },
    { key: "tipeRuang", label: "Tipe ruang", list: ["Terbuka", "Tertutup"], w: 6 },
    { key: "tutupan", label: "Tutupan lahan", list: pilihan("tipetutupanlahan"), w: 7 },
    { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number", w: 4.5 },
    { key: "keterangan", label: "Keterangan", w: 10 }
  ];

  /* ---------- Teks bawaan ---------- */
  const DASAR = (I) => [
    "Undang-Undang Nomor 5 Tahun 1990 tentang Konservasi Sumber Daya Alam Hayati dan Ekosistemnya;",
    "Undang-Undang Nomor 41 Tahun 1999 tentang Kehutanan;",
    "Undang-Undang Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup;",
    "Peraturan Pemerintah Nomor 28 Tahun 2011 sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 108 Tahun 2015 tentang Pengelolaan Kawasan Suaka Alam dan Kawasan Pelestarian Alam;",
    "Peraturan Menteri Kehutanan Nomor P.81/Menhut-II/2014 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;",
    "Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;",
    I.nomorDipa ? `Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Taman Nasional Tambora Nomor ${I.nomorDipa};` : `${I.sumberAnggaran || "Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Taman Nasional Tambora"};`,
    `Surat Tugas Kepala Balai Taman Nasional Tambora Nomor ${I.nomorST || "……"}${I.tanggalST ? ` tanggal ${tglPanjang(I.tanggalST)}` : ""}.`
  ];

  const nmJenis = (b) => `${b.jenis}${b.latin ? ` (${b.latin})` : ""}`;
  const daftarKata = (arr) => (arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + (arr.length > 2 ? "," : "") + " dan " + arr[arr.length - 1]);
  const f3 = (v) => num(v, 3), f2 = (v) => num(v, 2);
  const haTxt = (v) => (Number.isFinite(v) ? `1 ind/${num(v, Number.isInteger(Math.round(v * 100) / 100) ? 0 : 2)} Ha` : "-");
  const dens = (v) => num(v, 7);

  function hitung(S) {
    return A_.analisis({ ...S.plot, perjumpaan: S.perjumpaan, urutanJenis: S.urutanJenis, ...S.opsi });
  }

  /* ---------- Narasi otomatis ---------- */
  function narasi(A, S) {
    const I = S.identitas, wil = I.resort ? `wilayah kerja ${I.resort}${I.sptn ? `, ${I.sptn}` : ""}` : I.lokasi || "lokasi kegiatan";
    const hari = jumlahHari(I.mulai, I.selesai);
    const kritPerJenis = (k) => A.baris.filter((b) => b.kritSebaran === k).map(nmJenis);
    const dom = ["Dominan", "Sub Dominan", "Tidak Dominan"].map((k) => [k, A.baris.filter((b) => b.kritDom === k)]).filter(([, a]) => a.length);
    const maxB = A.baris.length ? A.baris.reduce((m, b) => (b.Xi > m.Xi ? b : m)) : null;
    const minXi = A.baris.length ? Math.min(...A.baris.map((b) => b.Xi)) : 0;
    const minB = A.baris.filter((b) => b.Xi === minXi);
    const plotTxt = A.plotPerjumpaan.length ? daftarKata(A.plotPerjumpaan) : "-";
    const metodeIDTxt = A.metodeID === "plot"
      ? "Ragam (S²) dihitung dari jumlah individu pada setiap plot pengamatan (plot tanpa perjumpaan bernilai nol)."
      : "Ragam (S²) dihitung dengan rumus pada template analisis Balai (Analisa data.xlsx) yang memakai jumlah individu total per jenis.";
    return {
      latar: [
        "Raptor atau burung pemangsa (elang, alap-alap, dan burung hantu) berada di puncak rantai makanan sehingga keberadaan dan kesehatan populasinya mencerminkan kesehatan ekosistem tempat hidupnya. Raptor diakui sebagai spesies indikator karena sensitif terhadap perubahan ekosistem dan rentan terhadap polutan lingkungan, dan seluruh jenis raptor diurnal di Indonesia dilindungi peraturan perundang-undangan.",
        `Taman Nasional Tambora dengan luas 71.645,64 ha didominasi savana dan hutan hujan tropis dengan bentang alam yang bervariasi, sehingga menjadi habitat berbagai jenis satwa termasuk raptor. Balai TN Tambora bertujuan membangun basis data sumber daya hutan berbasis hasil penelitian dan inventarisasi sebagai dasar pengambilan kebijakan pengelolaan kawasan. Untuk itu dilaksanakan kegiatan ${I.judul || "Inventarisasi dan Sebaran Raptor"} di ${wil}.`
      ].join("\n"),
      maksud: [
        `Maksud kegiatan ini adalah melakukan identifikasi dan inventarisasi jenis raptor di ${wil}. Tujuan kegiatan ini adalah:`,
        `1. Mengetahui jenis-jenis raptor yang berada di kawasan TN Tambora, khususnya ${wil};`,
        `2. Menduga kepadatan populasi, keanekaragaman, dominansi, dan pola sebaran raptor di ${wil}.`
      ].join("\n"),
      ruanglingkup: ["Ruang lingkup kegiatan ini meliputi:", "1. Identifikasi jenis raptor yang dijumpai berdasarkan taksonomi;", "2. Persebaran raptor pada plot pengamatan;", "3. Aktivitas raptor saat perjumpaan dan identifikasi persarangan;", "4. Pendugaan kepadatan populasi, indeks keanekaragaman, indeks dominansi, dan indeks dispersi."].join("\n"),
      lokasi: `Kegiatan dilaksanakan di ${I.lokasi || wil}${I.lokasiPlot ? `, ${I.lokasiPlot}` : ""}. ${S.plot.keterangan ? cap1(S.plot.keterangan) + "." : `Plot pengamatan ditempatkan sebanyak ${A.n} titik.`}`,
      waktu: validISO(I.mulai) ? `Kegiatan dilaksanakan selama ${nTxt(hari)} hari, mulai tanggal ${periodeSd(I.mulai, I.selesai)}.` : "Tanggal pelaksanaan belum diisi.",
      metode: [
        `Pengumpulan data menggunakan metode point count dengan plot pengamatan berbentuk lingkaran. Titik pengamatan (pusat plot) ditempatkan di sepanjang jalur pengamatan. Jari-jari plot adalah ${num(A.r)} m sehingga jarak antar pusat plot ${num(A.r * 2)} m. Pada setiap plot dicatat jenis raptor, jumlah individu (dewasa dan anak), waktu, jarak dan azimuth perjumpaan, aktivitas, penggunaan ruang, serta tipe tutupan lahan.`,
        `Perjumpaan dengan jarak lebih dari jari-jari plot dicatat sebagai perjumpaan di luar plot dan tidak dimasukkan dalam analisis. Data dicatat menggunakan aplikasi SMART Mobile dengan kategori Metode Teknis > Inventarisasi dan Sebaran Raptor, atau tally sheet.`
      ].join("\n"),
      analisis: [
        "1. Kepadatan populasi (Jarvinen, 1978): D = N / A, dengan A = n × π × r², N = jumlah individu raptor di seluruh plot, n = jumlah plot, dan r = jari-jari plot. Kepadatan disajikan dalam individu/ha dan luas yang ditempati satu individu (1 ind/... ha).",
        `2. Indeks keanekaragaman Shannon-Wiener: H' = −Σ Pi ln Pi, dengan Pi = ni/N. Kriteria: ${A.kritHLabel}.`,
        "3. Indeks dominansi/kelimpahan relatif: Di = ni/N × 100%. Kriteria: Di < 2% tidak dominan, 2–5% sub dominan, Di ≥ 5% dominan.",
        `4. Indeks dispersi (Ludwig dan Reynolds, 1988): ID = S²/x̄, dengan x̄ = Σx/n dan S² = (Σx² − (Σx)²/n)/(n − 1). ${metodeIDTxt} Kriteria: ID = 1 sebaran acak, ID > 1 sebaran kelompok, ID < 1 sebaran homogen/merata.`
      ].join("\n"),
      hasil_lokasi: `Pengamatan dilakukan pada ${nTxt(A.n)} plot pengamatan dengan jari-jari ${num(A.r)} m. Satu plot memiliki luas ${num(A.luas.perPlotHa, 1)} ha sehingga luas seluruh plot ${num(A.luas.ha, A.luas.ha % 1 ? 2 : 0)} ha. Raptor dijumpai pada plot ${plotTxt}.${A.luar.length ? ` Sebanyak ${A.luar.length} perjumpaan berada di luar jari-jari plot sehingga tidak dimasukkan dalam analisis.` : ""}${S.catatanLapangan ? " " + S.catatanLapangan : ""}`,
      hasil_jenis: A.S ? `Selama pengamatan dijumpai ${nTxt(A.S)} jenis raptor dengan total ${nTxt(A.N)} individu di dalam plot pengamatan, yaitu ${daftarKata(A.baris.map((b) => `${nmJenis(b)} sebanyak ${b.Xi} individu`))}.` : "Belum ada data perjumpaan raptor.",
      hasil_populasi: A.S ? `Kepadatan populasi raptor secara keseluruhan adalah ${num(A.D.perHa, 4)} individu/ha atau satu individu menempati wilayah seluas ${num(A.D.haPerInd, 2)} ha. Kepadatan tertinggi terdapat pada ${nmJenis(maxB)} sebesar ${dens(maxB.perHa)} ind/ha (${haTxt(maxB.haPerInd)}), sedangkan kepadatan terendah ${minB.length > 1 ? `terdapat pada ${nTxt(minB.length)} jenis` : `pada ${nmJenis(minB[0])}`} sebesar ${dens(minB[0].perHa)} ind/ha (${haTxt(minB[0].haPerInd)}).` : "",
      hasil_keragaman: A.S ? `Indeks keanekaragaman jenis raptor (H') pada plot pengamatan sebesar ${f2(A.H)} sehingga tergolong ${A.kritH.toLowerCase()}.` : "",
      hasil_dominansi: A.S ? dom.map(([k, a]) => `${a.length === A.S ? "Seluruh jenis raptor yang dijumpai" : daftarKata(a.map(nmJenis))} termasuk kategori ${k.toLowerCase()}${a.length < A.S ? ` (Di ${daftarKata(a.map((b) => f3(b.di) + "%"))})` : ` dengan nilai Di antara ${f3(Math.min(...a.map((b) => b.di)))}% dan ${f3(Math.max(...a.map((b) => b.di)))}%`}.`).join(" ") : "",
      hasil_sebaran: A.S ? `Secara keseluruhan raptor pada plot pengamatan memiliki pola sebaran ${A.idGab.kriteria.toLowerCase()} dengan nilai ID ${f3(A.idGab.id)}. Menurut jenis, ${["Kelompok", "Acak", "Homogen"].map((k) => [k, kritPerJenis(k)]).filter(([, a]) => a.length).map(([k, a]) => `${daftarKata(a)} memiliki pola sebaran ${k.toLowerCase()}`).join("; ")}.` : "",
      pembahasan: A.S ? [
        `Kepadatan populasi raptor pada plot pengamatan tergolong rendah. Hal ini sesuai dengan karakter raptor sebagai predator puncak yang memiliki kepadatan rendah, populasi kecil, wilayah jelajah luas, serta sensitif terhadap perubahan lingkungan.`,
        `Nilai keanekaragaman ${A.kritH.toLowerCase()} (H' = ${f2(A.H)}) dipengaruhi oleh jumlah jenis dan kemerataan jumlah individu tiap jenis. Suatu komunitas mempunyai keanekaragaman tinggi bila tersusun oleh banyak jenis dengan kelimpahan yang sama atau hampir sama.`,
        `Pola sebaran ${A.idGab.kriteria.toLowerCase()} secara keseluruhan perlu dibaca bersama perilaku tiap jenis; jenis yang dijumpai berpasangan atau berkelompok cenderung memiliki nilai ID lebih dari 1.`,
        S.satwaLain ? `Selain raptor, dijumpai pula satwa lain yang memanfaatkan relung yang sama dan berpotensi menjadi mangsa raptor, antara lain ${S.satwaLain}.` : ""
      ].filter(Boolean).join("\n") : "",
      kesimpulan: A.S ? [
        `1. Pengumpulan data menggunakan metode point count pada ${nTxt(A.n)} plot dengan jari-jari ${num(A.r)} m (luas total ${num(A.luas.ha, A.luas.ha % 1 ? 2 : 0)} ha);`,
        `2. Dijumpai ${nTxt(A.S)} jenis raptor atau ${nTxt(A.N)} individu di dalam plot pengamatan${A.luar.length ? ` dan ${A.luar.reduce((s, r) => s + r.individu, 0)} individu di luar plot` : ""};`,
        `3. Kepadatan populasi raptor adalah ${num(A.D.perHa, 4)} individu/ha atau 1 individu/${num(A.D.haPerInd, 2)} ha;`,
        `4. Keanekaragaman raptor tergolong ${A.kritH.toLowerCase()} (H' = ${f2(A.H)});`,
        `5. ${dom.map(([k, a]) => `${a.length === A.S ? "Semua jenis" : daftarKata(a.map((b) => b.jenis))} berkategori ${k.toLowerCase()}`).join("; ")};`,
        `6. Secara keseluruhan raptor memiliki pola sebaran ${A.idGab.kriteria.toLowerCase()} (ID = ${f3(A.idGab.id)}).`
      ].join("\n") : "",
      saran: [
        "1. Pelaksanaan kegiatan perlu dilengkapi peralatan yang lebih memadai (kamera lensa panjang, binokuler) untuk memudahkan identifikasi;",
        "2. Perlu peningkatan kapasitas pelaksana dalam metode survei, identifikasi, dan analisis data raptor;",
        "3. Perlu monitoring berkala pada musim yang berbeda untuk mengetahui pola sebaran dan perilaku raptor, termasuk raptor migran;",
        "4. Perlu pengamanan dan pemantauan wilayah yang diduga menjadi lokasi berbiak raptor;",
        "5. Perlu kerja sama dengan komunitas dan tenaga profesional pemerhati raptor."
      ].join("\n"),
      penutup: `Demikian laporan pelaksanaan kegiatan ${I.judul || ""} ini disusun sebagai bahan informasi dan pertimbangan dalam pengelolaan populasi raptor dan habitatnya di kawasan Taman Nasional Tambora.`
    };
  }

  /* ---------- Tabel laporan ---------- */
  const thJenis = `<th>No</th><th>Nama Indonesia</th><th>Nama Ilmiah</th>`;
  const tdJenis = (b) => `<td class="c">${b.no}</td><td>${esc(b.jenis)}</td><td>${sci(b.latin)}</td>`;
  const tabPopulasi = (A) => `<table class="data"><thead><tr>${thJenis}<th>Jumlah Individu (Xi)</th><th>Populasi (Ind/Ha)</th><th>Populasi (1 ind/… Ha)</th></tr></thead><tbody>${A.baris.map((b) => `<tr>${tdJenis(b)}<td class="c">${b.Xi}</td><td class="c">${dens(b.perHa)}</td><td class="c nw">${haTxt(b.haPerInd)}</td></tr>`).join("")}<tr class="total"><td colspan="3">Jumlah</td><td class="c">${A.N}</td><td class="c">${num(A.D.perHa, 4)}</td><td class="c nw">${haTxt(A.D.haPerInd)}</td></tr></tbody></table>`;
  const tabKeragaman = (A) => `<table class="data"><thead><tr>${thJenis}<th>Xi</th><th>Pi</th><th>Pi ln Pi</th></tr></thead><tbody>${A.baris.map((b) => `<tr>${tdJenis(b)}<td class="c">${b.Xi}</td><td class="c">${f3(b.pi)}</td><td class="c">${f3(b.piLnPi)}</td></tr>`).join("")}<tr class="total"><td colspan="5">Σ</td><td class="c">${f2(A.sumPiLnPi)}</td></tr><tr class="total"><td colspan="5">H' (${esc(A.kritH)})</td><td class="c">${f2(A.H)}</td></tr></tbody></table>`;
  const tabDominansi = (A) => `<table class="data"><thead><tr>${thJenis}<th>Di (%)</th><th>Tingkat Dominansi</th></tr></thead><tbody>${A.baris.map((b) => `<tr>${tdJenis(b)}<td class="c">${f3(b.di)}</td><td class="c">${esc(b.kritDom)}</td></tr>`).join("")}</tbody></table>`;
  const tabSebaran = (A) => `<table class="data"><thead><tr>${thJenis}<th>IDi</th><th>Kriteria Sebaran</th><th>ID Raptor</th></tr></thead><tbody>${A.baris.map((b, i) => `<tr>${tdJenis(b)}<td class="c">${f3(b.id.id)}</td><td class="c">${esc(b.kritSebaran)}</td>${i === 0 ? `<td class="c" rowspan="${A.baris.length}">${f3(A.idGab.id)}<br>(${esc(A.idGab.kriteria)})</td>` : ""}</tr>`).join("")}</tbody></table>`;
  const tabData = (S, A) => {
    const rows = S.perjumpaan.filter((p) => p.jenis || p.latin);
    return `<table class="data"><thead><tr><th>No</th><th>Tanggal/ Jam</th><th>Plot</th><th>Jenis</th><th>Jumlah Individu</th><th>Jarak (m)</th><th>Azimuth (°)</th><th>Aktivitas</th><th>Penggunaan Ruang</th><th>Tipe Ruang</th><th>Tutupan Lahan</th><th>Keterangan</th></tr></thead><tbody>${rows.map((p, i) => `<tr><td class="c">${i + 1}</td><td class="nw">${esc(p.tanggal ? tglPanjang(p.tanggal) : "")}${p.tanggal && p.waktu ? "<br>" : ""}${esc(p.waktu || "")}</td><td class="c">${esc(p.plot || "-")}</td><td>${esc(p.jenis || "")}${p.latin ? `<br>${sci(p.latin)}` : ""}</td><td class="c">${A_.num(p.dewasa) + A_.num(p.anakan)}</td><td class="c">${esc(p.jarak ?? "")}</td><td class="c">${esc(p.azimuth ?? "")}</td><td>${esc(p.aktivitas || "")}</td><td>${esc(p.ruang || "")}</td><td>${esc(p.tipeRuang || "")}</td><td>${esc(p.tutupan || "")}</td><td>${esc(p.keterangan || "")}${A_.has(p.jarak) && A.r && A_.num(p.jarak) > A.r ? " (di luar plot)" : ""}</td></tr>`).join("") || `<tr><td colspan="12" class="c">Belum ada data.</td></tr>`}</tbody></table>`;
  };
  // Lampiran 3: matriks analisis lengkap seperti lembar Excel
  const tabAnalisis = (A) => `<table class="data"><thead><tr><th>No</th><th>Jenis</th><th>Dewasa</th><th>Anak</th><th>Xi</th><th>Ind/Ha</th><th>1 ind/… Ha</th><th>Xi²</th><th>Pi</th><th>Pi ln Pi</th><th>Di (%)</th><th>Dominansi</th><th>Sxi²</th><th>x̄i</th><th>IDi</th><th>Pola Sebaran</th></tr></thead><tbody>${A.baris.map((b) => `<tr><td class="c">${b.no}</td><td>${esc(b.jenis)}<br>${sci(b.latin)}</td><td class="c">${b.dewasa}</td><td class="c">${b.anakan}</td><td class="c">${b.Xi}</td><td class="c">${dens(b.perHa)}</td><td class="c nw">${haTxt(b.haPerInd)}</td><td class="c">${b.Xi2}</td><td class="c">${f3(b.pi)}</td><td class="c">${f3(b.piLnPi)}</td><td class="c">${f3(b.di)}</td><td class="c">${esc(b.kritDom)}</td><td class="c">${num(b.id.s2, 4)}</td><td class="c">${num(b.id.mean, 4)}</td><td class="c">${f3(b.id.id)}</td><td class="c">${esc(b.kritSebaran)}</td></tr>`).join("")}<tr class="total"><td colspan="4">Σ</td><td class="c">${A.N}</td><td class="c">${num(A.D.perHa, 4)}</td><td class="c nw">${haTxt(A.D.haPerInd)}</td><td class="c">${A.sumXi2}</td><td class="c">${f2(A.sumPi)}</td><td class="c">${f2(A.sumPiLnPi)}</td><td colspan="6"></td></tr></tbody></table>
    <table class="data"><thead><tr><th>Parameter</th><th>Nilai</th></tr></thead><tbody>
      <tr><td>Jumlah individu raptor (N)</td><td class="c">${A.N} individu</td></tr><tr><td>Jumlah plot (n)</td><td class="c">${A.n} plot</td></tr>
      <tr><td>Jari-jari plot pengamatan (r)</td><td class="c">${num(A.r)} m</td></tr><tr><td>Luas plot pengamatan (A = n × ${num(A.pi, 2)} × r²)</td><td class="c">${num(A.luas.m2)} m² (${num(A.luas.ha, A.luas.ha % 1 ? 2 : 0)} ha)</td></tr>
      <tr><td>Populasi raptor (D)</td><td class="c">${num(A.D.perHa, 4)} ind/ha (${haTxt(A.D.haPerInd)})</td></tr><tr><td>Indeks keanekaragaman (H')</td><td class="c">${f2(A.H)} (${esc(A.kritH)})</td></tr>
      <tr><td>Sx² raptor; x̄ raptor; ID raptor</td><td class="c">${num(A.idGab.s2, 6)}; ${num(A.idGab.mean, 6)}; ${num(A.idGab.id, 6)} (${esc(A.idGab.kriteria)})</td></tr></tbody></table>`;

  /* ---------- LPK ---------- */
  function lpk(A, S, notes) {
    const I = S.identitas, N = numbering(), P = L.DEFAULT_PROFIL;
    const ttd = S.penandatangan, ketua = ttd.kanan || {};
    const rab = L.rabTable(S.rab);
    const periodeTxt = periodeSd(I.mulai, I.selesai), tglTtd = tglPanjang(I.tanggalLaporan);
    const judul = I.judul || "Inventarisasi dan Sebaran Raptor";
    const judulLengkap = `${judul}${I.resort ? ` (${I.resort})` : ""}`;
    const body = [L.kopHtml(P), L.titleHtml("LAPORAN", judulLengkap)];
    body.push(N.h1("1. Pendahuluan"), N.h2("a. Umum"), noteBlock(notes, "latar"), N.h2("b. Maksud dan Tujuan"), noteBlock(notes, "maksud"), N.h2("c. Ruang Lingkup"), noteBlock(notes, "ruanglingkup"),
      N.h2("d. Dasar"), para(`Dasar pelaksanaan kegiatan ${esc(judul)} adalah sebagai berikut:`), olList(DASAR(I)));
    const sched = validISO(I.mulai) ? [["Persiapan dan penyusunan rencana kegiatan", addDays(I.mulai, -2), addDays(I.mulai, -1)], ["Pelaksanaan kegiatan (perjalanan dan pengambilan data)", I.mulai, I.selesai || I.mulai],
      ["Pengolahan data dan penyusunan laporan", addDays(I.selesai || I.mulai, 1), validISO(I.tanggalLaporan) && I.tanggalLaporan > (I.selesai || I.mulai) ? I.tanggalLaporan : addDays(I.selesai || I.mulai, 2)]] : [];
    body.push(N.h1("2. Kegiatan yang dilaksanakan"),
      N.h2("a. Keadaan Umum Lokasi Kegiatan"), noteBlock(notes, "lokasi"),
      N.h2("b. Waktu Pelaksanaan"), noteBlock(notes, "waktu"),
      N.h2("c. Alat dan Bahan"), para("Alat dan bahan yang digunakan dalam kegiatan ini adalah sebagai berikut:"), N.cap("Alat dan Bahan"), L.alatTable(S.alat),
      N.h2("d. Metode Pelaksanaan/Metode Pengumpulan Data"), noteBlock(notes, "metode"),
      N.h2("e. Metode Analisis Data"), noteBlock(notes, "analisis"),
      N.h2("f. Tim Pelaksana"), para("Personil pelaksana kegiatan adalah fungsional Pengendali Ekosistem Hutan lingkup Balai TN Tambora dan staf, sebagaimana tersaji pada tabel berikut:"), N.cap("Daftar Nama Pelaksana Kegiatan"), L.timTable(S.tim),
      N.h2("g. Rincian Anggaran dan Biaya"), para(`Kegiatan ini dibiayai dari ${esc(I.sumberAnggaran || "……")}${I.akun ? `, akun ${esc(I.akun)}` : ""}, dengan jumlah ${esc(L.rupiah(rab.total) || "Rp……")} dengan rincian sebagai berikut:`), N.cap("Rincian Anggaran dan Biaya"), rab.html,
      N.h2("h. Tata Waktu/Jadwal Pelaksanaan"), para("Tahapan dan jadwal pelaksanaan kegiatan adalah sebagai berikut:"), N.cap("Tata Waktu Pelaksanaan Kegiatan"), L.ganttTable(sched));

    body.push(N.h1("3. Hasil yang dicapai"), N.h2("a. Hasil"),
      N.h3("1) Lokasi dan Plot Pengamatan"), noteBlock(notes, "hasil_lokasi", 3),
      N.h3("2) Jenis Raptor yang Dijumpai"), noteBlock(notes, "hasil_jenis", 3),
      N.h3("3) Kepadatan Populasi"), noteBlock(notes, "hasil_populasi", 3), N.cap("Rekapitulasi Perjumpaan dan Kepadatan Populasi Raptor pada Plot Pengamatan"), tabPopulasi(A),
      N.h3("4) Keanekaragaman Jenis"), noteBlock(notes, "hasil_keragaman", 3), N.cap("Indeks Keanekaragaman Jenis Raptor"), tabKeragaman(A),
      N.h3("5) Dominansi/Kelimpahan"), noteBlock(notes, "hasil_dominansi", 3), N.cap("Indeks Dominansi/Kelimpahan Raptor"), tabDominansi(A),
      N.h3("6) Pola Sebaran"), noteBlock(notes, "hasil_sebaran", 3), N.cap("Pola Sebaran Raptor"), tabSebaran(A),
      N.h2("b. Pembahasan"), noteBlock(notes, "pembahasan"));
    body.push(N.h1("4. Simpulan dan saran"), N.h2("a. Simpulan"), noteBlock(notes, "kesimpulan"), N.h2("b. Saran"), noteBlock(notes, "saran"),
      N.h1("5. Penutup"), noteBlock(notes, "penutup", 1),
      L.closingHtml(I.kota, tglTtd, ketua.jabatan || "Ketua Tim,", ketua.nama, ketua.nip),
      L.lampiranIndex(["Surat Tugas", "Matriks Data Hasil Kegiatan (rekapitulasi perjumpaan raptor)", "Matriks Analisis Data", "Peta Kerja/Peta Hasil Kegiatan", "Dokumentasi Kegiatan"]));
    body.push(N.h1("LAMPIRAN", "front", true), N.h2("1. Surat Tugas", "lamp"), para("Scan Surat Tugas dilampirkan pada halaman ini.", 1),
      `<div class="landscape">`, N.h2("2. Matriks Data Hasil Kegiatan", "lamp"), para("Rekapitulasi data perjumpaan raptor pada plot pengamatan disajikan pada tabel berikut.", 1), N.cap("Rekapitulasi Data Perjumpaan Raptor"), tabData(S, A),
      N.h2("3. Matriks Analisis Data", "lamp", true), para(`Hasil analisis data perjumpaan raptor${I.lokasi ? ` di ${esc(I.lokasi)}` : ""} disajikan pada tabel berikut.`, 1), N.cap("Hasil Analisis Data Perjumpaan Raptor"), tabAnalisis(A), `</div>`,
      N.h2("4. Peta Kerja/Peta Hasil Kegiatan", "lamp", true), para("Peta sebaran plot pengamatan dan titik perjumpaan raptor dilampirkan pada halaman ini.", 1),
      N.h2("5. Dokumentasi Kegiatan", "lamp", true), para("Foto pelaksanaan kegiatan dan jenis raptor yang dijumpai dilampirkan pada halaman ini.", 1));

    const cover = L.coverHtml({ jenis: "LAPORAN PELAKSANAAN KEGIATAN", judul: judulLengkap, balai: P.balai, logo: window.PEH_DEFAULT_LOGO, nomorST: I.nomorST, periode: periodeTxt, kota: I.kota, bulanTahun: L.bulanTahun(I.tanggalLaporan || I.selesai) });
    const kv = [["Judul Kegiatan", `Laporan Pelaksanaan Kegiatan ${judulLengkap}`], ["Waktu Kegiatan", periodeTxt || "……"], ["Lokasi Kegiatan", I.lokasi || "……"], ["Jumlah Dana", L.rupiah(rab.total) || "Rp……"],
      ["Sumber Dana", `${I.sumberAnggaran || "……"}${I.akun ? `, Akun ${I.akun}` : ""}`], ["Disusun di", I.kota || "……"], ["Pada Tanggal", tglTtd || "……"], ["Oleh", "Tim Pelaksana Kegiatan"]];
    const peng = L.pengesahanHtml(P, kv, ttd);
    const toc = [{ lv: 1, text: "LEMBAR PENGESAHAN" }, { lv: 1, text: "DAFTAR ISI" }, { lv: 1, text: "DAFTAR TABEL" }, ...N.toc];
    return `<section class="sec-cover">${cover}</section>\n<section class="sec-front">${peng}${L.tocHtml(toc, N.tables)}</section>\n<section class="sec-body">${body.join("\n")}</section>`;
  }

  /* ---------- Tampilan kalkulator ---------- */
  function hasilHtml(A, S) {
    if (!A.S) return `<div class="empty"><h2>Belum ada data perjumpaan</h2><p>Isi tabel di tab Data, muat file patroli SMART, atau muat data contoh di panel kiri.</p></div>`;
    const p = A.pembanding, beda = p.template.gab.kriteria !== p.plot.gab.kriteria || p.template.jenis.some((x, i) => x.kriteria !== p.plot.jenis[i].kriteria);
    return `<div class="kpi"><div><b>${A.S}</b><span>jenis raptor</span></div><div><b>${A.N}</b><span>individu dalam plot</span></div><div><b>${num(A.luas.ha, A.luas.ha % 1 ? 2 : 0)} ha</b><span>${A.n} plot × r ${num(A.r)} m</span></div><div><b>${num(A.D.perHa, 4)}</b><span>ind/ha (${haTxt(A.D.haPerInd)})</span></div><div><b>${f2(A.H)}</b><span>H' (${esc(A.kritH)})</span></div><div><b>${f3(A.idGab.id)}</b><span>ID raptor (${esc(A.idGab.kriteria)})</span></div></div>
    <div class="res"><h2>Rekapitulasi data (seperti lembar Excel)</h2><table><thead><tr><th>No</th><th>Nama Indonesia</th><th>Nama Latin</th><th>Dewasa</th><th>Anak</th><th>Xi</th><th>Ind/Ha</th><th>1 ind/… Ha</th><th>Xi²</th><th>Pi</th><th>Pi ln Pi</th><th>Di (%)</th><th>Dominansi</th><th>Sxi²</th><th>x̄i</th><th>IDi</th><th>Pola Sebaran</th></tr></thead><tbody>
    ${A.baris.map((b) => `<tr><td class="c">${b.no}</td><td class="t">${esc(b.jenis)}</td><td class="t"><i>${esc(b.latin)}</i></td><td>${b.dewasa}</td><td>${b.anakan}</td><td>${b.Xi}</td><td>${dens(b.perHa)}</td><td>${haTxt(b.haPerInd)}</td><td>${b.Xi2}</td><td>${f3(b.pi)}</td><td>${f3(b.piLnPi)}</td><td>${f3(b.di)}</td><td class="c">${esc(b.kritDom)}</td><td>${num(b.id.s2, 4)}</td><td>${num(b.id.mean, 4)}</td><td>${f3(b.id.id)}</td><td class="c">${esc(b.kritSebaran)}</td></tr>`).join("")}
    <tr class="total"><td colspan="5" class="t">Σ</td><td>${A.N}</td><td>${num(A.D.perHa, 4)}</td><td>${haTxt(A.D.haPerInd)}</td><td>${A.sumXi2}</td><td>${f2(A.sumPi)}</td><td>${f2(A.sumPiLnPi)}</td><td colspan="6"></td></tr></tbody></table>
    <h3>Parameter</h3><table><tbody><tr><td class="t">Jumlah individu raptor (N)</td><td>${A.N}</td></tr><tr><td class="t">Jumlah plot (n)</td><td>${A.n}</td></tr><tr><td class="t">Jari-jari plot (r)</td><td>${num(A.r)} m</td></tr><tr><td class="t">Luas plot pengamatan (n × ${num(A.pi, 2)} × r²)</td><td>${num(A.luas.m2)} m² = ${num(A.luas.ha, 2)} ha</td></tr><tr><td class="t">Populasi raptor (D)</td><td>${num(A.D.perHa, 4)} ind/ha</td></tr><tr><td class="t">H'</td><td>${num(A.H, 4)} (${esc(A.kritH)})</td></tr><tr><td class="t">Sx² raptor; x̄ raptor; ID raptor</td><td>${num(A.idGab.s2, 6)}; ${num(A.idGab.mean, 6)}; ${num(A.idGab.id, 6)} (${esc(A.idGab.kriteria)})</td></tr></tbody></table></div>
    <div class="res"><h2>Perbandingan rumus indeks dispersi</h2>
    <p class="muted">Laporan memakai: <b>${A.metodeID === "plot" ? "Per plot (Ludwig & Reynolds dengan data per plot)" : "Rumus template Analisa data.xlsx"}</b>. Ganti di panel kiri, Parameter metode.</p>
    <table><thead><tr><th>Jenis</th><th>Plot perjumpaan</th><th>IDi template</th><th>Kriteria</th><th>IDi per plot</th><th>Kriteria</th></tr></thead><tbody>
    ${A.baris.map((b, i) => `<tr><td class="t">${esc(b.jenis)}</td><td class="t">${esc(b.plot.join(", "))}</td><td>${f3(p.template.jenis[i].id)}</td><td class="c">${p.template.jenis[i].kriteria}</td><td>${f3(p.plot.jenis[i].id)}</td><td class="c">${p.plot.jenis[i].kriteria}</td></tr>`).join("")}
    <tr class="total"><td class="t" colspan="2">ID raptor (gabungan)</td><td>${f3(p.template.gab.id)}</td><td class="c">${p.template.gab.kriteria}</td><td>${f3(p.plot.gab.id)}</td><td class="c">${p.plot.gab.kriteria}</td></tr></tbody></table>
    ${beda ? `<div class="callout"><b>Hasil kedua rumus berbeda.</b> Rumus template menghitung ragam dari total individu per jenis seolah-olah sebaran per plot tidak diketahui (per jenis memakai Xi² sebagai Σx², gabungan menganggap tiap individu berada di plot berbeda). Rumus per plot memakai jumlah individu yang benar-benar tercatat di setiap plot, sesuai definisi Ludwig & Reynolds (1988). Dengan data per plot, rumus per plot lebih tepat; rumus template dipertahankan agar hasil bisa dibandingkan dengan laporan sebelumnya.</div>` : ""}
    <p class="formula">Template: Sxi² = (Xi² − Xi⁴/n)/(n − 1); Sx²raptor = (N − N²/n)/(n − 1). Per plot: S² = (Σx² − (Σx)²/n)/(n − 1), x = individu per plot. ID = S²/x̄.</p></div>
    ${A.luar.length ? `<div class="res"><h2>Perjumpaan di luar plot (tidak dihitung)</h2><table><thead><tr><th>Plot</th><th>Jenis</th><th>Individu</th><th>Jarak (m)</th></tr></thead><tbody>${A.luar.map((r) => `<tr><td class="c">${esc(r.plot)}</td><td class="t">${esc(r.jenis)}</td><td>${r.individu}</td><td>${esc(r.jarak)}</td></tr>`).join("")}</tbody></table></div>` : ""}`;
  }
  function csvHasil(A) {
    const rows = [["No", "Nama Indonesia", "Nama Latin", "Dewasa", "Anak", "Xi", "Populasi (Ind/Ha)", "1 ind/... Ha", "Xi2", "Pi", "Pi ln Pi", "Di (%)", "Kriteria Dominansi", "Sxi2", "xi rata-rata", "IDi", "Pola Sebaran"]];
    const n = (v, d) => num(v, d).replace(/\./g, "");
    A.baris.forEach((b) => rows.push([b.no, b.jenis, b.latin, b.dewasa, b.anakan, b.Xi, n(b.perHa, 7), n(b.haPerInd, 2), b.Xi2, n(b.pi, 4), n(b.piLnPi, 4), n(b.di, 3), b.kritDom, n(b.id.s2, 6), n(b.id.mean, 6), n(b.id.id, 6), b.kritSebaran]));
    rows.push(["Σ", "", "", "", "", A.N, n(A.D.perHa, 7), n(A.D.haPerInd, 2), A.sumXi2, n(A.sumPi, 4), n(A.sumPiLnPi, 4)], []);
    [["Jumlah individu raptor (N)", A.N], ["Jumlah plot (n)", A.n], ["Jari-jari plot (m)", A.r], ["Luas plot (m2)", n(A.luas.m2, 0)], ["Luas plot (Ha)", n(A.luas.ha, 2)], ["Populasi raptor (Ind/Ha)", n(A.D.perHa, 7)],
      ["H'", n(A.H, 4)], ["Kriteria keragaman", A.kritH], ["Sx2 raptor", n(A.idGab.s2, 6)], ["x rata-rata raptor", n(A.idGab.mean, 6)], ["ID raptor", n(A.idGab.id, 6)], ["Pola sebaran raptor", A.idGab.kriteria], ["Rumus ID", A.metodeID === "plot" ? "per plot" : "template"]].forEach((r) => rows.push(r));
    return rows;
  }

  /* ---------- Panel ---------- */
  function formParameter(S, changed, U) {
    const box = document.createElement("div");
    box.appendChild(U.fieldGrid([
      { key: "n", label: "Jumlah plot (n)", type: "number", half: true }, { key: "r", label: "Jari-jari plot (m)", type: "number", half: true },
      { key: "pi", label: "Nilai π", type: "number", step: "any", half: true }
    ], S.plot, () => changed()));
    box.appendChild(U.field({ key: "ket", label: "Keterangan penempatan plot", type: "textarea", rows: 2 }, S.plot.keterangan, (v) => { S.plot.keterangan = v; changed(); }));
    box.appendChild(U.fieldGrid([
      { key: "metodeID", label: "Rumus indeks dispersi", options: [["template", "Template Analisa data.xlsx"], ["plot", "Per plot (Ludwig & Reynolds)"]] },
      { key: "kriteriaH", label: "Kriteria keanekaragaman H'", options: [["template", "Template: ≤2 rendah, 2–3 sedang, ≥3 tinggi"], ["krebs", "Krebs: <1 rendah, 1–3 sedang, >3 tinggi"]] }
    ], S.opsi, () => changed()));
    const info = document.createElement("p");
    info.className = "muted";
    info.style.marginTop = "10px";
    info.innerHTML = "Template memakai π = 3,14. Perjumpaan dengan jarak lebih dari jari-jari plot otomatis tidak dihitung.";
    box.appendChild(info);
    return box;
  }

  function panelData(S, A, changed, U) {
    const wrap = document.createElement("div");
    const k = U.div(`<div class="kpi"><div><b>${S.perjumpaan.length}</b><span>baris perjumpaan</span></div><div><b>${A.S}</b><span>jenis dalam plot</span></div><div><b>${A.N}</b><span>individu dalam plot</span></div><div><b>${A.luar.length}</b><span>perjumpaan di luar plot</span></div></div>
      <p class="muted">Satu baris = satu jenis pada satu perjumpaan (sama dengan satu observasi <b>Perjumpaan Raptor</b> di SMART). Ketik nama jenis untuk memilih dari daftar jenis raptor Data Model SMART; nama ilmiah terisi otomatis. Baris berwarna jingga berada di luar jari-jari plot.${S.sumber ? ` Sumber data: ${esc(S.sumber)}.` : ""}</p>`);
    wrap.appendChild(k);
    const refreshKpi = () => { const B = A_.analisis({ ...S.plot, perjumpaan: S.perjumpaan, urutanJenis: S.urutanJenis, ...S.opsi }); const v = k.querySelectorAll(".kpi b"); v[0].textContent = S.perjumpaan.length; v[1].textContent = B.S; v[2].textContent = B.N; v[3].textContent = B.luar.length; };
    wrap.appendChild(U.tableEditor(S.perjumpaan, KOLOM, () => { S.perjumpaanDiubah = true; refreshKpi(); changed(); }, {
      rowClass: (r) => (A_.has(r.jarak) && A_.num(S.plot.r) && A_.num(r.jarak) > A_.num(S.plot.r) ? "out" : ""),
      newRow: () => { const last = S.perjumpaan[S.perjumpaan.length - 1] || {}; return { tanggal: last.tanggal || "", plot: "", dewasa: 1, anakan: 0 }; }
    }));
    const csvRow = U.div(`<div class="btnrow"><button class="btn small" type="button" id="csvOut">Unduh data (CSV)</button><label class="btn small" for="csvIn">Impor data dari CSV</label><input type="file" id="csvIn" accept=".csv,.txt" hidden></div><p class="status" id="csvStatus"></p>`);
    wrap.appendChild(csvRow);
    const extra = document.createElement("div");
    extra.className = "card";
    extra.style.marginTop = "14px";
    const f1 = document.createElement("label"); f1.className = "fld"; f1.textContent = "Satwa lain yang dijumpai (untuk pembahasan)";
    const t1 = document.createElement("textarea"); t1.rows = 2; t1.value = S.satwaLain || ""; t1.addEventListener("input", () => { S.satwaLain = t1.value; changed(); }); f1.appendChild(t1);
    const f2_ = document.createElement("label"); f2_.className = "fld"; f2_.textContent = "Catatan lapangan (waktu perjumpaan, cuaca, perjumpaan di luar plot, dll.)";
    const t2 = document.createElement("textarea"); t2.rows = 3; t2.value = S.catatanLapangan || ""; t2.addEventListener("input", () => { S.catatanLapangan = t2.value; changed(); }); f2_.appendChild(t2);
    extra.append(f1, f2_);
    wrap.appendChild(extra);

    wrap.querySelector("#csvOut").addEventListener("click", () => window.PEHExport.csv([KOLOM.map((c) => c.key), ...S.perjumpaan.map((r) => KOLOM.map((c) => r[c.key] ?? ""))], "data_perjumpaan_raptor.csv"));
    wrap.querySelector("#csvIn").addEventListener("change", async (e) => {
      const st = wrap.querySelector("#csvStatus");
      try {
        const rows = parseCSV(await e.target.files[0].text());
        const head = rows.shift().map((h) => h.trim().toLowerCase());
        const idx = KOLOM.map((c) => head.findIndex((h) => h === c.key.toLowerCase() || h === c.label.toLowerCase()));
        if (!idx.some((i) => i >= 0)) throw new Error("Judul kolom tidak dikenali. Pakai file hasil 'Unduh data (CSV)' sebagai contoh.");
        const data = rows.filter((r) => r.some((v) => v.trim())).map((r) => { const o = {}; KOLOM.forEach((c, j) => { if (idx[j] >= 0) { const v = r[idx[j]] ?? ""; o[c.key] = c.type === "number" && v !== "" ? Number(v.replace(",", ".")) : v; } }); return o; });
        S.perjumpaan.splice(0, S.perjumpaan.length, ...data);
        S.urutanJenis = [];
        changed();
        st.textContent = `${data.length} baris diimpor.`; st.className = "status ok";
        window.dispatchEvent(new Event("peh:redraw"));
      } catch (err) { st.textContent = err.message; st.className = "status err"; }
    });
    return wrap;
  }
  function parseCSV(text) {
    const sep = (text.split(/\r?\n/)[0].match(/;/g) || []).length >= (text.split(/\r?\n/)[0].match(/,/g) || []).length ? ";" : ",";
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

  /* ---------- SMART ---------- */
  function dariSMART(S, obs, info) {
    const v = PEHSmart.nilai;
    const plots = obs.filter((o) => o.sub === "titikpengamatan");
    const enc = obs.filter((o) => o.sub === "perjumpaanraptor");
    if (plots.length) {
      const kode = new Set(plots.map((o) => String(v(o, "noplot") || o.wpId)));
      S.plot.n = kode.size;
      const rs = plots.map((o) => Number(v(o, "jarijariplotm"))).filter((x) => x > 0);
      if (rs.length) S.plot.r = rs.sort((a, b) => rs.filter((x) => x === b).length - rs.filter((x) => x === a).length)[0];
    }
    S.perjumpaan = enc.map((o) => {
      const sp = String(v(o, "jenissatwa") || ""), [jenis, latin] = sp.includes(" - ") ? sp.split(" - ").map((s) => s.trim()) : [sp, ""];
      const ya = o.attr.sarangditemukan && o.attr.sarangditemukan.value;
      return { tanggal: o.tanggal, waktu: o.waktu.replace(":", "."), plot: String(v(o, "noplot") || ""), jenis, latin, dewasa: Number(v(o, "jumlahdewasa")) || 0, anakan: Number(v(o, "jumlahanakan")) || 0,
        jantan: v(o, "jumlahjantan"), betina: v(o, "jumlahbetina"), jarak: v(o, "jarakkesatwam"), azimuth: v(o, "azimuth"), aktivitas: v(o, "aktivitasraptor"), ruang: v(o, "penggunaanruang"), tipeRuang: v(o, "tiperuang"),
        tutupan: v(o, "tipetutupanlahan"), ketinggian: v(o, "ketinggianmdpl"), keterangan: [v(o, "keterangan"), ya ? "sarang ditemukan" : ""].filter(Boolean).join("; "), x: o.x, y: o.y };
    });
    S.urutanJenis = [];
    S.perjumpaanDiubah = false;
    return `${plots.length ? `${S.plot.n} titik pengamatan` : "Tidak ada observasi Titik Pengamatan; isi jumlah plot (n) secara manual"}, ${enc.length} perjumpaan raptor.`;
  }

  window.PEH.daftar({
    id: "raptor",
    judul: "Inventarisasi dan Sebaran Raptor",
    ringkas: "Metode point count. Kepadatan populasi, keanekaragaman Shannon-Wiener, dominansi, dan indeks dispersi; LPK format Memorandum M.57.",
    kategoriSMART: KAT,
    kamusSMART: ["PEH_JENIS_RAPTOR"],
    contoh: (window.PEH_CONTOH || {}).raptor,
    alatBawaan: [{ nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Kamera DSLR dengan lensa tele", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Tallysheet", jumlah: "1", satuan: "set" }, { nama: "Buku panduan identifikasi burung", jumlah: "1", satuan: "buah" }],
    stateAwal: () => ({ plot: { n: "", r: 500, pi: 3.14, keterangan: "" }, opsi: { metodeID: "template", kriteriaH: "template" }, perjumpaan: [], urutanJenis: [], satwaLain: "", catatanLapangan: "" }),
    dariContoh: (c) => ({ identitas: c.identitas, penandatangan: c.penandatangan, tim: c.tim, alat: c.alat, rab: c.rab, plot: c.plot, opsi: c.opsi, perjumpaan: c.perjumpaan, urutanJenis: c.urutanJenis, satwaLain: c.satwaLain, catatanLapangan: c.catatanLapangan, sumber: c.nama }),
    formParameter, panelData, dariSMART, hitung, hasilHtml, csvHasil, narasi, lpk
  });
})();
