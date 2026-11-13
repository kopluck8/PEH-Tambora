# Spesifikasi Data Model SMART: Metode Teknis

Dibuat otomatis oleh `tools/build_datamodel.py` dari `datamodel/metode-teknis.json`. Versi 0.2.0.

## Pohon kategori (Observation)

- **Metode Teknis** (level 0) `metodeteknis.`: Kategori level 0 untuk seluruh metode kegiatan teknis jabatan PEH. Setiap metode menjadi satu kategori level 1.
  - **Inventarisasi dan Sebaran Raptor** (level 1) `metodeteknis.inventarisasiraptor.`: Metode point count (plot lingkaran). Template analisis: Analisa data.xlsx; contoh LPK: Resort Piong, Juni 2021. Generator: RAPTOR.
    - **Titik Pengamatan (Plot Point Count)** (level 2) `metodeteknis.inventarisasiraptor.titikpengamatan.`: Dicatat sekali di pusat setiap plot, termasuk plot tanpa perjumpaan. Jumlah titik = jumlah plot (n).
    - **Perjumpaan Raptor** (level 2) `metodeteknis.inventarisasiraptor.perjumpaanraptor.`: Satu observasi per jenis per perjumpaan. Waktu perjumpaan diambil dari waktu waypoint.
  - **Monitoring Elang Flores** (level 1) `metodeteknis.monitoringelangflores.`: Point count di sepanjang jalur pengamatan, pohon sarang, dan vegetasi habitat. Generator: ELFLO.
    - **Titik Pengamatan** (level 2) `metodeteknis.monitoringelangflores.titikpengamatan.`: Dicatat sekali di setiap titik, termasuk titik tanpa perjumpaan.
    - **Perjumpaan Satwa** (level 2) `metodeteknis.monitoringelangflores.perjumpaansatwa.`: Satu observasi per jenis per perjumpaan, termasuk jenis burung lain yang dijumpai di titik pengamatan.
    - **Pohon Sarang** (level 2) `metodeteknis.monitoringelangflores.pohonsarang.`
    - **Vegetasi** (level 2) `metodeteknis.monitoringelangflores.vegetasi.`: Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah).
  - **Monitoring Rusa Timor** (level 1) `metodeteknis.monitoringrusatimor.`: Transek garis dengan perjumpaan langsung dan tanda keberadaan. Generator: RUSA.
    - **Transek** (level 2) `metodeteknis.monitoringrusatimor.transek.`: Dicatat sekali di awal setiap transek.
    - **Perjumpaan Langsung** (level 2) `metodeteknis.monitoringrusatimor.perjumpaanlangsung.`: Satu observasi untuk satu kontak (individu atau kelompok). Ulangan pagi atau sore dibaca dari jam waypoint.
    - **Tanda Keberadaan** (level 2) `metodeteknis.monitoringrusatimor.tandakeberadaan.`: Jumlah berisi pasangan jejak kaki, onggokan kotoran, atau banyaknya tanda.
    - **Vegetasi** (level 2) `metodeteknis.monitoringrusatimor.vegetasi.`: Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah).
  - **Ground Check Tutupan Lahan dan Tipe Ekosistem** (level 1) `metodeteknis.groundchecktutupanlahan.`: Verifikasi peta tutupan lahan, open area, dan tipe ekosistem. Aplikasi juga membaca kategori Ground Check > Tutupan Lahan dan Ground Check > Tipe Ekosistem yang sudah ada. Generator: GC.
    - **Titik Ground Check** (level 2) `metodeteknis.groundchecktutupanlahan.titikgroundcheck.`: Keterangan diisi deskripsi tutupan lahan di lapangan.
    - **Vegetasi** (level 2) `metodeteknis.groundchecktutupanlahan.vegetasi.`: Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah). Atribut noplot diisi ID titik ground check.
  - **Identifikasi Anggrek** (level 1) `metodeteknis.identifikasianggrek.`: Jalur dan plot pengamatan anggrek epifit, terestrial, dan litofit. Generator: ANGGREK.
    - **Plot Pengamatan** (level 2) `metodeteknis.identifikasianggrek.plotpengamatan.`
    - **Temuan Anggrek** (level 2) `metodeteknis.identifikasianggrek.temuananggrek.`: Satu observasi untuk satu jenis pada satu plot. Jumlah berisi individu atau rumpun.
  - **Inventarisasi Jenis Asing Invasif** (level 1) `metodeteknis.inventarisasijenisinvasif.`: Petak contoh di lokasi rawan invasi dan penilaian keinvasifan jenis. Generator: IAS.
    - **Petak Contoh** (level 2) `metodeteknis.inventarisasijenisinvasif.petakcontoh.`
    - **Vegetasi** (level 2) `metodeteknis.inventarisasijenisinvasif.vegetasi.`: Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah).
    - **Penilaian Keinvasifan** (level 2) `metodeteknis.inventarisasijenisinvasif.keinvasifan.`: Satu observasi untuk satu jenis invasif.
  - **Inventarisasi Burung** (level 1) `metodeteknis.inventarisasiburung.`: Point count atau transek untuk keanekaragaman jenis burung. Generator: BURUNG.
    - **Titik Pengamatan** (level 2) `metodeteknis.inventarisasiburung.titikpengamatan.`: Dicatat sekali di setiap titik, termasuk titik tanpa perjumpaan.
    - **Perjumpaan Burung** (level 2) `metodeteknis.inventarisasiburung.perjumpaanburung.`: Satu observasi per jenis per perjumpaan.
  - **Inventarisasi Tumbuhan Penting** (level 1) `metodeteknis.inventarisasitumbuhanpenting.`: Analisis vegetasi dan status jenis tumbuhan penting. Generator: TUMPEN.
    - **Petak Contoh** (level 2) `metodeteknis.inventarisasitumbuhanpenting.petakcontoh.`
    - **Vegetasi** (level 2) `metodeteknis.inventarisasitumbuhanpenting.vegetasi.`: Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah).
    - **Status Jenis** (level 2) `metodeteknis.inventarisasitumbuhanpenting.statusjenis.`: Satu observasi untuk satu jenis penting. Status yang kosong dilengkapi aplikasi dari daftar jenis TN Tambora.
  - **Monitoring Satwa Kunci** (level 1) `metodeteknis.monitoringsatwakunci.`: Penyusuran jalur purposif untuk perjumpaan langsung dan tanda keberadaan satwa kunci. Generator: SATKUN.
    - **Jalur Pengamatan** (level 2) `metodeteknis.monitoringsatwakunci.jalurpengamatan.`: Dicatat sekali di awal setiap jalur.
    - **Temuan Satwa** (level 2) `metodeteknis.monitoringsatwakunci.temuansatwa.`: Satu observasi untuk satu temuan. Perjumpaan langsung: jumlah individu. Tanda: banyaknya tanda dan perkiraan individu.
  - **Kajian Lokasi Pelepasliaran Satwa** (level 1) `metodeteknis.kajianpelepasliaran.`: Komunitas burung, fungsi pohon, dan kesesuaian lokasi pelepasliaran. Generator: LEPAS.
    - **Lokasi Pengamatan** (level 2) `metodeteknis.kajianpelepasliaran.lokasipengamatan.`
    - **Perjumpaan Burung** (level 2) `metodeteknis.kajianpelepasliaran.perjumpaanburung.`: Satu observasi per jenis per perjumpaan. Daftar MacKinnon: nomor daftar tempat jenis dicatat.
    - **Fungsi Pohon** (level 2) `metodeteknis.kajianpelepasliaran.fungsipohon.`: Satu observasi untuk satu jenis pohon (Handayani, 2015).
  - **Pengukuran Stok Karbon** (level 1) `metodeteknis.stokkarbon.`: Plot ukur bersarang untuk tegakan, serasah, kayu mati, dan tanah (SNI 7724:2019). Generator: KARBON.
    - **Plot Ukur** (level 2) `metodeteknis.stokkarbon.plotukur.`: Dicatat sekali di pusat setiap plot.
    - **Tegakan** (level 2) `metodeteknis.stokkarbon.tegakan.`: Satu observasi untuk satu batang pancang, tiang, atau pohon.
    - **Serasah, Nekromas, dan Tumbuhan Bawah** (level 2) `metodeteknis.stokkarbon.serasah.`: Berat kering dan kadar karbon diisi di aplikasi setelah analisis laboratorium.
    - **Kayu Mati** (level 2) `metodeteknis.stokkarbon.kayumati.`: Satu observasi untuk satu potongan kayu mati yang menyentuh garis kuadran.
    - **Contoh Tanah** (level 2) `metodeteknis.stokkarbon.contohtanah.`
  - **Rekap Perjumpaan Elang Flores** (level 1) `metodeteknis.rekapelangflores.`: Catatan perjumpaan dan sarang elang flores di luar kegiatan monitoring. Aplikasi juga membaca Satwa Liar, Monitoring Elang Flores, Inventarisasi Raptor, dan Monitoring Satwa Kunci. Generator: REKAP.
    - **Perjumpaan** (level 2) `metodeteknis.rekapelangflores.perjumpaan.`: Satu observasi untuk satu perjumpaan.
    - **Sarang** (level 2) `metodeteknis.rekapelangflores.sarang.`
  - **Sebaran Pohon Sarang Uma Ani** (level 1) `metodeteknis.sebaranumaani.`: Jenis, jumlah, dan sebaran pohon sarang lebah madu hutan (Apis dorsata). Generator: UMAANI.
    - **Pohon Sarang** (level 2) `metodeteknis.sebaranumaani.pohonsarang.`: Satu observasi untuk satu pohon. Pohon dari survei sebelumnya yang tidak lagi bersarang tetap dicatat dengan jumlah sarang 0.
    - **Vegetasi** (level 2) `metodeteknis.sebaranumaani.vegetasi.`: Petak lingkaran di sekitar pohon sarang. Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah).
  - **Verifikasi Kehati Tinggi** (level 1) `metodeteknis.verifikasikehatitinggi.`: Verifikasi grid areal bernilai keanekaragaman hayati tinggi. Aplikasi juga membaca Ground Check > Tipe Ekosistem dan Satwa Liar. Generator: KEHATI.
    - **Titik Grid** (level 2) `metodeteknis.verifikasikehatitinggi.titikgrid.`: Dicatat sekali di titik pengamatan setiap grid.
    - **Vegetasi** (level 2) `metodeteknis.verifikasikehatitinggi.vegetasi.`: Petak contoh bersarang. Satu observasi untuk satu individu (tiang, pohon), atau satu jenis per petak dengan atribut jumlah (semai, pancang, tumbuhan bawah). Kode petak sebaiknya diawali kode grid, misalnya 288-1.
    - **Perjumpaan Satwa** (level 2) `metodeteknis.verifikasikehatitinggi.perjumpaansatwa.`: Satu observasi untuk satu perjumpaan langsung atau tanda keberadaan.

