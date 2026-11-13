/*
 * Data contoh: LPK Monitoring Satwa Kunci Rusa Timor, Resor Doro Ncanga, SPTN Wilayah II Kempo/Pekat, 31 Juli sampai 4 Agustus 2023.
 * Perjumpaan langsung (jarak kontak, sudut, kiri/kanan, kelas umur, dan kelamin) dari Lampiran 2; panjang transek 1.600 m dan luas
 * areal studi 325 ha dari tabel perhitungan metode King. Koordinat dari tabel rekapitulasi perjumpaan (derajat menit diubah ke derajat
 * desimal). Kontak berisi dua individu dipasangkan dengan titik L2 berjumlah dua individu; dua kontak satu individu dipasangkan berurutan
 * dengan titik L1 dan L2 kedua. Tanda keberadaan di Wadu Brusu memakai koordinat tabel rinci (berjam). Panjang transek II tidak tercatat.
 * Hasil yang sama dengan LPK: kepadatan 0,033156 ind/ha (1 individu/30,16 ha), dugaan 11 individu di 325 ha, intensitas sampling 37,1%,
 * jejak kaki N = 5 dan Nh = 44, nisbah kelamin 1 : 3, kelas umur 0 : 0 : 4. LPK melaporkan ID 0,293 tanpa rincian hitungan; generator
 * menghitung ID per transek. Nama petugas tidak disalin.
 */
