# PEH Tambora

Kalkulator analisis data dan generator Laporan Pelaksanaan Kegiatan (LPK) untuk kegiatan teknis jabatan **Pengendali Ekosistem Hutan (PEH)** Balai Taman Nasional Tambora.

Aplikasi web statis (tanpa server), sama seperti [Generator LPK SMART Patrol](https://github.com/kopluck8/SMART_Report_generator). Semua data diproses di browser dan tidak diunggah ke mana pun. Repository ini disusun untuk menampung banyak kegiatan dan rumus PEH; saat ini berisi satu kegiatan:

| Kegiatan | Metode | Analisis | Status |
| --- | --- | --- | --- |
| Inventarisasi dan Sebaran Raptor | Point count (plot lingkaran) | Kepadatan populasi, keanekaragaman Shannon-Wiener, dominansi, indeks dispersi | Siap |
| Kegiatan PEH lainnya | | | Menyusul |

## Cara pakai

1. Buka `index.html` (atau alamat GitHub Pages), pilih kegiatan.
2. **Sumber data** (panel kiri), salah satu dari:
   - isi langsung di tab **Data** (satu baris = satu jenis pada satu perjumpaan);
   - pilih file ekspor patroli **SMART** (`.zip` atau `.xml`) yang dicatat dengan kategori **Metode Teknis** (lihat [Data model SMART](#data-model-smart-metode-teknis));
   - impor CSV (format sama dengan tombol *Unduh data (CSV)*);
   - **Muat contoh: Resort Piong, Juni 2021** untuk melihat contoh lengkap.
3. Isi **Parameter metode** (jumlah plot, jari-jari, rumus yang dipakai), identitas kegiatan, penandatangan, tim, alat, dan anggaran.
4. Tab **Hasil Analisis** menampilkan tabel seperti lembar Excel template; bisa diunduh sebagai CSV.
5. Tab **LPK** menampilkan laporan lengkap. Teks berlatar kuning bisa disunting langsung. Unduh **Word (.docx)** atau **Cetak / PDF**.

Isian disimpan di browser (per kegiatan). Pustaka dari CDN (perlu internet sekali): JSZip 3.10.1 (membaca .zip SMART) dan docx 8.5.0 (membuat Word).

## Kegiatan: Inventarisasi dan Sebaran Raptor

Acuan: template **Analisa data.xlsx** dan **LPK Identifikasi dan Inventarisasi Jenis serta Sebaran Raptor, Resort Piong, SPTN I Kore, 10–14 Juni 2021**. Data contoh diambil dari laporan tersebut (Tabel 2–5, Lampiran 2 dan 3).

| Analisis | Rumus | Kriteria |
| --- | --- | --- |
| Luas plot | A = n × π × r² (template memakai π = 3,14) | |
| Kepadatan populasi (Jarvinen 1978) | D = N / A, juga ditulis 1 ind/… ha | |
| Keanekaragaman Shannon-Wiener | H' = −Σ Pi ln Pi, Pi = ni/N | Template: H' ≤ 2 rendah, 2–3 sedang, ≥ 3 tinggi. Pilihan Krebs: < 1 rendah, 1–3 sedang, > 3 tinggi |
| Dominansi/kelimpahan relatif | Di = ni/N × 100% | < 2% tidak dominan, 2–5% sub dominan, ≥ 5% dominan |
| Indeks dispersi (Ludwig & Reynolds 1988) | ID = S²/x̄ | ID = 1 acak, > 1 kelompok, < 1 homogen |

Perjumpaan dengan jarak lebih dari jari-jari plot dicatat tetapi tidak dihitung, seperti di LPK 2021.

**Dua rumus indeks dispersi.** Template menghitung ragam dari total individu per jenis: Sxi² = (Xi² − Xi⁴/n)/(n − 1) per jenis dan Sx² = (N − N²/n)/(n − 1) untuk gabungan. Rumus ini dipertahankan (bawaan) supaya hasil sama dengan laporan sebelumnya. Bila jumlah individu per plot tersedia (dari tabel data atau SMART), pilih **Per plot** di Parameter metode: S² = (Σx² − (Σx)²/n)/(n − 1) dengan x = individu per plot. Pada data Piong 2021 hasilnya berbeda: ID raptor 0,805 (homogen) dengan rumus template, 2,398 (kelompok) dengan rumus per plot. Tab Hasil Analisis selalu menampilkan keduanya.

`tests/raptor.test.js` memastikan kalkulator menghasilkan angka yang sama dengan LPK 2021 (luas 3.297 ha, D 0,0027 ind/ha, H' 1,58, Di 11,111%/44,444%, IDi 1,000/2,537, ID raptor 0,804878). Jalankan `node --test`.

Format LPK mengikuti Memorandum M.57/T.41/TU/PEG/02/2026 (laporan kegiatan keteknisan), sama dengan Generator LPK SMART Patrol: sampul, lembar pengesahan, daftar isi/tabel, 1. Pendahuluan, 2. Kegiatan yang dilaksanakan, 3. Hasil yang dicapai (lokasi, jenis, kepadatan, keanekaragaman, dominansi, sebaran), 4. Simpulan dan saran, 5. Penutup, lampiran (Surat Tugas, matriks data, matriks analisis mendatar, peta, dokumentasi).

## Data model SMART: Metode Teknis

Rancangan kategori observasi untuk kegiatan teknis PEH ada di folder [`datamodel/`](datamodel/):

```
Metode Teknis                                   (level 0)  metodeteknis.
└─ Inventarisasi dan Sebaran Raptor             (level 1)  metodeteknis.inventarisasiraptor.
   ├─ Titik Pengamatan (Plot Point Count)       (level 2)  ...titikpengamatan.
   └─ Perjumpaan Raptor                         (level 2)  ...perjumpaanraptor.
```

Kategori level 1 lain (metode PEH berikutnya) ditambahkan di bawah `metodeteknis`. Rincian atribut: [`datamodel/SPESIFIKASI.md`](datamodel/SPESIFIKASI.md). Cara menerapkan di SMART Desktop: [`datamodel/README.md`](datamodel/README.md).

## Struktur repository

```
index.html                 halaman aplikasi
css/style.css              tampilan (sama dengan Generator LPK SMART Patrol)
js/core/                   inti yang dipakai semua kegiatan
  app.js                   kerangka: pilihan kegiatan, isian bersama, tab Data/Hasil/LPK, penyimpanan
  stats.js                 rumus umum (luas plot, kepadatan, Shannon, dominansi, dispersi)
  laporan.js               bagian LPK bersama (kop, sampul, pengesahan, tim, alat, RAB, tata waktu)
  docx.js                  ekspor Word dari pratinjau
  smart-parser.js          pembaca ekspor patroli dan Data Model SMART
  smart-import.js          meratakan observasi SMART per kategori
  datamodel.js             dibuat dari datamodel/metode-teknis.json
  defaults.js              logo bawaan (dibuat tools/build_defaults.py)
kegiatan/raptor/           satu folder per kegiatan
  analisis.js              perhitungan (bisa diuji di Node)
  raptor.js                definisi kegiatan: kolom data, impor SMART, narasi, tabel, LPK
  contoh-piong-2021.js     data contoh dari LPK 2021
  jenis-raptor.js          daftar jenis raptor dari Data Model SMART Balai
datamodel/                 data model SMART Metode Teknis (sumber JSON, XML, spesifikasi)
tools/                     skrip pembangun (datamodel, logo)
tests/                     uji rumus dan contoh file patroli SMART
```

## Menambah kegiatan PEH baru

1. Tambahkan kategori level 1 baru di `datamodel/metode-teknis.json` (di bawah `metodeteknis`), lalu jalankan `python3 tools/build_datamodel.py`.
2. Rumus yang bisa dipakai kegiatan lain masuk ke `js/core/stats.js`; rumus khusus masuk ke folder kegiatan.
3. Buat folder `kegiatan/<nama>/` dengan berkas definisi yang memanggil `PEH.daftar({...})`. Contoh lengkap: `kegiatan/raptor/raptor.js`. Fungsi yang perlu disediakan:

| Fungsi | Kegunaan |
| --- | --- |
| `id`, `judul`, `ringkas`, `kategoriSMART` | identitas kegiatan dan awalan kategori SMART yang dibaca |
| `stateAwal()`, `contoh`, `dariContoh(c)` | isian awal dan data contoh |
| `formParameter(S, changed, U)` | isian parameter metode di panel kiri |
| `panelData(S, hasil, changed, U)` | tab Data |
| `dariSMART(S, observasi, ringkasan)` | mengisi data dari ekspor patroli SMART |
| `hitung(S)` | menjalankan analisis |
| `hasilHtml(hasil, S)`, `csvHasil(hasil, S)` | tab Hasil Analisis dan unduhan CSV |
| `narasi(hasil, S)`, `lpk(hasil, S, notes)` | narasi otomatis dan isi LPK |

4. Muat berkasnya di `index.html` pada blok "Kegiatan", lalu tambahkan uji di `tests/`.

## Pasang di GitHub Pages

Settings → Pages → Source: *Deploy from a branch*, Branch: `main` / root → Save. Aplikasi terbuka di `https://<username>.github.io/PEH-Tambora/`. Jangan unggah file ekspor patroli asli ke repository.
