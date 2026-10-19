# Ghaith Jenhani · Brand Identity 2026

The full brand system built on the 2025 "G" logo: strategy, verbal identity, visual identity, guidelines and applications.

| Deliverable | Where |
|---|---|
| Brand strategy document (market, audience, strategy, verbal identity) | `strategy/brand-strategy.md` |
| Brand book: visual identity system + guidelines + mockups (web) | `brandbook/index.html` |
| Brand book (print / share) | `brandbook/Ghaith-Jenhani-Brandbook.pdf` |
| Logo masters: 5 lockups × 4 colours + 3 avatars | `logos/svg/` |
| Logo exports: transparent PNG, 2400 px | `logos/png/` |
| Mockups: one PNG per application spread, 2× | `mockups/` |
| Colour and type tokens (CSS, JSON, Adobe .ase swatches) | `source/tokens/` |
| Original 2025 Illustrator file (unchanged) | `source/original/` |

## Logo files

`gj-<lockup>-<colour>.svg`

- **Lockups:** `primary-stacked` (default), `horizontal`, `symbol`, `wordmark` (name + "Filmmaker"), `name` (name only)
- **Colours:** `navy` (Blue Hour #002B5C), `ink` (Night #0A1220), `white`, `graphite` (#333333, from the 2025 file)
- **Avatars:** `gj-avatar-navy|ink|paper.svg` for social profiles and app icons

All logo vectors are taken directly from the original Illustrator paths. Nothing was redrawn.

## Rebuilding the brand book

`brandbook/src/brandbook.src.html` is the editable source. `brandbook/src/build.py` injects the logo vectors and writes `brandbook/index.html`.

```sh
cd brand/brandbook/src
python3 build.py logo-parts.json 2025-artboards.jpg
```

`extract.js` and `gen.js` (Node + Playwright) regenerate `logo-parts.json` and the `logos/` folder from the original `.ai` file.
