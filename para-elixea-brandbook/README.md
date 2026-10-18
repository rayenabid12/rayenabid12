# Para Elixea — Brand book 2.0

A complete redesign of the Para Elixea brand guidelines (Catana Creative — Med Rayen Abid).
The PE monogram is kept as-is. Everything around it was rebuilt: brand platform, design concept,
logo system, palette, typography, graphic elements, mockups and a Behance case study.

## Design concept — « Le Sanctuaire »

The whole identity is designed like a place you walk into. It uses three visual elements
taken from the store and the logo:

| Element | Origin | Use |
|---|---|---|
| **L'Arche** (the arch) | The arched shelving niches of the Slimen store | Photo frames, packaging windows, signage, social layouts |
| **La Ligne** (the line) | The monogram's single round-ended stroke (1/13 of its height) | Icons, dividers, illustrations |
| **La Feuille** (the leaf) | The leaf-shaped "e" taken out of the symbol | Signature pattern |

Palette: Vert Marine `#1A5F7A`, Vert Sauge `#88B0A8`, Beige Rosé `#D8C1A8`,
and two additions, Crème Sanctuaire `#F5EFE6` (backgrounds) and Encre Nuit `#0F3443` (text).
Typefaces: **Gotham** (headings, wordmark) and **Calibri** (body text).

## Deliverables (`export/`)

- `Para-Elixea-Charte-Graphique.pdf` — 48-slide brand book in French (16:9)
- `brandbook-slides/` — the same slides as JPGs (1920 × 1080)
- `behance/` — 24 Behance modules in English (2800 px wide, 2×) plus `00-behance-cover.jpg` (project cover, 808 × 632 at 2×).
  Upload them to Behance in numbered order.
- `mockups/` — 11 mockup scenes at 4K: business cards, stationery, bags, packaging, facade,
  interior signage, loyalty and gift cards, tissue and seal, Instagram, social templates, website
- `assets/logo/` — vector SVGs (symbol and horizontal lockup, 5 colours)

## Sources

- `brandbook.html`, `behance.html`, `mockups.html` — open them in Chrome to view or edit
- `css/brand.css` — design tokens (colours, type scale)
- `js/brand.js` — logo, icon and pattern builders · `js/posts.js` — social templates

### Fonts
If **Gotham** and **Calibri** are installed, the pages use them automatically. Otherwise they fall back
to the bundled **Montserrat** (close to Gotham) and **Carlito** (metric-compatible with Calibri).
The exports were rendered with these fallbacks. Re-render with Gotham installed for the final version.
In the SVG lockups the wordmark is live text: open the file in Illustrator with Gotham Book active, then *Create Outlines* before print.

### Re-rendering
```bash
NODE_PATH=$(npm root -g) node tools/shots.js mockups.html export/mockups 2
NODE_PATH=$(npm root -g) node tools/shots.js brandbook.html export/brandbook-slides 1
NODE_PATH=$(npm root -g) node tools/shots.js behance.html export/behance 2 1400 1000
NODE_PATH=$(npm root -g) node tools/pdf.js brandbook.html export/Para-Elixea-Charte-Graphique.pdf
```
Render the mockups first, because the brand book and Behance pages embed them.

## Notes
- Contact details on the mockups (phone, name, address, prices) are placeholders.
- The « Gamme signature » packaging is a proposed private-label extension, not an existing product line.
- Stock photos are reused from the 2024 guide. The real store photo was cropped to the arches only,
  because it showed construction boxes. Replace it with a professional photo shoot of the finished store.
