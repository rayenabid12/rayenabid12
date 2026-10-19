# Rectify brand kit v2.0

A rebuild of the 2024 Rectify charte graphique, a kids' learning platform. The logo stays the same. Everything around it is new or tightened up.

## What's here

| Folder | Contents |
| --- | --- |
| `logo/` | Vector masters pulled from the original PDF: symbol, wordmark, vertical and horizontal lockups in orange, coral, white and ink (`.svg`). `paths.json` holds the raw path data. |
| `mockups/png/` | Rendered logo PNGs (transparent), system diagrams (clear space, app icons, misuse, pattern) and application mockups (business cards, stationery, app, website, social, merch, signage). |
| `mockups/*.js` | The scripts that generate everything in `logo/*.svg` and `mockups/png/`. |

To regenerate: `cd mockups && node logos.js && node mockups.js` (needs Playwright with Chromium).

## Core system

- **Colors:** Rectify Orange `#F57C00`, Coral `#FF6F61`, Ink `#231A15`, Cream `#FFF7EE`, Peach `#FFE2C7`, Deep Orange `#A84B00` for text. Subject colors are Sun `#FFC23D` (math), Leaf `#1FA67A` (language) and Sky `#2F80ED` (science).
- **Contrast rule:** white on Orange or Coral is 2.7:1, which fails WCAG, so it's for the logo only. Set text in Ink on the brights.
- **Type:** Fredoka (display), Nunito (text), Cairo (Arabic). All three are free on Google Fonts. The wordmark is a drawn logo: never retype it.
- **Tagline:** "Learn. Laugh. Look closer."

## Fixed from v1

- Typos ("Secondaire", "Rectifv" on the van, "don't on low contrast").
- Off-palette colors in the mockups (teal, purple icons).
- A paid font (Proxima) and a mix of other fonts, replaced by a free, consistent system.
- Leftover template text in the mockups (the "Water Bottle Mock-up" label).
- First-person copy ("I chose…").
- Added: brand platform, tone of voice, clear-space rules, accessible color pairings and subject colors.
