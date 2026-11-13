/*
 * Rumus analisis data kegiatan teknis PEH.
 * Setiap rumus berdiri sendiri supaya bisa dipakai ulang oleh kegiatan lain
 * (inventarisasi satwa, vegetasi, dan seterusnya). Berjalan di browser dan di Node (untuk uji).
 */
(function (root) {
  "use strict";

  const sum = (a) => a.reduce((s, v) => s + v, 0);
  const round = (v, d = 3) => (Number.isFinite(v) ? Math.round(v * 10 ** d) / 10 ** d : v);

  /* ---------- Luas plot lingkaran (point count) ---------- */
  // A = n × π × r²  (m²). Template Excel memakai π = 3,14.
  function luasPlotLingkaran(n, r, pi = 3.14) {
    const m2 = n * pi * r * r;
    return { perPlotM2: pi * r * r, perPlotHa: (pi * r * r) / 10000, m2, ha: m2 / 10000 };
  }

  /* ---------- Kepadatan populasi (Jarvinen 1978) ---------- */
  // D = N / A ; disajikan juga sebagai "1 individu per ... Ha" (A / N)
  function kepadatan(N, luasHa) {
    return { perHa: luasHa ? N / luasHa : 0, haPerInd: N ? luasHa / N : Infinity };
  }

  /* ---------- Keanekaragaman Shannon-Wiener ---------- */
  // H' = -Σ Pi ln Pi ; Pi = ni / N
  function shannon(counts) {
    const N = sum(counts);
    const rows = counts.map((n) => {
      const pi = N ? n / N : 0;
      return { n, pi, piLnPi: pi > 0 ? pi * Math.log(pi) : 0 };
    });
    return { N, rows, H: -sum(rows.map((r) => r.piLnPi)) };
  }

  // Kriteria H'. "template": dipakai di Analisa data.xlsx (lembar 1) dan LPK Resort Piong 2021.
  // "krebs": Krebs (1989) / Magurran: H' < 1 rendah, 1 ≤ H' ≤ 3 sedang, H' > 3 tinggi.
  const KRITERIA_H = {
    template: { label: "H' ≤ 2 rendah; 2 < H' < 3 sedang; H' ≥ 3 tinggi", fn: (h) => (h <= 2 ? "Rendah" : h < 3 ? "Sedang" : "Tinggi") },
    krebs: { label: "H' < 1 rendah; 1 ≤ H' ≤ 3 sedang; H' > 3 tinggi", fn: (h) => (h < 1 ? "Rendah" : h <= 3 ? "Sedang" : "Tinggi") }
  };

  /* ---------- Indeks dominansi / kelimpahan relatif ---------- */
  // Di = ni / N × 100% ; < 2% tidak dominan, 2–5% sub dominan, ≥ 5% dominan
  function dominansi(counts) {
    const N = sum(counts);
    return counts.map((n) => {
      const di = N ? (n / N) * 100 : 0;
      return { n, di, kriteria: kriteriaDominansi(di) };
    });
  }
  function kriteriaDominansi(di) {
    const v = round(di, 6);
    return v < 2 ? "Tidak Dominan" : v < 5 ? "Sub Dominan" : "Dominan";
  }

  /* ---------- Indeks dispersi (Ludwig & Reynolds 1988) ---------- */
  // ID = S² / x̄ ; x̄ = Σx / n ; S² = (Σx² − (Σx)²/n) / (n − 1)
  // x = jumlah individu per plot, n = jumlah plot (plot tanpa perjumpaan bernilai 0)
  function dispersiPerPlot(perPlot, n) {
    const xs = perPlot.filter((v) => v > 0);
    const sx = sum(xs), sx2 = sum(xs.map((v) => v * v));
    const mean = n ? sx / n : 0;
    const s2 = n > 1 ? (sx2 - (sx * sx) / n) / (n - 1) : 0;
    return { sx, sx2, mean, s2, id: mean ? s2 / mean : 0 };
  }

  // Rumus seperti di template Analisa data.xlsx (dipakai LPK Resort Piong 2021) yang hanya membutuhkan total per jenis:
  //   per jenis : Sxi² = (Xi² − (Xi²)²/n)/(n − 1), x̄i = Xi/n          (lembar "Rekapitulasi Data", kolom P dan R)
  //   gabungan  : Sx² = (N − N²/n)/(n − 1),      x̄ = N/n              (lembar "Rekapitulasi Data (2)", kolom P dan R)
  function dispersiTemplateJenis(Xi, n) {
    const xi2 = Xi * Xi, mean = n ? Xi / n : 0;
    const s2 = n > 1 ? (xi2 - (xi2 * xi2) / n) / (n - 1) : 0;
    return { sx: Xi, sx2: xi2, mean, s2, id: mean ? s2 / mean : 0 };
  }
  function dispersiTemplateGabungan(N, n) {
    const mean = n ? N / n : 0;
    const s2 = n > 1 ? (N - (N * N) / n) / (n - 1) : 0;
    return { sx: N, mean, s2, id: mean ? s2 / mean : 0 };
  }

  // ID dibulatkan 3 desimal sebelum dibandingkan dengan 1 (sesuai tampilan laporan)
  function kriteriaSebaran(id) {
    const v = round(id, 3);
    return v === 1 ? "Acak" : v > 1 ? "Kelompok" : "Homogen";
  }
  // Uji khi-kuadrat untuk ID: χ² = ID × (n − 1), derajat bebas n − 1 (Ludwig & Reynolds 1988)
  function khiKuadratID(id, n) { return { chi2: id * (n - 1), df: n - 1 }; }

  /* =====================================================================
   * Rumus tambahan untuk kegiatan PEH lain (monitoring satwa, vegetasi, karbon, tutupan lahan).
   * Semua fungsi murni: masukan angka/array, keluaran objek. Dipakai lewat js/core/modul.js.
   * ===================================================================== */
  const mean = (a) => (a.length ? sum(a) / a.length : 0);
  const fin = (v) => Number.isFinite(v);

  /* ---------- Indeks komunitas ---------- */
  // Pielou E = H'/ln S ; Margalef R = (S − 1)/ln N ; Menhinick = S/√N ; Simpson λ = Σ pi², Ds = 1 − λ ; Berger-Parker = n maks/N
  function komunitas(counts) {
    const c = counts.filter((n) => n > 0), N = sum(c), S = c.length, sh = shannon(c);
    const lambda = N ? sum(c.map((n) => (n / N) ** 2)) : 0;
    return { N, S, H: sh.H, rows: sh.rows, E: S > 1 ? sh.H / Math.log(S) : 0, lambda, Ds: N ? 1 - lambda : 0,
      R: N > 1 ? (S - 1) / Math.log(N) : 0, Mn: N ? S / Math.sqrt(N) : 0, BP: N ? Math.max(...c) / N : 0 };
  }
  // Kriteria (Odum 1993 dalam Panduan Inventarisasi Tumbuhan 2025; Margalef dalam Panduan Herpetofauna 2025)
  const kriteriaE = (e) => { const v = round(e, 2); return v > 0.6 ? "Tinggi" : v >= 0.4 ? "Sedang" : "Rendah"; };
  const kriteriaDs = (d) => { const v = round(d, 2); return v > 0.6 ? "Tinggi" : v > 0.3 ? "Sedang" : "Rendah"; };
  const kriteriaR = (r) => { const v = round(r, 2); return v > 4 ? "Tinggi" : v >= 2.5 ? "Sedang" : "Rendah"; };

  /* ---------- Penduga kekayaan jenis ---------- */
  // rows: [{ jenis, unit, n }] ; units: daftar unit contoh (termasuk unit tanpa temuan)
  // Chao2 = S + ((m−1)/m)·Q1²/(2Q2) [Q2 = 0: ((m−1)/m)·Q1(Q1−1)/2] ; Jack1 = S + Q1(m−1)/m
  // Chao1 = S + F1²/(2F2) [F2 = 0: F1(F1−1)/(2(F2+1))]
  function penduga(rows, units) {
    const per = new Map(), urut = [];
    rows.forEach((r) => {
      const j = String(r.jenis || "").trim(), u = String(r.unit ?? "").trim();
      if (!j) return;
      if (!per.has(j)) per.set(j, { units: new Set(), n: 0 });
      const o = per.get(j);
      if (u) { o.units.add(u); if (!urut.includes(u)) urut.push(u); }
      o.n += Number.isFinite(Number(r.n)) && r.n !== "" ? Number(r.n) : 1;
    });
    const unitList = (units && units.length ? units.map(String) : urut);
    urut.forEach((u) => { if (!unitList.includes(u)) unitList.push(u); });
    const m = unitList.length, S = per.size, k = m ? (m - 1) / m : 0;
    const freq = [...per.values()].map((o) => o.units.size);
    const Q1 = freq.filter((f) => f === 1).length, Q2 = freq.filter((f) => f === 2).length;
    const chao2 = S + (Q2 > 0 ? (k * Q1 * Q1) / (2 * Q2) : (k * Q1 * (Q1 - 1)) / 2);
    const jack1 = S + Q1 * k;
    // ragam Jack1: ((m−1)/m)·(Σ j² f_j − Q1²/m), f_j = jumlah unit yang memuat tepat j jenis unik
    const unik = new Map();
    per.forEach((o) => { if (o.units.size === 1) { const u = [...o.units][0]; unik.set(u, (unik.get(u) || 0) + 1); } });
    const fj = new Map();
    unik.forEach((j) => fj.set(j, (fj.get(j) || 0) + 1));
    let sj = 0; fj.forEach((f, j) => (sj += j * j * f));
    const varJack = m ? k * (sj - (Q1 * Q1) / m) : 0;
    const ab = [...per.values()].map((o) => o.n);
    const F1 = ab.filter((n) => n === 1).length, F2 = ab.filter((n) => n === 2).length;
    const chao1 = S + (F2 > 0 ? (F1 * F1) / (2 * F2) : (F1 * (F1 - 1)) / (2 * (F2 + 1)));
    // Kurva akumulasi jenis menurut urutan unit contoh
    const seen = new Set(), akumulasi = unitList.map((u, i) => {
      let baru = 0;
      per.forEach((o, j) => { if (o.units.has(u) && !seen.has(j)) { seen.add(j); baru++; } });
      return { ke: i + 1, unit: u, baru, kumulatif: seen.size };
    });
    return { S, m, Q1, Q2, F1, F2, chao2, jack1, varJack: Math.max(0, varJack), seJack: Math.sqrt(Math.max(0, varJack)), chao1,
      lengkap: chao2 ? (S / chao2) * 100 : 0, akumulasi, jenis: [...per.entries()].map(([jenis, o]) => ({ jenis, unit: o.units.size, n: o.n })) };
  }

  /* ---------- Kepadatan titik hitung (plot lingkaran atau bujur sangkar) ---------- */
  // A = n·π·r² (lingkaran) atau A = n·s² (bujur sangkar), dalam m² lalu ha
  function luasTitik(n, bentuk, ukuran, pi = 3.14) {
    const per = bentuk === "persegi" ? ukuran * ukuran : pi * ukuran * ukuran;
    return { perPlotM2: per, perPlotHa: per / 10000, m2: n * per, ha: (n * per) / 10000 };
  }

  /* ---------- Transek garis ---------- */
  // King (Tobing 2008): A = 2·L·d̄ ; D = N/A
  function king(N, jarak, L) {
    const d = jarak.filter((x) => fin(x) && x > 0), dbar = mean(d), m2 = 2 * L * dbar, ha = m2 / 10000;
    return { N, L, dbar, m2, ha, D: ha ? N / ha : 0, haPerInd: N ? ha / N : Infinity };
  }
  // Hayne (Santosa dkk. 2014): D = n·R/(2L), R = (1/n)Σ(1/ri) ; V(D) ≈ D²[var(n)/n² + Σ(1/ri − R)²/(R²·n·(n−1))], var(n) ≈ n
  // jarak dan L dalam meter; D per m² dikali 10.000 menjadi per ha. Individu = kelompok × rata-rata ukuran kelompok.
  function hayne(jarak, L, N) {
    const r = jarak.filter((x) => fin(x) && x > 0), n = r.length;
    if (!n || !L) return { n, R: 0, D: 0, Dind: 0, V: 0, SE: 0 };
    const inv = r.map((x) => 1 / x), R = mean(inv);
    const Dm2 = (n * R) / (2 * L), D = Dm2 * 10000;
    const dev = sum(inv.map((v) => (v - R) ** 2));
    const V = n > 1 ? D * D * (n / (n * n) + dev / (R * R * n * (n - 1))) : 0;
    const g = N && n ? N / n : 1;
    return { n, R, D, Dind: D * g, ukuranKelompok: g, V, SE: Math.sqrt(V), VInd: V * g * g, SEInd: Math.sqrt(V) * g, haPerInd: D * g ? 1 / (D * g) : Infinity };
  }
  // Jalur berlebar tetap: A = 2·w·L (w = setengah lebar), D = N/A
  function jalur(N, w, L) { const ha = (2 * w * L) / 10000; return { N, ha, D: ha ? N / ha : 0, haPerInd: N ? ha / N : Infinity }; }

  /* ---------- Pellet count (Sukmawati 2012) ---------- */
  // D = A·p/(t·d·a): kepadatan per ha = p/(t·d·a) dengan a dalam ha; populasi = kepadatan × A
  function pellet(p, t, d, a, A) {
    const D = t && d && a ? p / (t * d * a) : 0;
    return { p, t, d, a, A, D, populasi: A ? D * A : null, haPerInd: D ? 1 / D : Infinity };
  }

  /* ---------- Jejak kaki (Tikupadang dan Gunawan 1997) ---------- */
  // N = 2Nk − Nk1 ; Nh = [Nk + (1 − a)/a]·(Nk − Nk1) ; Nk, Nk1 = jumlah pasangan jejak terbanyak pertama dan kedua
  function jejak(perUnit, a = 0.05, luasHa) {
    const s = perUnit.filter((x) => fin(x)).sort((x, y) => y - x);
    const Nk = s[0] || 0, Nk1 = s[1] || 0, N = 2 * Nk - Nk1;
    const Nh0 = (Nk + (1 - a) / a) * (Nk - Nk1), Nh = Math.max(Nh0, N);
    return { Nk, Nk1, a, N, Nh, nhSamaN: Nh0 < N, luasHa, Dmin: luasHa ? N / luasHa : 0, Dmax: luasHa ? Nh / luasHa : 0 };
  }

  /* ---------- Sebaran: Morisita ---------- */
  // Id = n·(Σx² − Σx)/((Σx)² − Σx)
  function morisita(xs) {
    const n = xs.length, sx = sum(xs), sx2 = sum(xs.map((v) => v * v));
    return { n, sx, sx2, Id: sx > 1 ? (n * (sx2 - sx)) / (sx * sx - sx) : 0 };
  }

  /* ---------- Wilayah jelajah: poligon cembung minimum (Mohr 1947) ---------- */
  // titik: [{x, y}] ; sistem "geo" (x = bujur, y = lintang, derajat) diproyeksikan ke meter (ekuirektangular pada lintang rata-rata)
  const R_BUMI = 6371008.8;
  function mcp(titik, sistem = "geo") {
    const ok = titik.filter((p) => fin(p.x) && fin(p.y));
    const key = new Set(), unik = [];
    ok.forEach((p) => { const k = `${p.x.toFixed(7)},${p.y.toFixed(7)}`; if (!key.has(k)) { key.add(k); unik.push(p); } });
    const lat0 = mean(unik.map((p) => p.y)) * Math.PI / 180, lon0 = mean(unik.map((p) => p.x));
    const pr = (p) => (sistem === "geo" ? { x: ((p.x - lon0) * Math.PI / 180) * R_BUMI * Math.cos(lat0), y: (p.y * Math.PI / 180) * R_BUMI, src: p } : { x: p.x, y: p.y, src: p });
    const P = unik.map(pr).sort((a, b) => a.x - b.x || a.y - b.y);
    if (P.length < 3) return { n: ok.length, nUnik: unik.length, hull: P.map((p) => p.src), m2: 0, ha: 0, km2: 0, keliling: 0 };
    const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    const lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    const H = lo.slice(0, -1).concat(up.slice(0, -1));
    let a2 = 0, kel = 0;
    H.forEach((p, i) => { const q = H[(i + 1) % H.length]; a2 += p.x * q.y - q.x * p.y; kel += Math.hypot(q.x - p.x, q.y - p.y); });
    const m2 = Math.abs(a2) / 2;
    return { n: ok.length, nUnik: unik.length, hull: H.map((p) => p.src), m2, ha: m2 / 10000, km2: m2 / 1e6, keliling: kel };
  }

  /* ---------- Analisis vegetasi (Perdirjen KSDAE P.10/KSDAE/SET/KSA.0/9/2016) ---------- */
  // jenis: [{ jenis, latin, n, p (jumlah petak ditemukan), lbds (m², opsional) }] ; P = jumlah petak ; luasHa = luas seluruh petak
  // K = n/A, KR = K/ΣK·100, F = p/P, FR = F/ΣF·100, D = LBDS/A, DR = D/ΣD·100, INP = KR + FR (+ DR)
  function vegetasi(jenis, P, luasHa, pakaiD) {
    const rows = jenis.filter((r) => r.n > 0 || r.p > 0).map((r) => ({ ...r, K: luasHa ? r.n / luasHa : 0, F: P ? r.p / P : 0, D: luasHa && fin(r.lbds) ? r.lbds / luasHa : 0 }));
    const sK = sum(rows.map((r) => r.K)), sF = sum(rows.map((r) => r.F)), sD = sum(rows.map((r) => r.D));
    const adaD = !!pakaiD && sD > 0;
    rows.forEach((r) => {
      r.KR = sK ? (r.K / sK) * 100 : 0; r.FR = sF ? (r.F / sF) * 100 : 0; r.DR = adaD && sD ? (r.D / sD) * 100 : 0;
      r.INP = r.KR + r.FR + (adaD ? r.DR : 0);
    });
    rows.sort((a, b) => b.INP - a.INP);
    const sh = shannon(rows.map((r) => r.n));
    rows.forEach((r, i) => { r.pi = sh.rows[i].pi; r.piLnPi = sh.rows[i].piLnPi; });
    return { rows, P, luasHa, adaD, sK, sF, sD, N: sum(rows.map((r) => r.n)), S: rows.length, H: sh.H, maksINP: adaD ? 300 : 200 };
  }
  // Luas bidang dasar satu batang: LBDS = ¼·π·d² (d dalam cm → m²)
  const lbds = (dCm) => (fin(dCm) && dCm > 0 ? (Math.PI / 4) * (dCm / 100) ** 2 : 0);

  /* ---------- Karbon (SNI 7724:2011; IPCC 2006) ---------- */
  // Persamaan volume hutan alam NTB (dipakai LPK stok karbon Balai): V = a·D^b, D = diameter setinggi dada (cm)
  const PERS_VOLUME = {
    duabanga: { a: 0.000107, b: 2.5541, label: "Duabanga sp.", rumus: "V = 0,000107 × D^2,5541" },
    toona: { a: 0.00013, b: 2.5017, label: "Toona sureni", rumus: "V = 0,00013 × D^2,5017" },
    lain: { a: 0.000051464, b: 2.5874, label: "Jenis lain (hutan alam NTB)", rumus: "V = 0,000051464 × D^2,5874" }
  };
  const persVolume = (latin, jenis) => (/duabanga/i.test(`${latin} ${jenis}`) ? "duabanga" : /toona/i.test(`${latin} ${jenis}`) ? "toona" : "lain");
  const volumePohon = (d, key = "lain") => (fin(d) && d > 0 ? PERS_VOLUME[key].a * d ** PERS_VOLUME[key].b : 0);
  // BCEF bawaan IPCC (2006) Tabel 4.5, hutan alam tropis lembap, menurut kelas growing stock (m³/ha)
  const BCEF_IPCC = [[10, 9.0], [20, 4.0], [40, 2.8], [100, 2.05], [200, 1.7], [Infinity, 1.5]];
  const bcefIPCC = (gs) => BCEF_IPCC.find(([b]) => gs <= b)[1];
  // Serasah/nekromas/tumbuhan bawah: Bo = Bks·Bbt/Bbs (g per bingkai) ; t/ha = g/m² × 0,01
  function bahanOrganik(bbt, bbs, bks, luasM2 = 1) {
    const bo = bbs ? (bks * bbt) / bbs : 0;
    return { g: bo, gM2: luasM2 ? bo / luasM2 : 0, tHa: luasM2 ? (bo / luasM2) * 0.01 : 0 };
  }
  // Kayu mati (Van Wagner 1968; Kauffman dkk. 2016): V (m³/ha) = π²·Σd²/(8L), d dalam cm, L dalam m ; B = V·ρ
  const volumeKayuMati = (dCm, L) => (L ? (Math.PI ** 2 * dCm * dCm) / (8 * L) : 0);
  // Tanah: ρ = Bks/V (g/cm³) ; C (g/cm²) = KD·ρ·%C ; 1 g/cm² = 100 t/ha
  function karbonTanah(bks, vol, kd, persenC) {
    const rho = vol ? bks / vol : 0, gcm2 = kd * rho * (persenC / 100);
    return { rho, gcm2, tHa: gcm2 * 100 };
  }

  /* ---------- Uji akurasi peta tutupan (Congalton 1991; Cohen 1960) ---------- */
  // pasangan: [{ peta, lapangan }] ; OA = Σxii/N ; κ = (N·Σxii − Σ xi+·x+i)/(N² − Σ xi+·x+i)
  function akurasi(pasangan) {
    const ok = pasangan.filter((p) => String(p.peta || "").trim() && String(p.lapangan || "").trim());
    const kelas = [...new Set(ok.flatMap((p) => [String(p.peta).trim(), String(p.lapangan).trim()]))].sort();
    const ix = new Map(kelas.map((k, i) => [k, i]));
    const M = kelas.map(() => kelas.map(() => 0));
    ok.forEach((p) => M[ix.get(String(p.peta).trim())][ix.get(String(p.lapangan).trim())]++);
    const N = ok.length, diag = sum(kelas.map((_, i) => M[i][i]));
    const baris = M.map((r) => sum(r)), kolom = kelas.map((_, j) => sum(M.map((r) => r[j])));
    const pe = sum(kelas.map((_, i) => baris[i] * kolom[i]));
    const kappa = N * N - pe ? (N * diag - pe) / (N * N - pe) : 0;
    const per = kelas.map((k, i) => ({ kelas: k, pengguna: baris[i] ? (M[i][i] / baris[i]) * 100 : 0, pembuat: kolom[i] ? (M[i][i] / kolom[i]) * 100 : 0, nPeta: baris[i], nLapangan: kolom[i] }));
    return { kelas, M, N, sesuai: diag, OA: N ? (diag / N) * 100 : 0, kappa, baris, kolom, per };
  }
  // Kriteria kappa (Landis dan Koch 1977)
  const kriteriaKappa = (k) => (k > 0.8 ? "Hampir sempurna" : k > 0.6 ? "Kuat (substantial)" : k > 0.4 ? "Sedang (moderate)" : k > 0.2 ? "Cukup (fair)" : k > 0 ? "Lemah (slight)" : "Tidak ada kesesuaian");

  /* ---------- Skoring ---------- */
  // skor: [angka per kriteria] ; maks: skor maksimal per kriteria ; kelas: [[batas bawah %, label], ...] diurutkan menurun
  function skor(nilai, maks, kelas) {
    const v = nilai.map((x) => (fin(Number(x)) ? Number(x) : 0)), total = sum(v), mx = sum(maks);
    const persen = mx ? (total / mx) * 100 : 0;
    const k = (kelas || []).find(([b]) => round(persen, 6) >= b);
    return { total, maks: mx, persen, kelas: k ? k[1] : "" };
  }
  // Kelas sama lebar dari rentang skor [min, maks]: interval = (maks − min)/jumlah kelas
  function kelasSamaLebar(min, maks, label) {
    const w = (maks - min) / label.length;
    return label.map((l, i) => ({ dari: min + i * w, sampai: min + (i + 1) * w, label: l }));
  }

  /* ---------- Rekap kategori (persentase perilaku, tipe temuan, dll.) ---------- */
  // P = x/y × 100%
  function persen(items) {
    const m = new Map();
    items.forEach(([k, n]) => { k = String(k || "").trim() || "(tidak diisi)"; m.set(k, (m.get(k) || 0) + (fin(n) ? n : 1)); });
    const y = sum([...m.values()]);
    return { y, rows: [...m.entries()].map(([k, x]) => ({ k, x, p: y ? (x / y) * 100 : 0 })).sort((a, b) => b.x - a.x) };
  }

  const api = { sum, round, luasPlotLingkaran, kepadatan, shannon, KRITERIA_H, dominansi, kriteriaDominansi,
    dispersiPerPlot, dispersiTemplateJenis, dispersiTemplateGabungan, kriteriaSebaran, khiKuadratID,
    mean, komunitas, kriteriaE, kriteriaDs, kriteriaR, penduga, luasTitik, king, hayne, jalur, pellet, jejak, morisita, mcp,
    vegetasi, lbds, PERS_VOLUME, persVolume, volumePohon, BCEF_IPCC, bcefIPCC, bahanOrganik, volumeKayuMati, karbonTanah,
    akurasi, kriteriaKappa, skor, kelasSamaLebar, persen };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PEHStats = api;
})(typeof window !== "undefined" ? window : globalThis);
