# PEH Tambora

Kalkulator analisis data serta generator Rencana Pelaksanaan Kegiatan (RPK) dan Laporan Pelaksanaan Kegiatan (LPK) untuk kegiatan teknis jabatan **Pengendali Ekosistem Hutan (PEH)** Balai Taman Nasional Tambora.

Aplikasi web statis (tanpa server), sama seperti [Generator LPK SMART Patrol](https://github.com/kopluck8/SMART_Report_generator). Semua data diproses di browser dan tidak diunggah ke mana pun.

## Kegiatan

Setiap kegiatan punya alamat sendiri: tambahkan id di kolom kedua di belakang alamat aplikasi, misalnya `https://kopluck8.github.io/PEH-Tambora/#burung`.

| Kegiatan | Id | Analisis | Data contoh |
| --- | --- | --- | --- |
| Inventarisasi dan Sebaran Raptor | `#raptor` | Point count: kepadatan, Shannon-Wiener, dominansi, indeks dispersi | LPK Resort Piong, Juni 2021 |
| Monitoring Satwa Kunci Elang Flores | `#elang-flores` | Titik pengamatan: kepadatan, struktur populasi, pola sebaran, wilayah jelajah (MCP), aktivitas, burung lain di habitatnya, pohon sarang, vegetasi sekitar sarang | LPK Resor Oi Katupa, Agustus 2023 |
| Inventarisasi dan Monitoring Rusa Timor | `#rusa-timor` | Transek garis: kepadatan King dan Hayne, struktur populasi, dugaan populasi dari jejak kaki dan onggokan kotoran, pola sebaran, tanda keberadaan, vegetasi habitat | LPK Resor Doro Ncanga, Juli 2023 |
| Ground Check Tutupan Lahan/Open Area dan Tipe Ekosistem | `#ground-check` | Matriks kesalahan, akurasi keseluruhan, kappa, rekap open area per penyebab dan zona, vegetasi petak contoh | LPK Resor Doro Ncanga, September 2023 |
| Identifikasi Jenis Anggrek | `#anggrek` | Daftar jenis per genus, kelimpahan, INP, Shannon-Wiener, pendugaan kekayaan jenis, cara hidup, pohon inang, fenologi | Belum ada |
| Inventarisasi Tumbuhan Asing Invasif | `#jenis-invasif` | Kerapatan, frekuensi, dan INP di dalam komunitas tumbuhan, skor keinvasifan lima faktor, sebaran per zona dan lokasi sasaran | Belum ada |
| Identifikasi dan Inventarisasi Jenis Burung | `#burung` | Kepadatan, Shannon-Wiener, kemerataan, kekayaan jenis, dominansi, pendugaan kekayaan jenis, aktivitas | LPK Resort Doropeti, Februari 2023 |
| Identifikasi Penyebaran dan Inventarisasi Tumbuhan Penting | `#tumbuhan-penting` | Intensitas sampling, analisis vegetasi per tingkat pertumbuhan, daftar tumbuhan penting (IUCN, CITES, P.106/2018, endemisitas, nilai ekonomi) | Belum ada |
| Monitoring Populasi dan Persebaran Satwa Liar Spesies Kunci | `#satwa-kunci` | Perkiraan individu dari perjumpaan langsung dan tanda keberadaan, kepadatan King, struktur populasi, onggokan kotoran | Belum ada |
| Identifikasi dan Kajian Lokasi Pelepasliaran Satwa | `#pelepasliaran` | Daftar MacKinnon, guild burung, fungsi pohon sebagai penarik burung (Handayani, 2015), skoring kesesuaian lokasi | Belum ada |
| Pengumpulan Data Penghitungan Stok Karbon | `#stok-karbon` | Cadangan karbon lima pool (atas permukaan, bawah permukaan, serasah/nekromas/tumbuhan bawah, kayu mati, tanah), komposisi tegakan | LPK SPTN Wilayah II Pekat, September 2025 |
| Rekapitulasi Perjumpaan dan Sebaran Elang Flores | `#rekap-elang-flores` | Individu minimum per lokasi dan tahun, daerah sebaran (MCP), status sarang, sumber data; membaca juga patroli rutin (Satwa Liar) | Belum ada |
| Identifikasi Jenis, Jumlah, dan Sebaran Pohon Sarang Lebah Madu Hutan (Uma Ani) | `#uma-ani` | Jenis dan jumlah pohon sarang, perbandingan dengan survei sebelumnya, jarak ke sumber air, daerah sebaran, vegetasi sekitar sarang | Belum ada |
| Inventarisasi dan Verifikasi Kawasan dengan Nilai Keanekaragaman Hayati Tinggi | `#kehati-tinggi` | Verifikasi tipe ekosistem per grid (klasifikasi empat tingkat SMART Balai), INP dan H′, daftar tumbuhan dan satwa beserta statusnya | Belum ada |

Data contoh disalin dari lampiran LPK Balai tanpa nama petugas. Kegiatan yang belum punya contoh diuji dengan data uji sintetis di `tests/fixtures/uji-<id>.json`.

## Cara pakai

1. Buka `index.html` (atau alamat GitHub Pages), lalu pilih kegiatan.
2. **Sumber data** (panel kiri), salah satu atau gabungan dari:
   - isi langsung di tab **Data**, atau impor CSV per tabel (formatnya sama dengan tombol *Unduh CSV* di tabel itu);
   - pilih file ekspor patroli **SMART** (`.zip` atau `.xml`, bisa beberapa sekaligus) yang dicatat dengan kategori **Metode Teknis**. Kategori yang dibaca setiap kegiatan tertulis di panel. Bila ada pilihan yang labelnya belum terbaca, muat juga ekspor Data Model SMART Balai;
   - **Muat contoh** (untuk kegiatan yang punya data contoh).
3. Isi **Parameter metode**, identitas kegiatan, penandatangan LPK dan RPK, tim, alat, dan anggaran.
4. Tab **RPK** menyusun rencana kegiatan dan bisa dibuat sebelum ada data lapangan. Tab **Hasil Analisis** menampilkan tabel hitungan (unduh CSV). Tab **LPK** menampilkan laporan lengkap. Teks berlatar kuning bisa disunting langsung; unduh **Word (.docx)** atau **Cetak / PDF**.

Bab metode analisis di RPK dan LPK memuat rumus beserta simbol dan keterangannya, seperti LPK raptor 2021. Rumus tampil sebagai MathML di pratinjau dan menjadi equation Word saat diunduh. Format dokumen mengikuti Memorandum M.57/T.41/TU/PEG/02/2026 (laporan kegiatan keteknisan): sampul, lembar pengesahan, daftar isi dan tabel, pendahuluan, kegiatan yang dilaksanakan, hasil, simpulan dan saran, penutup, dan lampiran.

Isian disimpan di browser (per kegiatan). Pustaka dari CDN (perlu internet sekali): JSZip 3.10.1 (membaca .zip SMART) dan docx 8.5.0 (membuat Word).

## Data model SMART: Metode Teknis

Rancangan kategori observasi untuk semua kegiatan di atas ada di folder [`datamodel/`](datamodel/): kategori level 0 **Metode Teknis**, satu kategori level 1 per kegiatan (14), dan kategori level 2 untuk setiap tabel isian.

```
Metode Teknis                                   (level 0)  metodeteknis.
├─ Inventarisasi dan Sebaran Raptor             (level 1)  metodeteknis.inventarisasiraptor.
│  ├─ Titik Pengamatan                          (level 2)  ...titikpengamatan.
│  └─ Perjumpaan Raptor                         (level 2)  ...perjumpaanraptor.
├─ Monitoring Elang Flores                      (level 1)  metodeteknis.monitoringelangflores.
├─ ...
└─ Verifikasi Kehati Tinggi                     (level 1)  metodeteknis.verifikasikehatitinggi.
```

Atribut yang sudah ada di Data Model Balai (misalnya `jenissatwa`, `jenistumbuhan`, `lokasi`, `noplot`, klasifikasi tipe ekosistem) dipakai ulang dengan key yang sama. Ground check, kehati tinggi, dan rekap elang flores juga membaca kategori patroli rutin (Ground Check, Satwa Liar). Daftar kategori, atribut, dan pilihan: [`datamodel/SPESIFIKASI.md`](datamodel/SPESIFIKASI.md). Prinsip penyusunan dan cara menerapkan di SMART Desktop: [`datamodel/README.md`](datamodel/README.md).

## Uji

```
node --test
```

- `tests/kegiatan.test.js` membandingkan hasil hitungan dengan angka di LPK asal data contoh (burung Doropeti 2023, stok karbon Pekat 2025, rusa Doro Ncanga 2023, elang flores Oi Katupa 2023, ground check Doro Ncanga 2023, jumlah petak tumbuhan penting Doro Ncanga dan Doropeti, perbandingan sarang uma ani 2019 dan 2024). Kegiatan lain diuji dengan hitungan tangan pada data uji sintetis. Uji ini juga memastikan narasi RPK dan LPK ke-13 generator tidak memuat NaN atau undefined.
- `tests/impor-smart.test.js` membaca contoh ekspor patroli di `tests/fixtures/` sampai menjadi baris tabel generator.
- `tests/raptor.test.js` memastikan kalkulator raptor sama dengan LPK Piong 2021.

`tests/muat.js` memuat semua skrip aplikasi di Node, jadi uji berjalan tanpa browser. GitHub Actions menjalankan uji ini dan memeriksa bahwa berkas data model sudah dibangun ulang (`.github/workflows/uji.yml`).

## Catatan rumus raptor

Acuan: template **Analisa data.xlsx** dan LPK Identifikasi dan Inventarisasi Jenis serta Sebaran Raptor, Resort Piong, SPTN I Kore, 10 sampai 14 Juni 2021.

| Analisis | Rumus | Kriteria |
| --- | --- | --- |
| Luas plot | A = n × π × r² (template memakai π = 3,14) | |
| Kepadatan populasi (Jarvinen 1978) | D = N / A, juga ditulis 1 ind/… ha | |
| Keanekaragaman Shannon-Wiener | H' = −Σ Pi ln Pi, Pi = ni/N | Template: H' ≤ 2 rendah, 2 sampai 3 sedang, ≥ 3 tinggi. Pilihan Krebs: < 1 rendah, 1 sampai 3 sedang, > 3 tinggi |
| Dominansi/kelimpahan relatif | Di = ni/N × 100% | < 2% tidak dominan, 2 sampai 5% sub dominan, ≥ 5% dominan |
| Indeks dispersi (Ludwig & Reynolds 1988) | ID = S²/x̄ | ID = 1 acak, > 1 kelompok, < 1 homogen |

Perjumpaan dengan jarak lebih dari jari-jari plot dicatat tetapi tidak dihitung, seperti di LPK 2021.

**Dua rumus indeks dispersi.** Template menghitung ragam dari total individu per jenis: Sxi² = (Xi² − Xi⁴/n)/(n − 1) per jenis dan Sx² = (N − N²/n)/(n − 1) untuk gabungan. Rumus ini menjadi bawaan supaya hasil sama dengan laporan sebelumnya. Bila jumlah individu per plot tersedia (dari tabel data atau SMART), pilih **Per plot** di Parameter metode: S² = (Σx² − (Σx)²/n)/(n − 1) dengan x = individu per plot. Pada data Piong 2021 hasilnya berbeda: ID raptor 0,805 (homogen) dengan rumus template, 2,398 (kelompok) dengan rumus per plot. Tab Hasil Analisis selalu menampilkan keduanya.

## Struktur repository

```
index.html                 halaman aplikasi
css/style.css              tampilan (sama dengan Generator LPK SMART Patrol)
js/core/                   inti yang dipakai semua kegiatan
  app.js                   kerangka: pilihan kegiatan, isian bersama, tab RPK/Data/Hasil/LPK, penyimpanan
  kegiatan.js              mesin generator: satu konfigurasi menjadi tab Data, Hasil, RPK, dan LPK
  modul.js, modul2.js      modul analisis siap pakai (hitungan, narasi metode dengan rumus, tabel, simpulan)
  stats.js                 rumus umum (luas plot, kepadatan, Shannon, dominansi, dispersi, King, Hayne, MCP)
  rumus.js                 penulisan rumus (MathML di pratinjau, equation di Word)
  laporan.js, dokumen.js   bagian RPK dan LPK bersama (kop, sampul, pengesahan, tim, alat, RAB, tata waktu)
  docx.js                  ekspor Word dari pratinjau
  smart-parser.js          pembaca ekspor patroli dan Data Model SMART
  smart-import.js          meratakan observasi SMART per kategori
  taksa.js                 daftar jenis tumbuhan dan satwa TN Tambora (nama, famili, status P.106, IUCN, CITES)
  datamodel.js             dibuat dari datamodel/metode-teknis.json
  defaults.js              logo bawaan (dibuat tools/build_defaults.py)
kegiatan/bersama.js        kolom, pembacaan atribut SMART, dan teks yang dipakai banyak kegiatan
kegiatan/<id>/             satu folder per kegiatan: konfigurasi dan data contoh
kegiatan/raptor/           kegiatan raptor (generator tersendiri, dibuat lebih dulu)
datamodel/                 data model SMART Metode Teknis (sumber JSON, XML, spesifikasi)
tools/                     skrip pembangun (datamodel, logo)
tests/                     uji rumus, contoh ekspor patroli, dan data uji sintetis
```

## Menambah kegiatan PEH baru

1. Tambahkan kategori level 1 di `datamodel/metode-teknis.json` (di bawah `metodeteknis`), lalu jalankan `python3 tools/build_datamodel.py`.
2. Buat `kegiatan/<id>/<id>.js` yang memanggil `PEH.kegiatan({...})`. Contoh yang ringkas: `kegiatan/burung/burung.js`.

```js
window.PEH.kegiatan({
  id: "burung", kode: "BURUNG", judul: "...", ringkas: "...", objek: "burung",
  kategoriSMART: "metodeteknis.inventarisasiburung.",   // boleh daftar, misalnya ["metodeteknis.x.", "satwaliar."]
  tabel: [{ key: "perjumpaan", judul: "Perjumpaan Burung", kolom: [...],
    smart: { sub: "perjumpaanburung", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenissatwa"); return { ...K.dasarObs(o), jenis, latin, n: Number(v("jumlah")) || 1 }; } } }],
  parameter: [{ key: "nPlot", label: "Jumlah titik", type: "number", def: "" }],
  modul: [{ m: "komunitas", id: "keragaman", input: (S) => ({ rows: S.data.perjumpaan }) }],
  teks: { latar, maksud, ruanglingkup, metode, lokasi, pembahasan, saran }
});
```

   - `modul` memakai modul di `js/core/modul.js` dan `modul2.js` (`komunitas`, `titik`, `dispersi`, `penduga`, `persen`, `daftar`, `struktur`, `transek`, `pellet`, `jejak`, `vegetasi`, `mcp`, `karbon`, `tutupan`, `skor`, `kesesuaian`, `kelimpahan`, `invasif`, `keinvasifan`, `sampling`, `deskripsi`, `perkiraan`, `sarang`, `rekap`, `ekosistem`). Setiap modul menyediakan hitungan, narasi metode dengan rumus, narasi hasil, tabel, dan butir simpulan. `opsional: true` menyembunyikan modul di LPK bila datanya kosong (RPK tetap memuat metodenya). `simpulan: false` menghapus butir simpulan modul, atau berikan fungsi untuk menggantinya. Id modul `lokasi` sudah dipakai subbab lokasi.
   - `smart.map(o, v)` menerima observasi dan fungsi `v(key)` yang mengembalikan nilai atribut (label untuk pilihan daftar). `smart.sub` boleh daftar kategori level 2; `smart.gabung: true` menggabungkan observasi pada waypoint yang sama menjadi satu baris.
   - `kegiatan/bersama.js` (`window.PEHKeg`) berisi kolom umum (`KOL`, `kolJenis`, `kolVegetasi`), `dasarObs` (tanggal, waktu, dan koordinat waypoint), `jenisDari` (nama lokal dan ilmiah dari atribut jenis), `pas` (menyamakan nilai dengan label daftar), dan `resorObs` (resor dari stasiun patroli).
3. Muat berkasnya di `index.html` pada blok "Kegiatan".
4. Tambahkan uji di `tests/kegiatan.test.js`: pakai data contoh dari LPK bila ada, atau data uji di `tests/fixtures/uji-<id>.json`.

Rumus yang bisa dipakai kegiatan lain masuk ke `js/core/stats.js` atau menjadi modul baru; rumus di LPK ditulis dengan `PEHRumus` (`js/core/rumus.js`).

## Pasang di GitHub Pages

Settings → Pages → Source: *Deploy from a branch*, Branch: `main` / root → Save. Aplikasi terbuka di `https://<username>.github.io/PEH-Tambora/`. Jangan unggah file ekspor patroli asli ke repository.
