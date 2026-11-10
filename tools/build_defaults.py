"""Tanam logo bawaan ke js/core/defaults.js supaya aplikasi bisa dibuka langsung dari file (tanpa server).
Pakai: python3 tools/build_defaults.py (dari folder utama repo). Jalankan ulang setelah mengganti logo di img/."""
import base64, json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
b64 = lambda p: "data:image/png;base64," + base64.b64encode(open(os.path.join(ROOT, p), "rb").read()).decode()
with open(os.path.join(ROOT, "js", "core", "defaults.js"), "w") as f:
    f.write("/* Dibuat oleh tools/build_defaults.py: logo Balai (sampul) dan logo kementerian (kop). */\n")
    f.write("window.PEH_DEFAULT_LOGO = " + json.dumps(b64("img/logo-tntambora.png")) + ";\n")
    f.write("window.PEH_KOP_LOGO = " + json.dumps(b64("img/logo-kemenhut.png")) + ";\n")
print("OK", os.path.getsize(os.path.join(ROOT, "js", "core", "defaults.js")) // 1024, "KB")
