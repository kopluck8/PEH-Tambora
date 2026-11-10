# Spesifikasi Data Model SMART: Metode Teknis

Dibuat otomatis oleh `tools/build_datamodel.py` dari `datamodel/metode-teknis.json`. Versi 0.1.0.

## Pohon kategori (Observation)

- **Metode Teknis** (level 0) `metodeteknis.` — Kategori level 0 untuk seluruh metode kegiatan teknis jabatan PEH. Setiap metode menjadi satu kategori level 1.
  - **Inventarisasi dan Sebaran Raptor** (level 1) `metodeteknis.inventarisasiraptor.` — Metode point count (plot lingkaran). Template analisis: Analisa data.xlsx; contoh LPK: Resort Piong, Juni 2021.
    - **Titik Pengamatan (Plot Point Count)** (level 2) `metodeteknis.inventarisasiraptor.titikpengamatan.` — Dicatat sekali di pusat setiap plot, termasuk plot tanpa perjumpaan. Jumlah titik = jumlah plot (n).
    - **Perjumpaan Raptor** (level 2) `metodeteknis.inventarisasiraptor.perjumpaanraptor.` — Satu observasi per jenis per perjumpaan. Waktu perjumpaan diambil dari waktu waypoint.

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

## Pilihan untuk atribut daftar (LIST) yang baru

- `jalurpengamatan` (Jalur pengamatan): `jalurpendakian` = Jalur pendakian; `jalaninspeksi` = Jalan inspeksi; `jalurpatroli` = Jalur patroli; `lainnya` = Lainnya
- `tipetutupanlahan` (Tipe tutupan lahan): `savana` = Savana; `hutanlahankering` = Hutan lahan kering; `hutanpegunungan` = Hutan pegunungan; `semakbelukar` = Semak belukar; `kebunladang` = Kebun/ladang masyarakat; `lahanterbuka` = Lahan terbuka; `lainnya` = Lainnya
- `aktivitasraptor` (Aktivitas raptor): `soaring` = Soaring (terbang mengapung); `gliding` = Gliding (meluncur horizontal); `display` = Display/undulating; `hovering` = Hovering; `diving` = Diving (menukik); `perchhunting` = Berburu sambil bertengger (perch hunting); `ambushhunting` = Berburu terbang rendah (ambush hunting); `bertengger` = Bertengger; `terbang` = Terbang; `kawin` = Kawin; `bersarang` = Bersarang; `makan` = Makan; `lainnya` = Lainnya
- `penggunaanruang` (Penggunaan ruang): `atastajuk` = Top (di atas tajuk); `tajuk` = Tajuk; `bawahtajuk` = Bawah tajuk; `permukaantanah` = Permukaan tanah
- `tiperuang` (Tipe ruang): `terbuka` = Terbuka; `tertutup` = Tertutup
