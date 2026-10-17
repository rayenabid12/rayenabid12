# Happy Book — Brand Guidelines v2.0

A full redesign of the original Happy Book *charte graphique* (2024) by Catanacreative.

## What's here

| Folder | Contents |
| --- | --- |
| `brand/logo/` | Vector logo masters (SVG) and 1600 px PNGs: full colour, sticker (white outline), white, ink, purple, white-with-ink-outline |
| `brand/icons/` | The five brand shapes taken from the logo: heart, hand, smiley, smile, bean, in brand colours, white, pink, purple and yellow |
| `brand/pattern/` | Repeating pattern tiles (SVG, 600 px) and 1920×1080 renders: full colour on cream, on cyan, tone-on-tone cyan and purple |
| `brand/photos/` | Lifestyle photos from the first edition, cropped to remove generator watermarks |
| `mockups/renders/` | 1920×1080 mockups: stationery, packaging, book series, social media, website, merchandise, stickers, retail sign; plus the clear-space, backgrounds and misuse diagrams |
| `mockups/source/` | The HTML/CSS source of every mockup and diagram, so text, products and colours can be edited and re-rendered |
| `deck/project/` | Source of the 37-slide brand guidelines deck (Arabic first, English labels) |
| `tools/` | `render.js` (HTML → PNG) and `svg2png.js` (SVG → PNG), both Playwright-based |

## Palette

| Role | Name | HEX | RGB | CMYK |
| --- | --- | --- | --- | --- |
| Primary | Trust Cyan | `#00CCFF` | 0 204 255 | 100 20 0 0 |
| Primary | Wisdom Purple | `#B130D0` | 177 48 208 | 15 77 0 18 |
| Primary | Joy Yellow | `#FFCC0D` | 255 204 13 | 0 20 95 0 |
| Secondary | Tender Pink | `#FF669B` | 255 102 155 | 0 60 39 0 |
| Secondary | Warm Orange | `#FF9922` | 255 153 34 | 0 40 87 0 |
| Secondary | Growth Lime | `#CCCC0D` | 204 204 13 | 0 0 94 20 |
| Neutral | Ink | `#231F20` | 35 31 32 | 0 11 9 86 |
| Neutral | Cream | `#FFF8EC` | 255 248 236 | 0 3 7 0 |

CMYK values are mathematical conversions. Confirm them with a printed proof before a large print run.

Text contrast: use white text only on purple (5.0:1). On cyan, yellow, lime, orange and pink, use Ink (all above 5.9:1).

## Typefaces (Google Fonts)

- **Baloo Bhaijaan 2**: headings, Arabic and Latin
- **Tajawal**: Arabic body text
- **Nunito**: Latin body text and numbers

## Re-rendering a mockup

```bash
npm i playwright            # or use a global install
cd happy-book/mockups/source
node ../../tools/render.js packaging.html ../renders/packaging.png 1920 1080
```

The mockups load the fonts from Google Fonts, so rendering needs an internet connection.
