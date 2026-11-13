/*
 * Memuat skrip aplikasi (urutan sama dengan index.html) di dalam konteks vm Node, tanpa peramban,
 * supaya rumus generator dan pembaca patroli SMART bisa diuji dengan `node --test`.
 * Bukan berkas uji: dipakai oleh tests/*.test.js.
 */
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const AKAR = path.join(__dirname, "..");

// DOMParser kecil untuk XML ekspor SMART: elemen, atribut, teks, CDATA, komentar, dan deklarasi.
// Cukup untuk smart-parser.js (localName, children, attributes, textContent, getAttribute).
const ENTITAS = { lt: "<", gt: ">", amp: "&", quot: '"', apos: "'" };
const urai = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => (e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENTITAS[e] ?? m));
function elemen(nama, atribut) {
  return {
    tagName: nama, localName: nama.replace(/^.*:/, ""), attributes: atribut, children: [], isi: [],
    hasAttribute(n) { return atribut.some((a) => a.name === n); },
    getAttribute(n) { const a = atribut.find((x) => x.name === n); return a ? a.value : null; },
    get textContent() { return this.isi.map((x) => (typeof x === "string" ? x : x.textContent)).join(""); },
    getElementsByTagName(n) { return this.children.flatMap((c) => [...(c.localName === n || c.tagName === n ? [c] : []), ...c.getElementsByTagName(n)]); }
  };
}
class DOMParser {
  parseFromString(teks) {
    const akar = elemen("#document", []), tumpuk = [akar];
    const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!DOCTYPE[^>]*>|<!\[CDATA\[([\s\S]*?)\]\]>|<\/([^\s>]+)\s*>|<([^\s/>]+)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
    let m, galat = false;
    while ((m = re.exec(teks))) {
      const atas = tumpuk[tumpuk.length - 1];
      if (m[1] !== undefined) atas.isi.push(m[1]);
      else if (m[2]) { if (tumpuk.length < 2 || atas.tagName !== m[2]) { galat = true; break; } tumpuk.pop(); }
      else if (m[3]) {
        const atr = [...(m[4] || "").matchAll(/([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g)].map((a) => ({ name: a[1], value: urai(a[3] ?? a[4]) }));
        const el = elemen(m[3], atr);
        atas.children.push(el); atas.isi.push(el);
        if (!m[5]) tumpuk.push(el);
      } else if (m[6] !== undefined) atas.isi.push(urai(m[6]));
    }
    if (tumpuk.length !== 1) galat = true;
    const doc = { documentElement: akar.children[0] || null, getElementsByTagName: (n) => (galat && n === "parsererror" ? [{}] : akar.getElementsByTagName(n)) };
    return doc;
  }
}

// Konteks peramban tiruan: document dan localStorage kosong, cukup agar skrip termuat tanpa antarmuka.
function muat() {
  const html = fs.readFileSync(path.join(AKAR, "index.html"), "utf8");
  const berkas = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]).filter((f) => !/^https?:/.test(f));
  const el = () => ({ style: {}, classList: { add() {}, remove() {}, toggle() {} }, appendChild() {}, setAttribute() {}, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [] });
  const ctx = {
    console, Buffer, DOMParser, setTimeout, clearTimeout, addEventListener() {}, location: { hash: "" },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    document: { getElementById: () => null, createElement: el, addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], body: el() }
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of berkas) vm.runInContext(fs.readFileSync(path.join(AKAR, f), "utf8"), ctx, { filename: f });
  return ctx;
}

const fixture = (nama) => fs.readFileSync(path.join(__dirname, "fixtures", nama), "utf8");

module.exports = { muat, fixture, DOMParser };
