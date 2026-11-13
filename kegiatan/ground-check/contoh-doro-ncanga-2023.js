/*
 * Data contoh: LPK Ground Check Verifikasi Tutupan Lahan/Open Area dan Tipe Ekosistem, Resor Doro Ncanga dan Sanctuary Rusa,
 * SPTN Wilayah II Kempo/Pekat, 25 sampai 29 September 2023 (31 titik dari tabel lokasi dan tabel hasil ground check).
 * Kelas peta disalin dari kolom hasil interpretasi citra. Kelas lapangan disetarakan ke sistem kelas peta: hutan dataran rendah menjadi
 * Hutan, areal pertanian menjadi Pertanian lahan kering (berbeda dari kelas peta Lahan terbuka); uraian asli ada di kolom deskripsi.
 * Penyebab open area buatan diisi pertanian/perladangan sesuai uraian LPK (lahan jagung warga Dusun So Tompo). LPK tidak memuat tipe
 * ekosistem per titik, dan tabel analisis vegetasinya hanya berupa rekap per jenis tanpa data per petak, sehingga tabel vegetasi kosong.
 * Rekap sama dengan LPK: 15 titik non open area, 10 titik open area buatan, 6 titik open area alami. Nama petugas tidak disalin.
 */
(function (root) {
  "use strict";
  const CONTOH = {
    nama: "Resor Doro Ncanga, September 2023 (LPK contoh)",
    identitas: {
      judul: "Ground Check Verifikasi Tutupan Lahan/Open Area dan Tipe Ekosistem",
      lokasi: "Doro Tabe, Pintu Masuk 3 dan 4 PT SMS, dan Dusun So Tompo, Wilayah Kerja Resor Doro Ncanga, SPTN Wilayah II Kempo/Pekat",
      resort: "Resor Doro Ncanga",
      sptn: "SPTN Wilayah II Kempo/Pekat",
      mulai: "2023-09-25",
      selesai: "2023-09-29",
      nomorST: "PT.1609/T.41/TU/DIPA/9/2023",
      kota: "Dompu",
      tanggalLaporan: "",
      sumberAnggaran: "DIPA Balai Taman Nasional Tambora Tahun Anggaran 2023, Akun 6739.REA.001.051.B.524111 (RM)"
    },
    penandatangan: {
      kiri: { head: "Menyetujui", jabatan: "Pejabat Pembuat Komitmen,", nama: "", nip: "" },
      kanan: { head: "", jabatan: "Ketua Tim,", nama: "", nip: "" },
      bawah: { head: "Mengetahui", jabatan: "Kepala Balai,", nama: "", nip: "" }
    },
    rab: [
      { uraian: "Belanja Bahan: Alat dan Bahan", volume: "1", satuan: "KEG", harga: "2000000" },
      { uraian: "Belanja Bahan: Bahan Makan Buruh (5 orang, 5 hari)", volume: "25", satuan: "OH", harga: "55000" },
      { uraian: "Belanja Barang Non Operasional Lainnya: Upah Buruh di Lapangan (5 orang, 5 hari)", volume: "25", satuan: "OH", harga: "100000" },
      { uraian: "Belanja Perjalanan Dinas Biasa: Uang Harian Petugas (5 orang, 5 hari)", volume: "25", satuan: "OH", harga: "180000" },
      { uraian: "Belanja Perjalanan Dinas Biasa: Bantuan Penginapan (5 orang, 4 hari)", volume: "20", satuan: "OH", harga: "150000" }
    ],
    param: {},
    data: {
      titik: [
        {"kode": "R4-41", "tanggal": "", "lokasi": "Doro Tabe", "x": 118.069467, "y": -8.394707, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rimba", "keterangan": ""},
        {"kode": "R4-42", "tanggal": "", "lokasi": "Doro Tabe", "x": 118.06986, "y": -8.394095, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rimba", "keterangan": ""},
        {"kode": "R4-24", "tanggal": "", "lokasi": "Doro Tabe", "x": 118.062935, "y": -8.394912, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rimba", "keterangan": ""},
        {"kode": "R4-43", "tanggal": "", "lokasi": "Doro Tabe", "x": 118.06394, "y": -8.39425, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rimba", "keterangan": "Ditemukan sarang elang"},
        {"kode": "R4-44", "tanggal": "", "lokasi": "Doro Tabe", "x": 118.064578, "y": -8.394648, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rimba", "keterangan": ""},
        {"kode": "R4-19", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.940452, "y": -8.394653, "ketinggian": "", "peta": "Savana", "lapangan": "Savana", "rinci": "Savana", "openArea": "Open area alami", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-20", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.94501, "y": -8.39464, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-28", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.945112, "y": -8.390155, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-27", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.940777, "y": -8.390113, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-21", "tanggal": "", "lokasi": "Pintu Masuk 4 PT SMS", "x": 117.950023, "y": -8.394625, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-22", "tanggal": "", "lokasi": "Pintu Masuk 4 PT SMS", "x": 117.954287, "y": -8.394648, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-05", "tanggal": "", "lokasi": "So Tompo", "x": 118.126497, "y": -8.430047, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Khusus", "keterangan": ""},
        {"kode": "R4-09", "tanggal": "", "lokasi": "So Tompo", "x": 118.12686, "y": -8.42597, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-12", "tanggal": "", "lokasi": "So Tompo", "x": 118.130928, "y": -8.421437, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-11", "tanggal": "", "lokasi": "So Tompo", "x": 118.126633, "y": -8.421168, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-15", "tanggal": "", "lokasi": "So Tompo", "x": 118.131015, "y": -8.416845, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Pemanfaatan", "keterangan": ""},
        {"kode": "R4-01", "tanggal": "", "lokasi": "So Tompo", "x": 118.126663, "y": -8.434923, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Khusus", "keterangan": "Lahan akan ditanami jati dan jambu mete"},
        {"kode": "R4-18", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.95408, "y": -8.399126, "ketinggian": "", "peta": "Semak belukar", "lapangan": "Semak belukar", "rinci": "Semak belukar", "openArea": "Open area alami", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-16", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.95412, "y": -8.403713, "ketinggian": "", "peta": "Semak belukar", "lapangan": "Semak belukar", "rinci": "Semak belukar", "openArea": "Open area alami", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-17", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.949594, "y": -8.399256, "ketinggian": "", "peta": "Savana", "lapangan": "Savana", "rinci": "Savana", "openArea": "Open area alami", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-04", "tanggal": "", "lokasi": "So Tompo", "x": 118.122159, "y": -8.430394, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-08", "tanggal": "", "lokasi": "So Tompo", "x": 118.122259, "y": -8.425836, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-10", "tanggal": "", "lokasi": "So Tompo", "x": 118.122168, "y": -8.421397, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-13", "tanggal": "", "lokasi": "So Tompo", "x": 118.122299, "y": -8.416916, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Pemanfaatan", "keterangan": ""},
        {"kode": "R4-03", "tanggal": "", "lokasi": "So Tompo", "x": 118.117816, "y": -8.430369, "ketinggian": "", "peta": "Lahan terbuka", "lapangan": "Pertanian lahan kering", "rinci": "Areal pertanian", "openArea": "Open area buatan", "penyebab": "Pertanian/perladangan", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-38", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.931461, "y": -8.38116, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-39", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.93592, "y": -8.381248, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-40", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.931417, "y": -8.376665, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-07", "tanggal": "", "lokasi": "So Tompo", "x": 118.117699, "y": -8.425918, "ketinggian": "", "peta": "Semak belukar", "lapangan": "Semak belukar", "rinci": "Semak belukar", "openArea": "Open area alami", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Tradisional", "keterangan": ""},
        {"kode": "R4-35", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.930969, "y": -8.386303, "ketinggian": "", "peta": "Savana", "lapangan": "Savana", "rinci": "Savana", "openArea": "Open area alami", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""},
        {"kode": "R4-36", "tanggal": "", "lokasi": "Pintu Masuk 3 PT SMS", "x": 117.9359, "y": -8.385744, "ketinggian": "", "peta": "Hutan", "lapangan": "Hutan", "rinci": "Hutan dataran rendah", "openArea": "Non open area", "penyebab": "", "ekoPeta": "", "ekoLapangan": "", "zona": "Zona Rehabilitasi", "keterangan": ""}
      ],
      vegetasi: []
    },
    catatanLapangan: "Titik ground check ditentukan dari interpretasi citra Landsat dan SPOT rekaman tahun 2022 dan data tutupan lahan kawasan tahun 2021. Hampir semua titik di Dusun So Tompo sudah dibersihkan untuk ditanami jagung sehingga jarang ditemukan pohon. Titik di Pintu Masuk 3 PT SMS berdekatan dengan lahan perkebunan tebu yang dibatasi pagar kayu."
  };
  if (typeof module !== "undefined" && module.exports) module.exports = CONTOH;
  else (root.PEH_CONTOH = root.PEH_CONTOH || {})["ground-check"] = CONTOH;
})(typeof window !== "undefined" ? window : globalThis);
