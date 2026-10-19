---
name: clawd-animation
description: Make short hand-painted 2D cartoon videos (MP4) of Clawd, or any character you design, with p5.js and p5.brush, using John Heibel's ClaudeAnimationBase kit. Use whenever someone asks for an animation, cartoon, animated short, music-video scene, character animation or "video of Clawd doing X", or wants new Clawd emotions, costumes, props or characters animated in this painted style, even if they don't name the skill.
---

# Clawd animation

This skill wraps [JohnHeibel/ClaudeAnimationBase](https://github.com/JohnHeibel/ClaudeAnimationBase) (MIT). The full kit is in `kit/` next to this file: a character (Clawd), a painting and timing engine, a shot timeline and a headless renderer that writes contact sheets, frame strips and MP4s.

## Steps

1. **Set up a working copy.** Never edit `kit/` in place. Copy it to a new project folder (the person's choice, or `./animations/<short-name>/` by default), then install dependencies:
   ```bash
   cp -r <this skill dir>/kit <workdir> && cd <workdir> && npm install
   ```
   Requirements: Node.js, ffmpeg and Chrome/Chromium. `render.mjs` finds Chrome in standard locations and Playwright's Chromium; otherwise pass `--chrome=<path>` or set `CHROME_PATH`.
2. **Read `<workdir>/ANIMATION_GUIDE.md` in full before drawing anything.** It holds the rules (handmade, alive, one piece, no text, transitions everywhere, an event in every shot, viewer-paced timing), the workflow and the whole API. Look at `docs/emotions.jpg` and `docs/views.jpg` too.
3. **Storyboard first.** Write `STORYBOARD.md` in the format the guide gives. If someone is around to react, show it to them before you build.
4. **Build shot by shot** in a new `src/scenes/<name>.js`, set `duration`/`bpm` in `src/config.js`, and swap the `demo.js` script tag in `studio.html` for your scene.
5. **Review loop.** Render contact sheets, strips and crops with `node render.mjs --sheet=… / --strip=… / --crop=…`, open the images and actually look at them, fix what's wrong, and repeat. The guide gives the checklist.
6. **Render** with `node render.mjs --clip --out=out/video.mp4`, then give the person the MP4 path.

## Rendering notes

- Claude Code cloud containers: Chromium is preinstalled but not where `render.mjs` looks. Use `CHROME_PATH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux/chrome | tail -1)`.
- No GPU (most cloud containers): add `--soft-gl`. It is slow: the demo's watercolour frames took about 45 s each in testing, so a 10 s video (240 frames) takes hours. Lean on sparse contact sheets for review, swap watercolour `fill`s for flat washes on long pieces (say so), and use `--frames --workers=N` (resumable) then `--encode` for the final render.
- Headless Linux with an NVIDIA GPU: try `--gpu-angle=gl-egl` or `vulkan`; `node gpu_probe.mjs <chrome path>` shows which renderer each set of flags gets.
- On Linux, `render.mjs` already starts Chrome with `--no-sandbox`.
- Smoke test of the kit itself: `node render.mjs --sheet=0,1,2,3,4,5 --out=out/sheet.jpg` renders the bundled 11-second demo.

The person decides **what** the video is about; the guide decides **how** it's made. When they explicitly ask for something the guide forbids (a caption, a 3D spin), do what they ask.
