# Les Aventures Boum Boum: series bible

The Boum Boum monster is the brand's presenter: every episode is a short adventure
where he gets into (sweet) trouble, the bubble goes BOUM, and he ends up sharing the
product with the viewer.

## Format (every episode, ~20 s, 1080x1920, 30 fps, 120 BPM)
1. **Title card**: `brand/SeriesTitle` ("Les Aventures Boum Boum · Épisode N").
2. **The want**: he wants something (a big bubble, candy, to win...).
3. **The idea!**: finger up + sparkle "ting", determined smirk.
4. **It gets out of hand**, then **BOUM !**: the bubble pop is always the climax (yellow starburst).
5. **Tasty reward**: filling splash + flavor title ("Fourré coulis goût PASTÈQUE !").
6. **"À toi !"**: camera dollies in, he offers a pack to the viewer; it fills the frame.
7. **Brand finale**: `brand/BrandFinale` (packs, logo, wave, last bubble, POP, wink, "Fais BOUM !").
   Episodes only add decorations (`decorBack`, `decorFront`) and a seasonal `line`.

## The character
- Rig: `src/rig` (pose-to-pose keys + spring physics). Model sheet: `ModelSheet` still.
- Personality: joyful, greedy for gum, curious, a little too ambitious with bubbles. Never mean.
- Always glossy pink, no outline; eyes ~40% of height; big toothy grin is his default face.
- Signature moves: hop with anticipation, rubber-arm wave, "idea!" finger, surprise take, scramble run, wink + point.
- Use `alive` on `AnimatedMonster` for new episodes: moving holds, natural blinks, horizontal smear stretch. Add `DustPuff` on landings.

## Mélo, the watermelon friend (Pastèque flavour)
- Same rig, `skin="melo"` on `BoumMonster` / `AnimatedMonster`. Model sheet: `MeloSheet` still; duo size reference: `DuoLineup`.
- Roles: the pink monster stays the brand host (all flavours); Mélo is his friend and the face of the green Pastèque pack.
- Design: rounder and wider, rind stripes, seed freckles on the lower body, curly stem + leaf (swings with the ear physics), pink cheeks, teal eyes.
- Personality: cool, calm, a bit of a show-off with his perfect bubbles. Contrast with the pink monster's big emotions.
- Default face `MELO_COOL` (`src/rig/meloKeys.ts`): half-closed lids + half-smile. Use `coolBlink` (returns to the half-lids); `alive` auto-blinks don't fire on him.
- Acting: fewer, shorter, more precise moves; he always settles back to cool. He only loses it on a big surprise, then pretends nothing happened.
- Reactions (`Melo-*` compositions, `MeloReactionReel`, `MeloReactionGrid`): Idle (hand on hip, nods to a beat), Yo (two-finger flick), Yesss (fist pump, then composes himself), Miam (calm chew + chef's kiss), Surprise (take, then checks no one saw), Clin d'œil (finger guns), Trop facile (signature perfect bubble, shrug, pop).

## World
- Candy world (`story/World`): gum trees, watermelon-striped hills, bubble clouds; `night` mode for seasonal episodes.
- Candy city (`episodes/ep2/CitySet`): BONBONS candy shop, apartment block, haunted townhouse n°13, parallax skyline, sidewalk and street lamps.
- Props in the same glossy style (`story/Props`, `episodes/ep2/Halloween`).
- Colors: see the model sheet palette; logo red `#E3123B`, brand green `#2E9E3E`.

## Sound
- Happy theme in C major (ukulele + glockenspiel) = the brand's musical signature; it always returns after the BOUM.
- Cartoon SFX: boing/bloop hops, "ting" idea, chomp/gulp, stretch while blowing, POP + boum, sparkle on "À toi !".

## Episodes
| # | Title | Status |
|---|---|---|
| 1 | Le plus gros BOUM | `BoumFinal` |
| 2 | Boum-Boo ! (Halloween) | `Ep2BoumBoo` |
| 3 | Le Duel de Bulles (introduces Mélo; Fraise vs Pastèque, then together) | `Ep3Duel` |
| 4 | Joyeux anniversaire, Mélo ! (surprise party at the pink monster's home) | `Ep4Birthday` |
| 5 | La Naissance de Boum Boum (origin story, 45 s) | `Ep5Origin` |
| – | Le dernier Boum Boum | idea |
| 5 | La Récré | idea |
| 6 | Mission Pastèque | idea |
| ★ | Noël Boum Boum | idea |

## Locations
- The candy factory where he was born (Ep. 5, `ep5/FactorySet.tsx`): bubble machine, filling tank, conveyor, quality-control scanner + reject bin, tasting machine (« Goûtomètre »), dripper line, printing platform. Canon: in a factory of identical, empty gums, a drop of filling fell into a bubble during a storm and he was born with a glowing liquid heart. Rejected as a « défaut », he tried to hide it, then his heart won the taste test, every Boum Boum got a liquid heart, and his face was printed on the first pack. Message: « Ce qui te rend différent, c'est ce qui te rend unique. »
- City street at night (Ep. 2, `ep2/CitySet.tsx`), sunny park (Ep. 3, `ep3/ParkSet.tsx`), the pink monster's home (Ep. 4, `ep4/HomeSet.tsx`: wall calendar, photo of the two friends, party table, front door).
- Shared staging toolkit for two-character episodes: `src/episodes/shared/stage.tsx`. Mélo on the end card: `brand/FinaleMelo.tsx`.

## Notes from Ep. 3
- Long gaps between keys make channels drift (e.g. eyes slowly closing). Wrap episode keys in `tighten()` (`src/final/kit.ts`); give deliberate slow moves an explicit `inOut` ease.
- Split screen = the same world rendered through two cameras (`View` in `DuelScene.tsx`).
- Pink monster labelled « BOUM » on the scoreboard; Mélo's gum and bubbles are green.

## Staging & pacing rules (learned on Ep. 2)
- One idea per shot. Give every key moment a **hold** (≥ 1 s) so kids can read it before the next beat.
- Prefer **30 s** when the story has a second character; 20 s only for single-character stories.
- Use the virtual camera (world coordinates + keyed `[frame, x, y, zoom]`): wide to establish,
  medium for action, push-ins for suspense, close-up for "À toi !".
- Never stack characters and set pieces in one corner: in two-shots put the monster on the left
  third, the other character on the right third, and let the action (bubble) happen in the space between.
- Keep text in the top third; characters in the middle/bottom.
