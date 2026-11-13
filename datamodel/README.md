# Data model SMART: Metode Teknis

Rancangan kategori observasi SMART untuk kegiatan teknis jabatan PEH. Kategori level 0 **Metode Teknis**; setiap metode PEH menjadi satu kategori level 1, dan setiap tabel isian generator menjadi satu kategori level 2. Versi 0.2.0 memuat 14 kategori level 1, sesuai 14 generator RPK dan LPK di aplikasi.

| Berkas | Isi |
| --- | --- |
| `metode-teknis.json` | **Sumber.** Ubah berkas ini saja |
| `SPESIFIKASI.md` | Tabel kategori, atribut, dan pilihan (dibuat otomatis) untuk diinput di SMART Desktop |
| `metode-teknis.xml` | Rancangan dalam format ekspor Data Model SMART (dibuat otomatis) |

Setelah mengubah JSON, jalankan dari folder utama repo:

```
python3 tools/build_datamodel.py
```

Skrip memeriksa bahwa setiap atribut yang dipakai kategori terdefinisi, lalu memperbarui XML, spesifikasi, dan `js/core/datamodel.js` (kamus label yang dipakai aplikasi saat membaca ekspor patroli).

## Kategori level 1

| Kategori | Key | Generator |
| --- | --- | --- |
| Inventarisasi dan Sebaran Raptor | `inventarisasiraptor` | RAPTOR |
| Monitoring Elang Flores | `monitoringelangflores` | ELFLO |
| Monitoring Rusa Timor | `monitoringrusatimor` | RUSA |
| Ground Check Tutupan Lahan dan Tipe Ekosistem | `groundchecktutupanlahan` | GC |
| Identifikasi Anggrek | `identifikasianggrek` | ANGGREK |
| Inventarisasi Jenis Asing Invasif | `inventarisasijenisinvasif` | IAS |
| Inventarisasi Burung | `inventarisasiburung` | BURUNG |
| Inventarisasi Tumbuhan Penting | `inventarisasitumbuhanpenting` | TUMPEN |
| Monitoring Satwa Kunci | `monitoringsatwakunci` | SATKUN |
| Kajian Lokasi Pelepasliaran Satwa | `kajianpelepasliaran` | LEPAS |
| Pengukuran Stok Karbon | `stokkarbon` | KARBON |
| Rekap Perjumpaan Elang Flores | `rekapelangflores` | REKAP |
| Sebaran Pohon Sarang Uma Ani | `sebaranumaani` | UMAANI |
| Verifikasi Kehati Tinggi | `verifikasikehatitinggi` | KEHATI |

Kategori level 2, atribut, dan status wajibnya ada di `SPESIFIKASI.md`.

## Prinsip penyusunan

- **Pakai ulang atribut yang sudah ada** di Data Model Balai TN Tambora dengan key yang sama, antara lain `jenissatwa`, `jenistumbuhan`, `noplot`, `jumlah`, `lokasi`, `jarakkesatwam`, `azimuth`, `jenisperjumpaan`, `jumlahjantan`, `jumlahbetina`, `usiatemuan`, `status`, `asal`, `keterangan`, dan klasifikasi tipe ekosistem `klasifikasi1te` sampai `klasifikasi4`. Dengan begitu data Metode Teknis bisa digabung dengan data patroli rutin.
- **Satu key untuk satu makna di semua kegiatan.** Kode petak atau titik selalu `noplot`, kode transek atau jalur `notransek`, kode grid `kodegrid`, nama lokasi `lokasi`, zona `zonasikawasan`, dan tingkat pertumbuhan `tingkatpertumbuhan`. Tabel vegetasi memakai susunan atribut yang sama di semua kegiatan.
- **Pilihan daftar sama persis dengan tabel isian generator.** Pilihan atribut LIST baru disalin dari kolom tabel aplikasi, sehingga hasil impor SMART dan isian manual terkelompok sama di analisis. Atribut yang dipakai beberapa kegiatan (misalnya `tipetutupanlahan`, `aktivitassatwa`, `tandakeberadaan`, `tipeekosistem`) berisi pilihan gabungan; pilihan yang tidak relevan bisa dinonaktifkan per kategori di SMART Desktop.
- **Pilihan atribut lama hanya untuk kamus.** Pilihan atribut yang sudah ada disalin dari kamus dashboard SMART Balai supaya label terbaca tanpa memuat Data Model. Beberapa key yang belum berlabel di kamus (misalnya `pegununganatas15002400mdpl`) diberi label yang disimpulkan dari key-nya; muat ekspor Data Model Balai di aplikasi untuk label resmi.
- **Resor dibaca dari stasiun patroli**, bukan dari atribut, karena patroli Balai sudah mencatatnya di tingkat patroli.
- **Titik tanpa perjumpaan tetap dicatat** (kategori titik pengamatan, transek, atau jalur) karena jumlah titik dan panjang jalur menentukan luas sampel dan kepadatan.
- Key kategori dan atribut huruf kecil tanpa spasi, mengikuti kebiasaan Data Model Balai.

