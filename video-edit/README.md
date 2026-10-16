# Brand Research reel (Remotion)

A vertical 1080×1920 edit of the talking-head clip, styled after the lavender and purple reference.

- **Colour grade**: `scripts/purple_grade.py` segments the speaker with MediaPipe's `selfie_multiclass_256x256` model and runs it on LiteRT. It re-lights the room dark purple with soft light falloff, keeps skin natural, and adds a violet rim light.
  ```bash
  pip install ai-edge-litert opencv-python numpy
  curl -LO https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
  python3 scripts/purple_grade.py selfie_multiclass_256x256.tflite public/raw.mp4 /tmp/v.mp4
  ffmpeg -i /tmp/v.mp4 -i public/raw.mp4 -map 0:v -map 1:a -c:v copy \
    -af "highpass=f=80,afftdn=nf=-25,acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=7" \
    -c:a aac -b:a 192k public/graded.mp4
  ```
- **Layout**: the speaker floats in a rounded card (`src/components/FaceCard.tsx`, `CARD_TRACK` in `src/Edit.tsx`). The card moves between beats with motion blur, and the whole stage does a small punch-in at each scene change.
- **Kinetic type**: words build up one at a time with blur-in and blur-out (`src/components/Kinetic.tsx`, `src/scenes/Beats.tsx`).
- **Silence cuts**: adaptive `silencedetect` at −33.9 dB. Five gaps are removed, and the jump cuts are hidden with punch-in zooms.
- **SFX**: `public/sfx`, made of Kenney CC0 UI sounds plus a synthesized whoosh, swish, riser and boom.
- **Fonts**: Playfair Display Italic 800/900 (condensed) and Inter, bundled in `public/fonts` under the OFL.

```bash
npm i
npx remotion studio            # preview / tweak
npx remotion render BrandResearchReel out/BrandResearchReel.mp4
```
