/*
 * Kegiatan: Inventarisasi Tumbuhan Asing Invasif (Invasive Alien Species, IAS).
 * Acuan: LPK inventarisasi IAS Resor Doropeti (Mei 2023), Resor Pancasila (Mei 2023), dan Resor Kawinda Toi (Juli 2023);
 * skor keinvasifan menurut Modul Analisis Risiko Spesies Asing Invasif (Post Border), FORIS Indonesia dan Puslitbang Hutan (2016).
 * Data SMART: kategori metodeteknis.inventarisasijenisinvasif. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const SASARAN = ["Jalur pendakian", "Jalur ternak", "Jalan setapak", "Areal terbuka", "Bekas kebakaran", "Batas kawasan dan ladang", "Dekat permukiman", "Tepi sungai"];
  const EKOSISTEM = [...K.EKOSISTEM.slice(0, -1), "Padang rumput", "Semak belukar", "Ekosistem lainnya"];
  const TINGKAT_Q = ["Rendah", "Medium", "Tinggi", "Sangat tinggi", "Tidak tahu"];
  const BUAH = ["1 tahun", "2 sampai 3 tahun", "Lebih dari 3 tahun", "Tidak tahu"];
  const BIJI = ["Banyak", "Sedikit", "Tidak ada", "Tidak tahu"];
  const VEG = ["Cepat", "Lambat", "Tidak ada", "Tidak tahu"];
  const SEBAR = ["Umum", "Kadang-kadang", "Mungkin tidak", "Tidak tahu"];
  // Jenis yang dinyatakan invasif di LPK IAS Balai (Doropeti, Pancasila, dan Kawinda Toi 2023, termasuk temuan SPTN Wilayah I Kore 2020)
  const JAI_LPK = ["Ageratum conyzoides", "Bidens pilosa", "Chromolaena odorata", "Crassocephalum crepidioides", "Emilia sonchifolia", "Euphorbia hirta", "Hyptis capitata", "Imperata cylindrica", "Lantana camara", "Mimosa diplotricha", "Momordica balsamina", "Psidium guajava", "Solanum torvum", "Themeda arguens", "Acacia auriculiformis"];
  // Famili jenis invasif yang belum tercatat familinya di daftar jenis TN Tambora
  const FAMILI = { ageratum: "Asteraceae", bidens: "Asteraceae", chromolaena: "Asteraceae", crassocephalum: "Asteraceae", emilia: "Asteraceae", euphorbia: "Euphorbiaceae", jatropha: "Euphorbiaceae", hyptis: "Lamiaceae", imperata: "Poaceae", themeda: "Poaceae", ischaemum: "Poaceae", cyperus: "Cyperaceae", lantana: "Verbenaceae", mimosa: "Fabaceae", acacia: "Fabaceae", crotalaria: "Fabaceae", momordica: "Cucurbitaceae", psidium: "Myrtaceae", solanum: "Solanaceae", anacardium: "Anacardiaceae" };
  const familiDari = (r, t) => (t && t.famili) || FAMILI[String(r.latin || "").trim().split(/\s+/)[0].toLowerCase()] || "";
  const kunciJenis = (s) => String(s || "").trim().toLowerCase().split(/\s+/).slice(0, 2).join(" ");
  const SET_JAI = new Set([...JAI_LPK, ...K.taksa.semua.filter((t) => t.invasif).map((t) => t.latin)].map(kunciJenis).filter((x) => x.includes(" ")));
  const dikenalInvasif = (r) => { const t = K.taksa.cari(r.latin) || K.taksa.cari(r.jenis); return SET_JAI.has(kunciJenis(r.latin)) || (!!t && (t.invasif || SET_JAI.has(kunciJenis(t.latin)))); };
  // Kolom Invasif menang; bila kosong, jenis dikenali dari daftar di atas dan daftar jenis TN Tambora
  const isInv = (r) => { const s = String(r.invasif || "").trim().toLowerCase(); return s === "ya" || (s !== "tidak" && dikenalInvasif(r)); };
  const isiInvasif = (r) => { if (!String(r.invasif || "").trim() && dikenalInvasif(r)) r.invasif = "Ya"; };
  const kolVeg = K.kolVegetasi([{ key: "invasif", label: "Invasif", options: ["Ya", "Tidak"], w: 4 }, KOL.keterangan]).map((c) =>
    c.key === "jenis" ? { ...c, onSet: (r, v) => { if (c.onSet) c.onSet(r, v); isiInvasif(r); } } : c.key === "latin" ? { ...c, onSet: (r) => isiInvasif(r) } : c);
  const petakIsi = (S) => K.terisi(S.data.petak, "kode");
  const vegIsi = (S) => K.terisi(S.data.vegetasi, "jenis", "latin").map((r) => ({ ...r, tingkat: String(r.tingkat || "").trim() || "Tumbuhan bawah" }));
  const invIsi = (S) => vegIsi(S).filter(isInv);
  const petakDari = (S) => new Map(petakIsi(S).map((p) => [String(p.kode).trim(), p]));
  const skorIsi = (S) => K.terisi(S.data.skor, "jenis", "latin");
  const cariSkor = (S, r) => skorIsi(S).find((s) => (s.latin && kunciJenis(s.latin) === kunciJenis(r.latin)) || (s.jenis && String(s.jenis).trim().toLowerCase() === String(r.jenis || "").trim().toLowerCase())) || {};

  function inputInvasif(S, P) {
    const vi = K.inputVegetasi(vegIsi(S), P), pk = petakIsi(S);
    const grup = P.perEkosistem === "ya" ? K.unik(pk, "ekosistem").map((e) => { const kode = pk.filter((p) => String(p.ekosistem || "").trim() === e).map((p) => String(p.kode).trim()); return { nama: e, petak: kode, nPetak: kode.length }; }) : [];
    return { rows: vi.rows, luas: vi.luas, nPetak: Number(P.nPetak) || pk.length || "", isInv, basis: P.basisRelatif, grup };
  }
  // Satu perjumpaan = satu jenis invasif pada satu petak
  const perjumpaan = (S) => { const m = new Map(); invIsi(S).forEach((r) => { const k = `${kunciJenis(r.latin || r.jenis)}|${String(r.petak || "").trim()}`; if (!m.has(k)) m.set(k, r); }); return [...m.values()]; };

  window.PEH.kegiatan({
    id: "jenis-invasif", kode: "IAS",
    judul: "Inventarisasi Tumbuhan Asing Invasif (Invasive Alien Species)",
    ringkas: "Petak contoh pada lokasi sasaran. Kerapatan, frekuensi, dan INP tumbuhan asing invasif di dalam komunitas tumbuhan, skor keinvasifan lima faktor, serta sebaran perjumpaan menurut zona dan lokasi sasaran.",
    objek: "tumbuhan asing invasif", objekPeta: "petak contoh dan perjumpaan tumbuhan asing invasif",
    kategoriSMART: "metodeteknis.inventarisasijenisinvasif.",
    contoh: (window.PEH_CONTOH || {})["jenis-invasif"],
    alat: [{ nama: "Peta kerja dan peta grid 500 m × 500 m", jumlah: "1", satuan: "set" }, { nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Kamera", jumlah: "1", satuan: "unit" }, { nama: "Meteran dan tali rafia untuk petak contoh", jumlah: "1", satuan: "set" }, { nama: "Pita ukur (meteran jahit)", jumlah: "1", satuan: "buah" }, { nama: "Parang", jumlah: "1", satuan: "buah" }, { nama: "Buku panduan pengenalan jenis tumbuhan asing invasif", jumlah: "1", satuan: "buah" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "petak", judul: "Petak Contoh", ket: "Satu baris untuk satu petak contoh, termasuk petak tanpa jenis invasif.",
        kolom: [{ key: "kode", label: "Kode petak", w: 4.5, tengah: true }, { key: "grid", label: "Grid", w: 3.5, tengah: true }, KOL.tanggal, KOL.x, KOL.y, KOL.ketinggian, { key: "ekosistem", label: "Tipe ekosistem", list: EKOSISTEM, w: 8 }, { key: "sasaran", label: "Lokasi sasaran", list: SASARAN, w: 8 }, { key: "zona", label: "Zona", list: K.ZONA, w: 6 }, KOL.keterangan],
        smart: { sub: "petakcontoh", map: (o, v) => ({ ...K.dasarObs(o), kode: String(v("noplot") || o.wpId || ""), grid: v("idgrid"), ketinggian: v("ketinggianmdpl"), ekosistem: v("tipeekosistem"), sasaran: v("lokasisasaran"), zona: v("zonasikawasan"), keterangan: v("keterangan") }) } },
      { key: "vegetasi", judul: "Data Vegetasi Petak Contoh", ket: "Satu baris untuk satu jenis pada satu petak dan tingkat pertumbuhan. Catat semua jenis tumbuhan di petak, bukan hanya jenis invasif. Kolom Invasif terisi otomatis untuk jenis yang dikenal invasif dan bisa diubah. Tingkat yang dikosongkan dianggap tumbuhan bawah.",
        kolom: kolVeg,
        smart: { sub: "vegetasi", map: (o, v) => { const r = { ...K.petaVegetasi(o, v), invasif: K.yaTidak(o, "jenisinvasif") }; isiInvasif(r); return r; } },
        baruBaris: (last) => ({ petak: last.petak || "", tingkat: last.tingkat || "Tumbuhan bawah", n: 1 }) },
      { key: "skor", judul: "Penilaian Keinvasifan", ket: "Satu baris untuk satu jenis invasif. Jawab setiap faktor menurut Modul Analisis Risiko Spesies Asing Invasif (2016); pilih Tidak tahu bila belum diketahui.",
        kolom: [...K.kolJenis("Nama jenis", K.kamus("Flora")), { key: "mapan", label: "1. Kemampuan mapan", options: TINGKAT_Q, w: 6 }, { key: "tahan", label: "2. Ketahanan terhadap pengelolaan", options: TINGKAT_Q, w: 6 },
          { key: "buah", label: "3a. Periode berbuah", options: BUAH, w: 6 }, { key: "biji", label: "3b. Produksi biji", options: BIJI, w: 5 }, { key: "vegetatif", label: "3c. Reproduksi vegetatif", options: VEG, w: 5 },
          { key: "burung", label: "4a. Disebarkan burung", options: SEBAR, w: 5 }, { key: "hewan", label: "4b. Disebarkan hewan lain", options: SEBAR, w: 5 }, { key: "air", label: "4c. Disebarkan air", options: SEBAR, w: 5 }, { key: "angin", label: "4d. Disebarkan angin", options: SEBAR, w: 5 },
          { key: "sengaja", label: "5a. Disebarkan manusia dengan sengaja", options: SEBAR, w: 5 }, { key: "tanpaSengaja", label: "5b. Disebarkan manusia tanpa sengaja", options: SEBAR, w: 5 }, { key: "kontaminasi", label: "5c. Mengontaminasi hasil bumi", options: SEBAR, w: 5 }, { key: "ternak", label: "5d. Dibawa hewan ternak", options: SEBAR, w: 5 },
          { key: "asal", label: "Daerah asal", w: 7 }, { key: "acuan", label: "Acuan status invasif", w: 8 }, KOL.keterangan],
        smart: { sub: "keinvasifan", map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); return { jenis, latin, mapan: v("kemampuanmapan"), tahan: v("ketahananpengelolaan"), buah: v("periodeberbuah"), biji: v("produksibiji"), vegetatif: v("reproduksivegetatif"), burung: v("sebaranburung"), hewan: v("sebaranhewan"), air: v("sebaranair"), angin: v("sebaranangin"), sengaja: v("sebaransengaja"), tanpaSengaja: v("sebarantanpasengaja"), kontaminasi: v("sebarankontaminasi"), ternak: v("sebaranternak"), asal: v("asal"), acuan: v("acuaninvasif"), keterangan: v("keterangan") }; } } }
    ],
    parameter: [
      { key: "basisRelatif", label: "Dasar nilai relatif (KR, FR, INP)", options: [["komunitas", "Seluruh jenis di petak contoh (seperti LPK Kawinda Toi 2023)"], ["invasif", "Jenis invasif saja (seperti LPK Doropeti 2023)"]], def: "komunitas" },
      { key: "perEkosistem", label: "Pisahkan menurut tipe ekosistem", options: [["tidak", "Tidak"], ["ya", "Ya, dari kolom tipe ekosistem petak"]], half: true, def: "tidak" },
      ...K.paramVegetasi()
    ],
    paramInfo: "Tumbuhan bawah (herba, semak, dan rumput) dihitung dengan luas petak semai. Dasar nilai relatif menentukan pembagi KR dan FR: seluruh jenis di petak (INP menggambarkan peran jenis invasif di dalam komunitas) atau jenis invasif saja.",
    modul: [
      { m: "daftar", id: "jenis", judul: "Jenis Tumbuhan Asing Invasif yang Ditemukan",
        input: (S) => ({ rows: invIsi(S).map((r) => { const t = K.taksa.cari(r.latin) || K.taksa.cari(r.jenis) || {}, s = cariSkor(S, r); return { ...r, famili: familiDari(r, t), habitus: t.habitus || "", asal: s.asal || "", acuan: s.acuan || "", unit: String(r.petak || "").trim() }; }) }),
        opt: { satuan: "individu", kolom: [{ key: "tingkat", label: "Tingkat" }, { key: "asal", label: "Daerah Asal" }, { key: "acuan", label: "Acuan Status Invasif" }] } },
      { m: "invasif", id: "inp", input: (S, P) => inputInvasif(S, P), opt: (P) => ({ basis: P.basisRelatif, perEkosistem: P.perEkosistem === "ya", luas: K.optVegetasi(P).luas }) },
      { m: "keinvasifan", id: "keinvasifan", input: (S) => ({ rows: skorIsi(S).map((r) => ({ ...r, nama: r.jenis })) }), opt: { cap: "Skor Keinvasifan Tumbuhan Asing Invasif" } },
      { m: "persen", id: "zona", opsional: true, judul: "Perjumpaan menurut Zona Pengelolaan",
        input: (S) => { const pk = petakDari(S); return { items: perjumpaan(S).map((r) => [String((pk.get(String(r.petak || "").trim()) || {}).zona || "").trim(), 1]).filter(([z]) => z) }; },
        opt: { label: "zona pengelolaan", satuan: "perjumpaan", cap: "Perjumpaan Tumbuhan Asing Invasif menurut Zona Pengelolaan" } },
      { m: "persen", id: "sasaran", opsional: true, judul: "Lokasi Sasaran yang Memuat Jenis Invasif",
        input: (S) => { const pk = petakDari(S), kode = [...new Set(invIsi(S).map((r) => String(r.petak || "").trim()).filter(Boolean))]; return { items: kode.map((k) => [String((pk.get(k) || {}).sasaran || "").trim(), 1]).filter(([s]) => s) }; },
        opt: { label: "lokasi sasaran", satuan: "petak berisi jenis invasif", cap: "Lokasi Sasaran Petak Contoh yang Memuat Tumbuhan Asing Invasif" } }
    ],
    lokasiTabel: (S) => ({ cap: "Lokasi Petak Contoh", spec: K.specDari(petakIsi(S), [{ key: "kode", label: "Kode Petak", tengah: true }, { key: "grid", label: "Grid", tengah: true }, { key: "x", label: "X", type: "number", d: 5 }, { key: "y", label: "Y", type: "number", d: 5 }, { key: "ketinggian", label: "Ketinggian (mdpl)", type: "number" }, { key: "ekosistem", label: "Tipe Ekosistem" }, { key: "sasaran", label: "Lokasi Sasaran" }, { key: "zona", label: "Zona" }]) }),
    teks: {
      dasar: ["Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.94/MENLHK/SETJEN/KUM.1/12/2016 tentang Jenis Invasif;", "Peraturan Direktur Jenderal Konservasi Sumber Daya Alam dan Ekosistem Nomor P.10/KSDAE/SET/KSA.0/9/2016 tentang Tata Cara Pelaksanaan Inventarisasi Potensi pada Kawasan Suaka Alam dan Kawasan Pelestarian Alam;"],
      latar: (x) => [K.TN,
        "Kawasan TN Tambora menghadapi gangguan berupa perambahan, pembalakan liar, dan kebakaran hutan yang membentuk areal terbuka. Areal terbuka memudahkan jenis asing, terutama tumbuhan invasif, untuk tumbuh dan menyebar. Jenis asing invasif dapat mendesak jenis asli, menurunkan keanekaragaman hayati, dan mengubah fungsi ekosistem (Sunaryo dan Girmansyah, 2015). Aktivitas manusia di dalam dan di sekitar kawasan, seperti pendakian, perladangan, dan penggembalaan ternak secara lepas, dapat menjadi pembawa jenis asing ke dalam kawasan.",
        `Penetapan jenis invasif mengacu pada Peraturan Menteri LHK Nomor P.94/MENLHK/SETJEN/KUM.1/12/2016 tentang Jenis Invasif, dan pengendalian jenis invasif merupakan salah satu fungsi pengelolaan taman nasional. Pengendalian memerlukan data dasar jenis tumbuhan asing invasif, sebaran, dan tingkat keinvasifannya pada setiap wilayah kerja. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah tersedianya data dasar jenis tumbuhan asing invasif dan potensi persebarannya di ${x.wil}. Tujuan kegiatan ini adalah:`, "1. Mengidentifikasi dan menginventarisasi jenis tumbuhan asing invasif di dalam kawasan;", "2. Mengetahui kerapatan, frekuensi, dan indeks nilai penting tumbuhan asing invasif;", "3. Mengetahui tingkat keinvasifan setiap jenis;", "4. Memetakan sebaran perjumpaan tumbuhan asing invasif dan potensi penyebarannya."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Persiapan: penentuan lokasi sasaran pada areal yang berpotensi menjadi pintu masuk dan wilayah sebaran jenis invasif, seperti jalur pendakian, jalur ternak, areal terbuka, dan batas kawasan yang berbatasan dengan ladang;", "2. Pengambilan data vegetasi pada petak contoh dan penilaian keinvasifan setiap jenis yang terindikasi invasif;", "3. Identifikasi jenis dengan acuan Peraturan Menteri LHK Nomor P.94/MENLHK/SETJEN/KUM.1/12/2016, A Guide Book to Invasive Alien Plant Species in Indonesia (Setyawati dkk., 2015), dan CABI Invasive Species Compendium;", "4. Analisis data dan pemetaan sebaran;", "5. Pelaporan."],
      metode: (x) => ["Inventarisasi dilakukan dengan metode petak contoh (kuadrat) yang diletakkan secara purposif pada lokasi sasaran, terutama di tepi jalur atau jalan setapak dan di areal terbuka, karena tumbuhan asing invasif umumnya tumbuh di tempat terbuka tanpa naungan. Satu petak contoh dapat mewakili satu grid berukuran 500 m × 500 m.",
        `Petak contoh dibuat bersarang menurut tingkat pertumbuhan: ${L.num(Number(x.P.luasSemai) || 4)} m² untuk semai dan tumbuhan bawah (herba, semak, dan rumput), ${L.num(Number(x.P.luasPancang) || 25)} m² untuk pancang, ${L.num(Number(x.P.luasTiang) || 100)} m² untuk tiang, dan ${L.num(Number(x.P.luasPohon) || 400)} m² untuk pohon. Pada setiap petak dicatat seluruh jenis tumbuhan beserta jumlah individunya, serta diameter batang untuk tiang dan pohon, agar peran jenis invasif di dalam komunitas dapat dihitung.`,
        "Jenis yang terindikasi invasif diidentifikasi dengan acuan P.94/MENLHK/SETJEN/KUM.1/12/2016, Setyawati dkk. (2015), dan CABI Invasive Species Compendium, lalu dinilai tingkat keinvasifannya dengan lima faktor menurut Modul Analisis Risiko Spesies Asing Invasif (Post Border) (FORIS Indonesia dan Puslitbang Hutan, 2016). Setiap petak dicatat koordinat, tipe ekosistem, lokasi sasaran, dan zona pengelolaannya.",
        "Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Inventarisasi Jenis Invasif atau pada tally sheet."],
      lokasi: (x) => { const pk = petakIsi(x.S), eko = K.unik(pk, "ekosistem"), alt = K.rentang(pk.map((p) => p.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${alt ? ` Petak contoh berada pada ketinggian ${alt} mdpl` : ""}${eko.length ? `${alt ? " dan mencakup" : " Petak contoh mencakup"} ekosistem ${x.daftarKata(eko.map((e) => e.toLowerCase()))}` : ""}${alt || eko.length ? "." : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}, pada lokasi sasaran yang berpotensi menjadi pintu masuk jenis asing invasif, yaitu jalur pendakian, jalur ternak, areal terbuka, dan batas kawasan yang berbatasan dengan ladang masyarakat.`,
      hasilLokasi: (x) => { const pk = petakIsi(x.S), sa = K.unik(pk, "sasaran"); return pk.length ? `Sebanyak ${x.nTxt(pk.length)} petak contoh diletakkan di ${x.lokasi}${sa.length ? `, pada ${x.daftarKata(sa.map((s) => s.toLowerCase()))}` : ""}.` : `Pengamatan dilakukan di ${x.lokasi}.`; },
      pembahasan: (x) => {
        const out = [], inp = x.A.inp, kv = x.A.keinvasifan, kn = (s) => kunciJenis(s.latin || s.jenis || s.nama);
        if (inp && !inp.kosong && kv && !kv.kosong) {
          const topInp = [...inp.per].sort((a, b) => b.rows[0].INP / b.maksINP - a.rows[0].INP / a.maksINP)[0].rows[0], topK = kv.baris[0];
          if (kn(topInp) === kn(topK)) out.push(`${K.namaJenis(topInp)} memiliki INP tertinggi sekaligus nilai keinvasifan tertinggi (K = ${L.num(topK.K, 1)}), sehingga menjadi prioritas utama pengendalian dan pemantauan.`);
          else out.push(`${K.namaJenis(topInp)} paling berperan di petak contoh (INP ${L.num(topInp.INP, 2)}%), sedangkan nilai keinvasifan tertinggi dimiliki ${topK.nama || topK.latin} (K = ${L.num(topK.K, 1)}). Kedua jenis ini perlu diprioritaskan dalam pengendalian: jenis pertama karena sudah dominan, jenis kedua karena berpotensi menyebar cepat.`);
        }
        const pk = petakDari(x.S), inti = [...new Set(perjumpaan(x.S).filter((r) => /inti/i.test(String((pk.get(String(r.petak || "").trim()) || {}).zona || ""))).map(K.namaJenis))];
        if (inti.length) out.push(`Jenis invasif sudah ditemukan di zona inti, yaitu ${x.daftarKata(inti)}, sehingga perlu penanganan segera agar tidak menyebar ke ekosistem asli yang masih utuh.`);
        else if (petakIsi(x.S).some((p) => /inti/i.test(String(p.zona || ""))) && invIsi(x.S).length) out.push("Pada petak contoh di zona inti tidak ditemukan jenis invasif.");
        const terbuka = perjumpaan(x.S).some((r) => { const p = pk.get(String(r.petak || "").trim()) || {}; return /savana|padang rumput/i.test(String(p.ekosistem || "")) || /terbuka|kebakaran/i.test(String(p.sasaran || "")); });
        if (terbuka) out.push("Sebagian besar tumbuhan asing invasif mudah mapan di areal terbuka atau semi-terbuka walaupun pada tanah miskin hara dan intensitas cahaya tinggi, sehingga savana, padang rumput, dan areal bekas kebakaran di TN Tambora perlu diawasi agar jenis invasif tidak meluas.");
        const marga = [...new Set(invIsi(x.S).concat(skorIsi(x.S)).filter((r) => /\bsp{1,2}\.?$/i.test(String(r.latin || "").trim())).map((r) => String(r.latin).trim()))];
        if (marga.length) out.push(`Sebagian jenis baru teridentifikasi sampai tingkat marga (${x.daftarKata(marga)}), sehingga perlu identifikasi lanjutan sampai tingkat jenis.`);
        return out;
      },
      saran: () => ["Inventarisasi jenis asing invasif perlu diperluas ke wilayah kerja lain agar sebaran jenis invasif di kawasan tergambar menyeluruh", "Jenis dengan INP dan nilai keinvasifan tertinggi perlu diprioritaskan dalam pengendalian dan dipantau secara berkala", "Lokasi rawan penyebaran (jalur pendakian, jalur ternak, dan batas kawasan) perlu diawasi melalui patroli, disertai edukasi masyarakat tentang bahaya jenis invasif", "Perlu kajian metode pengendalian yang sesuai untuk setiap jenis invasif prioritas", K.SARAN_UMUM.smart],
      simpulanAwal: (x) => { const pk = petakIsi(x.S); return pk.length ? `Inventarisasi dilakukan pada ${x.nTxt(pk.length)} petak contoh di ${x.lokasi}` : ""; }
    }
  });
})();