## Kategori Balai yang ikut dibaca generator

Selain kategori Metode Teknis, beberapa generator membaca kategori patroli rutin yang sudah ada:

| Generator | Kategori Balai | Dipakai untuk |
| --- | --- | --- |
| GC | Ground Check > Tutupan Lahan (`klasifikasi01`, `klasifikasi02`) dan Ground Check > Tipe Ekosistem (`klasifikasi4`) | Status open area, kelas tutupan, dan tipe ekosistem lapangan. Observasi pada waypoint yang sama digabung menjadi satu titik |
| KEHATI | Ground Check > Tipe Ekosistem, Satwa Liar | Klasifikasi empat tingkat per grid; nomor grid dibaca dari atribut `lokasi` bila ditulis "Grid 681" |
| REKAP | Satwa Liar, Monitoring Elang Flores, Inventarisasi Raptor, Monitoring Satwa Kunci | Semua catatan elang flores dari patroli dan kegiatan teknis |

## Menerapkan di SMART Desktop

1. Ekspor dulu Data Model yang sedang dipakai sebagai cadangan (Conservation Area → Data Model → Export).
2. Buat atribut baru dan kategori sesuai `SPESIFIKASI.md` lewat editor Data Model, dengan **key persis sama** (aplikasi membaca key, bukan label). Pilihan baru hanya berlabel bahasa Indonesia.
3. Periksa tipe atribut lama yang dipakai ulang, terutama `noplot` (di rancangan dianggap teks). Aplikasi membaca nilai teks maupun angka.
4. Perbarui Configurable Model SMART Mobile agar kategori Metode Teknis muncul di ponsel. Kategori bisa diterapkan bertahap, mulai dari kegiatan yang paling dekat jadwalnya.
5. Coba satu patroli uji, ekspor, lalu muat di aplikasi (tab Data → Pilih file patroli SMART).

`metode-teknis.xml` mengikuti struktur ekspor Data Model SMART (elemen `names`, `values` untuk pilihan daftar, `category` bertingkat) seperti yang dibaca Generator LPK SMART Patrol. Berkas ini **belum diuji impor langsung** ke SMART Desktop; perlakukan sebagai rancangan dan acuan, dan uji di Conservation Area percobaan bila ingin mengimpornya.

Contoh ekspor patroli untuk uji aplikasi:

- `tests/fixtures/patroli-raptor-contoh.xml`: data perjumpaan Piong 2021; koordinat dan tanggal per plot fiktif.
- `tests/fixtures/patroli-metode-teknis-contoh.xml`: data fiktif untuk menguji pembacaan kategori kehati tinggi, ground check, uma ani, rekap elang flores, rusa timor, dan stok karbon, termasuk kategori Balai Ground Check dan Satwa Liar.
