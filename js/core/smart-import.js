/*
 * Membaca file ekspor patroli SMART Desktop (.xml, atau .zip berisi satu/lebih .xml patroli)
 * lalu meratakan observasi menjadi daftar { kategori, atribut, waypoint } yang mudah dipakai kegiatan.
 * Label diambil dari kamus Data Model: kamus Metode Teknis bawaan (js/core/datamodel.js),
 * kamus tambahan kegiatan (mis. daftar jenis raptor), dan Data Model XML yang dimuat pengguna.
 */
(function () {
  "use strict";

  async function bacaFile(file) {
    const name = file.name.toLowerCase();
    if (name.endsWith(".zip")) {
      if (!window.JSZip) throw new Error("Pustaka JSZip belum termuat (perlu koneksi internet sekali).");
      const zip = await JSZip.loadAsync(file);
      const xmls = Object.keys(zip.files).filter((n) => n.toLowerCase().endsWith(".xml") && !zip.files[n].dir);
      const out = [];
      for (const n of xmls) {
        const text = await zip.file(n).async("string");
        if (/<(\w+:)?patrol[\s>]/.test(text)) out.push(SMART.parsePatrolXML(text));
      }
      if (!out.length) throw new Error("Tidak ada file XML patroli SMART di dalam zip ini.");
      return out;
    }
    if (name.endsWith(".xml")) return [SMART.parsePatrolXML(await file.text())];
    throw new Error("Format file belum didukung. Pilih ekspor patroli SMART (.xml atau .zip).");
  }

  // Gabungan kamus: urutan pertama paling diutamakan
  function labeler(dicts) {
    const ds = dicts.filter(Boolean);
    const variants = (k) => [k, k.endsWith(".") ? k.slice(0, -1) : k + "."];
    return {
      item(attrKey, key) {
        for (const d of ds) for (const v of variants(key)) {
          if (d.items && d.items[attrKey + "|" + v]) return d.items[attrKey + "|" + v];
        }
        for (const d of ds) for (const v of variants(key)) if (d.items && d.items[v]) return d.items[v];
        const segs = key.split(".").filter(Boolean);
        return segs[segs.length - 1] || key;
      },
      cat(key) { for (const d of ds) if (d.categories && d.categories[key]) return d.categories[key]; return key; }
    };
  }

  // Semua observasi dengan kategori berawalan `prefix` (mis. "metodeteknis.inventarisasiraptor."); prefix boleh berupa daftar,
  // sub dihitung dari awalan pertama yang cocok (mis. ["metodeteknis.", "satwaliar."] untuk rekap lintas kategori)
  function observasi(patrols, prefix, dicts) {
    const L = labeler(dicts), awalan = [].concat(prefix);
    const out = [];
    for (const p of patrols) for (const leg of p.legs) for (const day of leg.days) for (const wp of day.waypoints) {
      for (const ob of wp.observations) {
        const pre = awalan.find((a) => ob.category.startsWith(a));
        if (pre === undefined) continue;
        const attr = {};
        for (const a of ob.attributes) {
          const v = a.values[0];
          if (!v) continue;
          attr[a.key] = v.kind === "item" ? { key: v.value, label: L.item(a.key, v.value), kind: "item" } : { value: v.value, kind: v.kind };
        }
        out.push({ patrol: p.id, stasiun: p.station || "", kategori: ob.category, sub: ob.category.slice(pre.length).replace(/\.$/, ""), attr, x: wp.x, y: wp.y, tanggal: day.date || wp.date, waktu: (wp.time || "").substr(0, 5), wpId: wp.id, foto: ob.photos.concat(wp.photos) });
      }
    }
    return out;
  }
  // Nilai atribut sebagai teks/angka
  const nilai = (o, key) => { const a = o.attr[key]; return a ? (a.kind === "item" ? a.label : a.value) : ""; };

  // Ringkasan patroli untuk mengisi identitas kegiatan
  function ringkas(patrols) {
    const dates = patrols.flatMap((p) => [p.startDate, p.endDate]).filter(Boolean).map((d) => d.substr(0, 10)).sort();
    const anggota = new Map();
    patrols.forEach((p) => p.legs.forEach((l) => l.members.forEach((m) => {
      const nama = `${m.givenName || ""} ${m.familyName || ""}`.trim();
      if (nama && !anggota.has(nama)) anggota.set(nama, { nama, nip: m.employeeId || "", ketua: m.isLeader });
    })));
    return { id: patrols.map((p) => p.id).join(", "), mulai: dates[0] || "", selesai: dates[dates.length - 1] || "", anggota: [...anggota.values()], mandat: [...new Set(patrols.map((p) => p.mandate).filter(Boolean))].join(", ") };
  }

  window.PEHSmart = { bacaFile, labeler, observasi, nilai, ringkas };
})();
