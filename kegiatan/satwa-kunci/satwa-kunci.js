/*
 * Kegiatan: Monitoring Populasi dan Persebaran Satwa Liar Spesies Kunci.
 * Acuan: LPK monitoring satwa kunci Resor Doro Ncanga dan Resor Doropeti (2020) serta Resor Pancasila (2021).
 * Data SMART: kategori metodeteknis.monitoringsatwakunci. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const TIPE = ["Perjumpaan langsung", "Suara", "Jejak kaki", "Kotoran (onggokan)", "Bekas makan", "Garukan ranggah", "Tempat istirahat", "Sarang", "Bulu atau bagian tubuh", "Lainnya"];
  // Umur tanda mengikuti pilihan atribut usiatemuan di Data Model SMART Balai
  const UMUR = ["Baru (dalam 1 minggu)", "Cukup lama (>1 bulan)", "Sangat lama (>3bulan)", "Diatas 1 tahun"];
  const KAMUS = K.kamus("Mamalia", "Aves");
  const n0 = (v) => Number(v) || 0;
  const langsung = (r) => /langsung/i.test(String(r.tipe || ""));
  const kotoran = (r) => /kotoran|feses/i.test(String(r.tipe || ""));
  const individu = (r) => n0(r.n) || n0(r.dewasa) + n0(r.muda) + n0(r.anak) || n0(r.jantan) + n0(r.betina) || 1;
  const jalurIsi = (S) => K.terisi(S.data.jalur, "kode", "nama");
  const temuanIsi = (S) => K.terisi(S.data.temuan, "jenis", "latin");
  // Jenis yang dihitung kepadatan, struktur populasi, dan onggokan kotorannya (bawaan rusa timor)
  const jenisUtama = (P) => String(P.jenisUtama || "").trim();
  const cocok = (r, P) => { const q = jenisUtama(P).toLowerCase(); return !!q && [r.jenis, r.latin].some((s) => String(s || "").trim().toLowerCase() === q); };
  const objekUtama = (P) => (jenisUtama(P) || "satwa kunci").toLowerCase();
  const daftarKunci = (P) => String(P.satwaKunci || "").split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const namaJalur = (S, kode) => { const j = (S.data.jalur || []).find((x) => String(x.kode || "").trim() === String(kode || "").trim()); return (j && String(j.nama || "").trim()) || String(kode || "").trim(); };

  window.PEH.kegiatan({
    id: "satwa-kunci", kode: "SATKUN",
    judul: "Monitoring Populasi dan Persebaran Satwa Liar Spesies Kunci",
    kelompok: "Satwa",
    ringkas: "Penyusuran jalur secara purposif. Perkiraan jumlah individu per jenis dan lokasi dari perjumpaan langsung dan tanda keberadaan, kepadatan populasi metode King, struktur populasi, onggokan kotoran (pellet count), dan sebaran temuan.",
    objek: "satwa kunci", objekPeta: "jalur pengamatan dan titik temuan satwa kunci",
    kategoriSMART: "metodeteknis.monitoringsatwakunci.",
    contoh: (window.PEH_CONTOH || {})["satwa-kunci"],
    alat: [{ nama: "Peta kerja", jumlah: "1", satuan: "lembar" }, { nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Kamera digital", jumlah: "1", satuan: "unit" }, { nama: "Pengukur jarak (rangefinder) atau meteran", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "jalur", judul: "Jalur Pengamatan", ket: "Satu baris untuk satu jalur atau lokasi yang disusuri, termasuk jalur tanpa temuan. Panjang jalur dipakai untuk kepadatan metode King.",
        kolom: [{ key: "kode", label: "Kode jalur", w: 4.5, tengah: true }, { key: "nama", label: "Nama jalur atau lokasi", w: 10 }, KOL.tanggal, { key: "panjang", label: "Panjang (m)", type: "number", w: 4.5 }, { key: "ekosistem", label: "Tipe ekosistem", list: K.EKOSISTEM, w: 8 }, { ...KOL.x, label: "X awal" }, { ...KOL.y, label: "Y awal" }, KOL.keterangan],
        smart: { sub: "jalurpengamatan", map: (o, v) => ({ kode: String(v("notransek") || o.wpId || ""), nama: v("lokasi"), tanggal: o.tanggal || "", panjang: v("panjangtransekm"), ekosistem: v("tipeekosistem"), x: o.x ?? "", y: o.y ?? "", keterangan: v("keterangan") }) } },
      { key: "temuan", judul: "Temuan Satwa Kunci", ket: "Satu baris untuk satu temuan. Perjumpaan langsung: isi jumlah individu dan jarak ke satwa. Tanda keberadaan: isi banyaknya tanda (jejak, onggokan) dan perkiraan individu bila dapat ditaksir; kosongkan perkiraan untuk kotoran.",
        kolom: [KOL.tanggal, KOL.waktu, { key: "jalur", label: "Jalur", w: 4.5, tengah: true }, ...K.kolJenis("Nama jenis", KAMUS), { key: "tipe", label: "Tipe temuan", list: TIPE, w: 8 },
          { ...KOL.jumlah, label: "Jumlah individu atau tanda" }, { key: "taksir", label: "Perkiraan individu (tanda)", type: "number", w: 4.5 }, { key: "jarak", label: "Jarak ke satwa (m)", type: "number", w: 4.5 },
          { key: "jantan", label: "Jantan", type: "number", w: 3.5 }, { key: "betina", label: "Betina", type: "number", w: 3.5 }, { key: "dewasa", label: "Dewasa", type: "number", w: 3.5 }, { key: "muda", label: "Muda", type: "number", w: 3.5 }, { key: "anak", label: "Anak", type: "number", w: 3.5 },
          { key: "umur", label: "Umur tanda", options: UMUR, w: 6 }, { key: "habitat", label: "Tipe ekosistem", list: K.EKOSISTEM, w: 7 }, KOL.x, KOL.y, KOL.ketinggian, KOL.keterangan],
        smart: { sub: "temuansatwa", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenissatwa"); const jp = String(v("jenisperjumpaan") || ""); return { ...K.dasarObs(o), jalur: String(v("notransek") || ""), jenis, latin, tipe: v("tandakeberadaan") || (jp ? (/^suara$/i.test(jp.trim()) ? "Suara" : "Perjumpaan langsung") : ""), n: Number(v("jumlah")) || "", taksir: v("perkiraanindividu"), jarak: v("jarakkesatwam"), jantan: v("jumlahjantan"), betina: v("jumlahbetina"), dewasa: v("jumlahdewasa"), muda: v("jumlahmuda"), anak: v("jumlahanakan"), umur: v("usiatemuan"), habitat: v("tipeekosistem"), ketinggian: v("ketinggianmdpl"), keterangan: v("keterangan") }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", jalur: last.jalur || "", jenis: last.jenis || "", latin: last.latin || "", n: 1 }) }
    ],
    parameter: [
      { key: "satwaKunci", label: "Satwa kunci yang dipantau (pisahkan dengan koma)", def: "Rusa timor, Elang flores" },
      { key: "jenisUtama", label: "Jenis untuk kepadatan, struktur populasi, dan onggokan kotoran", def: "Rusa timor" },
      { key: "metodeKepadatan", label: "Rumus kepadatan perjumpaan langsung", options: [["king", "King (Tobing 2008)"], ["jalur", "Jalur berlebar tetap"]], def: "king" },
      { key: "w", label: "Setengah lebar jalur tetap (m)", type: "number", half: true, def: "" },
      { key: "luasArea", label: "Luas area pengamatan (ha)", type: "number", half: true, def: "" },
      { key: "tPellet", label: "Interval waktu onggokan t (hari)", type: "number", half: true, def: "" },
      { key: "dPellet", label: "Laju defekasi d (onggokan/individu/hari)", type: "number", step: "any", half: true, def: "" },
      { key: "aPellet", label: "Luas plot pengamatan onggokan a (ha)", type: "number", step: "any", half: true, def: "" }
    ],
    paramInfo: "Perkiraan jumlah individu dihitung untuk semua jenis yang tercatat. Kepadatan King, struktur populasi, dan pendugaan dari onggokan kotoran hanya dihitung untuk jenis utama, karena LPK Balai menerapkannya pada rusa timor. Pendugaan dari onggokan kotoran baru dihitung bila t, d, dan a diisi.",
    modul: [
      { m: "perkiraan", id: "perkiraan", judul: "Perkiraan Jumlah Individu dan Sebaran Satwa Kunci",
        input: (S) => ({ rows: temuanIsi(S).map((r) => ({ jenis: r.jenis, latin: r.latin, unit: namaJalur(S, r.jalur), tipe: r.tipe, ketinggian: r.ketinggian, habitat: r.habitat, ...(langsung(r) ? { langsung: individu(r) } : { taksir: kotoran(r) ? 0 : n0(r.taksir) }) })) }) },
      { m: "transek", id: "kepadatan", opsional: true, judul: (P) => `Kepadatan Populasi ${L.judul(jenisUtama(P) || "Satwa Kunci")} dari Perjumpaan Langsung`, objek: objekUtama,
        input: (S, P) => ({ kontak: temuanIsi(S).filter((r) => langsung(r) && cocok(r, P)).map((r) => ({ transek: r.jalur, n: individu(r), jarak: r.jarak })), transek: K.terisi(S.data.jalur, "kode", "panjang").map((t) => ({ id: t.kode, panjang: t.panjang })), ulangan: 1, metode: P.metodeKepadatan, w: P.w, luasArea: P.luasArea }),
        opt: (P) => ({ metode: P.metodeKepadatan, unitLabel: "jalur" }) },
      { m: "struktur", id: "struktur", opsional: true, judul: (P) => `Struktur Populasi ${L.judul(jenisUtama(P) || "Satwa Kunci")}`, objek: objekUtama, input: (S, P) => ({ rows: temuanIsi(S).filter((r) => langsung(r) && cocok(r, P)) }) },
      { m: "pellet", id: "kotoran", opsional: true, judulMetode: "Pendugaan Populasi dari Onggokan Kotoran", objek: objekUtama,
        input: (S, P) => ({ rows: temuanIsi(S).filter((r) => kotoran(r) && cocok(r, P)).map((r) => ({ unit: r.jalur, p: n0(r.n) })), t: P.tPellet, d: P.dPellet, a: P.aPellet, A: P.luasArea }), opt: { fase: [] } },
      { m: "persen", id: "tipe", judul: "Tipe Temuan Satwa Kunci", input: (S) => ({ items: temuanIsi(S).filter((r) => String(r.tipe || "").trim()).map((r) => [r.tipe, 1]) }), opt: { label: "tipe temuan", satuan: "temuan" } }
    ],
    lokasiTabel: (S) => ({ cap: "Jalur Pengamatan Satwa Kunci", spec: K.specDari(jalurIsi(S), [{ key: "kode", label: "Kode", tengah: true }, { key: "nama", label: "Nama Jalur atau Lokasi" }, { key: "tanggal", label: "Tanggal", type: "date" }, { key: "panjang", label: "Panjang (m)", type: "number" }, { key: "ekosistem", label: "Tipe Ekosistem" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;", "Keputusan Kepala Balai Taman Nasional Tambora Nomor SK.5/T.41/TU/KSA/1/2021 tanggal 4 Januari 2021 tentang Penetapan Jenis Satwa Kunci dan Dipandang Penting menjadi Prioritas Pengelolaan untuk Ditingkatkan Populasinya di Kawasan TN Tambora;"],
      latar: (x) => { const sk = daftarKunci(x.P); return [K.TN,
        "Zona rimba merupakan zona terluas di TN Tambora karena peruntukan dan kondisi ekologinya sebagai habitat dan tempat berlindung satwa liar. Sebagian besar satwa dapat dijumpai di hampir setiap blok hutan, tetapi beberapa jenis hanya tersebar di lokasi tertentu karena tingginya ancaman dan gangguan.",
        `Satwa kunci adalah satwa yang keberadaannya sangat penting dan berperan penting dalam ekosistem${sk.length ? `; di TN Tambora jenis yang dipantau meliputi ${x.daftarKata(sk.map((s) => s.toLowerCase()))}` : ""}. Data populasi dan persebaran satwa kunci diperlukan sebagai bahan pertimbangan pengelolaan, dan pemantauan berkala diperlukan untuk melihat perubahan populasinya. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`]; },
      maksud: (x) => [`Maksud kegiatan ini adalah mengetahui jumlah populasi dan persebaran satwa kunci di ${x.wil}. Tujuan kegiatan ini adalah:`, "1. Melakukan monitoring terhadap populasi satwa kunci;", "2. Mengetahui sebaran satwa kunci dan habitatnya sebagai bahan pengelolaan."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Penetapan area monitoring pada wilayah yang kemungkinan besar menjadi habitat satwa kunci, berdasarkan lokasi monitoring sebelumnya dan informasi masyarakat;", "2. Pengambilan data lapangan: mencatat perjumpaan langsung dan tanda keberadaan satwa kunci (jejak, kotoran, bekas garukan, bekas makan, dan suara), mengambil koordinat, dan mengamati kondisi habitat di sekitar jalur;", "3. Tabulasi dan analisis data;", "4. Pelaporan."],
      metode: (x) => { const ju = jenisUtama(x.P); return ["Pengumpulan data menggunakan metode transek, yaitu menyusuri jalur pengamatan yang diletakkan secara purposif pada lokasi yang diperkirakan menjadi habitat satwa kunci, misalnya jalur pendakian, lokasi monitoring tahun sebelumnya, atau lokasi yang ditunjukkan masyarakat.",
        "Di sepanjang jalur dicatat semua data satwa kunci, baik perjumpaan langsung maupun tanda keberadaan berupa jejak, kotoran, bekas garukan pada batang pohon, bekas makan, atau suara. Pada perjumpaan langsung dicatat jumlah individu, jenis kelamin, kelas umur, jarak ke satwa, dan koordinat. Pada tanda keberadaan dicatat jenis dan banyaknya tanda, umur tanda, dan koordinat, lalu jumlah individu ditaksir dari ukuran dan arah jejak.",
        `${ju ? `Untuk ${ju.toLowerCase()} juga dihitung kepadatan populasi dari perjumpaan langsung dengan metode King dan, bila datanya memadai, pendugaan populasi dari jumlah onggokan kotoran (pellet count). ` : ""}Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Monitoring Satwa Kunci atau pada tally sheet.`]; },
      lokasi: (x) => { const jl = jalurIsi(x.S).map((j) => j.nama || j.kode), eko = K.unik(x.D.jalur, "ekosistem"); return `Kegiatan dilaksanakan di ${x.lokasi}.${jl.length ? ` Jalur pengamatan meliputi ${x.daftarKata(jl)}.` : ""}${eko.length ? ` Jalur melintasi ekosistem ${x.daftarKata(eko.map((e) => e.toLowerCase()))}.` : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Jalur pengamatan dipilih secara purposif dengan mempertimbangkan aksesibilitas, lokasi monitoring tahun sebelumnya, dan informasi masyarakat tentang lokasi yang sering dijumpai satwa kunci atau tanda keberadaannya.`,
      hasilLokasi: (x) => { const jl = jalurIsi(x.S), Lt = jl.reduce((s, r) => s + n0(r.panjang), 0), alt = K.rentang(temuanIsi(x.S).map((r) => r.ketinggian)); return jl.length ? `Monitoring dilakukan di ${x.nTxt(jl.length)} jalur pengamatan, yaitu ${x.daftarKata(jl.map((j) => j.nama || j.kode))}${Lt ? `, dengan panjang total ${L.num(Lt)} m` : ""}.${alt ? ` Temuan satwa kunci berada pada ketinggian ${alt} mdpl.` : ""}` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const out = [], pk = x.A.perkiraan, sk = daftarKunci(x.P).map((s) => s.toLowerCase());
        if (pk && !pk.kosong) {
          const ada = new Set(pk.jenis.flatMap((j) => [j.jenis.toLowerCase(), j.latin.toLowerCase()]));
          const tidak = sk.filter((s) => !ada.has(s));
          if (tidak.length) out.push(`Satwa kunci yang tidak teramati dalam kegiatan ini adalah ${x.daftarKata(tidak)}. Hal ini tidak berarti jenis tersebut tidak ada di lokasi, karena waktu dan jalur pengamatan terbatas.`);
          if (pk.NT) out.push("Perkiraan jumlah individu dari tanda keberadaan hanya berdasarkan analisis deskriptif. Jejak dengan ukuran berbeda pada lokasi yang sama diperkirakan berasal dari individu yang berbeda, sehingga semakin banyak jejak yang dijumpai semakin besar pula perkiraan jumlah individunya. Perkiraan ini dapat berbeda dari jumlah sebenarnya dan perlu dilengkapi pengamatan langsung atau kamera jebak.");
        }
        const hab = K.unik(temuanIsi(x.S), "habitat");
        if (hab.length) out.push(`Temuan satwa kunci tersebar pada ekosistem ${x.daftarKata(hab.map((h) => h.toLowerCase()))}. Persebaran satwa umumnya mengikuti sumber pakan dan sumber air, sehingga lokasi temuan dapat dijadikan lokasi monitoring permanen untuk memantau perkembangan populasinya.`);
        return out;
      },
      saran: () => ["Perlu survei pendahuluan sebelum monitoring agar lokasi pengamatan lebih representatif", "Monitoring selanjutnya dapat menggunakan kamera jebak agar keberadaan satwa terpantau secara langsung, tidak hanya diduga dari tanda keberadaannya", "Lokasi temuan satwa kunci perlu dijadikan lokasi monitoring permanen dan dipantau secara berkala", K.SARAN_UMUM.smart],
      simpulanAwal: (x) => { const jl = jalurIsi(x.S); return jl.length ? `Monitoring satwa kunci dilakukan di ${x.nTxt(jl.length)} jalur pengamatan di ${x.lokasi}` : ""; }
    }
  });
})();
