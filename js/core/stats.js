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

  const api = { sum, round, luasPlotLingkaran, kepadatan, shannon, KRITERIA_H, dominansi, kriteriaDominansi,
    dispersiPerPlot, dispersiTemplateJenis, dispersiTemplateGabungan, kriteriaSebaran, khiKuadratID };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.PEHStats = api;
})(typeof window !== "undefined" ? window : globalThis);
