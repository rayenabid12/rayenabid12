# Tunisia Crypto Signals: Brand Book 2.0

A rebuilt version of the 2024 brand guidelines (`final_charte.pdf`).

| File | What it is |
| --- | --- |
| `index.html` | Source of the brand book (chapters, guidelines, mockups). Has a **Present** mode: arrow keys move plate by plate. |
| `brandbook.html` | Standalone copy you can open in any browser. |
| `exports/TCS-Brand-Book.pdf` | One page per chapter. |
| `exports/plates/` | Each chapter as a PNG (2×). |
| `exports/mockups/` | Each mockup as a PNG (2×): Discord, cards, mobile, Instagram, website, stationery, billboard, roll-up, signage, icons. |
| `exports/logo/` | Vector mark in gradient, Mist, Royal, white and black. |

Rebuild exports after editing `index.html`:

```sh
npm i -g playwright   # if needed
node render.js
```

Contact details, handles (`tcsignals.tn`, `discord.gg/tcsignals`) and signal prices in the mockups are placeholders.
