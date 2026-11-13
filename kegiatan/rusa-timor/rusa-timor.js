/*
 * Kegiatan: Inventarisasi dan Monitoring Satwa Kunci Rusa Timor (transek garis, perjumpaan langsung dan tanda keberadaan).
 * Acuan: LPK monitoring rusa timor Resor Doro Ncanga (2021 sampai 2024), Resor Pancasila (2021 sampai 2023), dan Resor Oi Katupa (2022).
 * Data SMART: kategori metodeteknis.monitoringrusatimor. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const HABITAT = ["Savana", "Semak belukar", "Hutan musim", "Hutan hujan", "Hutan sub pegunungan", "Ekoton savana dan hutan", "Sumber air"];
  const AKT = ["Makan", "Istirahat", "Berjalan", "Berlari", "Minum", "Berkubang", "Lainnya"];
  // Ulangan dari jam waypoint SMART: pengamatan pagi (08.00 sampai 12.00) atau sore sampai malam (18.00 sampai 22.00)
  const ulanganDari = (w) => { const j = parseInt(String(w || "").slice(0, 2), 10); return Number.isFinite(j) ? (j < 15 ? "Pagi" : "Sore/malam") : ""; };
  const TANDA = ["Jejak kaki", "Kotoran (onggokan)", "Bekas makan", "Garukan ranggah", "Tempat istirahat", "Kubangan", "Suara", "Urine"];
  const FASE = ["A", "B", "C", "D", "E", "F"];
  const n0 = (v) => Number(v) || 0;
  const individu = (r) => n0(r.n) || n0(r.anak) + n0(r.muda) + n0(r.dewasa) || n0(r.jantan) + n0(r.betina) || 1;
  // Jarak yang dipakai metode King: jarak tegak lurus r × sin α (seperti LPK 2023) atau jarak kontak r
  const jarakDipakai = (r, P) => { const d = Number(r.jarak), a = Number(r.sudut); if (!Number.isFinite(d) || d <= 0) return ""; return P.jarakKing !== "kontak" && Number.isFinite(a) && String(r.sudut).trim() !== "" ? Math.abs(d * Math.sin((a * Math.PI) / 180)) : d; };
  const transekIsi = (S) => K.terisi(S.data.transek, "kode", "panjang");
  const jenisTanda = (r, rx) => rx.test(String(r.tipe || ""));
  const areaDari = (S) => K.unik(S.data.transek, "area");

  window.PEH.kegiatan({
    id: "rusa-timor", kode: "RUSA",
    judul: "Inventarisasi dan Monitoring Satwa Kunci Rusa Timor",
    ringkas: "Transek garis. Kepadatan populasi (King dan Hayne), struktur populasi, dugaan populasi dari jejak kaki dan onggokan kotoran, pola sebaran, tanda keberadaan, dan vegetasi habitat.",
    objek: "rusa timor", objekPeta: "transek dan titik perjumpaan rusa timor",
    kategoriSMART: "metodeteknis.monitoringrusatimor.",
    contoh: (window.PEH_CONTOH || {})["rusa-timor"],
    alat: [{ nama: "Peta kerja", jumlah: "1", satuan: "lembar" }, { nama: "GPS", jumlah: "2", satuan: "unit" }, { nama: "Kompas", jumlah: "2", satuan: "unit" }, { nama: "Binokuler", jumlah: "2", satuan: "unit" }, { nama: "Lampu senter", jumlah: "4", satuan: "unit" }, { nama: "Kamera digital", jumlah: "1", satuan: "unit" }, { nama: "Kamera jebak (camera trap)", jumlah: "2", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Jam tangan dan parang", jumlah: "1", satuan: "set" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "transek", judul: "Transek Pengamatan", ket: "Satu baris untuk satu transek, termasuk transek tanpa perjumpaan. Luas area sampel dipakai untuk pendugaan dari jejak kaki.",
        kolom: [{ key: "kode", label: "Transek", w: 4.5, tengah: true }, { key: "area", label: "Area pengamatan", w: 9 }, { key: "panjang", label: "Panjang (m)", type: "number", w: 4.5 }, { key: "luasSampel", label: "Luas area sampel (ha)", type: "number", w: 5 }, { key: "habitat", label: "Tipe habitat", list: HABITAT, w: 8 }, { ...KOL.x, label: "X awal" }, { ...KOL.y, label: "Y awal" }, KOL.keterangan],
        smart: { sub: "transek", map: (o, v) => ({ kode: String(v("notransek") || o.wpId || ""), area: v("lokasi"), panjang: v("panjangtransekm"), luasSampel: v("luasha"), habitat: v("tipetutupanlahan"), x: o.x ?? "", y: o.y ?? "", keterangan: v("keterangan") }) } },
      { key: "langsung", judul: "Perjumpaan Langsung", ket: "Satu baris untuk satu kontak (individu atau kelompok). Sudut kontak diukur antara arah transek dan garis pandang ke satwa.",
        kolom: [KOL.tanggal, KOL.waktu, { ...KOL.transek, label: "Transek" }, { key: "ulangan", label: "Ulangan", options: ["Pagi", "Sore/malam"], w: 5 }, { ...KOL.jumlah, label: "Jumlah individu" }, { key: "jarak", label: "Jarak kontak r (m)", type: "number", w: 4.5 }, { key: "sudut", label: "Sudut kontak α (°)", type: "number", w: 4.5 }, { key: "sisi", label: "Ki/Ka", options: ["Kiri", "Kanan"], w: 3.5 },
          { key: "jantan", label: "Jantan", type: "number", w: 3.5 }, { key: "betina", label: "Betina", type: "number", w: 3.5 }, { key: "anak", label: "Anak", type: "number", w: 3.5 }, { key: "muda", label: "Muda", type: "number", w: 3.5 }, { key: "dewasa", label: "Dewasa", type: "number", w: 3.5 }, { key: "aktivitas", label: "Aktivitas", list: AKT, w: 6 }, KOL.x, KOL.y, KOL.keterangan],
        smart: { sub: "perjumpaanlangsung", map: (o, v) => ({ ...K.dasarObs(o), transek: String(v("notransek") || ""), ulangan: ulanganDari(o.waktu), n: Number(v("jumlah")) || "", jarak: v("jarakkesatwam"), sudut: v("sudutkontak"), sisi: v("sisitransek"), jantan: v("jumlahjantan"), betina: v("jumlahbetina"), anak: v("jumlahanakan"), muda: v("jumlahmuda"), dewasa: v("jumlahdewasa"), aktivitas: v("aktivitassatwa"), keterangan: v("keterangan") }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", transek: last.transek || "", ulangan: last.ulangan || "", n: 1 }) },
      { key: "tanda", judul: "Tanda Keberadaan", ket: "Perjumpaan tidak langsung. Jumlah berisi pasangan jejak kaki, onggokan kotoran, atau banyaknya tanda. Fase dekomposisi diisi untuk kotoran.",
        kolom: [KOL.tanggal, KOL.waktu, { ...KOL.transek, label: "Transek" }, { key: "tipe", label: "Tanda keberadaan", list: TANDA, w: 8 }, { ...KOL.jumlah, label: "Jumlah" }, { key: "fase", label: "Fase kotoran", options: FASE, w: 3.5 }, { key: "umur", label: "Umur tanda", options: ["Baru (dalam 1 minggu)", "Cukup lama (>1 bulan)", "Sangat lama (>3bulan)", "Diatas 1 tahun"], w: 7 }, { key: "habitat", label: "Tipe vegetasi", list: HABITAT, w: 7 }, KOL.x, KOL.y, KOL.keterangan],
        smart: { sub: "tandakeberadaan", map: (o, v) => ({ ...K.dasarObs(o), transek: String(v("notransek") || ""), tipe: v("tandakeberadaan"), n: Number(v("jumlah")) || 1, fase: String(v("fasefeses") || "").charAt(0), umur: v("usiatemuan"), habitat: v("tipetutupanlahan"), keterangan: v("keterangan") }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", transek: last.transek || "", n: 1 }) },
      { key: "vegetasi", judul: "Vegetasi Habitat (opsional)", ket: "Analisis vegetasi pada petak contoh di habitat rusa. Satu baris untuk satu individu atau satu jenis per petak.",
        kolom: K.kolVegetasi([KOL.tinggi]), smart: { sub: "vegetasi", map: (o, v) => K.petaVegetasi(o, v) }, baruBaris: (last) => ({ petak: last.petak || "", tingkat: last.tingkat || "", n: 1 }) }
    ],
    parameter: [
      { key: "metodeKepadatan", label: "Rumus kepadatan perjumpaan langsung", options: [["king", "King (Tobing 2008)"], ["hayne", "Hayne (Santosa dkk. 2014)"], ["jalur", "Jalur berlebar tetap"]], def: "king" },
      { key: "jarakKing", label: "Jarak kontak untuk rumus King", options: [["tegak", "Jarak tegak lurus r × sin α (LPK 2023)"], ["kontak", "Jarak kontak r"]], def: "tegak" },
      { key: "ulangan", label: "Ulangan pengamatan dihitung dalam panjang jalur", type: "number", half: true, def: 1 },
      { key: "w", label: "Setengah lebar jalur tetap (m)", type: "number", half: true, def: "" },
      { key: "luasArea", label: "Luas area pengamatan (ha)", type: "number", half: true, def: "" },
      { key: "aJejak", label: "Taraf nyata jejak kaki (a)", type: "number", step: "any", half: true, def: 0.05 },
      { key: "tPellet", label: "Interval waktu onggokan t (hari)", type: "number", half: true, def: "" },
      { key: "dPellet", label: "Laju defekasi d (onggokan/individu/hari)", type: "number", step: "any", half: true, def: "" },
      { key: "aPellet", label: "Luas plot pengamatan onggokan a (ha)", type: "number", step: "any", half: true, def: "" },
      { ...K.paramMetodeID, def: "unit" },
      ...K.paramVegetasi()
    ],
    paramInfo: "LPK rusa Balai memakai metode King dengan jarak tegak lurus (r × sin α) dan panjang transek tanpa dikali ulangan. Rumus indeks dispersi template menghasilkan ragam negatif bila hanya ada satu jenis, sehingga bawaannya per unit transek. Kepadatan dari onggokan kotoran baru dihitung bila t, d, dan a diisi.",
    modul: [
      { m: "transek", id: "kepadatan", judulMetode: "Kepadatan Populasi dari Perjumpaan Langsung", judul: "Kepadatan Populasi dari Perjumpaan Langsung",
        input: (S, P) => ({ kontak: S.data.langsung.map((r) => ({ transek: r.transek, n: individu(r), jarak: jarakDipakai(r, P) })), transek: transekIsi(S).map((t) => ({ id: t.kode, panjang: t.panjang })), ulangan: P.ulangan, metode: P.metodeKepadatan, w: P.w, luasArea: P.luasArea }),
        opt: (P) => ({ metode: P.metodeKepadatan }) },
      { m: "struktur", id: "struktur", input: (S) => ({ rows: S.data.langsung }) },
      { m: "jejak", id: "jejak", judulMetode: "Pendugaan Populasi dari Jejak Kaki",
        input: (S, P) => ({ rows: S.data.tanda.filter((r) => jenisTanda(r, /jejak/i)).map((r) => ({ unit: r.transek, n: r.n })), units: transekIsi(S).map((t) => ({ id: t.kode, luas: t.luasSampel })), a: P.aJejak }), opt: (P) => ({ a: P.aJejak }) },
      { m: "pellet", id: "kotoran", opsional: true, judulMetode: "Pendugaan Populasi dari Onggokan Kotoran",
        input: (S, P) => ({ rows: S.data.tanda.filter((r) => jenisTanda(r, /kotoran|feses/i)).map((r) => ({ unit: r.transek, p: r.n, fase: r.fase })), fase: ["A", "B"], t: P.tPellet, d: P.dPellet, a: P.aPellet, A: P.luasArea }), opt: { fase: ["A", "B"] } },
      { m: "dispersi", id: "sebaran", judul: "Pola Sebaran Rusa Timor",
        input: (S) => ({ rows: S.data.langsung.map((r) => ({ jenis: "Rusa timor", latin: "Rusa timorensis", n: individu(r), unit: r.transek })), units: transekIsi(S).map((t) => t.kode) }), opt: (P) => ({ metodeID: P.metodeID, unitLabel: "transek" }) },
      { m: "persen", id: "tanda", judul: "Tanda Keberadaan Rusa Timor", input: (S) => ({ items: S.data.tanda.filter((r) => String(r.tipe || "").trim()).map((r) => [r.tipe, 1]) }), opt: { label: "tanda keberadaan" } },
      { m: "vegetasi", id: "vegetasi", opsional: true, judul: "Vegetasi Habitat Rusa Timor", objek: "vegetasi habitat rusa timor", input: (S, P) => K.inputVegetasi(S.data.vegetasi, P), opt: (P) => K.optVegetasi(P) }
    ],
    lokasiTabel: (S) => ({ cap: "Transek Pengamatan Rusa Timor", spec: K.specDari(K.terisi(S.data.transek, "kode", "panjang"), [{ key: "kode", label: "Transek", tengah: true }, { key: "area", label: "Area Pengamatan" }, { key: "panjang", label: "Panjang (m)", type: "number" }, { key: "luasSampel", label: "Luas Area Sampel (ha)", type: "number", d: 2 }, { key: "habitat", label: "Tipe Habitat" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Kehutanan Nomor P.81/Menhut-II/2014 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;", "Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;", "Keputusan Kepala Balai Taman Nasional Tambora Nomor SK.5/T.51/TU/KSA/1/2021 tanggal 4 Januari 2021 tentang Penetapan Jenis Satwa Kunci dan Dipandang Penting menjadi Prioritas Pengelolaan untuk Ditingkatkan Populasinya di Kawasan TN Tambora;"],
      latar: (x) => [K.TN,
        "Rusa timor (Rusa timorensis) merupakan satwa dilindungi menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 dan ditetapkan sebagai salah satu jenis satwa kunci yang menjadi prioritas pengelolaan untuk ditingkatkan populasinya di kawasan TN Tambora melalui Keputusan Kepala Balai TN Tambora Nomor SK.5/T.51/TU/KSA/1/2021. Sebaran rusa timor di kawasan terbatas pada lokasi tertentu karena tingginya ancaman dan gangguan, terutama perburuan dan kebakaran hutan.",
        "Rusa membutuhkan sedikitnya empat tipe tutupan lahan sebagai habitatnya, yaitu savana, semak belukar, sungai atau sumber air, dan hutan bervegetasi rapat. Di padang rumput rusa berperan sebagai pemakan rumput (grazer), sedangkan di semak dan hutan sebagai pemakan dedaunan (browser); hutan bervegetasi rapat menjadi tempat berlindung dari cuaca dan predator (Hoogerwerf, 1970; Semiadi dan Nugraha, 2004 dalam Tohari dkk., 2011).",
        `Populasi dan sebaran rusa timor perlu dipantau secara berkala agar dinamika populasinya dapat diketahui dari tahun ke tahun. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah memantau populasi dan sebaran rusa timor di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Memperoleh data populasi dan sebaran rusa timor;", "2. Mengetahui dinamika populasi rusa timor dari tahun ke tahun sebagai bahan pertimbangan pengelolaan dan perencanaan, khususnya pengelolaan satwa prioritas di TN Tambora."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Penetapan area monitoring pada wilayah yang menjadi habitat preferensi rusa timor;", "2. Pengambilan data perjumpaan langsung (jumlah individu, jenis kelamin, kelas umur, jarak dan sudut kontak) serta tanda keberadaan (jejak kaki, kotoran, bekas makan, garukan ranggah, dan tempat istirahat) beserta koordinatnya;", "3. Analisis kepadatan populasi, struktur populasi, dugaan populasi dari jejak kaki dan onggokan kotoran, serta pola sebaran;", "4. Pengamatan kondisi habitat, ketersediaan pakan, dan sumber air;", "5. Pelaporan."],
      metode: (x) => [`Pengumpulan data menggunakan metode transek garis (line transect). Transek diletakkan secara purposif pada wilayah yang diperkirakan menjadi habitat rusa timor, memotong garis kontur, dan mewakili tipe vegetasi yang berbeda (savana, semak belukar, sumber air, dan hutan bervegetasi rapat). Lebar jalur tidak ditetapkan; luas area amatan dihitung setelah pengambilan data dari jarak kontak (Krebs, 1998).`,
        "Pengamatan dilakukan dengan ulangan pada setiap transek, yaitu pagi hari pukul 08.00 sampai 12.00 dan sore sampai malam hari pukul 18.00 sampai 22.00, saat rusa paling aktif. Pengamat berjalan perlahan dan berhenti sekitar 10 menit di titik pengamatan. Agar tidak terjadi penghitungan ganda, jam setiap regu disamakan sehingga perjumpaan antarjalur dapat dicocokkan dari waktu, jumlah, jenis kelamin, umur, dan arah pergerakan satwa.",
        "Pada setiap perjumpaan langsung dicatat waktu, jumlah individu, jenis kelamin, kelas umur, jarak kontak, sudut kontak terhadap transek, dan koordinat. Tanda keberadaan dicatat jenis, jumlah, dan koordinatnya; onggokan kotoran dicatat fase dekomposisinya dan jejak kaki dicatat bila berumur tidak lebih dari satu minggu. Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Monitoring Rusa Timor atau pada tally sheet."],
      lokasi: (x) => { const ar = areaDari(x.S), hab = K.unik(x.D.transek, "habitat"); return `Kegiatan dilaksanakan di ${x.lokasi}.${ar.length ? ` Area pengamatan meliputi ${x.daftarKata(ar)}.` : ""}${hab.length ? ` Transek melintasi tipe habitat ${x.daftarKata(hab.map((h) => h.toLowerCase()))}.` : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Area pengamatan ditetapkan dari interpretasi citra satelit, pengamatan lapangan, dan informasi petugas serta masyarakat tentang lokasi yang sering dijumpai rusa atau tanda keberadaannya, dengan memasukkan empat tipe tutupan lahan habitat rusa (savana, semak belukar, sumber air, dan hutan bervegetasi rapat).`,
      hasilLokasi: (x) => { const t = transekIsi(x.S), Ltot = t.reduce((s, r) => s + n0(r.panjang), 0), ar = areaDari(x.S); return t.length ? `Pengamatan dilakukan pada ${x.nTxt(t.length)} transek${Ltot ? ` dengan panjang total ${L.num(Ltot)} m` : ""}${ar.length ? ` di area ${x.daftarKata(ar)}` : ` di ${x.lokasi}`}${n0(x.P.luasArea) ? `. Luas area pengamatan yang dijadikan areal studi adalah ${L.num(n0(x.P.luasArea), 2)} ha` : ""}.` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const out = [], st = x.A.struktur, td = x.A.tanda;
        if (st && !st.kosong && st.D > st.A + st.Mu) out.push("Perbandingan kelas umur menunjukkan populasi rusa timor yang dijumpai didominasi kelas umur dewasa. Kelas umur anak dan muda yang sedikit atau tidak dijumpai perlu diperhatikan karena menentukan regenerasi populasi.");
        if (td && !td.kosong) out.push("Tanda keberadaan lain seperti garukan ranggah, bekas makan, dan tempat istirahat menunjukkan adanya aktivitas rusa dan kemungkinan lokasi tersebut sering dikunjungi pada periode tertentu. Belum ada model matematis untuk menduga populasi dari tanda tersebut, sehingga tanda ini tidak dipakai dalam pendugaan populasi.");
        const hab = [...new Set([...K.unik(x.D.transek, "habitat"), ...K.unik(x.D.tanda, "habitat")])];
        if (hab.length) out.push(`Habitat rusa timor di area pengamatan terdiri atas ${x.daftarKata(hab.map((h) => h.toLowerCase()))}, yang berfungsi sebagai tempat aktivitas harian, interaksi sosial, perlindungan, sumber pakan, dan air minum rusa.`);
        return out;
      },
      saran: () => ["Perlu pengamatan di lokasi lain yang berpotensi menjadi habitat rusa timor untuk melengkapi data yang sudah ada, didahului survei pendahuluan untuk memastikan keberadaan satwa", "Perlu penggunaan peralatan yang memadai seperti kamera jebak, kamera termal, atau kamera night vision agar perjumpaan langsung, terutama pada malam hari, tercatat lebih akurat", "Habitat rusa perlu dijaga dari kebakaran hutan dan perburuan melalui patroli rutin bersama masyarakat mitra", K.SARAN_UMUM.kapasitas, K.SARAN_UMUM.berkala],
      simpulanAwal: (x) => { const t = transekIsi(x.S), ar = areaDari(x.S); return `Monitoring rusa timor dilakukan pada ${t.length ? `${x.nTxt(t.length)} transek` : "transek pengamatan"}${ar.length ? ` di area ${x.daftarKata(ar)}` : ""}${n0(x.P.luasArea) ? ` dengan luas areal studi ${L.num(n0(x.P.luasArea), 2)} ha` : ""}`; }
    }
  });
})();
