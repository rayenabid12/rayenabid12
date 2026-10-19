"""Builds brandbook/index.html from brandbook.src.html + the logo vector parts.
Usage: python3 build.py <parts inline.json> <old-artboards.jpg>"""
import json, sys, base64, pathlib
here = pathlib.Path(__file__).parent
I = json.load(open(sys.argv[1]))
old = base64.b64encode(open(sys.argv[2], 'rb').read()).decode()
src = (here / 'brandbook.src.html').read_text()
L, M = I['L'], I['M']
f = lambda n: f"{n:.2f}".rstrip('0').rstrip('.')

syms = ''.join(f'<symbol id="gj-{k}" viewBox="0 0 {f(v["vb"][0])} {f(v["vb"][1])}">{v["body"]}</symbol>' for k, v in L.items())
src = src.replace('{{SYMBOLS}}', f'<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>{syms}</defs></svg>')
for k, v in L.items():
    src = src.replace('{{VB_%s}}' % k, f'0 0 {f(v["vb"][0])} {f(v["vb"][1])}')
src = src.replace('{{OLD_IMG}}', 'data:image/jpeg;base64,' + old)

# anatomy: callouts on the symbol (symbol units)
w, h = L['symbol']['vb']
W, H = w + 120, h + 60
def call(n, cx, cy, lx, ly):
    return (f'<line x1="{f(cx)}" y1="{f(cy)}" x2="{f(lx)}" y2="{f(ly)}" stroke="#F0A23B" stroke-width="1.2"/>'
            f'<circle cx="{f(cx)}" cy="{f(cy)}" r="4" fill="#F0A23B"/>'
            f'<circle cx="{f(lx)}" cy="{f(ly)}" r="11" fill="#0A1220"/>'
            f'<text x="{f(lx)}" y="{f(ly+4)}" text-anchor="middle" fill="#F0A23B" style="font:500 11px \'JetBrains Mono\',monospace">{n}</text>')
anat = call(1, 12, h*0.40, -24, h*0.40) + call(2, w*0.40, h*0.16, w*0.40, -16) + call(3, w*0.93, h*0.85, w+30, h*0.85)
src = src.replace('{{ANAT_W}}', f(W)).replace('{{ANAT_H}}', f(H)).replace('{{ANATOMY}}', anat)

# clear space on the primary stacked lockup; X = g crossbar height (34.35 units at this scale)
X = 34.35
sw, sh = L['primary-stacked']['vb']
p = X * 1.6
cs = (f'<rect x="{-X}" y="{-X}" width="{f(sw+2*X)}" height="{f(sh+2*X)}" fill="none" stroke="#F0A23B" stroke-dasharray="6 5" stroke-width="1.5"/>'
      f'<rect x="0" y="0" width="{f(sw)}" height="{f(sh)}" fill="none" stroke="rgba(0,43,92,.25)" stroke-width="1"/>'
      f'<use href="#gj-primary-stacked" width="{f(sw)}" height="{f(sh)}" fill="#002B5C"/>')
for x, y in [(-X, -X), (sw, -X), (-X, sh), (sw, sh)]:
    cs += (f'<rect x="{f(x)}" y="{f(y)}" width="{X}" height="{X}" fill="rgba(240,162,59,.22)"/>'
           f'<text x="{f(x+X/2)}" y="{f(y+X/2+5)}" text-anchor="middle" fill="#8a5512" style="font:500 14px \'JetBrains Mono\',monospace">X</text>')
src = src.replace('{{CS_VB}}', f'{f(-p)} {f(-p)} {f(sw+2*p)} {f(sh+2*p)}').replace('{{CLEARSPACE}}', cs)

cw = (400 - 11 * 10) / 12
src = src.replace('{{COLS}}', ''.join(f'<rect x="{f(40+i*(cw+10))}" y="0" width="{f(cw)}" height="270"/>' for i in range(12)))
assert '{{' not in src, src[src.index('{{'):src.index('{{')+40]
(here.parent / 'index.html').write_text(src)
print('built', len(src)//1024, 'KB')
