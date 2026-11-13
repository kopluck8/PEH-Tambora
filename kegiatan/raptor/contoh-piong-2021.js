/*
 * Data contoh: LPK Identifikasi dan Inventarisasi Jenis serta Sebaran Raptor, Resort Piong, SPTN I Kore, 10–14 Juni 2021.
 * Diambil dari laporan (Tabel 2–5 dan Lampiran 2) dan template "Analisa data.xlsx".
 * Catatan: kode 23 plot di luar jalur pendakian tidak tercantum di laporan; hanya plot dengan perjumpaan yang dicatat.
 */
(function (root) {
  "use strict";
  const CONTOH = {
    nama: "Resort Piong, Juni 2021 (LPK contoh)",
    identitas: {
      judul: "Identifikasi dan Inventarisasi Jenis serta Sebaran Raptor",
      lokasi: "Wilayah Kerja Resort Piong, SPTN Wilayah I Kore",
      resort: "Resort Piong",
      sptn: "SPTN Wilayah I Kore",
      mulai: "2021-06-10",
      selesai: "2021-06-14",
      nomorST: "PT.657/T.41/TU/DIPA/6/2021",
      tanggalST: "2021-06-08",
      kota: "Dompu",
      tanggalLaporan: "2021-06-30",
      sumberAnggaran: "DIPA BA. 029 Balai Taman Nasional Tambora Tahun Anggaran 2021",
      nomorDipa: "DIPA-029.05.230645/2021",
      akun: "029.05.FF.5420.QMA.001.A.521211; 029.05.FF.5420.QMA.001.A.521219; 029.05.FF.5420.QMA.001.A.524111",
      lokasiPlot: "sepanjang jalur pendakian Piong dan jalan inspeksi yang masuk ke dalam kawasan TN Tambora"
    },
    penandatangan: {
      kiri: { head: "An. Kuasa Pengguna Anggaran", jabatan: "Pejabat Pembuat Komitmen,", nama: "", nip: "" },
      kanan: { head: "", jabatan: "Ketua Tim,", nama: "", nip: "" },
      bawah: { head: "Mengetahui: an. Kepala Balai TN Tambora", jabatan: "Kepala SPTN Wilayah I Kore,", nama: "", nip: "" }
    },
    plot: { n: 42, r: 500, pi: 3.14, keterangan: "19 plot di sepanjang jalur pendakian Piong (Zona Pemanfaatan) dan 23 plot di luar jalur pendakian (Zona Rehabilitasi dan Zona Rimba)" },
    opsi: { metodeID: "template", kriteriaH: "template" },
    tim: [
      { nama: "", nip: "", pangkat: "Penata Muda Tk. I / IIIb", jabatan: "PEH Pertama", peran: "Koordinator" },
      { nama: "", nip: "", pangkat: "Penata Muda Tk. I / IIIb", jabatan: "PEH Pertama", peran: "Anggota" },
      { nama: "", nip: "", pangkat: "Penata Muda / IIIa", jabatan: "PEH Pertama", peran: "Anggota" },
      { nama: "", nip: "", pangkat: "Penata Muda / IIIa", jabatan: "PEH Pertama", peran: "Anggota" },
      { nama: "", nip: "", pangkat: "-", jabatan: "Staf Balai TN Tambora", peran: "Anggota" },
      { nama: "", nip: "", pangkat: "-", jabatan: "Staf Balai TN Tambora", peran: "Anggota" }
    ],
    alat: [
      { nama: "GPS", jumlah: "1", satuan: "unit" },
      { nama: "Kamera DSLR Canon 80D, lensa 18-200 mm", jumlah: "1", satuan: "unit" },
      { nama: "Kamera DSLR Canon 800D, lensa 100-400 mm", jumlah: "1", satuan: "unit" },
      { nama: "Kamera Nikon P1000", jumlah: "1", satuan: "unit" },
      { nama: "Tallysheet", jumlah: "1", satuan: "set" },
      { nama: "Binokuler", jumlah: "1", satuan: "unit" },
      { nama: "Monokuler", jumlah: "1", satuan: "unit" },
      { nama: "Alat tulis", jumlah: "1", satuan: "set" },
      { nama: "Perlengkapan lapangan (tenda, matras, sleeping bag, dll.)", jumlah: "1", satuan: "set" },
      { nama: "Peta kerja Resort Piong", jumlah: "1", satuan: "lembar" },
      { nama: "Buku Burung Lombok dan Sumbawa", jumlah: "1", satuan: "buah" }
    ],
    rab: [
      { uraian: "Belanja Bahan: Alat dan Bahan", volume: "1", satuan: "KEG", harga: "4250000" },
      { uraian: "Belanja Bahan: Penggandaan Laporan", volume: "2", satuan: "EKSP", harga: "50000" },
      { uraian: "Belanja Bahan: Bahan Makanan Buruh (5 org, 5 hari)", volume: "25", satuan: "OH", harga: "55000" },
      { uraian: "Belanja Bahan: Perlengkapan Tim", volume: "6", satuan: "ORG", harga: "200000" },
      { uraian: "Belanja Barang Non Operasional Lainnya: Upah Buruh di Lapangan (5 org, 5 hari)", volume: "25", satuan: "OH", harga: "100000" },
      { uraian: "Belanja Perjalanan Dinas Biasa: Uang Harian Petugas (6 org, 5 hari)", volume: "30", satuan: "OH", harga: "180000" },
      { uraian: "Belanja Perjalanan Dinas Biasa: Bantuan Penginapan (6 org, 4 hari)", volume: "24", satuan: "OH", harga: "150000" }
    ],
    // Urutan baris tabel analisis seperti di template
    urutanJenis: [
      { jenis: "Elang Ular Jari Pendek", latin: "Circaetus gallicus" },
      { jenis: "Elang Bonelli", latin: "Hieraaetus fasciatus" },
      { jenis: "Alap-alap sapi", latin: "Falco moluccensis" },
      { jenis: "Sikep madu asia", latin: "Pernis ptilorhyncus" },
      { jenis: "Elang tikus", latin: "Elanus caeruleus" },
      { jenis: "Elang bondol", latin: "Haliastur indus" }
    ],
    // Lampiran 2 LPK (rekapitulasi data perjumpaan); ketinggian dari uraian hasil
    perjumpaan: [
      { tanggal: "", waktu: "10.23", plot: "JP02", jenis: "Alap-alap sapi", latin: "Falco moluccensis", dewasa: 2, anakan: 0, jantan: 1, betina: 1, jarak: 300, azimuth: 107, aktivitas: "Soaring", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Savana", ketinggian: 250, keterangan: "Diduga sepasang (jantan dan betina)" },
      { tanggal: "", waktu: "10.55", plot: "JP04", jenis: "Elang Ular Jari Pendek", latin: "Circaetus gallicus", dewasa: 1, anakan: 0, jarak: 450, azimuth: 175, aktivitas: "Soaring", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Savana", ketinggian: 353, keterangan: "" },
      { tanggal: "", waktu: "08.11", plot: "JP17", jenis: "Elang Bonelli", latin: "Hieraaetus fasciatus", dewasa: 1, anakan: 0, jarak: 450, azimuth: 340, aktivitas: "Soaring", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Savana", ketinggian: 1896, keterangan: "Di bawah Pos 5 Jalur Pendakian Piong" },
      { tanggal: "", waktu: "10.52", plot: "JP19", jenis: "Alap-alap sapi", latin: "Falco moluccensis", dewasa: 2, anakan: 0, jarak: 450, azimuth: 165, aktivitas: "Soaring", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Savana", ketinggian: 2160, keterangan: "Sepasang" },
      { tanggal: "", waktu: "13.54", plot: "JP19", jenis: "Elang tikus", latin: "Elanus caeruleus", dewasa: 1, anakan: 0, jarak: 200, azimuth: 311, aktivitas: "Soaring", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Savana", ketinggian: 2000, keterangan: "Teramati hovering" },
      { tanggal: "", waktu: "11.10", plot: "JP19", jenis: "Sikep madu asia", latin: "Pernis ptilorhyncus", dewasa: 1, anakan: 0, jarak: 420, azimuth: 238, aktivitas: "Soaring", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Savana", ketinggian: 2000, keterangan: "" },
      { tanggal: "", waktu: "10.45", plot: "DO03", jenis: "Elang bondol", latin: "Haliastur indus", dewasa: 1, anakan: 0, jarak: 280, azimuth: 200, aktivitas: "Bertengger kemudian terbang", ruang: "Top", tipeRuang: "Terbuka", tutupan: "Kebun masyarakat", ketinggian: 165, keterangan: "Bertengger di pohon kering ±20 m" }
    ],
    satwaLain: "Tiong Lampu Biasa (Eurystomus orientalis), Pergam Punggung Hitam (Ducula lacernulata), Kirik-kirik Laut (Merops philippinus), Cekakak Sungai (Todiramphus chloris), Kekep Babi (Artamus leucorynchus), Delimukan Zamrud (Chalcophaps indica), Walet (Collocalia vestita), dan Sriti (Collocalia esculenta)",
    catatanLapangan: "Perjumpaan dominan terjadi pada siang hari (08.11–13.54 WITA) dalam kondisi cuaca cerah, saat raptor terbang atau soaring. Dua individu lain teramati di luar plot pengamatan (JP17 ±1.500 m dan DO04 ±2.000 m) sehingga tidak dimasukkan dalam analisis."
  };
  if (typeof module !== "undefined" && module.exports) module.exports = CONTOH;
  else (root.PEH_CONTOH = root.PEH_CONTOH || {}).raptor = CONTOH;
})(typeof window !== "undefined" ? window : globalThis);
