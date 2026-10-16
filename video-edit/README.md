# Brand Research reel (Remotion)

A vertical 1080×1920 edit of the talking-head clip, styled after the lavender and purple reference.

- **Colour grade + audio polish**: `scripts/grade.sh` (raw.mp4 → `public/graded.mp4`).
- **Silence cuts**: adaptive `silencedetect` at −33.9 dB. Five gaps are removed, and the jump cuts are hidden with punch-in zooms.
- **B-roll**: "ANY BRAND", "BRAND RESEARCH", "THE BRIEF", the "MARKET" split screen and the "SAVE" outro (`src/scenes`).
- **SFX**: `public/sfx`, made of Kenney CC0 UI sounds plus a synthesized whoosh, swish, riser and boom.
- **Fonts**: Playfair Display Italic 800/900 (condensed) and Inter, bundled in `public/fonts` under the OFL.

```bash
npm i
npx remotion studio            # preview / tweak
npx remotion render BrandResearchReel out/BrandResearchReel.mp4
```
