# Data model SMART: Metode Teknis

Rancangan kategori observasi SMART untuk kegiatan teknis jabatan PEH. Kategori level 0 **Metode Teknis**; setiap metode PEH menjadi satu kategori level 1. Saat ini baru ada **Inventarisasi dan Sebaran Raptor**; kategori level 1 lain ditambahkan setelah pengumpulan metode PEH selesai.

| Berkas | Isi |
| --- | --- |
| `metode-teknis.json` | **Sumber.** Ubah berkas ini saja |
| `SPESIFIKASI.md` | Tabel kategori dan atribut (dibuat otomatis) untuk diinput di SMART Desktop |
| `metode-teknis.xml` | Rancangan dalam format ekspor Data Model SMART (dibuat otomatis) |

Setelah mengubah JSON, jalankan dari folder utama repo:

```
python3 tools/build_datamodel.py
```

Skrip memeriksa bahwa setiap atribut yang dipakai kategori terdefinisi, lalu memperbarui XML, spesifikasi, dan `js/core/datamodel.js` (kamus yang dipakai aplikasi saat membaca ekspor patroli).

## Prinsip penyusunan

- **Pakai ulang atribut yang sudah ada** di Data Model Balai TN Tambora dengan key yang sama (`jenissatwa`, `noplot`, `jarakkesatwam`, `azimuth`, `jenisperjumpaan`, `jumlahjantan`, `jumlahbetina`, `cuaca`, `keterangan`). Jenis raptor tetap dipilih dari pohon `jenissatwa`, sehingga data raptor dari Metode Teknis bisa digabung dengan perjumpaan satwa dari patroli biasa.
- **Atribut baru** hanya untuk kebutuhan template raptor yang belum ada: `jarijariplotm`, `jalurpengamatan`, `ketinggianmdpl`, `tipetutupanlahan`, `jumlahdewasa`, `jumlahanakan`, `aktivitasraptor`, `penggunaanruang`, `tiperuang`, `sarangditemukan`.
- **Plot tanpa perjumpaan tetap dicatat** (kategori Titik Pengamatan) karena jumlah plot (n) menentukan luas plot dan indeks dispersi.
- Key kategori dan atribut huruf kecil tanpa spasi, mengikuti kebiasaan Data Model Balai.

## Kebutuhan data template raptor dan padanannya di SMART

| Kolom template / tally sheet | Kategori SMART | Atribut |
| --- | --- | --- |
| Plot | Titik Pengamatan, Perjumpaan Raptor | `noplot` |
| Jumlah plot (n) | Titik Pengamatan | dihitung dari banyaknya `noplot` berbeda |
| Jari-jari plot (r) | Titik Pengamatan | `jarijariplotm` |
| Jalur (pendakian/inspeksi), ketinggian, tutupan lahan, cuaca | Titik Pengamatan | `jalurpengamatan`, `ketinggianmdpl`, `tipetutupanlahan`, `cuaca` |
| Jenis (nama Indonesia/latin) | Perjumpaan Raptor | `jenissatwa` |
| Jumlah dewasa / anak | Perjumpaan Raptor | `jumlahdewasa`, `jumlahanakan` |
| Jantan / betina (opsional) | Perjumpaan Raptor | `jumlahjantan`, `jumlahbetina` |
| Jarak perjumpaan (m), azimuth | Perjumpaan Raptor | `jarakkesatwam`, `azimuth` |
| Waktu perjumpaan, koordinat | Perjumpaan Raptor | dari waypoint SMART |
| Aktivitas, penggunaan ruang, tipe ruang | Perjumpaan Raptor | `aktivitasraptor`, `penggunaanruang`, `tiperuang` |
| Tutupan lahan, ketinggian lokasi perjumpaan | Perjumpaan Raptor | `tipetutupanlahan`, `ketinggianmdpl` |
| Identifikasi persarangan | Perjumpaan Raptor | `sarangditemukan` |

## Menerapkan di SMART Desktop

1. Ekspor dulu Data Model yang sedang dipakai sebagai cadangan (Conservation Area → Data Model → Export).
2. Buat atribut baru dan kategori sesuai `SPESIFIKASI.md` lewat editor Data Model, dengan **key persis sama** (aplikasi membaca key, bukan label).
3. Periksa tipe atribut lama yang dipakai ulang, terutama `noplot` (di rancangan dianggap teks). Aplikasi membaca nilai teks maupun angka.
4. Perbarui Configurable Model SMART Mobile agar kategori Metode Teknis muncul di ponsel.
5. Coba satu patroli uji, ekspor, lalu muat di aplikasi (tab Data → Pilih file patroli SMART).

`metode-teknis.xml` mengikuti struktur ekspor Data Model SMART (elemen `names`, `values` untuk pilihan daftar, `category` bertingkat) seperti yang dibaca Generator LPK SMART Patrol. Berkas ini **belum diuji impor langsung** ke SMART Desktop; perlakukan sebagai rancangan dan acuan, dan uji di Conservation Area percobaan bila ingin mengimpornya.

Contoh ekspor patroli untuk uji aplikasi: `tests/fixtures/patroli-raptor-contoh.xml` (data perjumpaan Piong 2021; koordinat dan tanggal per plot fiktif).
