# Family character sheets

Painted model sheets for the six family members in the barbecue illustration (girl, boy, mom, dad, grandma, grandpa),
made with the clawd-animation kit's p5.brush engine. The finished sheets are in [`sheets/`](sheets/):

| sheet | what's on it |
|---|---|
| `lineup.jpg` | the whole family to scale, in their seating order at the table |
| `<who>_turn.jpg` | turnaround: front, 3/4, side, 3/4 back, back, with proportion guides and the colour palette |
| `<who>_faces_a.jpg`, `<who>_faces_b.jpg` | 24 expressions (front and 3/4 busts): neutral, happy, laugh, excited, love, proud, playful, smug, shy, surprised, scared, nervous, sad, cry, angry, furious, disgusted, confused, thinking, idea, sleepy, bored, determined, yummy |
| `<who>_poses_a.jpg`, `<who>_poses_b.jpg` | 16 body poses: stand, walk, run, jump, sit, wave, point, cheer, arms crossed, hands on hips, thinking, shrug, sad, scared, sneak, plus one signature pose from the illustration |

`<who>` is one of `girl`, `boy`, `mom`, `dad`, `grandma`, `grandpa`.

The characters live in [`src/family.js`](src/family.js) (`person(x, y, u, who, options)`, with the cast, views,
expressions, poses and props), so they can be animated with the rest of the kit. The sheet layouts are in
[`src/scenes/family_sheets.js`](src/scenes/family_sheets.js).

Lower bodies, shoes and backs aren't visible in the illustration, so those were designed to match: the girl's pinafore
skirt and red shoes, the boy's shorts, the adults' trousers, grandma's skirt.

Re-render everything (about 30 minutes without a GPU; `N` = parallel renders):

```bash
npm install
N=4 ./render_sheets.sh            # or: ./render_sheets.sh mom_turn lineup
```
