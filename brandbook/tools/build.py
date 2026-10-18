"""Assemble brandbook/index.html from the sources in brandbook/src.

Usage: python3 brandbook/tools/build.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / "src"

logos = json.loads((ROOT / "tools" / "logo-paths.json").read_text())
symbols = {"monogramme": "pe", "logotype": "wm", "horizontal": "lh", "vertical": "lv"}
defs = "".join(
    f'<symbol id="{sid}" viewBox="{logos[name]["viewBox"]}">{logos[name]["inner"]}</symbol>'
    for name, sid in symbols.items()
)
defs = f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{defs}</defs></svg>'

shell = (SRC / "shell.html").read_text()
css = (SRC / "styles.css").read_text()
slides = "\n".join(
    (SRC / f).read_text() for f in ("slides-1-marque.html", "slides-2-systeme.html", "slides-3-applications.html")
)
html = shell.replace("/*STYLES*/", css).replace("<!--LOGO_DEFS-->", defs).replace("<!--SLIDES-->", slides)
(ROOT / "index.html").write_text(html)
print(f"index.html written ({len(html) // 1024} KB)")