## Atribut per kategori

### Titik Pengamatan (Plot Point Count) `metodeteknis.inventarisasiraptor.titikpengamatan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `jarijariplotm` | Jari-jari plot (m) | NUMERIC | ya | **baru** |
| 3 | `jalurpengamatan` | Jalur pengamatan | LIST |  | **baru** |
| 4 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 5 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 6 | `cuaca` | Cuaca | LIST |  | sudah ada, dipakai ulang |
| 7 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Perjumpaan Raptor `metodeteknis.inventarisasiraptor.perjumpaanraptor.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 3 | `jumlahdewasa` | Jumlah dewasa | NUMERIC | ya | **baru** |
| 4 | `jumlahanakan` | Jumlah anak/remaja | NUMERIC |  | **baru** |
| 5 | `jumlahjantan` | Jumlah jantan | NUMERIC |  | sudah ada, dipakai ulang |
| 6 | `jumlahbetina` | Jumlah betina | NUMERIC |  | sudah ada, dipakai ulang |
| 7 | `jarakkesatwam` | Jarak ke satwa (m) | NUMERIC | ya | sudah ada, dipakai ulang |
| 8 | `azimuth` | Azimuth (derajat) | NUMERIC |  | sudah ada, dipakai ulang |
| 9 | `jenisperjumpaan` | Jenis perjumpaan | LIST |  | sudah ada, dipakai ulang |
| 10 | `aktivitasraptor` | Aktivitas raptor | LIST |  | **baru** |
| 11 | `penggunaanruang` | Penggunaan ruang | LIST |  | **baru** |
| 12 | `tiperuang` | Tipe ruang | LIST |  | **baru** |
| 13 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 14 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 15 | `sarangditemukan` | Sarang ditemukan | BOOLEAN |  | **baru** |
| 16 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Titik Pengamatan `metodeteknis.monitoringelangflores.titikpengamatan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 3 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 4 | `jaraksarangm` | Jarak ke sarang (m) | NUMERIC |  | **baru** |
| 5 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Perjumpaan Satwa `metodeteknis.monitoringelangflores.perjumpaansatwa.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 3 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 4 | `jumlahdewasa` | Jumlah dewasa | NUMERIC |  | **baru** |
| 5 | `jumlahanakan` | Jumlah anak/remaja | NUMERIC |  | **baru** |
| 6 | `jumlahjantan` | Jumlah jantan | NUMERIC |  | sudah ada, dipakai ulang |
| 7 | `jumlahbetina` | Jumlah betina | NUMERIC |  | sudah ada, dipakai ulang |
| 8 | `jarakkesatwam` | Jarak ke satwa (m) | NUMERIC |  | sudah ada, dipakai ulang |
| 9 | `azimuth` | Azimuth (derajat) | NUMERIC |  | sudah ada, dipakai ulang |
| 10 | `aktivitasraptor` | Aktivitas raptor | LIST |  | **baru** |
| 11 | `stratatajuk` | Strata penggunaan ruang | LIST |  | **baru** |
| 12 | `tiperuang` | Tipe ruang | LIST |  | **baru** |
| 13 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Pohon Sarang `metodeteknis.monitoringelangflores.pohonsarang.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `kodesarang` | Kode sarang | TEXT | ya | **baru** |
| 2 | `jenistumbuhan` | Jenis tumbuhan | TREE |  | sudah ada, dipakai ulang |
| 3 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 4 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 5 | `tinggisarangm` | Tinggi sarang (m) | NUMERIC |  | **baru** |
| 6 | `kondisisarang` | Kondisi sarang | LIST |  | **baru** |
| 7 | `jaraksumberairm` | Jarak ke sumber air (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.monitoringelangflores.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 3 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 7 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Transek `metodeteknis.monitoringrusatimor.transek.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `panjangtransekm` | Panjang transek (m) | NUMERIC | ya | **baru** |
| 4 | `luasha` | Luas area sampel (ha) | NUMERIC |  | **baru** |
| 5 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 6 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Perjumpaan Langsung `metodeteknis.monitoringrusatimor.perjumpaanlangsung.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `jumlah` | Jumlah | NUMERIC | ya | sudah ada, dipakai ulang |
| 3 | `jarakkesatwam` | Jarak ke satwa (m) | NUMERIC | ya | sudah ada, dipakai ulang |
| 4 | `sudutkontak` | Sudut kontak (derajat) | NUMERIC | ya | **baru** |
| 5 | `sisitransek` | Sisi transek | LIST |  | **baru** |
| 6 | `jumlahjantan` | Jumlah jantan | NUMERIC |  | sudah ada, dipakai ulang |
| 7 | `jumlahbetina` | Jumlah betina | NUMERIC |  | sudah ada, dipakai ulang |
| 8 | `jumlahdewasa` | Jumlah dewasa | NUMERIC |  | **baru** |
| 9 | `jumlahmuda` | Jumlah muda | NUMERIC |  | **baru** |
| 10 | `jumlahanakan` | Jumlah anak/remaja | NUMERIC |  | **baru** |
| 11 | `aktivitassatwa` | Aktivitas satwa | LIST |  | **baru** |
| 12 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Tanda Keberadaan `metodeteknis.monitoringrusatimor.tandakeberadaan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `tandakeberadaan` | Tanda keberadaan | LIST | ya | **baru** |
| 3 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 4 | `fasefeses` | Fase kotoran | LIST |  | **baru** |
| 5 | `usiatemuan` | Usia temuan | LIST |  | sudah ada, dipakai ulang |
| 6 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 7 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.monitoringrusatimor.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 3 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 7 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Titik Ground Check `metodeteknis.groundchecktutupanlahan.titikgroundcheck.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 4 | `tutupanlahanpeta` | Tutupan lahan (peta) | LIST |  | **baru** |
| 5 | `tutupanlahanlapangan` | Tutupan lahan (lapangan) | LIST | ya | **baru** |
| 6 | `statusopenarea` | Status open area | LIST | ya | **baru** |
| 7 | `penyebabopenarea` | Penyebab open area | LIST |  | **baru** |
| 8 | `tipeekosistempeta` | Tipe ekosistem (peta) | LIST |  | **baru** |
| 9 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 10 | `zonasikawasan` | Zona | LIST |  | **baru** |
| 11 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.groundchecktutupanlahan.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 3 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 7 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Plot Pengamatan `metodeteknis.identifikasianggrek.plotpengamatan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `notransek` | No. transek/jalur | TEXT |  | **baru** |
| 3 | `kodegrid` | Kode grid | TEXT |  | **baru** |
| 4 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 5 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 6 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Temuan Anggrek `metodeteknis.identifikasianggrek.temuananggrek.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 3 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 4 | `carahidup` | Cara hidup | LIST |  | **baru** |
| 5 | `pohoninang` | Pohon inang | TEXT |  | **baru** |
| 6 | `tinggitempelm` | Tinggi tempel (m) | NUMERIC |  | **baru** |
| 7 | `fenologi` | Fenologi | LIST |  | **baru** |
| 8 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 9 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Petak Contoh `metodeteknis.inventarisasijenisinvasif.petakcontoh.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `kodegrid` | Kode grid | TEXT |  | **baru** |
| 3 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 4 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 5 | `lokasisasaran` | Lokasi sasaran | LIST |  | **baru** |
| 6 | `zonasikawasan` | Zona | LIST |  | **baru** |
| 7 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.inventarisasijenisinvasif.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 3 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 7 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |
| 9 | `jenisinvasif` | Jenis invasif | BOOLEAN |  | **baru** |

### Penilaian Keinvasifan `metodeteknis.inventarisasijenisinvasif.keinvasifan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 2 | `kemampuanmapan` | Kemampuan mapan | LIST |  | **baru** |
| 3 | `ketahananpengelolaan` | Ketahanan terhadap pengelolaan | LIST |  | **baru** |
| 4 | `periodeberbuah` | Periode berbuah | LIST |  | **baru** |
| 5 | `produksibiji` | Produksi biji | LIST |  | **baru** |
| 6 | `reproduksivegetatif` | Reproduksi vegetatif | LIST |  | **baru** |
| 7 | `sebaranburung` | Disebarkan burung | LIST |  | **baru** |
| 8 | `sebaranhewan` | Disebarkan hewan lain | LIST |  | **baru** |
| 9 | `sebaranair` | Disebarkan air | LIST |  | **baru** |
| 10 | `sebaranangin` | Disebarkan angin | LIST |  | **baru** |
| 11 | `sebaransengaja` | Disebarkan manusia dengan sengaja | LIST |  | **baru** |
| 12 | `sebarantanpasengaja` | Disebarkan manusia tanpa sengaja | LIST |  | **baru** |
| 13 | `sebarankontaminasi` | Mengontaminasi hasil bumi | LIST |  | **baru** |
| 14 | `sebaranternak` | Dibawa hewan ternak | LIST |  | **baru** |
| 15 | `asal` | Asal | TEXT |  | sudah ada, dipakai ulang |
| 16 | `acuaninvasif` | Acuan status invasif | TEXT |  | **baru** |
| 17 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Titik Pengamatan `metodeteknis.inventarisasiburung.titikpengamatan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 3 | `tipetutupanlahan` | Tipe tutupan lahan | LIST |  | **baru** |
| 4 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Perjumpaan Burung `metodeteknis.inventarisasiburung.perjumpaanburung.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 3 | `jumlah` | Jumlah | NUMERIC | ya | sudah ada, dipakai ulang |
| 4 | `jarakkesatwam` | Jarak ke satwa (m) | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `azimuth` | Azimuth (derajat) | NUMERIC |  | sudah ada, dipakai ulang |
| 6 | `aktivitassatwa` | Aktivitas satwa | LIST |  | **baru** |
| 7 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Petak Contoh `metodeteknis.inventarisasitumbuhanpenting.petakcontoh.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `notransek` | No. transek/jalur | TEXT |  | **baru** |
| 3 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 4 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 5 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.inventarisasitumbuhanpenting.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 3 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 7 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Status Jenis `metodeteknis.inventarisasitumbuhanpenting.statusjenis.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 2 | `statusiucn` | Status IUCN | LIST |  | **baru** |
| 3 | `status` | Status | LIST |  | sudah ada, dipakai ulang |
| 4 | `statuscites` | Status CITES | LIST |  | **baru** |
| 5 | `endemisitas` | Endemisitas | LIST |  | **baru** |
| 6 | `kategorimanfaat` | Kategori manfaat | LIST |  | **baru** |
| 7 | `nilaiekonomi` | Nilai ekonomi atau manfaat | TEXT |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Jalur Pengamatan `metodeteknis.monitoringsatwakunci.jalurpengamatan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `panjangtransekm` | Panjang transek (m) | NUMERIC |  | **baru** |
| 4 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 5 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Temuan Satwa `metodeteknis.monitoringsatwakunci.temuansatwa.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 3 | `tandakeberadaan` | Tanda keberadaan | LIST | ya | **baru** |
| 4 | `jenisperjumpaan` | Jenis perjumpaan | LIST |  | sudah ada, dipakai ulang |
| 5 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 6 | `perkiraanindividu` | Perkiraan jumlah individu | NUMERIC |  | **baru** |
| 7 | `jarakkesatwam` | Jarak ke satwa (m) | NUMERIC |  | sudah ada, dipakai ulang |
| 8 | `jumlahjantan` | Jumlah jantan | NUMERIC |  | sudah ada, dipakai ulang |
| 9 | `jumlahbetina` | Jumlah betina | NUMERIC |  | sudah ada, dipakai ulang |
| 10 | `jumlahdewasa` | Jumlah dewasa | NUMERIC |  | **baru** |
| 11 | `jumlahmuda` | Jumlah muda | NUMERIC |  | **baru** |
| 12 | `jumlahanakan` | Jumlah anak/remaja | NUMERIC |  | **baru** |
| 13 | `usiatemuan` | Usia temuan | LIST |  | sudah ada, dipakai ulang |
| 14 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 15 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 16 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Lokasi Pengamatan `metodeteknis.kajianpelepasliaran.lokasipengamatan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 4 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 5 | `tipehabitat` | Tipe habitat | LIST |  | **baru** |
| 6 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Perjumpaan Burung `metodeteknis.kajianpelepasliaran.perjumpaanburung.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `daftarmackinnon` | Daftar MacKinnon ke- | NUMERIC |  | **baru** |
| 3 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `jarakkesatwam` | Jarak ke satwa (m) | NUMERIC |  | sudah ada, dipakai ulang |
| 6 | `guildburung` | Guild pakan | LIST |  | **baru** |
| 7 | `aktivitassatwa` | Aktivitas satwa | LIST |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Fungsi Pohon `metodeteknis.kajianpelepasliaran.fungsipohon.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT |  | sudah ada, dipakai ulang |
| 2 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 3 | `nektarbunga` | Nektar bunga | LIST |  | **baru** |
| 4 | `mahkotabunga` | Mahkota bunga | LIST |  | **baru** |
| 5 | `ukuranbunga` | Ukuran bunga | LIST |  | **baru** |
| 6 | `lapisanluarbuah` | Lapisan luar buah berdaging | LIST |  | **baru** |
| 7 | `lapisanbuah` | Lapisan buah berdaging | LIST |  | **baru** |
| 8 | `ukuranbuah` | Ukuran buah berdaging | LIST |  | **baru** |
| 9 | `lapisankulitbiji` | Lapisan kulit buah kering | LIST |  | **baru** |
| 10 | `ukuranbiji` | Ukuran biji | LIST |  | **baru** |
| 11 | `lokasibiji` | Lokasi biji | LIST |  | **baru** |
| 12 | `bentuktajuk` | Bentuk tajuk | LIST |  | **baru** |
| 13 | `bentukpercabangan` | Bentuk percabangan | LIST |  | **baru** |
| 14 | `ukurandaun` | Ukuran daun | LIST |  | **baru** |
| 15 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Plot Ukur `metodeteknis.stokkarbon.plotukur.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 3 | `tipeekosistem` | Tipe ekosistem | LIST |  | **baru** |
| 4 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 5 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 6 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Tegakan `metodeteknis.stokkarbon.tegakan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 3 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 4 | `jenistumbuhan` | Jenis tumbuhan | TREE |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC | ya | **baru** |
| 6 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 7 | `jarijariplotm` | Jari-jari plot (m) | NUMERIC |  | **baru** |
| 8 | `pohonmati` | Pohon mati berdiri | BOOLEAN |  | **baru** |

### Serasah, Nekromas, dan Tumbuhan Bawah `metodeteknis.stokkarbon.serasah.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 3 | `komponenserasah` | Komponen | LIST | ya | **baru** |
| 4 | `kodesampel` | Kode sampel | TEXT |  | **baru** |
| 5 | `beratbasahtotalg` | Berat basah total (g) | NUMERIC | ya | **baru** |
| 6 | `beratbasahsampelg` | Berat basah sampel (g) | NUMERIC |  | **baru** |

### Kayu Mati `metodeteknis.stokkarbon.kayumati.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 3 | `kuadran` | Kuadran | LIST |  | **baru** |
| 4 | `kelasdiameter` | Kelas diameter | LIST | ya | **baru** |
| 5 | `kodesampel` | Kode sampel | TEXT |  | **baru** |
| 6 | `diametercm` | Diameter (cm) | NUMERIC |  | **baru** |
| 7 | `panjangtransekm` | Panjang transek (m) | NUMERIC |  | **baru** |

### Contoh Tanah `metodeteknis.stokkarbon.contohtanah.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `notransek` | No. transek/jalur | TEXT | ya | **baru** |
| 2 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 3 | `lapisantanah` | Lapisan tanah (cm) | LIST | ya | **baru** |
| 4 | `kodesampel` | Kode sampel | TEXT |  | **baru** |
| 5 | `kedalamancm` | Kedalaman (cm) | NUMERIC |  | **baru** |
| 6 | `volumetanahcm3` | Volume tanah (cm³) | NUMERIC |  | **baru** |

### Perjumpaan `metodeteknis.rekapelangflores.perjumpaan.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 2 | `tipecatatan` | Tipe catatan | LIST |  | **baru** |
| 3 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 4 | `aktivitasraptor` | Aktivitas raptor | LIST |  | **baru** |
| 5 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 6 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 7 | `sumberdata` | Sumber data | LIST |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Sarang `metodeteknis.rekapelangflores.sarang.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `kodesarang` | Kode sarang | TEXT | ya | **baru** |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 4 | `jenistumbuhan` | Jenis tumbuhan | TREE |  | sudah ada, dipakai ulang |
| 5 | `kondisisarang` | Kondisi sarang | LIST |  | **baru** |
| 6 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Pohon Sarang `metodeteknis.sebaranumaani.pohonsarang.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `kodepohon` | Kode pohon | TEXT | ya | **baru** |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 4 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 7 | `jumlahsarang` | Jumlah sarang | NUMERIC | ya | **baru** |
| 8 | `tinggisarangm` | Tinggi sarang (m) | NUMERIC |  | **baru** |
| 9 | `jaraksumberairm` | Jarak ke sumber air (m) | NUMERIC |  | **baru** |
| 10 | `jumlahsaranglalu` | Jumlah sarang survei sebelumnya | NUMERIC |  | **baru** |
| 11 | `kondisipohon` | Kondisi pohon | LIST |  | **baru** |
| 12 | `tandapanen` | Bekas panen madu | BOOLEAN |  | **baru** |
| 13 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.sebaranumaani.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 2 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 3 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 6 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 7 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 8 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Titik Grid `metodeteknis.verifikasikehatitinggi.titikgrid.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `kodegrid` | Kode grid | TEXT | ya | **baru** |
| 2 | `lokasi` | Lokasi | TEXT |  | sudah ada, dipakai ulang |
| 3 | `zonasikawasan` | Zona | LIST |  | **baru** |
| 4 | `ketinggianmdpl` | Ketinggian (mdpl) | NUMERIC |  | **baru** |
| 5 | `klasifikasi1te` | Klasifikasi 1 | TREE |  | sudah ada, dipakai ulang |
| 6 | `klasifikasi2te` | Klasifikasi 2 | TREE |  | sudah ada, dipakai ulang |
| 7 | `klasifikasi3` | Klasifikasi 3 | TREE |  | sudah ada, dipakai ulang |
| 8 | `klasifikasi4` | Klasifikasi 4 | LIST | ya | sudah ada, dipakai ulang |
| 9 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Vegetasi `metodeteknis.verifikasikehatitinggi.vegetasi.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `kodegrid` | Kode grid | TEXT | ya | **baru** |
| 2 | `noplot` | No. plot | TEXT | ya | sudah ada, dipakai ulang |
| 3 | `tingkatpertumbuhan` | Tingkat pertumbuhan | LIST | ya | **baru** |
| 4 | `jenistumbuhan` | Jenis tumbuhan | TREE | ya | sudah ada, dipakai ulang |
| 5 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 6 | `dbhpohoncm` | Diameter setinggi dada (cm) | NUMERIC |  | **baru** |
| 7 | `kelilingcm` | Keliling batang (cm) | NUMERIC |  | **baru** |
| 8 | `tinggipohonm` | Tinggi pohon (m) | NUMERIC |  | **baru** |
| 9 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

### Perjumpaan Satwa `metodeteknis.verifikasikehatitinggi.perjumpaansatwa.`

| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |
|---|---|---|---|---|---|
| 1 | `kodegrid` | Kode grid | TEXT | ya | **baru** |
| 2 | `jenissatwa` | Jenis satwa | TREE | ya | sudah ada, dipakai ulang |
| 3 | `tandakeberadaan` | Tanda keberadaan | LIST |  | **baru** |
| 4 | `jumlah` | Jumlah | NUMERIC |  | sudah ada, dipakai ulang |
| 5 | `keterangan` | Keterangan | TEXT |  | sudah ada, dipakai ulang |

## Pilihan untuk atribut daftar (LIST) yang baru

- `jalurpengamatan` (Jalur pengamatan): `jalurpendakian` = Jalur pendakian; `jalaninspeksi` = Jalan inspeksi; `jalurpatroli` = Jalur patroli; `lainnya` = Lainnya
- `tipetutupanlahan` (Tipe tutupan lahan): `savana` = Savana; `hutanlahankering` = Hutan lahan kering; `hutanpegunungan` = Hutan pegunungan; `semakbelukar` = Semak belukar; `kebunladang` = Kebun/ladang masyarakat; `lahanterbuka` = Lahan terbuka; `lainnya` = Lainnya; `hutanhujan` = Hutan hujan; `hutanmusim` = Hutan musim; `hutansubpegunungan` = Hutan sub pegunungan; `tepisungai` = Tepi sungai; `ekotonsavanadanhutan` = Ekoton savana dan hutan; `sumberair` = Sumber air; `hutancemara` = Hutan cemara; `lembah` = Lembah; `punggungbukit` = Punggung bukit
- `aktivitasraptor` (Aktivitas raptor): `soaring` = Soaring (terbang mengapung); `gliding` = Gliding (meluncur horizontal); `display` = Display/undulating; `hovering` = Hovering; `diving` = Diving (menukik); `perchhunting` = Berburu sambil bertengger (perch hunting); `ambushhunting` = Berburu terbang rendah (ambush hunting); `bertengger` = Bertengger; `terbang` = Terbang; `kawin` = Kawin; `bersarang` = Bersarang; `makan` = Makan; `lainnya` = Lainnya; `bersuara` = Bersuara; `membawamaterialsarang` = Membawa material sarang; `diserangmenyerangburunglain` = Diserang/menyerang burung lain
- `penggunaanruang` (Penggunaan ruang): `atastajuk` = Top (di atas tajuk); `tajuk` = Tajuk; `bawahtajuk` = Bawah tajuk; `permukaantanah` = Permukaan tanah
- `tiperuang` (Tipe ruang): `terbuka` = Terbuka; `tertutup` = Tertutup
- `sisitransek` (Sisi transek): `kiri` = Kiri; `kanan` = Kanan
- `tingkatpertumbuhan` (Tingkat pertumbuhan): `semai` = Semai; `pancang` = Pancang; `tiang` = Tiang; `pohon` = Pohon; `tumbuhanbawah` = Tumbuhan bawah
- `kondisisarang` (Kondisi sarang): `aktifadateluranakaninduk` = Aktif (ada telur/anakan/induk); `aktifmaterialbaru` = Aktif (material baru); `tidakaktif` = Tidak aktif; `rusakjatuh` = Rusak/jatuh
- `stratatajuk` (Strata penggunaan ruang): `top` = Top; `middle` = Middle; `low` = Low
- `tipeekosistem` (Tipe ekosistem): `hutanpamahdataranrendah` = Hutan pamah (dataran rendah); `hutanmusimkering` = Hutan musim/kering; `hutanhujantropisdataranrendah` = Hutan hujan tropis dataran rendah; `hutanpegununganbawah` = Hutan pegunungan bawah; `hutanpegununganatas` = Hutan pegunungan atas; `subalpin` = Sub alpin; `savana` = Savana; `riparian` = Riparian; `ekosistemlainnya` = Ekosistem lainnya; `padangrumput` = Padang rumput; `semakbelukar` = Semak belukar
- `tipeekosistempeta` (Tipe ekosistem (peta)): `hutanpamahdataranrendah` = Hutan pamah (dataran rendah); `hutanmusimkering` = Hutan musim/kering; `hutanhujantropisdataranrendah` = Hutan hujan tropis dataran rendah; `hutanpegununganbawah` = Hutan pegunungan bawah; `hutanpegununganatas` = Hutan pegunungan atas; `subalpin` = Sub alpin; `savana` = Savana; `riparian` = Riparian; `ekosistemlainnya` = Ekosistem lainnya
- `tutupanlahanpeta` (Tutupan lahan (peta)): `hutan` = Hutan; `hutanlahankeringprimer` = Hutan lahan kering primer; `hutanlahankeringsekunder` = Hutan lahan kering sekunder; `hutantanaman` = Hutan tanaman; `semakbelukar` = Semak belukar; `savana` = Savana; `padangrumput` = Padang rumput; `pertanianlahankering` = Pertanian lahan kering; `pertanianlahankeringcampursemak` = Pertanian lahan kering campur semak; `perkebunan` = Perkebunan; `permukiman` = Permukiman; `lahanterbuka` = Lahan terbuka; `tubuhair` = Tubuh air
- `tutupanlahanlapangan` (Tutupan lahan (lapangan)): `hutan` = Hutan; `hutanlahankeringprimer` = Hutan lahan kering primer; `hutanlahankeringsekunder` = Hutan lahan kering sekunder; `hutantanaman` = Hutan tanaman; `semakbelukar` = Semak belukar; `savana` = Savana; `padangrumput` = Padang rumput; `pertanianlahankering` = Pertanian lahan kering; `pertanianlahankeringcampursemak` = Pertanian lahan kering campur semak; `perkebunan` = Perkebunan; `permukiman` = Permukiman; `lahanterbuka` = Lahan terbuka; `tubuhair` = Tubuh air
- `statusopenarea` (Status open area): `nonopenarea` = Non open area; `openarea` = Open area; `openareaalami` = Open area alami; `openareabuatan` = Open area buatan
- `penyebabopenarea` (Penyebab open area): `pertanianperladangan` = Pertanian/perladangan; `perkebunan` = Perkebunan; `permukiman` = Permukiman; `bekaskebakaran` = Bekas kebakaran; `bekaspembalakan` = Bekas pembalakan; `jalanatausarana` = Jalan atau sarana; `bencanaalam` = Bencana alam; `lainnya` = Lainnya
- `zonasikawasan` (Zona): `zonainti` = Zona Inti; `zonarimba` = Zona Rimba; `zonapemanfaatan` = Zona Pemanfaatan; `zonatradisional` = Zona Tradisional; `zonarehabilitasi` = Zona Rehabilitasi; `zonakhusus` = Zona Khusus
- `lokasisasaran` (Lokasi sasaran): `jalurpendakian` = Jalur pendakian; `jalurternak` = Jalur ternak; `jalansetapak` = Jalan setapak; `arealterbuka` = Areal terbuka; `bekaskebakaran` = Bekas kebakaran; `bataskawasandanladang` = Batas kawasan dan ladang; `dekatpermukiman` = Dekat permukiman; `tepisungai` = Tepi sungai
- `carahidup` (Cara hidup): `epifit` = Epifit; `terestrial` = Terestrial; `litofit` = Litofit
- `fenologi` (Fenologi): `vegetatif` = Vegetatif; `kuncup` = Kuncup; `berbunga` = Berbunga; `berbuah` = Berbuah
- `aktivitassatwa` (Aktivitas satwa): `makan` = Makan; `istirahat` = Istirahat; `berjalan` = Berjalan; `berlari` = Berlari; `minum` = Minum; `berkubang` = Berkubang; `lainnya` = Lainnya; `terbang` = Terbang; `bertengger` = Bertengger; `berkicau` = Berkicau; `soaring` = Soaring; `bersarang` = Bersarang; `mandi` = Mandi; `mencarimakan` = Mencari makan; `membuatsarang` = Membuat sarang; `bersosialisasi` = Bersosialisasi
- `tandakeberadaan` (Tanda keberadaan): `jejakkaki` = Jejak kaki; `kotoranonggokan` = Kotoran (onggokan); `bekasmakan` = Bekas makan; `garukanranggah` = Garukan ranggah; `tempatistirahat` = Tempat istirahat; `kubangan` = Kubangan; `suara` = Suara; `urine` = Urine; `perjumpaanlangsung` = Perjumpaan langsung; `sarang` = Sarang; `buluataubagiantubuh` = Bulu atau bagian tubuh; `lainnya` = Lainnya; `bekasgarukanataugesekan` = Bekas garukan atau gesekan
- `fasefeses` (Fase kotoran): `a` = A; `b` = B; `c` = C; `d` = D; `e` = E; `f` = F
- `tipehabitat` (Tipe habitat): `terestrial` = Terestrial; `akuatik` = Akuatik; `terestrialdanakuatik` = Terestrial dan akuatik
- `guildburung` (Guild pakan): `pemakanbuah` = Pemakan buah; `pemakanbiji` = Pemakan biji; `pemakanbijidanbuah` = Pemakan biji dan buah; `pemakanserangga` = Pemakan serangga; `pemakanbuahdanserangga` = Pemakan buah dan serangga; `pemakannektar` = Pemakan nektar; `pemakandagingraptor` = Pemakan daging (raptor); `pemakanikan` = Pemakan ikan; `pemakancampuran` = Pemakan campuran
- `nektarbunga` (Nektar bunga): `sedikit` = Sedikit; `sedang` = Sedang; `banyak` = Banyak
- `mahkotabunga` (Mahkota bunga): `kecil` = Kecil; `sedang` = Sedang; `besar` = Besar
- `ukuranbunga` (Ukuran bunga): `kecil` = Kecil; `sedang` = Sedang; `besar` = Besar
- `lapisanluarbuah` (Lapisan luar buah berdaging): `tebal` = Tebal; `sedang` = Sedang; `tipis` = Tipis
- `lapisanbuah` (Lapisan buah berdaging): `keras` = Keras; `sedang` = Sedang; `lunak` = Lunak
- `ukuranbuah` (Ukuran buah berdaging): `besar` = Besar; `sedang` = Sedang; `kecil` = Kecil
- `lapisankulitbiji` (Lapisan kulit buah kering): `tebal` = Tebal; `sedang` = Sedang; `tipis` = Tipis
- `ukuranbiji` (Ukuran biji): `besar` = Besar; `sedang` = Sedang; `kecil` = Kecil
- `lokasibiji` (Lokasi biji): `dalam` = Dalam; `tengah` = Tengah; `luar` = Luar
- `bentuktajuk` (Bentuk tajuk): `kolumnarfastigiateataubulat` = Kolumnar, fastigiate, atau bulat; `piramidal` = Piramidal; `menjuntaiataupicturesque` = Menjuntai atau picturesque
- `bentukpercabangan` (Bentuk percabangan): `horizontal` = Horizontal; `vertikal` = Vertikal; `berlikuataumenjuntai` = Berliku atau menjuntai
- `ukurandaun` (Ukuran daun): `besar` = Besar; `sedang` = Sedang; `kecil` = Kecil
- `komponenserasah` (Komponen): `serasah` = Serasah; `nekromas` = Nekromas; `tumbuhanbawah` = Tumbuhan bawah
- `kuadran` (Kuadran): `a` = A; `b` = B; `c` = C; `d` = D
- `kelasdiameter` (Kelas diameter): `kurang06cm` = <0.6 cm (10-12 m); `antara06dan25cm` = 0.6-2.5 cm (7-10 m); `antara25dan75cm` = 2.5-7.5 cm (2-7 m); `lebih75cmutuh` = >7.5 cm sound (2-12 m); `lebih75cmlapuk` = >7.5 cm rotten (2-12 m)
- `lapisantanah` (Lapisan tanah (cm)): `lapisan0005` = 0-5; `lapisan0510` = 5-10; `lapisan1015` = 10-15; `lapisan1520` = 15-20; `lapisan2025` = 20-25; `lapisan2530` = 25-30
- `statusiucn` (Status IUCN): `cr` = CR; `en` = EN; `vu` = VU; `nt` = NT; `lc` = LC; `dd` = DD; `ne` = NE
- `statuscites` (Status CITES): `apendiksi` = Apendiks I; `apendiksii` = Apendiks II; `apendiksiii` = Apendiks III; `tidakterdaftar` = Tidak terdaftar
- `endemisitas` (Endemisitas): `endemiktntambora` = Endemik TN Tambora; `endemikpulausumbawa` = Endemik Pulau Sumbawa; `endemiknusatenggara` = Endemik Nusa Tenggara; `endemikindonesia` = Endemik Indonesia; `bukanendemik` = Bukan endemik
- `kategorimanfaat` (Kategori manfaat): `obat` = Obat; `pangan` = Pangan; `kayu` = Kayu; `tanamanhias` = Tanaman hias; `pakanternak` = Pakan ternak; `pakansatwaliar` = Pakan satwa liar; `bahankerajinan` = Bahan kerajinan; `ritualataubudaya` = Ritual atau budaya; `lainnya` = Lainnya
- `kemampuanmapan` (Kemampuan mapan): `rendah` = Rendah; `medium` = Medium; `tinggi` = Tinggi; `sangattinggi` = Sangat tinggi; `tidaktahu` = Tidak tahu
- `ketahananpengelolaan` (Ketahanan terhadap pengelolaan): `rendah` = Rendah; `medium` = Medium; `tinggi` = Tinggi; `sangattinggi` = Sangat tinggi; `tidaktahu` = Tidak tahu
- `periodeberbuah` (Periode berbuah): `satutahun` = 1 tahun; `duasampaitigatahun` = 2 sampai 3 tahun; `lebihtigatahun` = Lebih dari 3 tahun; `tidaktahu` = Tidak tahu
- `produksibiji` (Produksi biji): `banyak` = Banyak; `sedikit` = Sedikit; `tidakada` = Tidak ada; `tidaktahu` = Tidak tahu
- `reproduksivegetatif` (Reproduksi vegetatif): `cepat` = Cepat; `lambat` = Lambat; `tidakada` = Tidak ada; `tidaktahu` = Tidak tahu
- `sebaranburung` (Disebarkan burung): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebaranhewan` (Disebarkan hewan lain): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebaranair` (Disebarkan air): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebaranangin` (Disebarkan angin): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebaransengaja` (Disebarkan manusia dengan sengaja): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebarantanpasengaja` (Disebarkan manusia tanpa sengaja): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebarankontaminasi` (Mengontaminasi hasil bumi): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `sebaranternak` (Dibawa hewan ternak): `umum` = Umum; `kadangkadang` = Kadang-kadang; `mungkintidak` = Mungkin tidak; `tidaktahu` = Tidak tahu
- `tipecatatan` (Tipe catatan): `perjumpaanlangsung` = Perjumpaan langsung; `disarang` = Di sarang; `suara` = Suara
- `sumberdata` (Sumber data): `monitoringelangflores` = Monitoring elang flores; `inventarisasiraptor` = Inventarisasi raptor; `monitoringsatwakunci` = Monitoring satwa kunci; `patrolismart` = Patroli SMART; `laporanmasyarakat` = Laporan masyarakat; `kegiatanlain` = Kegiatan lain
- `kondisipohon` (Kondisi pohon): `hidupsehat` = Hidup sehat; `hiduprusak` = Hidup rusak; `matiatautumbang` = Mati atau tumbang
