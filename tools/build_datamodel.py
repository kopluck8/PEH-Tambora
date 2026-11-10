"""Bangun turunan data model 'Metode Teknis' dari datamodel/metode-teknis.json.

Pakai (dari folder utama repo):
    python3 tools/build_datamodel.py

Hasil:
    datamodel/metode-teknis.xml   rancangan kategori dan atribut dalam format ekspor Data Model SMART
    datamodel/SPESIFIKASI.md      tabel kategori dan atribut untuk diinput di SMART Desktop
    js/core/datamodel.js          kamus label dan struktur yang dipakai aplikasi saat membaca ekspor patroli
"""
import json
import os
from xml.sax.saxutils import quoteattr

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "datamodel", "metode-teknis.json")
dm = json.load(open(SRC, encoding="utf-8"))
LANGS = dm["bahasa"]
ATTR = {a["key"]: a for a in dm["atribut"]}


def names_xml(nama, ind):
    return "".join(f'{ind}<names language_code="{l}" value={quoteattr(nama[l])}/>\n' for l in LANGS if nama.get(l))


def walk(cats, path=()):
    for c in cats:
        p = path + (c["key"],)
        yield p, c
        yield from walk(c.get("anak", []), p)


# Cek konsistensi: setiap atribut yang dipakai kategori harus terdefinisi
for p, c in walk(dm["kategori"]):
    for a in c.get("atribut", []):
        if a["key"] not in ATTR:
            raise SystemExit(f"Atribut '{a['key']}' dipakai kategori {'.'.join(p)} tetapi tidak ada di daftar atribut.")

# ---------- XML (format ekspor Data Model SMART) ----------
x = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
     "<!-- Dibuat oleh tools/build_datamodel.py dari datamodel/metode-teknis.json. Jangan disunting langsung. -->",
     "<!-- Atribut yang SUDAH ADA di Data Model Balai TN Tambora dan hanya dirujuk (tidak didefinisikan ulang): "
     + ", ".join(a["key"] for a in dm["atribut"] if a.get("sudah_ada")) + " -->",
     '<DataModel xmlns="http://www.smartconservationsoftware.org/xml/1.0/datamodel">',
     "  <languages>"] + [f'    <language code="{l}"/>' for l in LANGS] + ["  </languages>", "  <attributes>"]
for a in dm["atribut"]:
    if a.get("sudah_ada"):
        continue
    x.append(f'    <attribute key="{a["key"]}" isrequired="false" type="{a["tipe"]}">')
    x.append(names_xml(a["nama"], "      ").rstrip("\n"))
    for o in a.get("pilihan", []):
        x.append(f'      <values key="{o["key"]}">')
        x.append(names_xml(o, "        ").rstrip("\n"))
        x.append("      </values>")
    x.append("    </attribute>")
x.append("  </attributes>")
x.append("  <categories>")


def cat_xml(c, ind):
    out = [f'{ind}<category key="{c["key"]}" ismultiple="{"true" if c.get("multiple") else "false"}" isactive="true">',
           names_xml(c["nama"], ind + "  ").rstrip("\n")]
    for a in c.get("atribut", []):
        out.append(f'{ind}  <attribute attributekey="{a["key"]}" isrequired="{"true" if a.get("wajib") else "false"}" isactive="true"/>')
    for k in c.get("anak", []):
        out.extend(cat_xml(k, ind + "  "))
    out.append(f"{ind}</category>")
    return out


for c in dm["kategori"]:
    x.extend(cat_xml(c, "    "))
x += ["  </categories>", "</DataModel>", ""]
open(os.path.join(ROOT, "datamodel", "metode-teknis.xml"), "w", encoding="utf-8").write("\n".join(x))

# ---------- Spesifikasi Markdown ----------
md = ["# Spesifikasi Data Model SMART: Metode Teknis", "",
      "Dibuat otomatis oleh `tools/build_datamodel.py` dari `datamodel/metode-teknis.json`. Versi " + dm["versi"] + ".", "",
      "## Pohon kategori (Observation)", ""]
for p, c in walk(dm["kategori"]):
    lvl = len(p) - 1
    md.append(f"{'  ' * lvl}- **{c['nama']['in']}** (level {lvl}) `{'.'.join(p)}.`" + (f" — {c['keterangan']}" if c.get("keterangan") else ""))
md += ["", "## Atribut per kategori", ""]
for p, c in walk(dm["kategori"]):
    if not c.get("atribut"):
        continue
    md += [f"### {c['nama']['in']} `{'.'.join(p)}.`", "", "| No | Key atribut | Label | Tipe | Wajib | Status di Data Model Balai |", "|---|---|---|---|---|---|"]
    for i, ref in enumerate(c["atribut"], 1):
        a = ATTR[ref["key"]]
        md.append(f"| {i} | `{a['key']}` | {a['nama']['in']} | {a['tipe']} | {'ya' if ref.get('wajib') else ''} | {'sudah ada, dipakai ulang' if a.get('sudah_ada') else '**baru**'} |")
    md.append("")
md += ["## Pilihan untuk atribut daftar (LIST) yang baru", ""]
for a in dm["atribut"]:
    if a.get("pilihan") and not a.get("sudah_ada"):
        md.append(f"- `{a['key']}` ({a['nama']['in']}): " + "; ".join(f"`{o['key']}` = {o['in']}" for o in a["pilihan"]))
md.append("")
open(os.path.join(ROOT, "datamodel", "SPESIFIKASI.md"), "w", encoding="utf-8").write("\n".join(md))

# ---------- Kamus untuk aplikasi ----------
cats, attrs, items = {}, {}, {}
for p, c in walk(dm["kategori"]):
    cats[".".join(p) + "."] = c["nama"]["in"]
for a in dm["atribut"]:
    attrs[a["key"]] = a["nama"]["in"]
    for o in a.get("pilihan", []):
        items[a["key"] + "|" + o["key"]] = o["in"]
js = ("/* Dibuat otomatis oleh tools/build_datamodel.py dari datamodel/metode-teknis.json. */\n"
      "window.PEH_DATAMODEL = " + json.dumps({"versi": dm["versi"], "kategori": dm["kategori"], "atribut": dm["atribut"]}, ensure_ascii=False, separators=(",", ":")) + ";\n"
      "window.PEH_DICT = " + json.dumps({"categories": cats, "attributes": attrs, "items": items}, ensure_ascii=False, separators=(",", ":")) + ";\n")
open(os.path.join(ROOT, "js", "core", "datamodel.js"), "w", encoding="utf-8").write(js)
print("OK:", len(cats), "kategori,", len(attrs), "atribut,", len(items), "pilihan")
