/*
 * Kegiatan: Inventarisasi dan Verifikasi Kawasan dengan Nilai Keanekaragaman Hayati Tinggi.
 * Acuan: RPK dan LPK inventarisasi dan verifikasi kehati tinggi SPTN Wilayah II Pekat 2025; Panduan Direktorat
 * Perencanaan Kawasan Konservasi (SK.15/RKK/IPKK/KSA.0/10/2022 jo. SK.12/RKK/IPKK/KSA.0/12/2023).
 * Data SMART: kategori metodeteknis.verifikasikehatitinggi. (lihat datamodel/SPESIFIKASI.md), ditambah kategori Balai
 * "Ground Check > Tipe Ekosistem" (klasifikasi1te sampai klasifikasi4) dan "Satwa Liar" yang sudah dipakai di patroli.
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const FAUNA = K.kamus("Aves", "Mamalia", "Fauna lain");
  // Klasifikasi tipe ekosistem empat tingkat. Label mengikuti Data Model SMART Balai (Ground Check > Tipe Ekosistem)
  // agar isian manual dan hasil impor SMART terkelompok sama. Zona ketinggian mengikuti pembagian van Steenis (1972).
  const KLAS1 = ["Alami", "Buatan"];
  const KLAS2 = ["Ekosistem Teresterial", "Ekosistem Perairan"];
  const KLAS3 = ["Daratan Rendah (0-1000mdpl)", "Pegunungan Bawah (1000-1500mdpl)", "Pegunungan Atas (1500-2400mdpl)", "Sub Alpin (2400-4150mdpl)"];
  const KLAS4 = ["Hutan Pamah", "Hutan Pegunungan Bawah", "Hutan Pegunungan Atas", "Savana", "Padang Rumput", "Sungai"];
  const KELAS = ["Burung", "Mamalia", "Reptil", "Amfibi", "Serangga", "Lainnya"];
  const TEMUAN = ["Perjumpaan langsung", "Suara", "Jejak kaki", "Kotoran (onggokan)", "Bekas garukan atau gesekan", "Sarang", "Lainnya"];
  const KELAS_TAKSA = { Aves: "Burung", Mamalia: "Mamalia" };
  const isi = (v) => String(v ?? "").trim() !== "";
  const grid = (S) => K.terisi(S.data.grid, "kode", "tipe");
  const veg = (S) => K.terisi(S.data.vegetasi, "jenis", "latin");
  const satwa = (S) => K.terisi(S.data.satwa, "jenis", "latin");
  // Patroli Balai menulis grid di atribut Lokasi ("Grid 681"); kode grid diambil dari situ bila atribut kodegrid kosong
  const gridLokasi = (s) => (String(s || "").trim().match(/^grid\s*([\w.-]+)$/i) || [])[1] || "";
  // Kode grid baris vegetasi: kolom grid, atau awalan kode petak ("288-1" → "288")
  const gridDari = (r) => String(r.grid || "").trim() || String(r.petak || "").trim().split(/[-./\s]/)[0];
  const taksaDari = (r) => K.taksa.cari(r.latin) || K.taksa.cari(r.jenis) || {};
  const kelasDari = (r) => String(r.kelas || "").trim() || KELAS_TAKSA[taksaDari(r).kelompok] || "";
  const sisi = (P) => Number(P.sisiGrid) || 1;
  const angka = (v) => Number(v).toLocaleString("id-ID", { maximumFractionDigits: 2 });
  const gridTxt = (P) => `${angka(sisi(P))} km × ${angka(sisi(P))} km (${angka(sisi(P) * sisi(P) * 100)} ha)`;
  const petakTxt = (luas) => { const s = Math.sqrt(Number(luas) || 0); return `${angka(s)} m × ${angka(s)} m`; };
  const kriteria = (h, P) => (window.PEHStats.KRITERIA_H[P.kriteriaH] || window.PEHStats.KRITERIA_H.template).fn(h).toLowerCase();
  const belumID = (rows) => [...new Set(rows.filter((r) => !isi(r.latin) && !isi(taksaDari(r).latin)).map((r) => String(r.jenis).trim()))];
  const invasif = (rows) => [...new Map(rows.filter((r) => K.dikenalInvasif(r)).map((r) => [K.kunciJenis(r.latin || r.jenis), r])).values()].map(K.namaJenis);

  window.PEH.kegiatan({
    id: "kehati-tinggi", kode: "KEHATI",
    judul: "Inventarisasi dan Verifikasi Kawasan dengan Nilai Keanekaragaman Hayati Tinggi",
    kelompok: "Ekosistem",
    ringkas: "Verifikasi tipe ekosistem pada grid areal kehati tinggi, analisis vegetasi (INP dan H′ per tingkat pertumbuhan), daftar jenis tumbuhan dan satwa beserta status perlindungannya, dan karakteristik setiap tipe ekosistem.",
    objek: "keanekaragaman hayati", objekPeta: "grid verifikasi dan tipe ekosistem",
    kategoriSMART: ["metodeteknis.verifikasikehatitinggi.", "groundcheck.", "satwaliar."],
    contoh: (window.PEH_CONTOH || {})["kehati-tinggi"],
    alat: [{ nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Kompas", jumlah: "1", satuan: "unit" }, { nama: "Peta grid areal kehati tinggi dan peta tutupan lahan terbaru", jumlah: "1", satuan: "set" }, { nama: "Pita diameter", jumlah: "1", satuan: "buah" }, { nama: "Meteran gulung 50 m", jumlah: "1", satuan: "buah" }, { nama: "Tali dan golok tebas", jumlah: "1", satuan: "set" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Kamera", jumlah: "1", satuan: "unit" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "grid", judul: "Grid Verifikasi", ket: "Satu baris untuk satu grid yang dikunjungi. X dan Y diisi koordinat titik pengamatan di dalam grid. Tipe ekosistem diisi empat tingkat seperti kategori SMART Ground Check > Tipe Ekosistem. Kode grid dipakai juga di tabel vegetasi dan satwa untuk menghubungkan data dengan tipe ekosistemnya.",
        kolom: [{ key: "kode", label: "Kode grid", w: 4.5, tengah: true }, KOL.tanggal, { key: "lokasi", label: "Nama lokasi", w: 8 }, { key: "zona", label: "Zona", list: K.ZONA, w: 6.5 }, KOL.x, KOL.y, KOL.ketinggian,
          { key: "kelas1", label: "Klasifikasi 1 (asal)", list: KLAS1, w: 5 }, { key: "kelas2", label: "Klasifikasi 2 (kelompok)", list: KLAS2, w: 7 }, { key: "kelas3", label: "Klasifikasi 3 (zona ketinggian)", list: KLAS3, w: 8.5 }, { key: "tipe", label: "Klasifikasi 4 (tipe ekosistem)", list: KLAS4, w: 8 }, KOL.keterangan],
        smart: { sub: ["titikgrid", "tipeekosis"], gabung: true, map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("kodegrid") || gridLokasi(v("lokasi")) || v("noplot") || o.wpId || ""), lokasi: gridLokasi(v("lokasi")) ? "" : v("lokasi"), zona: v("zonasikawasan"), ketinggian: v("ketinggianmdpl"), kelas1: v("klasifikasi1te"), kelas2: v("klasifikasi2te"), kelas3: v("klasifikasi3"), tipe: v("klasifikasi4"), keterangan: v("keterangan") }) },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", lokasi: last.lokasi || "", zona: last.zona || "" }) },
      { key: "vegetasi", judul: "Vegetasi", ket: "Analisis vegetasi pada petak contoh bersarang di dalam grid. Satu baris untuk satu individu (atau isi jumlah untuk semai, pancang, dan tumbuhan bawah). Kode petak sebaiknya diawali kode grid, misalnya 288-1.",
        kolom: [{ key: "grid", label: "Kode grid", w: 4.5, tengah: true }, ...K.kolVegetasi([KOL.tinggi])], smart: { sub: "vegetasi", map: (o, v) => ({ ...K.petaVegetasi(o, v), grid: String(v("kodegrid") || gridLokasi(v("lokasi"))) }) },
        baruBaris: (last) => ({ grid: last.grid || "", petak: last.petak || "", tingkat: last.tingkat || "", n: 1 }) },
      { key: "satwa", judul: "Perjumpaan Satwa", ket: "Satu baris untuk satu perjumpaan satwa, baik langsung maupun dari tanda keberadaannya.",
        kolom: [KOL.tanggal, KOL.waktu, { key: "grid", label: "Kode grid", w: 4.5, tengah: true }, ...K.kolJenis("Nama jenis satwa", FAUNA), { key: "kelas", label: "Kelompok", options: KELAS, w: 5 }, KOL.jumlah, { key: "temuan", label: "Jenis temuan", list: TEMUAN, w: 6.5 }, KOL.x, KOL.y, KOL.keterangan],
        smart: { sub: ["perjumpaansatwa", "jejaksatwa"], map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenissatwa"); return { ...K.dasarObs(o), grid: String(v("kodegrid") || gridLokasi(v("lokasi"))), jenis, latin, n: Number(v("jumlah")) || 1, temuan: v("tandakeberadaan") || v("tipetemuan") || (o.sub === "perjumpaansatwa" ? "Perjumpaan langsung" : ""), keterangan: v("keterangan") }; } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", grid: last.grid || "", n: 1 }) }
    ],
    parameter: [
      { key: "sisiGrid", label: "Panjang sisi grid (km)", type: "number", step: "any", half: true, def: 1 },
      { ...K.paramKriteriaH, half: true }, K.paramSistem, ...K.paramVegetasi()
    ],
    paramInfo: "Grid yang dikunjungi dicatat di tabel grid beserta klasifikasi tipe ekosistemnya. Data vegetasi dan satwa dihubungkan ke tipe ekosistem melalui kode grid (atau awalan kode petak). Ukuran petak contoh dipakai untuk menghitung kerapatan dan dominansi.",
    modul: [
      { m: "ekosistem", id: "ekosistem", judul: "Karakteristik Tipe Ekosistem", objek: "tipe ekosistem",
        input: (S) => ({ grid: grid(S), veg: veg(S).map((r) => ({ ...r, grid: gridDari(r) })), satwa: satwa(S) }),
        opt: (P) => ({ kriteriaH: P.kriteriaH, sisiGrid: sisi(P), luas: { semai: P.luasSemai, pancang: P.luasPancang, tiang: P.luasTiang, pohon: P.luasPohon, "tumbuhan bawah": P.luasSemai } }) },
      { m: "vegetasi", id: "vegetasi", judul: "Komposisi dan Struktur Vegetasi", objek: "vegetasi", input: (S, P) => K.inputVegetasi(veg(S), P),
        opt: (P) => ({ ...K.optVegetasi(P), kriteriaH: P.kriteriaH, ukuranTxt: { semai: petakTxt(P.luasSemai), pancang: petakTxt(P.luasPancang), tiang: petakTxt(P.luasTiang), pohon: petakTxt(P.luasPohon) } }),
        simpulan: (r, c, x) => `${window.PEHModul.vegetasi.simpulan(r)}; indeks keanekaragaman jenis (H′) ${r.per.map((v) => `tingkat ${v.tingkat} ${L.num(v.H, 2)} (${kriteria(v.H, x.P)})`).join(", ")}` },
      { m: "daftar", id: "tumbuhan", judul: "Daftar Jenis Tumbuhan", objek: "tumbuhan",
        input: (S) => ({ rows: veg(S).map((r) => { const t = taksaDari(r); return { jenis: r.jenis || t.nama || r.latin, latin: r.latin || t.latin || "", famili: K.familiDari(r, t), n: Number(r.n) || 1, unit: gridDari(r) ? `Grid ${gridDari(r)}` : "", habitus: t.habitus || "", iucn: t.iucn || "", p106: t.p106 || "" }; }) }),
        opt: { kolom: [{ key: "habitus", label: "Habitus" }, { key: "iucn", label: "IUCN" }, { key: "p106", label: "P.106/2018" }], metodeTxt: "Jenis tumbuhan dari seluruh petak contoh disusun dalam daftar menurut famili, dilengkapi habitus, jumlah individu, grid tempat ditemukan, status perlindungan menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018, dan kategori daftar merah IUCN." },
        simpulan: (r, c, x) => { const b = belumID(veg(x.S)); return `Teridentifikasi ${x.nTxt(r.S)} jenis tumbuhan${r.famili.length ? ` dari ${r.famili.length} famili` : ""}${b.length ? `; ${x.nTxt(b.length)} jenis di antaranya belum diketahui nama ilmiahnya` : ""}`; } },
      { m: "daftar", id: "satwa", opsional: true, judul: "Daftar Jenis Satwa", objek: "satwa",
        input: (S) => ({ rows: satwa(S).map((r) => { const t = taksaDari(r); return { jenis: r.jenis || t.nama || r.latin, latin: r.latin || t.latin || "", famili: K.familiDari(r, t), n: Number(r.n) || 1, unit: isi(r.grid) ? `Grid ${String(r.grid).trim()}` : "", kelas: kelasDari(r), temuan: r.temuan || "", iucn: t.iucn || "", p106: t.p106 || "Tidak dilindungi" }; }) }),
        opt: { kolom: [{ key: "kelas", label: "Kelompok" }, { key: "temuan", label: "Jenis Temuan" }, { key: "iucn", label: "IUCN" }, { key: "p106", label: "P.106/2018" }], metodeTxt: "Jenis satwa disusun dalam daftar menurut famili, dilengkapi kelompok satwa, jenis temuan, jumlah, grid tempat ditemukan, status perlindungan menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018, dan kategori daftar merah IUCN." },
        simpulan: (r, c, x) => {
          const kel = new Map(); r.baris.forEach((b) => { const k = String(b.kelas || "").split(", ")[0] || "lainnya"; kel.set(k, (kel.get(k) || 0) + 1); });
          const lind = r.baris.filter((b) => /^dilindungi$/i.test(b.p106));
          return `Tercatat ${x.nTxt(r.S)} jenis satwa${kel.size > 1 || !kel.has("lainnya") ? ` (${[...kel.entries()].map(([k, v]) => `${v} jenis ${k.toLowerCase()}`).join(", ")})` : ""}${lind.length ? `; ${x.nTxt(lind.length)} jenis di antaranya dilindungi menurut Permen LHK Nomor P.106/2018, yaitu ${x.daftarKata(lind.map((b) => K.namaJenis(b)))}` : ""}`;
        } }
    ],
    lokasiTabel: (S) => ({ cap: "Grid Verifikasi dan Tipe Ekosistem", spec: K.specDari(grid(S), [{ key: "kode", label: "Kode Grid", tengah: true }, { key: "lokasi", label: "Lokasi" }, { key: "zona", label: "Zona" }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "kelas1", label: "Klasifikasi 1" }, { key: "kelas2", label: "Klasifikasi 2" }, { key: "kelas3", label: "Klasifikasi 3" }, { key: "tipe", label: "Klasifikasi 4 (Tipe Ekosistem)" }]) }),
    teks: {
      dasar: ["Peraturan Direktur Jenderal Konservasi Sumber Daya Alam dan Ekosistem Nomor P.10/KSDAE/SET/KSA.0/9/2016 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;",
        "Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;",
        "Keputusan Direktur Perencanaan Kawasan Konservasi Nomor SK.15/RKK/IPKK/KSA.0/10/2022 tentang Panduan Pelaksanaan Inventarisasi dan Verifikasi Kawasan dengan Nilai Keanekaragaman Hayati Tinggi secara Partisipatif di Kawasan Konservasi Tahun 2020-2024, sebagaimana telah diubah dengan Keputusan Direktur Perencanaan Kawasan Konservasi Nomor SK.12/RKK/IPKK/KSA.0/12/2023;"],
      latar: (x) => [K.TN,
        "Inventarisasi keanekaragaman hayati di kawasan konservasi perlu menyajikan data potensi tumbuhan, satwa, tipe ekosistem, dan bentang alam sebagai dasar pengelolaan. Sebagian potensi tersebut belum terinventarisasi dan belum tersusun dalam data yang menunjukkan kawasan mana yang memiliki nilai keanekaragaman hayati tinggi. Inventarisasi dan verifikasi kawasan bernilai keanekaragaman hayati tinggi juga menjadi salah satu indikator kinerja Direktorat Jenderal Konservasi Sumber Daya Alam dan Ekosistem.",
        `Untuk melengkapi data karakteristik tipe ekosistem tersebut, dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah melengkapi data potensi keanekaragaman hayati dan karakteristik tipe ekosistem pada areal bernilai keanekaragaman hayati tinggi di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Memverifikasi tipe ekosistem pada grid areal kehati tinggi;", "2. Mengumpulkan dan menganalisis data komposisi, struktur, dan keanekaragaman jenis tumbuhan;", "3. Mencatat jenis satwa yang dijumpai beserta status perlindungannya;", "4. Memetakan sebaran grid dan tipe ekosistem yang diverifikasi."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Penentuan grid sampel dari peta grid areal kehati tinggi dan peta tutupan lahan;", "2. Verifikasi zona pengelolaan dan klasifikasi tipe ekosistem pada setiap grid;", "3. Analisis vegetasi pada petak contoh di setiap grid;", "4. Pencatatan satwa yang dijumpai secara langsung maupun dari tanda keberadaannya;", "5. Analisis data, pemetaan, dan penyusunan laporan."],
      metode: (x) => [
        `Areal kawasan dibagi ke dalam grid berukuran ${gridTxt(x.P)}. Grid yang dikunjungi dipilih secara acak sistematis dari grid areal kehati tinggi, kemudian diverifikasi di lapangan melalui eksplorasi dan pengamatan langsung mengikuti panduan inventarisasi dan verifikasi kawasan bernilai keanekaragaman hayati tinggi dari Direktorat Perencanaan Kawasan Konservasi. Pada setiap grid dicatat koordinat titik pengamatan, ketinggian, zona pengelolaan, dan klasifikasi tipe ekosistem empat tingkat, yaitu asal ekosistem (alami atau buatan), kelompok ekosistem, zona ketinggian, dan tipe ekosistem. Zona ketinggian mengikuti pembagian van Steenis (1972): daratan rendah 0 sampai 1.000 mdpl, pegunungan bawah 1.000 sampai 1.500 mdpl, pegunungan atas 1.500 sampai 2.400 mdpl, dan sub alpin di atas 2.400 mdpl.`,
        `Vegetasi diukur dengan petak contoh bersarang di dalam grid, yaitu petak ${petakTxt(x.P.luasSemai)} untuk semai dan tumbuhan bawah, ${petakTxt(x.P.luasPancang)} untuk pancang, ${petakTxt(x.P.luasTiang)} untuk tiang, dan ${petakTxt(x.P.luasPohon)} untuk pohon. Pada setiap petak dicatat jenis dan jumlah individu, serta diameter batang setinggi dada untuk tingkat tiang dan pohon.`,
        "Satwa dicatat dari perjumpaan langsung, suara, dan tanda keberadaan (jejak, kotoran, bekas garukan, dan sarang) selama penjelajahan grid. Status perlindungan jenis mengacu pada Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 dan daftar merah IUCN.",
        "Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Verifikasi Kehati Tinggi atau pada tally sheet. Klasifikasi tipe ekosistem dapat juga dicatat pada kategori Ground Check > Tipe Ekosistem, dan perjumpaan satwa pada kategori Satwa Liar."],
      lokasi: (x) => { const g = grid(x.S), lk = K.unik(g, "lokasi"), alt = K.rentang(g.map((r) => r.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${g.length ? ` Grid yang diverifikasi berada${lk.length ? ` di ${x.daftarKata(lk)}` : ""}${alt ? ` pada ketinggian ${alt} mdpl` : ""}.` : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Grid sampel dipilih dari peta grid areal kehati tinggi dengan mempertimbangkan keterwakilan tipe ekosistem, zona pengelolaan, dan aksesibilitas.`,
      hasilLokasi: (x) => {
        const g = grid(x.S), zona = K.unik(g, "zona"), alt = K.rentang(g.map((r) => r.ketinggian)), nP = new Set(veg(x.S).map((r) => String(r.petak || "").trim()).filter(Boolean)).size;
        if (!g.length) return `Verifikasi dilakukan di ${x.lokasi}.`;
        return `Verifikasi dilakukan pada ${x.nTxt(g.length)} grid berukuran ${gridTxt(x.P)} di ${x.lokasi}.${zona.length ? ` Grid tersebut berada di ${x.daftarKata(zona.map((z) => window.PEHModul.util.kecil(/^zona/i.test(z) ? z : `zona ${z}`)))}` : ""}${alt ? `${zona.length ? "," : " Grid tersebut berada"} pada ketinggian ${alt} mdpl` : ""}${zona.length || alt ? "." : ""}${nP ? ` Analisis vegetasi dilakukan pada ${x.nTxt(nP)} petak contoh.` : ""}`;
      },
      pembahasan: (x) => {
        const out = [], e = x.A.ekosistem, v = x.A.vegetasi, rows = veg(x.S), kecil = window.PEHModul.util.kecil;
        if (e && !e.kosong) {
          const s = e.rows.filter((r) => r.S).sort((a, b) => b.S - a.S);
          if (s.length > 1) out.push(`Jumlah jenis tumbuhan terbanyak tercatat pada ${kecil(s[0].tipe)} dengan ${s[0].S} jenis, dan paling sedikit pada ${kecil(s[s.length - 1].tipe)} dengan ${s[s.length - 1].S} jenis. Perbedaan ini dipengaruhi juga oleh jumlah petak contoh pada setiap tipe ekosistem, sehingga perbandingan antartipe sebaiknya memakai jumlah petak yang seimbang.`);
        }
        if (v && !v.kosong) {
          const tk = (n) => v.per.find((p) => p.tingkat === n), ph = tk("pohon"), muda = ["pancang", "semai"].map(tk).filter(Boolean);
          if (ph && muda.length) {
            const kunci = (r) => window.PEHModul.util.kunci(r.latin || r.jenis), set = new Set(muda.flatMap((p) => p.rows.map(kunci))), ada = ph.rows.filter((r) => set.has(kunci(r))).length;
            out.push(`Dari ${x.nTxt(ph.rows.length)} jenis pada tingkat pohon, ${x.nTxt(ada)} jenis juga dijumpai pada tingkat pancang atau semai. ${ada * 2 >= ph.rows.length ? "Sebagian besar jenis pohon memiliki permudaan di lokasi kegiatan, sehingga regenerasi alaminya dapat berlangsung." : "Sebagian besar jenis pohon belum dijumpai permudaannya, sehingga regenerasi alaminya perlu dipantau."}`);
          }
          const tinggi = v.per.filter((p) => kriteria(p.H, x.P) === "tinggi").map((p) => p.tingkat);
          if (tinggi.length) out.push(`Keanekaragaman jenis tergolong tinggi pada tingkat ${x.daftarKata(tinggi)}, yang menunjukkan komunitas tumbuhan pada tingkat tersebut tersusun atas banyak jenis dengan jumlah individu yang relatif merata.`);
        }
        const inv = invasif(rows);
        if (inv.length) out.push(`Tercatat ${x.nTxt(inv.length)} jenis yang tergolong jenis asing invasif dalam data Balai, yaitu ${x.daftarKata(inv)}. Jenis ini mudah menutupi areal terbuka, misalnya bekas kebakaran atau pohon tumbang, sehingga sebarannya perlu dipantau.`);
        const b = belumID(rows);
        if (b.length) out.push(`Sebanyak ${x.nTxt(b.length)} jenis tumbuhan belum diketahui nama ilmiahnya (${x.daftarKata(b.slice(0, 5))}${b.length > 5 ? ", dan lainnya" : ""}), sehingga perlu diverifikasi dengan foto dan spesimen herbarium.`);
        const sa = x.A.satwa;
        if (sa && !sa.kosong) { const lind = sa.baris.filter((r) => /^dilindungi$/i.test(r.p106)); if (lind.length) out.push(`Grid yang diverifikasi menjadi habitat ${x.nTxt(lind.length)} jenis satwa dilindungi, yaitu ${x.daftarKata(lind.map((r) => K.namaJenis(r)))}, sehingga nilai penting keanekaragaman hayatinya bertambah.`); }
        return out;
      },
      saran: (x) => {
        const rows = veg(x.S);
        return ["Verifikasi perlu dilanjutkan pada grid, zona, dan tipe ekosistem yang belum terwakili agar karakteristik setiap tipe ekosistem di kawasan dapat dibandingkan",
          belumID(rows).length ? "Jenis tumbuhan yang belum teridentifikasi perlu didokumentasikan dengan foto dan spesimen herbarium, lalu diverifikasi bersama ahli taksonomi" : "Identifikasi jenis perlu dilengkapi dengan foto dan spesimen herbarium agar mudah diverifikasi",
          invasif(rows).length ? "Sebaran jenis asing invasif perlu dipantau, terutama pada areal terbuka bekas kebakaran dan pohon tumbang" : "",
          "Data grid, vegetasi, dan satwa dari kegiatan lain (inventarisasi, monitoring, dan patroli) perlu digabungkan per tipe ekosistem agar basis data kehati tinggi makin lengkap", K.SARAN_UMUM.smart].filter(Boolean);
      },
      simpulanAwal: (x) => { const g = grid(x.S); return `Verifikasi dilakukan pada ${g.length ? `${x.nTxt(g.length)} grid berukuran ${gridTxt(x.P)}` : "grid areal kehati tinggi"} di ${x.lokasi}`; }
    }
  });
})();