(function (root) {
  "use strict";
  const CONTOH = {
    nama: "Resor Doro Ncanga, Juli 2023 (LPK contoh)",
    identitas: {
      judul: "Monitoring Satwa Kunci Rusa Timor",
      lokasi: "Doro Sato'i, Doro Mbolo, dan Wadu Brusu, Wilayah Kerja Resor Doro Ncanga, SPTN Wilayah II Kempo/Pekat",
      resort: "Resor Doro Ncanga",
      sptn: "SPTN Wilayah II Kempo/Pekat",
      mulai: "2023-07-31",
      selesai: "2023-08-04",
      nomorST: "PT.1157/T.41/TU/DIPA/8/2023",
      kota: "Dompu",
      tanggalLaporan: "2023-08-18",
      sumberAnggaran: "DIPA BA. 29 Balai Taman Nasional Tambora Tahun Anggaran 2023, Akun 6741.REB.001.051.A.524111 (PNP)"
    },
    penandatangan: {
      kiri: { head: "Menyetujui", jabatan: "Pejabat Pembuat Komitmen,", nama: "", nip: "" },
      kanan: { head: "", jabatan: "Ketua Tim,", nama: "", nip: "" },
      bawah: { head: "Mengetahui", jabatan: "Kepala Balai,", nama: "", nip: "" }
    },
    rab: [
      { uraian: "Belanja Bahan: Alat dan Bahan", volume: "1", satuan: "KEG", harga: "2355000" },
      { uraian: "Belanja Bahan: Bahan Makanan Buruh (5 orang, 5 hari)", volume: "25", satuan: "OH", harga: "150000" },
      { uraian: "Belanja Barang Non Operasional Lainnya: Upah Buruh di Lapangan (5 orang, 5 hari)", volume: "25", satuan: "OH", harga: "100000" },
      { uraian: "Belanja Perjalanan Dinas Biasa: Uang Harian Petugas (5 orang, 5 hari)", volume: "25", satuan: "OH", harga: "180000" },
      { uraian: "Belanja Perjalanan Dinas Biasa: Bantuan Penginapan (5 orang, 4 hari)", volume: "20", satuan: "OH", harga: "150000" }
    ],
    param: { metodeKepadatan: "king", jarakKing: "tegak", ulangan: 1, luasArea: 325, aJejak: 0.05, metodeID: "unit" },
    data: {
      transek: [
        { kode: "I", area: "Pertengahan Doro Sato'i dan Doro Mbolo", panjang: 1600, luasSampel: 3.96, habitat: "Savana", x: "", y: "", keterangan: "Transek dengan perjumpaan langsung" },
        { kode: "II", area: "Wadu Brusu", panjang: "", luasSampel: 3.2, habitat: "Hutan sub pegunungan", x: "", y: "", keterangan: "Panjang transek tidak tercatat di LPK" }
      ],
      langsung: [
        { tanggal: "2023-08-01", waktu: "", transek: "I", ulangan: "Sore/malam", n: 2, jarak: 1360, sudut: 32, sisi: "Kanan", jantan: 0, betina: 2, anak: 0, muda: 0, dewasa: 2, aktivitas: "", x: 117.9943, y: -8.3212, keterangan: "Betina dewasa" },
        { tanggal: "2023-08-01", waktu: "", transek: "I", ulangan: "Sore/malam", n: 1, jarak: 300, sudut: 82, sisi: "Kanan", jantan: 0, betina: 1, anak: 0, muda: 0, dewasa: 1, aktivitas: "", x: 117.998967, y: -8.32045, keterangan: "Betina dewasa" },
        { tanggal: "2023-08-01", waktu: "", transek: "I", ulangan: "Sore/malam", n: 1, jarak: 140, sudut: 126, sisi: "Kiri", jantan: 1, betina: 0, anak: 0, muda: 0, dewasa: 1, aktivitas: "", x: 117.993883, y: -8.328617, keterangan: "Jantan dewasa" }
      ],
      tanda: [
        { tanggal: "2023-08-01", waktu: "", transek: "I", tipe: "Bekas makan", n: 1, fase: "", umur: "", habitat: "Savana", x: 117.998967, y: -8.32045, keterangan: "" },
        { tanggal: "2023-08-02", waktu: "", transek: "I", tipe: "Jejak kaki", n: 1, fase: "", umur: "Baru (≤ 1 minggu)", habitat: "Hutan musim", x: 117.99525, y: -8.331983, keterangan: "" },
        { tanggal: "2023-08-02", waktu: "", transek: "I", tipe: "Jejak kaki", n: 2, fase: "", umur: "Baru (≤ 1 minggu)", habitat: "Savana", x: 117.994417, y: -8.33065, keterangan: "" },
        { tanggal: "2023-08-02", waktu: "", transek: "I", tipe: "Bekas makan", n: 1, fase: "", umur: "", habitat: "Savana", x: 117.99455, y: -8.330717, keterangan: "" },
        { tanggal: "2023-08-02", waktu: "", transek: "I", tipe: "Bekas makan", n: 3, fase: "", umur: "", habitat: "Hutan musim", x: 117.994583, y: -8.333233, keterangan: "" },
        { tanggal: "2023-08-03", waktu: "11.25", transek: "II", tipe: "Jejak kaki", n: 1, fase: "", umur: "Baru (≤ 1 minggu)", habitat: "Ekoton savana dan hutan", x: 117.97605, y: -8.307467, keterangan: "Grid 1411" },
        { tanggal: "2023-08-03", waktu: "12.21", transek: "II", tipe: "Garukan ranggah", n: 2, fase: "", umur: "", habitat: "Hutan hujan tropis", x: 117.975033, y: -8.310533, keterangan: "Dekat tempat istirahat" }
      ],
      vegetasi: []
    },
    catatanLapangan: "Pengamatan pada malam pertama di jalur pertengahan Doro Sato'i dan Doro Mbolo menjumpai empat individu rusa dan suara rusa; pengamatan malam sulit didokumentasikan karena jarak yang jauh. Pagi berikutnya tidak ada perjumpaan langsung pada transek yang sama, sehingga tim menelusuri lereng dan lembah Doro Sato'i dan menjumpai jejak, bekas makan, dan feses. Pengamatan malam kedua di Doro Mbolo tidak menemukan tanda keberadaan karena lokasi terbakar. Di Wadu Brusu ditemukan bekas gesekan ranggah dan feses yang masih baru. Ketersediaan pakan cukup melimpah karena tumbuhan bawah masih hijau dan banyak rumput muda (trubus) setelah kebakaran."
  };
  if (typeof module !== "undefined" && module.exports) module.exports = CONTOH;
  else (root.PEH_CONTOH = root.PEH_CONTOH || {})["rusa-timor"] = CONTOH;
})(typeof window !== "undefined" ? window : globalThis);
