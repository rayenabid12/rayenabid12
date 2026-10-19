# Packs the panel JPEGs into one PDF, one page per panel, without re-encoding.
import glob, sys
from PIL import Image

files = sorted(glob.glob('png/*.jpg'))
objs = []  # list of bytes, object i+1

def add(b):
    objs.append(b)
    return len(objs)

pages_id = add(b'')  # placeholder
page_ids = []
for f in files:
    data = open(f, 'rb').read()
    w, h = Image.open(f).size
    pw, ph = w / 2, h / 2  # 1400pt wide pages
    img = add(b'<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length %d >>\nstream\n' % (w, h, len(data)) + data + b'\nendstream')
    content = b'q %.2f 0 0 %.2f 0 0 cm /Im0 Do Q' % (pw, ph)
    cid = add(b'<< /Length %d >>\nstream\n' % len(content) + content + b'\nendstream')
    page_ids.append(add(b'<< /Type /Page /Parent %d 0 R /MediaBox [0 0 %.2f %.2f] /Resources << /XObject << /Im0 %d 0 R >> >> /Contents %d 0 R >>' % (pages_id, pw, ph, img, cid)))
objs[pages_id - 1] = b'<< /Type /Pages /Kids [%s] /Count %d >>' % (b' '.join(b'%d 0 R' % i for i in page_ids), len(page_ids))
info = add(b'<< /Title (Rectify Brand Identity) /Author (Rectify) >>')
cat = add(b'<< /Type /Catalog /Pages %d 0 R >>' % pages_id)

out = bytearray(b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
offsets = []
for i, o in enumerate(objs, 1):
    offsets.append(len(out))
    out += b'%d 0 obj\n' % i + o + b'\nendobj\n'
xref = len(out)
out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(objs) + 1)
for off in offsets:
    out += b'%010d 00000 n \n' % off
out += b'trailer\n<< /Size %d /Root %d 0 R /Info %d 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (len(objs) + 1, cat, info, xref)
path = sys.argv[1] if len(sys.argv) > 1 else 'Rectify-Brand-Identity.pdf'
open(path, 'wb').write(out)
print(path, len(files), 'pages', round(len(out) / 1e6, 1), 'MB')
