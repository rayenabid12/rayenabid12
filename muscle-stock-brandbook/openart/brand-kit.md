# OpenArt Brand Kit — Muscle Stock

Paste each block into the matching field of **Assets → Brand kit → Brand kit 1** in OpenArt.

## 1. Add logo
Upload, in this order:
1. `assets/logo/icon-color.png` (round symbol, primary)
2. `assets/logo/emblem-red.png` (full emblem)
3. `assets/logo/wordmark-white.png` (wordmark only)

## 2. Add color palette
| Name | Hex | Role |
|---|---|---|
| Crimson Red | #BC3333 | Accent: prices, buttons, lids, light glows |
| Iron Black | #1D1D1B | Main background, packaging |
| Bone | #F2EEE7 | Light neutral, replaces pure white |
| Dark Blue | #1F3A93 | Recovery product line only |

## 3. Add typography
- Headings: **Barlow Condensed**, ExtraBold Italic, all caps
- Body: **Roboto**, Regular / Medium / Bold
- Wordmark only: **Sakana** (never for headings)

## 4. Add brand assets
- `mockups/out/packaging-range.jpg` (tub range)
- `mockups/out/shaker-bottle.jpg` (shaker + bottle)
- `mockups/out/apparel.jpg` (T-shirts)

## 5. Add style references
- `mockups/out/photo-duotone.jpg` (red duotone photo style)
- `mockups/out/pattern.jpg` (14° stripe pattern)
- `openart/generated/scene-gym-night.jpg` (dark gym, red neon)

## 6. Add brand rules
```
ALWAYS
- Dark, moody, premium gym atmosphere: deep blacks, a single crimson red (#BC3333) light accent, light haze.
- Real athletes, real sweat, real effort. Determined, focused expressions.
- Matte black packaging; lid colour shows the line (red Performance, blue Recovery, bone Essentials).
- Keep the bodybuilder emblem and the MUSCLE STOCK wordmark exactly as supplied.
- Leave clean dark negative space for headlines.

NEVER
- Never stretch, rotate, recolour, outline or add shadows/glows to the logo.
- Never invent a new logo, mascot or slogan, and never misspell MUSCLE STOCK.
- No green, purple, orange or yellow colour casts; no pastel or bright daylight looks.
- No cartoon, 3D-render or plastic CGI style for people.
- No fake text, gibberish labels, watermarks or other brands.
- No exaggerated body claims (no unrealistic physiques, no before/after miracle imagery).
```
Reference focus: **Logo** first, then **Brand assets**.

---

# What was generated (OpenArt, via MCP, Nov 2026)

Saved in `openart/generated/`. Total spend: **192 credits** (budget 200).

| File | Model | Credits | Notes |
|---|---|---|---|
| scene-deadlift.jpg | Seedream 4.5, 2K 3:4 | 14 | Athlete lift, red rim light |
| scene-powder.jpg | Seedream 4.5, 2K 3:4 | 14 | Unbranded shaker (superseded) |
| scene-grip.jpg | Seedream 4.5, 2K 3:4 | 14 | Chalked hands on barbell |
| scene-athlete-story.jpg | Seedream 4.5, 2K 9:16 | 14 | Athlete drinking; shaker is unbranded |
| scene-flatlay.jpg | Seedream 4.5, 2K 3:4 | 14 | Powders + scoops flat lay |
| scene-gym-night.jpg | Seedream 4.5, 2K 9:16 | 14 | Empty gym, red neon |
| product-tubs.jpg | Nano Banana Pro, 1K 4:5 | 36 | From our tub mockup, logo kept |
| product-shaker.jpg | Nano Banana Pro, 1K 4:5 | 36 | From our shaker mockup, logo kept |
| scene-powder-branded.jpg | Nano Banana Pro, 1K 3:4 | 36 | Powder shot with the branded shaker |

# Social templates

Source: `mockups/src/13-social-templates.html` → `node render.mjs 13` (from `mockups/`).
Outputs in `mockups/out/`: 6 Instagram posts (1080×1350) and 2 stories (1080×1920),
plus `social-templates-overview.jpg`.

Fixed system on every post: real logo + wordmark bottom-left, handle bottom-right,
red eyebrow label, Barlow Condensed headline, one 14° red band for offers.
To make a new post: duplicate a block, swap the photo and the text.
Placeholders to replace: `@musclestock.tn`, street address, opening hours, offer dates.
