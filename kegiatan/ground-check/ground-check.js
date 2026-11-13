/*
 * Kegiatan: Ground Check Verifikasi Tutupan Lahan/Open Area dan Tipe Ekosistem.
 * Acuan: LPK ground check Resor Doro Ncanga (2023), Resor Doropeti (2023, 2024), Resor Kawinda Toi, dan Resor Pancasila.
 * Data SMART: kategori metodeteknis.groundchecktutupanlahan. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const KELAS = ["Hutan", "Hutan lahan kering primer", "Hutan lahan kering sekunder", "Hutan tanaman", "Semak belukar", "Savana", "Padang rumput", "Pertanian lahan kering", "Pertanian lahan kering campur semak", "Perkebunan", "Permukiman", "Lahan terbuka", "Tubuh air"];
  const { EKOSISTEM, ZONA } = K;
  const STATUS = ["Non open area", "Open area", "Open area alami", "Open area buatan"];
  const PENYEBAB = ["Pertanian/perladangan", "Perkebunan", "Permukiman", "Bekas kebakaran", "Bekas pembalakan", "Jalan atau sarana", "Bencana alam", "Lainnya"];
  const titikIsi = (S) => K.terisi(S.data.titik, "kode", "peta", "lapangan");
  const kelompok = (rows, key) => { const m = new Map(); rows.forEach((r) => { const k = String(r[key] || "").trim(); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m.entries()].sort((a, b) => b[1] - a[1]); };
  const terbuka = (r) => /^open/i.test(String(r.openArea || "").trim());

  window.PEH.kegiatan({
    id: "ground-check", kode: "GC",
    judul: "Ground Check Verifikasi Tutupan Lahan/Open Area dan Tipe Ekosistem",
    ringkas: "Verifikasi lapangan peta tutupan lahan, status open area, dan tipe ekosistem. Matriks kesalahan, akurasi keseluruhan, kappa, rekap open area per penyebab dan zona, serta analisis vegetasi petak contoh.",
    objek: "titik ground check", objekPeta: "titik ground check tutupan lahan dan tipe ekosistem",
    kategoriSMART: "metodeteknis.groundchecktutupanlahan.",
    contoh: (window.PEH_CONTOH || {})["ground-check"],
    alat: [{ nama: "Peta kerja dan peta hasil interpretasi citra terbaru", jumlah: "1", satuan: "set" }, { nama: "GPS", jumlah: "2", satuan: "unit" }, { nama: "Kompas", jumlah: "1", satuan: "unit" }, { nama: "Kamera digital", jumlah: "1", satuan: "unit" }, { nama: "Meteran dan pita diameter", jumlah: "1", satuan: "set" }, { nama: "Tali rafia untuk petak ukur", jumlah: "1", satuan: "gulung" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Golok tebas", jumlah: "2", satuan: "buah" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "titik", judul: "Titik Ground Check", ket: "Satu baris untuk satu titik. Kelas lapangan diisi dengan sistem kelas yang sama dengan peta agar akurasi dapat dihitung; uraian rinci ditulis di kolom deskripsi.",
        kolom: [{ key: "kode", label: "ID titik", w: 4.5, tengah: true }, KOL.tanggal, { key: "lokasi", label: "Lokasi/blok", w: 8 }, KOL.x, KOL.y, KOL.ketinggian, { key: "peta", label: "Tutupan lahan (peta)", list: KELAS, w: 8 }, { key: "lapangan", label: "Tutupan lahan (lapangan)", list: KELAS, w: 8 }, { key: "rinci", label: "Deskripsi tutupan lapangan", w: 9 },
          { key: "openArea", label: "Status open area", list: STATUS, w: 7 }, { key: "penyebab", label: "Penyebab open area", list: PENYEBAB, w: 7 }, { key: "ekoPeta", label: "Tipe ekosistem (peta)", list: EKOSISTEM, w: 8 }, { key: "ekoLapangan", label: "Tipe ekosistem (lapangan)", list: EKOSISTEM, w: 8 }, { key: "zona", label: "Zona", list: ZONA, w: 6 }, KOL.keterangan],
        smart: { sub: "titikgroundcheck", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), lokasi: "", ketinggian: v("ketinggianmdpl"), peta: v("tutupanlahanpeta"), lapangan: v("tutupanlahanlapangan"), rinci: v("keterangan"), openArea: v("statusopenarea"), penyebab: v("penyebabopenarea"), ekoPeta: v("tipeekosistempeta"), ekoLapangan: v("tipeekosistem"), zona: v("zonasikawasan"), keterangan: "" }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", lokasi: last.lokasi || "" }) },
      { key: "vegetasi", judul: "Vegetasi Petak Contoh", ket: "Petak ukur bersarang di titik ground check; kolom Petak diisi ID titik. Satu baris untuk satu individu atau satu jenis per petak.",
        kolom: K.kolVegetasi([KOL.tinggi]), smart: { sub: "vegetasi", map: (o, v) => K.petaVegetasi(o, v) }, baruBaris: (last) => ({ petak: last.petak || "", tingkat: last.tingkat || "", n: 1 }) }
    ],
    parameter: [...K.paramVegetasi()],
    paramInfo: "Panduan verifikasi tahun 2023 menggolongkan tutupan alami bukan hutan (semak belukar, savana, padang rumput) sebagai non open area. Status open area alami dan buatan tetap dapat dipakai bila mengikuti LPK sebelumnya.",
    modul: [
      { m: "tutupan", id: "tuplah", judul: "Kesesuaian Peta Tutupan Lahan dengan Kondisi Lapangan", judulMetode: "Kesesuaian Peta Tutupan Lahan", input: (S) => ({ titik: titikIsi(S).map((r) => ({ id: r.kode, peta: r.peta, lapangan: r.lapangan, openArea: r.openArea })) }), opt: { label: "tutupan lahan" } },
      { m: "persen", id: "openarea", judul: "Status Open Area", input: (S) => ({ items: titikIsi(S).filter((r) => String(r.openArea || "").trim()).map((r) => [r.openArea, 1]) }), opt: { label: "status open area", cap: "Persentase Status Open Area pada Titik Ground Check" } },
      { m: "persen", id: "penyebab", opsional: true, judul: "Penyebab Open Area", input: (S) => ({ items: titikIsi(S).filter((r) => terbuka(r) && String(r.penyebab || "").trim()).map((r) => [r.penyebab, 1]) }), opt: { label: "penyebab open area", cap: "Penyebab Open Area pada Titik Ground Check" } },
      { m: "tutupan", id: "ekosistem", opsional: true, judul: "Kesesuaian Peta Tipe Ekosistem dengan Kondisi Lapangan", judulMetode: "Kesesuaian Peta Tipe Ekosistem", input: (S) => ({ titik: K.terisi(S.data.titik, "ekoPeta", "ekoLapangan").map((r) => ({ id: r.kode, peta: r.ekoPeta, lapangan: r.ekoLapangan })) }), opt: { label: "tipe ekosistem" } },
      { m: "vegetasi", id: "vegetasi", opsional: true, judul: "Analisis Vegetasi Petak Contoh", objek: "vegetasi", input: (S, P) => K.inputVegetasi(S.data.vegetasi, P), opt: (P) => ({ ...K.optVegetasi(P), ukuranTxt: { semai: "2 m × 2 m", pancang: "5 m × 5 m", tiang: "10 m × 10 m", pohon: "20 m × 20 m" } }) }
    ],
    judulLokasi: "Lokasi dan Titik Ground Check",
    lokasiTabel: (S) => ({ cap: "Titik Ground Check dan Hasil Verifikasi Lapangan", spec: K.specDari(titikIsi(S), [{ key: "kode", label: "ID Titik", tengah: true }, { key: "x", label: "X", type: "number", d: 6 }, { key: "y", label: "Y", type: "number", d: 6 }, { key: "peta", label: "Tutupan Lahan (Peta)" }, { key: "rinci", label: "Hasil Ground Check" }, { key: "openArea", label: "Status Open Area" }, { key: "zona", label: "Zona" }]) }),
    teks: {
      dasar: ["Peraturan Direktur Jenderal Konservasi Sumber Daya Alam dan Ekosistem Nomor P.10/KSDAE/SET/KSA.0/9/2016 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;", "Keputusan Direktur Perencanaan Kawasan Konservasi Nomor SK.12/RKK/IPKK/KSA.0/12/2023 tentang Perubahan atas Keputusan Direktur Perencanaan Kawasan Konservasi Nomor SK.15/RKK/IPKK/KSA.0/10/2022 tentang Panduan Pelaksanaan Kegiatan Inventarisasi dan Verifikasi Kawasan dengan Nilai Keanekaragaman Hayati Tinggi secara Partisipatif di Kawasan Konservasi Tahun 2020-2024;"],
      latar: (x) => [K.TN,
        "Peta penutupan lahan dan peta indikatif tipe ekosistem disusun dari interpretasi citra satelit. Hasil interpretasi, baik manual maupun otomatis, tidak selalu sesuai dengan kondisi di lapangan, sehingga perlu diverifikasi melalui pengecekan lapangan (ground check). Data area terbuka (open area) yang akurat memudahkan pemantauan ada tidaknya aktivitas masyarakat di dalam kawasan dan menjadi dasar pengambilan keputusan pengelolaan.",
        `Verifikasi tutupan lahan/open area dan tipe ekosistem merupakan bagian dari kegiatan Inventarisasi dan Verifikasi Kawasan dengan Nilai Keanekaragaman Hayati Tinggi secara Partisipatif di Kawasan Konservasi. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah memverifikasi data penutupan lahan, area terbuka (open area), dan tipe ekosistem di ${x.wil} sebagai bagian integrasi data inventarisasi keanekaragaman hayati kawasan. Tujuan kegiatan ini adalah:`,
        "1. Melakukan ground check penutupan lahan dan area terbuka (open area);", "2. Melakukan ground check tipe ekosistem;", "3. Melakukan inventarisasi dan verifikasi keanekaragaman jenis tumbuhan pada petak contoh."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Penentuan titik sampel dari peta indikatif tutupan lahan/open area dan tipe ekosistem atau dari hasil interpretasi citra satelit;", "2. Verifikasi lapangan kelas tutupan lahan, status open area beserta penyebabnya, dan tipe ekosistem, dilengkapi foto dari empat arah mata angin;", "3. Analisis vegetasi pada petak contoh;", "4. Analisis kesesuaian peta dengan kondisi lapangan dan pelaporan."],
      metode: () => ["Titik ground check ditentukan dari peta indikatif tutupan lahan/open area dan peta indikatif tipe ekosistem atau dari hasil interpretasi citra satelit terbaru. Titik dipilih mewakili areal dengan kelas yang sama, diutamakan pada wilayah yang data citranya minim (misalnya tertutup awan) atau rawan gangguan, dengan mempertimbangkan kemudahan akses, tenaga, dan peralatan.",
        "Tim menuju titik dengan bantuan GPS, lalu mengamati dan mencatat kelas tutupan lahan, status open area beserta penyebabnya, tipe ekosistem, zona, dan deskripsi visual lokasi. Foto kondisi lapangan diambil dari empat arah mata angin. Menurut panduan verifikasi tahun 2023, tutupan alami bukan hutan seperti semak belukar, savana, dan padang rumput termasuk non open area.",
        "Analisis vegetasi dilakukan pada petak ukur bersarang: 2 m × 2 m untuk semai dan tumbuhan bawah, 5 m × 5 m untuk pancang, 10 m × 10 m untuk tiang, dan 20 m × 20 m untuk pohon. Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Ground Check Tutupan Lahan atau pada tally sheet."],
      lokasi: (x) => { const lk = K.unik(x.D.titik, "lokasi"); return `Kegiatan dilaksanakan di ${x.lokasi}.${lk.length ? ` Titik ground check tersebar di ${x.daftarKata(lk)}.` : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Sasaran titik ground check mengikuti peta kerja yang disusun dari peta indikatif tutupan lahan/open area dan peta indikatif tipe ekosistem.`,
      hasilLokasi: (x) => { const t = titikIsi(x.S), lk = K.unik(t, "lokasi"), zn = K.unik(t, "zona"); return t.length ? `Ground check dilakukan pada ${x.nTxt(t.length)} titik${lk.length ? ` di ${x.daftarKata(lk)}` : ` di ${x.lokasi}`}${zn.length ? `, yang berada di ${x.daftarKata(zn)}` : ""}.` : `Ground check dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const t = titikIsi(x.S), oa = t.filter(terbuka), out = [];
        if (!t.length) return "";
        out.push("Area terbuka (open area) di kawasan konservasi adalah area yang mengalami berbagai tingkat degradasi dari kondisi alaminya, baik oleh faktor alam (kebakaran, jenis invasif, letusan gunung api, longsor) maupun oleh manusia (perambahan, pembalakan liar, permukiman, dan konversi lahan).");
        if (oa.length) {
          const pb = kelompok(oa, "penyebab"), zn = kelompok(oa, "zona"), lk = kelompok(oa, "lokasi");
          out.push(`Titik open area${lk.length ? ` terdapat di ${x.daftarKata(lk.map(([k]) => k))}` : ""}${zn.length ? ` dan berada di ${x.daftarKata(zn.map(([k, n]) => `${k} (${n} titik)`))}` : ""}.${pb.length ? ` Penyebab open area yang tercatat adalah ${x.daftarKata(pb.map(([k, n]) => `${k.toLowerCase()} (${n} titik)`))}.` : ""}`);
        }
        const tl = x.A.tuplah;
        if (tl && !tl.kosong && tl.beda.length) out.push(`Titik yang kelas lapangannya berbeda dengan peta menjadi bahan perbaikan kelas dan batas poligon pada peta tutupan lahan.`);
        return out;
      },
      saran: () => ["Hasil verifikasi dipakai untuk memperbaiki kelas dan batas poligon pada peta tutupan lahan dan peta tipe ekosistem", "Titik open area akibat aktivitas manusia perlu ditindaklanjuti dengan patroli, pembinaan masyarakat, atau pemulihan ekosistem sesuai zonanya", "Ground check perlu dilakukan berkala pada wilayah yang tutupan lahannya cepat berubah", "Perlu peningkatan kapasitas pelaksana dalam pengenalan jenis tumbuhan dan penggunaan GPS serta aplikasi pemetaan", K.SARAN_UMUM.smart],
      simpulanAwal: (x) => { const t = titikIsi(x.S), g = kelompok(t, "openArea"); return t.length ? `Ground check dilakukan pada ${x.nTxt(t.length)} titik${g.length ? `, terdiri atas ${x.daftarKata(g.map(([k, n]) => `${n} titik ${k.toLowerCase()}`))}` : ""}` : ""; }
    }
  });
})();
