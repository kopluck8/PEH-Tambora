/*
 * Kegiatan: Rekapitulasi Perjumpaan dan Sebaran Elang Flores (seluruh kawasan, lintas tahun).
 * Acuan: Panduan Teknis Monitoring Satwa Kunci Elang Flores (2022) dan rekap perjumpaan elang flores Balai (2022).
 * Data SMART: kategori Metode Teknis (monitoring elang flores, inventarisasi raptor, monitoring satwa kunci,
 * metodeteknis.rekapelangflores.) dan Satwa Liar (perjumpaan satwa, tanda satwa) dari patroli rutin.
 */
(function () {
  "use strict";
  const K = window.PEHKeg, { KOL } = K, L = window.PEHLaporan;
  const TIPE = ["Perjumpaan langsung", "Di sarang", "Suara"];
  const AKT = ["Terbang", "Soaring (terbang mengapung)", "Bertengger", "Makan", "Bersuara", "Bersarang", "Membawa material sarang", "Kawin", "Diserang/menyerang burung lain"];
  const KONDISI = ["Aktif (ada telur/anakan/induk)", "Aktif (material baru)", "Tidak aktif", "Rusak/jatuh"];
  const SUMBER = ["Monitoring elang flores", "Inventarisasi raptor", "Monitoring satwa kunci", "Patroli SMART", "Laporan masyarakat", "Kegiatan lain"];
  const AVES = K.kamus("Aves"), FLORA = K.kamus("Flora");
  const target = (P) => String(P.target || "").trim() || "Elang flores";
  const objek = (P) => { const t = K.taksa.cari(target(P)); return (t && t.nama ? t.nama : target(P)).toLowerCase(); };
  // Suara tidak menambah jumlah individu; perjumpaan langsung dan individu di sarang dihitung
  const langsung = (r) => !/suara/i.test(String(r.tipe || ""));
  const aktif = (r) => /^aktif/i.test(String(r.kondisi || "").trim());
  const tahun = (r) => String(r.tanggal || "").slice(0, 4);
  // Catatan ganda (tanggal, koordinat, dan jumlah sama) dihitung sekali
  const kunciCatatan = (r) => [r.tanggal, Number(r.x).toFixed(5), Number(r.y).toFixed(5), Number(r.n) || 1].join("|");
  function catatan(S) {
    const rows = K.terisi(S.data.perjumpaan, "jenis", "latin").filter((r) => K.sasaran(r, target(S.param)));
    const lihat = new Set(), out = [];
    let ganda = 0;
    rows.forEach((r) => {
      const ber = String(r.tanggal || "").trim() && Number.isFinite(Number(r.x)) && Number(r.x) !== 0;
      const kk = kunciCatatan(r);
      if (ber && lihat.has(kk)) { ganda++; return; }
      if (ber) lihat.add(kk);
      out.push(r);
    });
    return { rows: out, ganda };
  }
  const sarangIsi = (S) => K.terisi(S.data.sarang, "kode", "x", "kondisi");
  const unitDari = (r, P) => String((P.unitRekap === "resor" ? r.resor : r.lokasi || r.resor) || "").trim();
  // Sumber data dari kategori SMART
  const sumberDari = (kategori) => (/^satwaliar\./.test(kategori) ? "Patroli SMART" : /monitoringelangflores/.test(kategori) ? "Monitoring elang flores" : /inventarisasiraptor/.test(kategori) ? "Inventarisasi raptor" : /monitoringsatwakunci/.test(kategori) ? "Monitoring satwa kunci" : "");
  const tipeDari = (v) => { const s = String(v("jenisperjumpaan") || v("tipetemuan") || v("tandakeberadaan") || v("tipecatatan") || ""); return /sarang/i.test(s) ? "Di sarang" : /suara/i.test(s) && !/lihat|langsung/i.test(s) ? "Suara" : s ? "Perjumpaan langsung" : ""; };

  window.PEH.kegiatan({
    id: "rekap-elang-flores", kode: "REKAP",
    judul: "Rekapitulasi Perjumpaan dan Sebaran Elang Flores",
    kelompok: "Satwa",
    ringkas: "Rekap seluruh catatan perjumpaan elang flores dari monitoring, inventarisasi raptor, patroli SMART, dan laporan masyarakat. Jumlah individu minimum per lokasi dan tahun, daerah sebaran (MCP), status sarang, sumber data, dan aktivitas.",
    objek: "elang flores", objekPeta: "titik perjumpaan dan sarang elang flores",
    kategoriSMART: ["metodeteknis.", "satwaliar."],
    contoh: (window.PEH_CONTOH || {})["rekap-elang-flores"],
    alat: [{ nama: "Komputer dengan SMART Desktop dan aplikasi SIG", jumlah: "1", satuan: "unit" }, { nama: "File ekspor patroli SMART dan laporan kegiatan", jumlah: "1", satuan: "set" }, { nama: "GPS", jumlah: "1", satuan: "unit" }, { nama: "Binokuler", jumlah: "1", satuan: "unit" }, { nama: "Kamera dengan lensa tele", jumlah: "1", satuan: "unit" }, { nama: "Smartphone dengan aplikasi SMART Mobile", jumlah: "1", satuan: "unit" }],
    tabel: [
      { key: "perjumpaan", judul: "Catatan Perjumpaan", ket: "Satu baris untuk satu catatan perjumpaan dari kegiatan apa pun. Pakai nama lokasi yang seragam antartahun agar perjumpaan di tempat yang sama terhitung satu lokasi. Catatan dengan tanggal, koordinat, dan jumlah yang sama dihitung sekali.",
        kolom: [KOL.tanggal, KOL.waktu, { key: "resor", label: "Resor", list: K.RESOR, w: 7 }, { key: "lokasi", label: "Nama lokasi", w: 9 }, ...K.kolJenis("Nama jenis", AVES), { key: "tipe", label: "Tipe catatan", options: TIPE, w: 6.5 },
          { ...KOL.jumlah, label: "Jumlah individu" }, { key: "aktivitas", label: "Aktivitas", list: AKT, w: 8 }, KOL.x, KOL.y, KOL.ketinggian, { key: "sumber", label: "Sumber data", list: SUMBER, w: 8 }, KOL.keterangan],
        smart: { sub: ["rekapelangflores.perjumpaan", "monitoringelangflores.perjumpaansatwa", "inventarisasiraptor.perjumpaanraptor", "monitoringsatwakunci.temuansatwa", "perjumpaansatwa", "jejaksatwa"],
          map: (o, v, S) => {
            const [jenis, latin] = K.jenisDari(v, "jenissatwa");
            if (!K.sasaran({ jenis, latin }, target(S.param))) return null;
            const d = Number(v("jumlahdewasa")) || 0, a = Number(v("jumlahanakan")) || 0;
            return { ...K.dasarObs(o), resor: K.resorObs(o), lokasi: v("lokasi") || v("jalurpengamatan"), jenis, latin, tipe: tipeDari(v), n: Number(v("jumlah")) || d + a || 1, aktivitas: v("aktivitasraptor") || v("aktivitassatwa"), ketinggian: v("ketinggianmdpl"), sumber: v("sumberdata") || sumberDari(o.kategori), keterangan: v("keterangan") };
          } },
        baruBaris: (last) => ({ tanggal: last.tanggal || "", resor: last.resor || "", lokasi: last.lokasi || "", jenis: last.jenis || "Elang flores", latin: last.latin || "Nisaetus floris", tipe: "Perjumpaan langsung", n: 1, sumber: last.sumber || "" }) },
      { key: "sarang", judul: "Pemeriksaan Sarang", ket: "Satu baris untuk satu sarang pada satu pemeriksaan. Sarang yang sama diberi kode yang sama setiap tahun.",
        kolom: [{ key: "kode", label: "Kode sarang", w: 5, tengah: true }, KOL.tanggal, { key: "resor", label: "Resor", list: K.RESOR, w: 7 }, { key: "lokasi", label: "Nama lokasi", w: 9 }, KOL.x, KOL.y, KOL.ketinggian, ...K.kolJenis("Jenis pohon sarang", FLORA), { key: "kondisi", label: "Kondisi sarang", list: KONDISI, w: 9 }, KOL.keterangan],
        smart: { sub: ["rekapelangflores.sarang", "monitoringelangflores.pohonsarang"], map: (o, v) => { const [jenis, latin] = K.jenisDari(v, "jenistumbuhan"); return { ...K.dasarObs(o), kode: v("kodesarang") || o.wpId || "", resor: K.resorObs(o), lokasi: v("lokasi"), ketinggian: v("ketinggianmdpl"), jenis, latin, kondisi: v("kondisisarang"), keterangan: v("keterangan") }; } } }
    ],
    parameter: [
      { key: "target", label: "Jenis sasaran (nama atau nama ilmiah)", def: "Elang flores" },
      { key: "unitRekap", label: "Satuan rekap individu minimum", options: [["lokasi", "Nama lokasi"], ["resor", "Resor"]], def: "lokasi" },
      { key: "kelompokMCP", label: "Kelompok daerah sebaran", options: [["tahun", "Per tahun"], ["resor", "Per resor"], ["", "Tanpa kelompok"]], def: "tahun" },
      K.paramSistem
    ],
    paramInfo: "Jumlah individu minimum per tahun adalah jumlah dari individu terbanyak dalam satu perjumpaan di setiap lokasi, sehingga perjumpaan berulang di lokasi yang sama tidak dijumlahkan. Catatan suara tidak menambah jumlah individu. Pilih satuan resor bila nama lokasi antartahun belum seragam.",
    modul: [
      { m: "rekap", id: "rekap", judul: (P) => `Rekapitulasi Perjumpaan ${L.judul(objek(P))} per Lokasi dan Tahun`, objek,
        input: (S, P) => ({ rows: catatan(S).rows.map((r) => ({ tahun: tahun(r), unit: unitDari(r, P), n: Number(r.n) || 1, langsung: langsung(r) })), sarang: sarangIsi(S).map((r) => ({ tahun: tahun(r), kode: r.kode, aktif: aktif(r) })) }),
        opt: (P) => ({ unitLabel: P.unitRekap === "resor" ? "resor" : "lokasi" }) },
      { m: "mcp", id: "sebaran", judul: (P) => `Daerah Sebaran ${L.judul(objek(P))}`, objek,
        input: (S, P) => {
          const kel = (r) => (P.kelompokMCP === "tahun" ? tahun(r) : P.kelompokMCP === "resor" ? String(r.resor || "").trim() : "");
          const lab = (r, jenis) => [jenis, r.lokasi || r.resor, r.tanggal && L.tglPanjang(r.tanggal)].filter(Boolean).join(", ");
          return { titik: [...catatan(S).rows.map((r) => ({ x: r.x, y: r.y, kelompok: kel(r), label: lab(r, "") })), ...sarangIsi(S).map((r) => ({ x: r.x, y: r.y, kelompok: kel(r), label: lab(r, `Sarang ${r.kode || ""}`.trim()) }))], sistem: P.sistem };
        },
        opt: (P, S) => ({ istilah: "sebaran", labelTitik: sarangIsi(S).length ? "titik perjumpaan dan sarang" : "titik perjumpaan" }) },
      { m: "persen", id: "sumber", judul: "Sumber Data Perjumpaan", objek, input: (S) => ({ items: catatan(S).rows.filter((r) => String(r.sumber || "").trim()).map((r) => [r.sumber, 1]) }), opt: { label: "sumber data", satuan: "catatan" }, simpulan: false },
      { m: "persen", id: "aktivitas", judul: (P) => `Aktivitas ${L.judul(objek(P))} saat Perjumpaan`, objek, input: (S) => ({ items: catatan(S).rows.filter((r) => String(r.aktivitas || "").trim()).map((r) => [r.aktivitas, 1]) }), opt: { label: "aktivitas", satuan: "catatan" } }
    ],
    lokasiTabel: (S, P) => {
      const m = new Map();
      catatan(S).rows.forEach((r) => {
        const u = unitDari(r, P) || "Tanpa lokasi";
        if (!m.has(u)) m.set(u, { lokasi: u, resor: new Set(), n: 0, tahun: new Set(), alt: [] });
        const o = m.get(u); o.n++; if (r.resor) o.resor.add(r.resor); if (tahun(r)) o.tahun.add(tahun(r)); if (Number(r.ketinggian)) o.alt.push(Number(r.ketinggian));
      });
      const rows = [...m.values()].map((o) => ({ lokasi: o.lokasi, resor: [...o.resor].join(", "), n: o.n, tahun: [...o.tahun].sort().join(", "), alt: K.rentang(o.alt) }));
      return { cap: `Lokasi Perjumpaan ${L.judul(objek(P))}`, spec: K.specDari(rows, [{ key: "lokasi", label: P.unitRekap === "resor" ? "Resor" : "Lokasi" }, ...(P.unitRekap === "resor" ? [] : [{ key: "resor", label: "Resor" }]), { key: "n", label: "Jumlah Catatan", type: "number" }, { key: "tahun", label: "Tahun Perjumpaan" }, { key: "alt", label: "Ketinggian (mdpl)" }]) };
    },
    teks: {
      dasar: ["Peraturan Pemerintah Nomor 7 Tahun 1999 tentang Pengawetan Jenis Tumbuhan dan Satwa;", "Peraturan Menteri Lingkungan Hidup dan Kehutanan Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 tentang Jenis Tumbuhan dan Satwa yang Dilindungi;", "Keputusan Kepala Balai Taman Nasional Tambora Nomor SK.5/T.41/TU/KSA/1/2021 tanggal 4 Januari 2021 tentang Penetapan Jenis Satwa Kunci dan Dipandang Penting menjadi Prioritas Pengelolaan untuk Ditingkatkan Populasinya di Kawasan TN Tambora;"],
      latar: (x) => [K.TN,
        "Elang flores (Nisaetus floris) adalah burung pemangsa endemik Nusa Tenggara yang tersebar di Pulau Flores, Sumbawa, Lombok, Satonda, Komodo, dan Rinca. Di Pulau Sumbawa, salah satu habitatnya adalah kawasan Gunung Tambora. Elang flores dilindungi menurut Peraturan Menteri LHK Nomor P.106/MENLHK/SETJEN/KUM.1/12/2018 dan ditetapkan sebagai satwa kunci TN Tambora.",
        `Catatan perjumpaan elang flores diperoleh dari berbagai kegiatan, yaitu monitoring elang flores, inventarisasi raptor, monitoring satwa kunci, patroli, dan laporan masyarakat. Catatan itu perlu direkapitulasi secara berkala agar sebaran, lokasi sarang, dan jumlah individu yang pernah teramati dapat diketahui sebagai dasar penentuan lokasi monitoring dan perlindungan habitat. Untuk itu dilaksanakan kegiatan ${x.judul} di ${x.wil}.`],
      maksud: (x) => [`Maksud kegiatan ini adalah menghimpun seluruh catatan perjumpaan ${objek(x.P)} di ${x.wil} dalam satu basis data. Tujuan kegiatan ini adalah:`, `1. Merekapitulasi catatan perjumpaan ${objek(x.P)} menurut lokasi dan tahun;`, "2. Menduga jumlah individu minimum yang teramati pada setiap tahun;", `3. Memetakan daerah sebaran dan lokasi sarang ${objek(x.P)};`, "4. Memberikan rekomendasi lokasi monitoring dan perlindungan habitat."],
      ruanglingkup: () => ["Ruang lingkup kegiatan ini meliputi:", "1. Pengumpulan catatan perjumpaan dari laporan kegiatan, ekspor patroli SMART, dan laporan masyarakat;", "2. Verifikasi lapangan pada lokasi perjumpaan dan sarang bila diperlukan;", "3. Kurasi data: penyeragaman nama lokasi, pemeriksaan koordinat, dan penghapusan catatan ganda;", "4. Analisis data dan pelaporan."],
      metode: (x) => [`Catatan perjumpaan ${objek(x.P)} dihimpun dari laporan pelaksanaan kegiatan monitoring elang flores dan inventarisasi raptor, ekspor patroli SMART, serta laporan masyarakat yang sudah diverifikasi petugas. Setiap catatan memuat tanggal, lokasi, koordinat, ketinggian, jumlah individu, tipe catatan (perjumpaan langsung, individu di sarang, atau suara), aktivitas, dan sumber data.`,
        "Catatan dengan tanggal, koordinat, dan jumlah individu yang sama dianggap ganda dan dihitung sekali. Nama lokasi diseragamkan agar perjumpaan di tempat yang sama terhitung sebagai satu lokasi. Sarang yang diketahui dicatat kode, koordinat, jenis pohon, dan kondisinya pada setiap pemeriksaan, dengan kode yang sama untuk sarang yang sama.",
        "Data dari file patroli SMART dimuat langsung dari kategori Satwa Liar (Perjumpaan Satwa dan Tanda Satwa) dan kategori Metode Teknis. Catatan baru dapat dicatat dengan SMART Mobile pada kategori Metode Teknis > Rekap Perjumpaan Elang Flores atau pada tally sheet."],
      lokasi: (x) => { const rs = K.unik(catatan(x.S).rows, "resor"); return `Kegiatan dilaksanakan di ${x.lokasi}.${rs.length ? ` Catatan perjumpaan berasal dari ${x.daftarKata(rs)}.` : ""}`; },
      lokasiRPK: (x) => `Rekap mencakup seluruh catatan ${objek(x.P)} di ${x.lokasi}. Verifikasi lapangan diarahkan ke lokasi perjumpaan terbaru dan sarang yang belum diperiksa pada tahun berjalan.`,
      hasilLokasi: (x) => {
        const c = catatan(x.S), rs = K.unik(c.rows, "resor"), lk = K.unik(c.rows, "lokasi"), alt = K.rentang(c.rows.map((r) => r.ketinggian));
        if (!c.rows.length) return `Rekap mencakup ${x.lokasi}.`;
        return `Catatan perjumpaan berasal dari ${rs.length ? `${x.nTxt(rs.length)} resor, yaitu ${x.daftarKata(rs)}` : x.lokasi}${lk.length ? `, pada ${x.nTxt(lk.length)} lokasi` : ""}.${alt ? ` Perjumpaan berada pada ketinggian ${alt} mdpl.` : ""}${c.ganda ? ` Sebanyak ${x.nTxt(c.ganda)} catatan ganda (tanggal, koordinat, dan jumlah sama) dihitung sekali.` : ""}`;
      },
      pembahasan: (x) => {
        const out = [], rk = x.A.rekap, sb = x.A.sebaran, sm = x.A.sumber;
        if (rk && !rk.kosong) out.push("Jumlah individu minimum adalah batas bawah. Individu yang tidak teramati tidak terhitung, sedangkan individu yang berpindah dapat terhitung lebih dari sekali bila terlihat di lokasi berbeda pada tahun yang sama. Karena itu, perbandingan antartahun perlu memperhatikan banyaknya lokasi dan kegiatan yang menghasilkan catatan pada setiap tahun.");
        if (sb && !sb.kosong) out.push("Daerah sebaran dari poligon cembung minimum menggambarkan batas luar sebaran yang diketahui. Poligon juga mencakup area di antara titik perjumpaan yang belum tentu dihuni, sehingga luasnya tidak sama dengan luas habitat yang digunakan.");
        if (rk && rk.adaSarang) out.push("Sarang aktif menandakan lokasi berbiak yang perlu diprioritaskan dalam patroli pengamanan dan monitoring, termasuk pemeriksaan ulang sarang yang sudah tidak aktif.");
        if (sm && !sm.kosong && sm.rows.length > 1) out.push(`Sebagian besar catatan berasal dari ${sm.rows[0].k.toLowerCase()} (${L.num(sm.rows[0].p, 1)}%). Catatan dari sumber lain melengkapi sebaran di luar jalur monitoring.`);
        return out;
      },
      saran: () => ["Rekap perjumpaan elang flores perlu diperbarui setiap tahun dengan memasukkan data patroli SMART dan laporan kegiatan terbaru", "Lokasi sarang aktif perlu dipantau secara berkala dan diprioritaskan dalam patroli pengamanan", "Pencatatan perjumpaan perlu menyertakan koordinat, jumlah individu, dan nama lokasi yang seragam agar rekap antartahun dapat dibandingkan", K.SARAN_UMUM.smart],
      // Butir simpulan sumber data menggantikan simpulan modul persentase sumber
      simpulanAwal: (x) => {
        const sm = x.A.sumber, kecil = window.PEHModul.util.kecil;
        if (!sm || sm.kosong) return "";
        if (sm.rows.length === 1) return `Seluruh catatan perjumpaan ${objek(x.P)} di ${x.lokasi} berasal dari ${kecil(sm.rows[0].k)}`;
        return `Catatan perjumpaan ${objek(x.P)} di ${x.lokasi} dihimpun dari ${x.nTxt(sm.rows.length)} sumber data, yaitu ${x.daftarKata(sm.rows.map((g) => kecil(g.k)))}; catatan terbanyak berasal dari ${kecil(sm.rows[0].k)} (${L.num(sm.rows[0].p, 1)}%)`;
      }
    }
  });
})();
