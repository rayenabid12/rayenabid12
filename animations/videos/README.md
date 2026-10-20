# The family, animated

| file | what's in it |
|---|---|
| `family_reel.mp4` | the whole family (3 min 50 s): intro, then a chapter per character, outro |
| `<who>_reel.mp4` | one character (37 s): 360° turnaround, walk cycle, run cycle, jump & wave, 14 acted emotions |

The painted animation clips behind them are in [`../family-character-sheets/clips/`](../family-character-sheets/clips/)
(`<who>_turn`, `_walk`, `_run`, `_jump`, `_emotions`, without captions), drawn with the p5.brush kit in
[`../family-character-sheets/src/scenes/family_anim.js`](../family-character-sheets/src/scenes/family_anim.js).
The reels are cut together in Remotion in [`../family-reel/`](../family-reel/).

Re-render:

```bash
cd family-character-sheets && npm install && ./render_clips.sh        # painted clips (~45 min without a GPU)
cd ../family-reel && npm install && npm run sync-clips && ./render_all.sh   # reels (~25 min)
npx remotion studio                                                   # or preview and edit in Remotion Studio
```
