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
- Signature moves: hop with anticipation, rubber-arm wave, "idea!" finger, surprise take, wink + point.

## World
- Candy world (`story/World`): gum trees, watermelon-striped hills, bubble clouds; `night` mode for seasonal episodes.
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
| 3 | Le Duel de Bulles (introduces the Fraise monster) | idea |
| 4 | Le dernier Boum Boum | idea |
| 5 | La Récré | idea |
| 6 | Mission Pastèque | idea |
| ★ | Noël Boum Boum | idea |

## Staging & pacing rules (learned on Ep. 2)
- One idea per shot. Give every key moment a **hold** (≥ 1 s) so kids can read it before the next beat.
- Prefer **30 s** when the story has a second character; 20 s only for single-character stories.
- Use the virtual camera (world coordinates + keyed `[frame, x, y, zoom]`): wide to establish,
  medium for action, push-ins for suspense, close-up for "À toi !".
- Never stack characters and set pieces in one corner: in two-shots put the monster on the left
  third, the other character on the right third, and let the action (bubble) happen in the space between.
- Keep text in the top third; characters in the middle/bottom.
