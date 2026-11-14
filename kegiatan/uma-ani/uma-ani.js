/*
 * Kegiatan: Identifikasi Jenis, Jumlah, dan Sebaran Pohon Sarang Lebah Madu Hutan (Uma Ani).
 * Acuan: LPK identifikasi jenis, jumlah, dan sebaran pohon sarang madu alam (uma ani) SPTN Wilayah I Kore 2024,
 * termasuk perbandingan jumlah sarang dengan survei 2019 pada pohon yang sama.
 * Data SMART: kategori metodeteknis.sebaranumaani. (lihat datamodel/SPESIFIKASI.md).
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const FLORA = K.kamus("Flora");
  const KONDISI = ["Hidup sehat", "Hidup rusak", "Mati atau tumbang"];
  const PANEN = ["Ada", "Tidak ada"];
  const isi = (v) => String(v ?? "").trim() !== "";
  const pohon = (S) => K.terisi(S.data.pohon, "jenis", "latin");
  // Pohon yang saat diamati tidak bersarang (jumlah sarang diisi 0) tidak masuk daerah sebaran sarang
  const bersarang = (r) => !(isi(r.jumlahSarang) && Number(r.jumlahSarang) === 0);
  const adaBanding = (S) => pohon(S).some((r) => isi(r.sarangLalu));
  const tahunKini = (S) => String(S.identitas.mulai || "").slice(0, 4);
  const tahunLalu = (P) => String(P.tahunLalu || "").trim();
  const survei = (P) => (tahunLalu(P) ? `survei tahun ${tahunLalu(P)}` : "survei sebelumnya");
  const adaVegetasi = (S) => K.terisi(S.data.vegetasi, "jenis", "latin").length > 0 || !pohon(S).length;
  const jari = (luas) => L.num(Math.sqrt((Number(luas) || 0) / Math.PI), 2);
  const lingkaran = (P) => Object.fromEntries([["semai", P.luasSemai], ["pancang", P.luasPancang], ["tiang", P.luasTiang], ["pohon", P.luasPohon]].map(([k, a]) => [k, `lingkaran berjari-jari ${jari(a)} m (${L.num(Number(a) || 0)} m²)`]));
  const kelompok = (r, P) => (P.kelompokMCP === "resor" ? String(r.resor || "").trim() : P.kelompokMCP === "lokasi" ? String(r.lokasi || "").trim() : "");
  const rasio = (a, b) => `${a} dari ${b} pohon (${L.num((a / b) * 100, 1)}%)`;

  // Tabel sebaran pohon sarang: koordinat dan jumlah sarang setiap pohon
  function specPohon(rows, geo) {
    const { k, t, n } = window.PEHModul.cell, esc = L.esc;
    const nn = (v, d) => (!isi(v) || !Number.isFinite(Number(v)) ? k("-") : n(Number(v), d));
    const tot = rows.reduce((a, r) => a + (Number(r.jumlahSarang) || 0), 0);
    return { head: ["No", "Kode", "Lokasi", "Jenis Pohon", "Nama Ilmiah", geo ? "Bujur (X)" : "X (m)", geo ? "Lintang (Y)" : "Y (m)", "Ketinggian (mdpl)", "Jumlah Sarang"],
      rows: rows.map((r, i) => [k(i + 1), k(esc(r.kode || "-")), t(esc(r.lokasi || "-")), t(esc(r.jenis || "-")), t(L.sci(r.latin)), nn(r.x, geo ? 6 : 0), nn(r.y, geo ? 6 : 0), nn(r.ketinggian, 0), nn(r.jumlahSarang, 0)]),
      total: [[{ t: "Jumlah", cs: 8 }, n(tot, 0)]] };
  }

  window.PEH.kegiatan({
    id: "uma-ani", kode: "UMAANI",
    judul: "Identifikasi Jenis, Jumlah, dan Sebaran Pohon Sarang Lebah Madu Hutan (Uma Ani)",
    kelompok: "Tumbuhan",
    ringkas: "Penelusuran pohon sarang lebah madu hutan (Apis dorsata). Jenis pohon sarang, jumlah sarang, tinggi sarang, jarak ke sumber air, perbandingan dengan survei sebelumnya pada pohon yang sama, daerah sebaran (MCP), dan vegetasi di sekitar sarang.",
    objek: "lebah madu hutan", objekPeta: "pohon sarang lebah madu hutan (uma ani)",
    kategoriSMART: "metodeteknis.sebaranumaani.",
    contoh: (window.PEH_CONTOH || {})["uma-ani"],
    alat: [{ nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }, { nama: "Kamera", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Pita diameter", jumlah: "1", satuan: "buah" }, { nama: "Meteran gulung 50 m", jumlah: "1", satuan: "buah" }, { nama: "Rangefinder atau klinometer", jumlah: "1", satuan: "unit" }, { nama: "Tali rafia dan parang", jumlah: "1", satuan: "set" }, { nama: "Peta kerja", jumlah: "1", satuan: "lembar" }, { nama: "Tally sheet dan alat tulis", jumlah: "1", satuan: "set" }],
    tabel: [
      { key: "pohon", judul: "Pohon Sarang", ket: "Satu baris untuk satu pohon sarang yang diperiksa. Pohon dari survei sebelumnya yang kini tidak bersarang tetap dicatat dengan jumlah sarang 0. Pakai kode pohon yang sama dengan survei sebelumnya agar jumlah sarangnya dapat dibandingkan.",
        kolom: [{ key: "kode", label: "Kode pohon", w: 4.5, tengah: true }, KOL.tanggal, { key: "resor", label: "Resor", list: K.RESOR, w: 7 }, { key: "lokasi", label: "Nama lokasi", w: 8 }, KOL.x, KOL.y, KOL.ketinggian, ...K.kolJenis("Jenis pohon sarang", FLORA),
          KOL.diameter, { ...KOL.tinggi, label: "Tinggi pohon (m)" }, { key: "jumlahSarang", label: "Jumlah sarang", type: "number", w: 3.5 }, { key: "tinggiSarang", label: "Tinggi sarang (m)", type: "number", w: 4 }, { key: "jarakAir", label: "Jarak ke sumber air (m)", type: "number", w: 4.5 },
          { key: "sarangLalu", label: "Jumlah sarang survei sebelumnya", type: "number", w: 4.5 }, { key: "kondisi", label: "Kondisi pohon", options: KONDISI, w: 6 }, { key: "panen", label: "Bekas panen madu", options: PANEN, w: 4.5 }, KOL.keterangan],
        smart: { sub: "pohonsarang", map: (o, v) => {
          const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"), pn = K.yaTidak(o, "tandapanen");
          return { ...K.dasarObs(o), kode: String(v("kodepohon") || o.wpId || ""), resor: K.resorObs(o), lokasi: v("lokasi"), ketinggian: v("ketinggianmdpl"), jenis, latin, diameter: v("dbhpohoncm"), tinggi: v("tinggipohonm"),
            jumlahSarang: v("jumlahsarang"), tinggiSarang: v("tinggisarangm"), jarakAir: v("jaraksumberairm"), sarangLalu: v("jumlahsaranglalu"), kondisi: v("kondisipohon"), panen: pn === "Ya" ? "Ada" : pn === "Tidak" ? "Tidak ada" : "", keterangan: v("keterangan") };
        } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", resor: last.resor || "", lokasi: last.lokasi || "" }) },
      { key: "vegetasi", judul: "Vegetasi Sekitar Pohon Sarang", ket: "Analisis vegetasi pada petak ukur lingkaran yang berpusat di pohon sarang; isi kode pohon sarang pada kolom petak. Satu baris untuk satu individu (atau isi jumlah untuk semai dan pancang).",
        kolom: K.kolVegetasi([KOL.tinggi]), smart: { sub: "vegetasi", map: (o, v) => K.petaVegetasi(o, v) },
        baruBaris: (last) => ({ petak: last.petak || "", tingkat: last.tingkat || "", n: 1 }) }
    ],
    parameter: [
      { key: "tahunLalu", label: "Tahun survei sebelumnya (untuk perbandingan)", half: true, def: "" },
      { key: "batasAir", label: "Batas dekat sumber air (m)", type: "number", half: true, def: 50 },
      { key: "kelompokMCP", label: "Kelompok daerah sebaran", options: [["lokasi", "Per lokasi"], ["resor", "Per resor"], ["", "Tanpa kelompok"]], def: "lokasi" },
      K.paramSistem, K.paramKriteriaH, ...K.paramVegetasi()
    ],
    paramInfo: "Isi kolom jumlah sarang survei sebelumnya (termasuk 0) pada pohon yang sama untuk membuat tabel perbandingan. Pohon yang saat diamati tidak bersarang tetap dihitung sebagai pohon sarang, tetapi tidak masuk daerah sebaran sarang. Luas petak vegetasi diubah menjadi jari-jari petak lingkaran di bagian metode.",
    modul: [
      { m: "sarang", id: "sarang", judul: "Jenis, Jumlah, dan Karakteristik Pohon Sarang", judulMetode: "Jenis, Jumlah, dan Karakteristik Pohon Sarang", objek: "lebah madu hutan",
        input: (S) => ({ rows: pohon(S).map((r) => ({ kode: r.kode, lokasi: r.lokasi, jenis: r.jenis, latin: r.latin, jumlahSarang: r.jumlahSarang, tinggiSarang: r.tinggiSarang, jarakAir: r.jarakAir, sarangLalu: r.sarangLalu })) }),
        opt: (P, S) => ({ banding: adaBanding(S), tahunLalu: tahunLalu(P), tahunKini: tahunKini(S) }) },
      { m: "mcp", id: "sebaran", judul: "Daerah Sebaran Pohon Sarang", objek: "pohon sarang lebah madu hutan",
        input: (S, P) => ({ titik: pohon(S).filter(bersarang).map((r) => ({ x: r.x, y: r.y, kelompok: kelompok(r, P), label: [r.kode, r.lokasi, r.jenis].filter(isi).join(", ") })), sistem: P.sistem }),
        opt: (P, S) => ({ istilah: "sebaran", labelTitik: pohon(S).some((r) => !bersarang(r)) ? "pohon yang bersarang" : "pohon sarang", labelLokasi: "lokasi pohon sarang", capPeta: "sebaran pohon sarang lebah madu hutan dan poligon cembung minimum daerah sebarannya" }) },
      { m: "vegetasi", id: "vegetasi", opsional: true, judul: "Vegetasi di Sekitar Pohon Sarang", objek: "vegetasi sekitar pohon sarang", input: (S, P) => K.inputVegetasi(S.data.vegetasi, P),
        opt: (P) => ({ ...K.optVegetasi(P), kriteriaH: P.kriteriaH, ukuranTxt: lingkaran(P) }) }
    ],
    lokasiTabel: (S, P) => ({ cap: "Sebaran Pohon Sarang Lebah Madu Hutan", spec: specPohon(pohon(S), P.sistem !== "utm") }),
    teks: {
      dasar: ["Peraturan Direktur Jenderal Planologi Kehutanan dan Tata Lingkungan Nomor P.6/PKTL/SETDIT/KUM.1/1/2017 tentang Petunjuk Teknis Penggambaran dan Penyajian Peta Lingkungan Hidup dan Kehutanan;"],
      latar: (x) => ["Lebah madu hutan (Apis dorsata) adalah lebah madu liar yang membangun sarang terbuka menggantung pada dahan pohon yang tinggi. Lebah ini berperan dalam penyerbukan tumbuhan hutan dan menghasilkan madu hutan yang bernilai ekonomi bagi masyarakat di sekitar kawasan. Kelangsungan koloninya bergantung pada tersedianya pohon sarang yang sesuai, baik jenis maupun sebarannya di dalam kawasan. Masyarakat setempat menyebut pohon tempat bersarang lebah madu hutan sebagai uma ani.",
        K.TN,
        `Data jenis, jumlah, dan sebaran pohon sarang diperlukan sebagai dasar perlindungan pohon sarang dan pemanfaatan madu hutan secara lestari. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah mengetahui jenis, jumlah, dan sebaran pohon sarang lebah madu hutan (uma ani) di ${x.wil}. Tujuan kegiatan ini adalah:`,
        "1. Mengidentifikasi jenis pohon yang digunakan lebah madu hutan untuk bersarang;", "2. Menghitung jumlah pohon sarang dan jumlah sarang pada setiap pohon;", "3. Memetakan sebaran pohon sarang;",
        `4. Mengetahui tinggi sarang, jarak pohon sarang ke sumber air, dan vegetasi di sekitarnya${adaBanding(x.S) || tahunLalu(x.P) ? ";" : "."}`,
        adaBanding(x.S) || tahunLalu(x.P) ? `5. Membandingkan jumlah sarang dengan hasil ${survei(x.P)} pada pohon yang sama.` : ""],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Penelusuran pohon sarang berdasarkan koordinat survei sebelumnya dan informasi petani madu;", "2. Pencatatan koordinat, jenis pohon, diameter dan tinggi pohon, jumlah sarang, tinggi sarang, jarak ke sumber air, kondisi pohon, dan bekas panen madu;", "3. Analisis vegetasi pada petak ukur lingkaran yang berpusat di pohon sarang;", "4. Wawancara dengan masyarakat dan petani madu tentang keberadaan sarang dan cara panen;", "5. Analisis data dan penyusunan laporan."],
      metode: (x) => [
        "Pengumpulan data dilakukan dengan observasi langsung dan wawancara. Observasi dilakukan dengan menelusuri lokasi yang diduga menjadi tempat bersarang lebah madu hutan, termasuk titik pohon sarang dari survei sebelumnya. Pada setiap pohon sarang dicatat koordinat dan ketinggian tempat, jenis pohon, diameter batang setinggi dada (1,3 m dari permukaan tanah), tinggi pohon, jumlah sarang, tinggi sarang dari permukaan tanah, jarak ke sumber air terdekat, kondisi pohon, dan ada tidaknya bekas panen madu. Wawancara dilakukan dengan masyarakat setempat dan petani madu untuk menghimpun informasi keberadaan sarang dan cara pemanenan.",
        adaBanding(x.S) || tahunLalu(x.P) ? `Setiap pohon sarang diberi kode tetap sehingga jumlah sarangnya dapat dibandingkan dengan hasil ${survei(x.P)} pada pohon yang sama. Pohon yang tidak lagi bersarang tetap dicatat dengan jumlah sarang nol.` : "",
        adaVegetasi(x.S) ? "Vegetasi di sekitar pohon sarang diukur dengan petak ukur lingkaran bersarang yang berpusat di pohon sarang, dengan ukuran petak mengacu pada SNI 7724:2019 tentang pengukuran dan penghitungan cadangan karbon. Pada setiap petak dicatat jenis dan jumlah individu tingkat semai, pancang, tiang, dan pohon, serta diameter batang tingkat tiang dan pohon." : "",
        "Data dicatat dengan SMART Mobile pada kategori Metode Teknis > Sebaran Pohon Sarang Uma Ani atau pada tally sheet."],
      lokasi: (x) => { const lk = K.unik(pohon(x.S), "lokasi"), alt = K.rentang(pohon(x.S).map((r) => r.ketinggian)); return `Kegiatan dilaksanakan di ${x.lokasi}.${lk.length ? ` Pohon sarang ditelusuri di ${x.daftarKata(lk)}${alt ? ` pada ketinggian ${alt} mdpl` : ""}.` : ""}`; },
      lokasiRPK: (x) => `Kegiatan akan dilaksanakan di ${x.lokasi}. Penelusuran diarahkan ke titik pohon sarang dari survei sebelumnya dan lokasi yang ditunjukkan petani madu.`,
      hasilLokasi: (x) => {
        const p = pohon(x.S), lk = K.unik(p, "lokasi"), rs = K.unik(p, "resor"), alt = K.rentang(p.map((r) => r.ketinggian));
        if (!p.length) return `Penelusuran pohon sarang dilakukan di ${x.lokasi}.`;
        const per = lk.map((l) => { const q = p.filter((r) => String(r.lokasi || "").trim() === l); return `${l} ${q.length} pohon`; });
        return `Penelusuran pohon sarang dilakukan di ${lk.length ? `${x.nTxt(lk.length)} lokasi, yaitu ${x.daftarKata(lk)}` : x.lokasi}${rs.length ? `, yang termasuk ${x.daftarKata(rs)}` : ""}. ${lk.length > 1 ? `Jumlah pohon sarang yang diperiksa per lokasi: ${per.join("; ")}.` : `Pohon sarang yang diperiksa berjumlah ${x.nTxt(p.length)}.`}${alt ? ` Pohon sarang berada pada ketinggian ${alt} mdpl.` : ""}`;
      },
      pembahasan: (x) => {
        const s = x.A.sarang, p = pohon(x.S), out = [];
        if (!s || s.kosong) return "Belum ada data pohon sarang yang dapat dibahas. Pohon sarang dari survei sebelumnya yang tidak ditemukan perlu dicatat di kolom keterangan agar penelusuran berikutnya lebih terarah.";
        const top = s.baris[0];
        out.push(`Lebah madu hutan di lokasi kegiatan paling banyak bersarang pada ${window.PEHModul.util.nm(top)}, yaitu ${rasio(top.pohon, s.pohon)}. Pohon jenis ini perlu menjadi prioritas perlindungan, karena hilangnya satu pohon sarang dapat menghilangkan beberapa sarang sekaligus.`);
        const air = p.filter((r) => isi(r.jarakAir) && Number.isFinite(Number(r.jarakAir))), batas = Number(x.P.batasAir) || 50, dekat = air.filter((r) => Number(r.jarakAir) < batas).length;
        if (air.length) out.push(`Sebanyak ${rasio(dekat, air.length)} berjarak kurang dari ${L.num(batas)} m dari sumber air.${dekat * 2 > air.length ? " Sebagian besar sarang berada dekat sumber air, yang dibutuhkan koloni lebah antara lain untuk mendinginkan sarang (Seeley, 1985)." : " Sebagian besar pohon sarang berada lebih jauh dari batas tersebut, sehingga kedekatan dengan sumber air bukan satu-satunya faktor pemilihan lokasi sarang; tinggi pohon dan ketersediaan pakan perlu ikut dikaji."}`);
        const b = s.banding;
        if (b) {
          const tetapAda = b.rows.filter((r) => r.lalu > 0 && r.kini > 0).length;
          out.push(`${tetapAda ? `Sebanyak ${x.nTxt(tetapAda)} pohon tetap bersarang pada kedua survei, yang menunjukkan pohon yang sama dipakai berulang. ` : ""}Perubahan jumlah sarang antarwaktu belum tentu menunjukkan perubahan populasi lebah, karena koloni lebah madu hutan berpindah mengikuti musim pembungaan dan dapat meninggalkan sarang setelah dipanen. Karena itu perbandingan sebaiknya dilakukan pada bulan yang sama setiap tahun.`);
          if (b.hilang) {
            const kodeHilang = new Set(b.rows.filter((r) => r.lalu > 0 && r.kini === 0).map((r) => r.kode).filter(Boolean));
            const rusak = p.filter((r) => kodeHilang.has(String(r.kode || "").trim()) && /rusak|mati|tumbang/i.test(String(r.kondisi || ""))).length;
            const semua = rusak === b.hilang ? (b.hilang === 2 ? "keduanya" : b.hilang > 2 ? "seluruhnya" : "pohon tersebut") : `${rusak} di antaranya`;
            out.push(`Sebanyak ${x.nTxt(b.hilang)} pohon tidak lagi bersarang${rusak ? `, ${semua} dalam kondisi rusak, mati, atau tumbang` : ""}. ${rusak === b.hilang ? "Kerusakan pohon dapat menjadi penyebabnya, tetapi pemanenan dan perpindahan koloni juga perlu ditelusuri." : "Penyebabnya perlu ditelusuri lebih lanjut, misalnya kerusakan pohon, pemanenan, atau perpindahan koloni."}`);
          }
        }
        const rusakAll = p.filter((r) => /rusak|mati|tumbang/i.test(String(r.kondisi || ""))).length;
        if (rusakAll && !(b && b.hilang)) out.push(`Sebanyak ${x.nTxt(rusakAll)} pohon sarang dalam kondisi rusak, mati, atau tumbang sehingga berisiko tidak lagi dapat dipakai bersarang.`);
        const panen = p.filter((r) => /^ada$/i.test(String(r.panen || "").trim())).length;
        if (panen) out.push(`Bekas panen madu ditemukan pada ${x.nTxt(panen)} pohon sarang. Pemanenan lestari dilakukan dengan memotong bagian sarang yang berisi madu dan menyisakan bagian yang berisi anakan, tanpa merusak pohon sarang, agar koloni tidak meninggalkan sarang.`);
        return out;
      },
      saran: (x) => {
        const s = x.A.sarang, top = s && !s.kosong ? window.PEHModul.util.nm(s.baris[0]) : "";
        return [`Pohon sarang${top ? `, terutama ${top},` : ""} perlu dilindungi dari penebangan dan diberi kode tetap (penanda di lapangan dan koordinat) agar mudah ditelusuri pada survei berikutnya`,
          "Perlu pembinaan pemanenan madu lestari kepada kelompok petani madu, yaitu memotong bagian sarang yang berisi madu dan menyisakan bagian anakan tanpa merusak pohon sarang",
          "Monitoring jumlah sarang perlu dilakukan setiap tahun pada bulan yang sama dengan kode pohon tetap, agar perubahan jumlah sarang dapat dibandingkan",
          "Penelusuran perlu diperluas ke lokasi lain yang ditunjukkan petani madu agar sebaran pohon sarang di kawasan makin lengkap", K.SARAN_UMUM.smart];
      },
      simpulanAwal: (x) => { const lk = K.unik(pohon(x.S), "lokasi"); return `Penelusuran pohon sarang lebah madu hutan dilakukan dengan observasi langsung dan wawancara${lk.length ? ` di ${x.nTxt(lk.length)} lokasi, yaitu ${x.daftarKata(lk)}` : ""}`; }
    }
  });
})();
