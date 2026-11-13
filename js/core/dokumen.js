/*
 * Kerangka dokumen bersama: Rencana Pelaksanaan Kegiatan (RPK) dan Laporan Pelaksanaan Kegiatan (LPK).
 * Susunan mengikuti Memorandum M.57/T.41/TU/PEG/02/2026 (laporan kegiatan keteknisan) dan format RPK
 * Generator LPK SMART Patrol: sampul, lembar pengesahan, daftar isi/tabel, isi bernomor, penutup, lampiran.
 * Isi khusus kegiatan (metode analisis, hasil, lampiran) disusun oleh kegiatan dan dimasukkan sebagai HTML.
 */
(function () {
  "use strict";
  const L = window.PEHLaporan;
  const { esc, para, noteBlock, olList, tglPanjang, periodeSd, jumlahHari, addDays, validISO, nTxt } = L;

  // Dasar hukum umum kegiatan inventarisasi/monitoring di kawasan konservasi; tambahan khusus kegiatan disisipkan sebelum DIPA
  const DASAR_UMUM = [
    "Undang-Undang Nomor 5 Tahun 1990 tentang Konservasi Sumber Daya Alam Hayati dan Ekosistemnya sebagaimana telah diubah dengan Undang-Undang Nomor 32 Tahun 2024;",
    "Undang-Undang Nomor 41 Tahun 1999 tentang Kehutanan;",
    "Undang-Undang Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup;",
    "Peraturan Pemerintah Nomor 28 Tahun 2011 sebagaimana telah diubah dengan Peraturan Pemerintah Nomor 108 Tahun 2015 tentang Pengelolaan Kawasan Suaka Alam dan Kawasan Pelestarian Alam;",
    "Peraturan Menteri Kehutanan Nomor P.81/Menhut-II/2014 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;"
  ];
  // Nomor peraturan ("P.81/Menhut-II/2014") untuk membuang dasar tambahan yang sudah ada di daftar umum
  const nomorAturan = (s) => (String(s).match(/Nomor\s+([^\s,;]+(?:\s+Tahun\s+\d{4})?)/) || [])[1] || String(s).trim();
  function dasar(I, tambahan = []) {
    const ada = new Set(DASAR_UMUM.map(nomorAturan));
    return [
      ...DASAR_UMUM,
      ...tambahan.filter((t) => !ada.has(nomorAturan(t))),
      I.nomorDipa ? `Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Taman Nasional Tambora Nomor ${I.nomorDipa};` : `${I.sumberAnggaran || "Daftar Isian Pelaksanaan Anggaran (DIPA) Balai Taman Nasional Tambora"};`,
      `Surat Tugas Kepala Balai Taman Nasional Tambora Nomor ${I.nomorST || "……"}${I.tanggalST ? ` tanggal ${tglPanjang(I.tanggalST)}` : ""}.`
    ];
  }

  // Tata waktu: persiapan, pelaksanaan, pengolahan data dan penyusunan laporan
  function jadwal(I, rpk) {
    if (!validISO(I.mulai)) return [];
    const akhir = I.selesai && validISO(I.selesai) ? I.selesai : I.mulai;
    const lap = !rpk && validISO(I.tanggalLaporan) && I.tanggalLaporan > akhir ? I.tanggalLaporan : addDays(akhir, rpk ? 7 : 2);
    return [["Persiapan dan penyusunan rencana kegiatan", addDays(I.mulai, -2), addDays(I.mulai, -1)], ["Pelaksanaan kegiatan (perjalanan dan pengambilan data)", I.mulai, akhir], ["Pengolahan data dan penyusunan laporan", addDays(akhir, 1), lap]];
  }
  const waktuTeks = (I, rpk) => (validISO(I.mulai) ? `Kegiatan ${rpk ? "akan dilaksanakan" : "dilaksanakan"} selama ${nTxt(jumlahHari(I.mulai, I.selesai || I.mulai))} hari, mulai tanggal ${periodeSd(I.mulai, I.selesai)}.` : "Tanggal pelaksanaan belum diisi.");

  // Bagian yang memuat tabel boleh dikirim sebagai fungsi agar nomor tabel mengikuti urutan dokumen
  const isiBagian = (x) => (typeof x === "function" ? x() : x);
  function pendahuluan(N, notes, I, judul, dasarTambahan) {
    return [N.h1("1. Pendahuluan"), N.h2("a. Umum"), noteBlock(notes, "latar"), N.h2("b. Maksud dan Tujuan"), noteBlock(notes, "maksud"), N.h2("c. Ruang Lingkup"), noteBlock(notes, "ruanglingkup"),
      N.h2("d. Dasar"), para(`Dasar pelaksanaan kegiatan ${esc(judul)} adalah sebagai berikut:`), olList(dasar(I, dasarTambahan))].join("\n");
  }
  function bagianKegiatan(N, notes, S, o, rpk) {
    const I = S.identitas, rab = L.rabTable(S.rab);
    return [N.h1(rpk ? "2. Kegiatan yang akan dilaksanakan" : "2. Kegiatan yang dilaksanakan"),
      N.h2("a. Keadaan Umum Lokasi Kegiatan"), noteBlock(notes, "lokasi"),
      N.h2("b. Waktu Pelaksanaan"), noteBlock(notes, "waktu"),
      N.h2("c. Alat dan Bahan"), para(`Alat dan bahan yang ${rpk ? "akan " : ""}digunakan dalam kegiatan ini adalah sebagai berikut:`), N.cap("Alat dan Bahan"), L.alatTable(S.alat),
      N.h2("d. Metode Pelaksanaan/Metode Pengumpulan Data"), noteBlock(notes, "metode"), o.metodeTambahan || "",
      N.h2("e. Metode Analisis Data"), isiBagian(o.metodeAnalisis) || noteBlock(notes, "an_pengantar"),
      N.h2("f. Tim Pelaksana"), para(`Personil pelaksana kegiatan adalah fungsional Pengendali Ekosistem Hutan lingkup Balai TN Tambora dan staf, sebagaimana tersaji pada tabel berikut:`), N.cap("Daftar Nama Pelaksana Kegiatan"), L.timTable(S.tim),
      N.h2("g. Rincian Anggaran dan Biaya"), para(`Kegiatan ini ${rpk ? "akan " : ""}dibiayai dari ${esc(I.sumberAnggaran || "……")}${I.akun ? `, akun ${esc(I.akun)}` : ""}, dengan jumlah ${esc(L.rupiah(rab.total) || "Rp……")} dengan rincian sebagai berikut:`), N.cap("Rincian Anggaran dan Biaya"), rab.html,
      N.h2("h. Tata Waktu/Jadwal Pelaksanaan"), para("Tahapan dan jadwal pelaksanaan kegiatan adalah sebagai berikut:"), N.cap("Tata Waktu Pelaksanaan Kegiatan"), L.ganttTable(jadwal(I, rpk)) || para("Tanggal pelaksanaan belum diisi.")].join("\n");
  }
  const judulLengkapOf = (I, def) => `${I.judul || def}${I.resort ? ` (${I.resort})` : ""}`;

  /* ---------- LPK ---------- */
  // o = { judul, metodeAnalisis, metodeTambahan, hasil, pembahasan?, lampiranData, lampiranAnalisis, lampiranIndex?, dasarTambahan, objekPeta }
  function lpk(S, notes, N, o) {
    const I = S.identitas, P = L.DEFAULT_PROFIL, ttd = S.penandatangan, ketua = ttd.kanan || {};
    const rab = L.rabTable(S.rab), periodeTxt = periodeSd(I.mulai, I.selesai), tglTtd = tglPanjang(I.tanggalLaporan);
    const judul = I.judul || o.judul, judulLengkap = judulLengkapOf(I, o.judul);
    const body = [L.kopHtml(P), L.titleHtml("LAPORAN", judulLengkap), pendahuluan(N, notes, I, judul, o.dasarTambahan), bagianKegiatan(N, notes, S, o, false)];
    body.push(N.h1("3. Hasil yang dicapai"), N.h2("a. Hasil"), isiBagian(o.hasil), N.h2("b. Pembahasan"), noteBlock(notes, "pembahasan"));
    body.push(N.h1("4. Simpulan dan saran"), N.h2("a. Simpulan"), noteBlock(notes, "kesimpulan"), N.h2("b. Saran"), noteBlock(notes, "saran"),
      N.h1("5. Penutup"), noteBlock(notes, "penutup", 1), L.closingHtml(I.kota, tglTtd, ketua.jabatan || "Ketua Tim,", ketua.nama, ketua.nip),
      L.lampiranIndex(o.lampiranIndex || ["Surat Tugas", "Matriks Data Hasil Kegiatan", "Matriks Analisis Data", "Peta Kerja/Peta Hasil Kegiatan", "Dokumentasi Kegiatan"]));
    body.push(N.h1("LAMPIRAN", "front", true), N.h2("1. Surat Tugas", "lamp"), para("Scan Surat Tugas dilampirkan pada halaman ini.", 1),
      `<div class="landscape">`, N.h2("2. Matriks Data Hasil Kegiatan", "lamp"), isiBagian(o.lampiranData) || para("Data hasil kegiatan dilampirkan pada halaman ini.", 1),
      N.h2("3. Matriks Analisis Data", "lamp", true), isiBagian(o.lampiranAnalisis) || para("Hasil analisis data dilampirkan pada halaman ini.", 1), `</div>`,
      N.h2("4. Peta Kerja/Peta Hasil Kegiatan", "lamp", true), o.lampiranPeta || para(`Peta lokasi kegiatan dan sebaran titik ${esc(o.objekPeta || "pengamatan")} dilampirkan pada halaman ini.`, 1),
      N.h2("5. Dokumentasi Kegiatan", "lamp", true), para("Foto pelaksanaan kegiatan dilampirkan pada halaman ini.", 1));
    const cover = L.coverHtml({ jenis: "LAPORAN PELAKSANAAN KEGIATAN", judul: judulLengkap, balai: P.balai, logo: window.PEH_DEFAULT_LOGO, nomorST: I.nomorST, periode: periodeTxt, kota: I.kota, bulanTahun: L.bulanTahun(I.tanggalLaporan || I.selesai) });
    const kv = [["Judul Kegiatan", `Laporan Pelaksanaan Kegiatan ${judulLengkap}`], ["Waktu Kegiatan", periodeTxt || "……"], ["Lokasi Kegiatan", I.lokasi || "……"], ["Jumlah Dana", L.rupiah(rab.total) || "Rp……"],
      ["Sumber Dana", `${I.sumberAnggaran || "……"}${I.akun ? `, Akun ${I.akun}` : ""}`], ["Disusun di", I.kota || "……"], ["Pada Tanggal", tglTtd || "……"], ["Oleh", "Tim Pelaksana Kegiatan"]];
    const toc = [{ lv: 1, text: "LEMBAR PENGESAHAN" }, { lv: 1, text: "DAFTAR ISI" }, { lv: 1, text: "DAFTAR TABEL" }, ...N.toc];
    return `<section class="sec-cover">${cover}</section>\n<section class="sec-front">${L.pengesahanHtml(P, kv, ttd)}${L.tocHtml(toc, N.tables)}</section>\n<section class="sec-body">${body.join("\n")}</section>`;
  }

  /* ---------- RPK ---------- */
  // Penandatangan RPK: kiri PPK (Diperiksa dan Disetujui), kanan Koordinator Kegiatan, bawah Kepala Balai (Mengesahkan).
  // Nama/NIP yang kosong diambil dari penandatangan LPK (kanan = ketua tim, bawah = kepala balai).
  function ttdRPK(S) {
    const r = S.penandatanganRPK || {}, l = S.penandatangan || {};
    const isi = (a, b, head, jab) => ({ head: (a && a.head) ?? head, jabatan: (a && a.jabatan) || jab, nama: (a && a.nama) || (b && b.nama) || "", nip: (a && a.nip) || (b && b.nip) || "" });
    return { kiri: isi(r.kiri, null, "Diperiksa dan Disetujui,", "Pejabat Pembuat Komitmen,"), kanan: isi(r.kanan, l.kanan, "", "Koordinator Kegiatan,"), bawah: isi(r.bawah, l.bawah, "Mengesahkan,", "Kepala Balai,") };
  }
  // o = { judul, metodeAnalisis, metodeTambahan, tallysheet, dasarTambahan }
  function rpk(S, notes, N, o) {
    const I = S.identitas, P = L.DEFAULT_PROFIL, ttd = ttdRPK(S), koor = ttd.kanan;
    const rab = L.rabTable(S.rab), periodeTxt = periodeSd(I.mulai, I.selesai), tgl = tglPanjang(I.tanggalRPK || (validISO(I.mulai) ? addDays(I.mulai, -3) : ""));
    const judul = I.judul || o.judul, judulLengkap = judulLengkapOf(I, o.judul);
    const lamp = ["Surat Tugas", "Peta Kerja (Peta Rencana Pelaksanaan Kegiatan)", ...(o.tallysheet ? ["Format Isian Data Lapangan (Tally Sheet)"] : [])];
    const body = [L.kopHtml(P), L.titleHtml("RENCANA PELAKSANAAN KEGIATAN", judulLengkap), pendahuluan(N, notes, I, judul, o.dasarTambahan), bagianKegiatan(N, notes, S, o, true),
      N.h1("3. Penutup"), noteBlock(notes, "penutup", 1), L.closingHtml(I.kota, tgl, koor.jabatan, koor.nama, koor.nip), L.lampiranIndex(lamp),
      N.h1("LAMPIRAN", "front", true), N.h2("1. Surat Tugas", "lamp"), para("Scan Surat Tugas dilampirkan pada halaman ini.", 1),
      N.h2("2. Peta Kerja (Peta Rencana Pelaksanaan Kegiatan)", "lamp", true), para(`Peta rencana lokasi ${esc(o.objekPeta || "pengamatan")} dilampirkan pada halaman ini.`, 1)];
    if (o.tallysheet) body.push(`<div class="landscape">`, N.h2("3. Format Isian Data Lapangan (Tally Sheet)", "lamp"), isiBagian(o.tallysheet), `</div>`);
    const cover = L.coverHtml({ jenis: "RENCANA PELAKSANAAN KEGIATAN", judul: judulLengkap, balai: P.balai, logo: window.PEH_DEFAULT_LOGO, nomorST: I.nomorST, periode: periodeTxt, kota: I.kota, bulanTahun: L.bulanTahun(I.tanggalRPK || I.mulai) });
    const kv = [["Judul", `Rencana Pelaksanaan Kegiatan ${judulLengkap}`], ["Waktu", periodeTxt || "……"], ["Lokasi", I.lokasi || "……"], ["Pelaksana", "Tim Pelaksana Kegiatan Balai Taman Nasional Tambora"], ["Jumlah Anggaran", L.rupiah(rab.total) || "Rp……"],
      ["Sumber Anggaran", `${I.sumberAnggaran || "……"}${I.akun ? `, Akun ${I.akun}` : ""}`], ["Disusun di", I.kota || "……"], ["Pada Tanggal", tgl || "……"], ["Oleh", koor.jabatan.replace(/,$/, "")]];
    const toc = [{ lv: 1, text: "LEMBAR PENGESAHAN" }, { lv: 1, text: "DAFTAR ISI" }, { lv: 1, text: "DAFTAR TABEL" }, ...N.toc];
    return `<section class="sec-cover">${cover}</section>\n<section class="sec-front">${L.pengesahanHtml(P, kv, ttd)}${L.tocHtml(toc, N.tables)}</section>\n<section class="sec-body">${body.join("\n")}</section>`;
  }
  const penutupRPK = (judul) => [`Demikian Rencana Pelaksanaan Kegiatan (RPK) ${judul} ini disusun sebagai acuan penyelenggaraan kegiatan sesuai dengan aturan, petunjuk pelaksanaan, dan petunjuk teknis yang telah ditetapkan untuk mencapai tujuan yang diharapkan.`, "Masukan dan saran dari semua pihak sangat kami harapkan untuk penyempurnaan Rencana Pelaksanaan Kegiatan (RPK) ini."].join("\n");

  // Tally sheet kosong dari kolom tabel data (untuk lampiran RPK)
  function tallysheet(N, tabel, baris = 12) {
    return tabel.map((tb) => {
      const kol = tb.kolom.filter((c) => !c.bukanTally);
      return N.cap(`Tally Sheet ${tb.judul}`) + `<table class="data tally"><thead><tr><th>No</th>${kol.map((c) => `<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${Array.from({ length: baris }, (_, i) => `<tr><td class="c">${i + 1}</td>${kol.map(() => "<td>&nbsp;</td>").join("")}</tr>`).join("")}</tbody></table>`;
    }).join("\n");
  }

  window.PEHDok = { dasar, jadwal, waktuTeks, lpk, rpk, ttdRPK, penutupRPK, tallysheet };
})();
