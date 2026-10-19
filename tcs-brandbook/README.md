# Tunisia Crypto Signals: Brand Book 2.0

A rebuilt version of the 2024 brand guidelines (`final_charte.pdf`).

| File | What it is |
| --- | --- |
| `index.html` | Source of the brand book (chapters, guidelines, mockups). Has a **Present** mode: arrow keys move plate by plate. |
| `brandbook.html` | Standalone copy you can open in any browser. |
| `exports/TCS-Brand-Book.pdf` | One page per chapter, full 2× resolution. |
| `exports/plates/` | Each chapter as a PNG (2×). |
| `exports/mockups/` | Each mockup as a PNG (2×): Discord, cards, mobile, Instagram, website, stationery, billboard, roll-up, signage, icons. |
| `exports/logo/` | Vector mark in gradient, Mist, Royal, white and black. |

Rebuild exports after editing `index.html`:

```sh
npm i -g playwright   # if needed
node render.js
python3 -c "from PIL import Image;import glob;i=[Image.open(f).convert('RGB') for f in sorted(glob.glob('exports/plates/*.png'))];i[0].save('exports/TCS-Brand-Book.pdf',save_all=True,append_images=i[1:],resolution=192,quality=95,subsampling=0)"
```

Contact details, handles (`tcsignals.tn`, `discord.gg/tcsignals`) and signal prices in the mockups are placeholders.
