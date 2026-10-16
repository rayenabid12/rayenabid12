import type React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AnimatedMonster } from "../../rig/AnimatedMonster";
import { blinkAt, type Key, sortKeys } from "../../rig/pose";
import { GumPiece, MelonSlice } from "../../story/Props";
import { GROUND_Y, World } from "../../story/World";
import { candyText, colors, displayFont } from "../../theme";
import { alternate, hop, poseAt, rigBox, rigToScreen } from "../kit";

export const ANCHOR: [number, number] = [540, GROUND_Y - 20];
export const WIDTH = 560;
export const SCALE = WIDTH / 400;

// Hop in, wave, unwrap, toss, gulp, chew. Ends mid-chew; the bubble shot continues it.
export const SNACK_KEYS: Key[] = sortKeys([
  { f: 0, x: 614, y: 0, turn: -0.35, lookX: -0.5, armL: 30, armR: 30, mouthOpen: 0.85, browY: -4 },
  ...hop(14, 614, 407),
  ...hop(30, 407, 200),
  ...hop(46, 200, 0),
  { f: 60, turn: -0.35, lookX: -0.5, armL: 30, armR: 30, ease: "hold" },
  { f: 66, turn: 0, lookX: 0, armL: 8, armR: 8, browY: 0, ease: "out" },
  // hello
  { f: 68, sy: 1, y: 0, armR: 8, bend: 0, mouthOpen: 0.85 },
  { f: 73, sy: 0.92, y: 7, armR: -20, bend: -8, browY: 4, mouthOpen: 0.55 },
  { f: 78, sy: 1.06, y: -6, armR: 112, bend: 10, browY: -12, mouthOpen: 1, rot: -3, turn: 0.1, ease: "snap" },
  { f: 83, sy: 1, y: 0, ease: "out" },
  ...alternate(83, 107, 6, { armR: 112, curlR: -0.5, sy: 1 }, { armR: 84, curlR: 0.5, sy: 0.975 }),
  { f: 89, rot: 3 },
  { f: 101, rot: -3 },
  { f: 112, armR: 100, curlR: 0 },
  ...blinkAt(96),
  // a pack appears in his hands: surprise, then a big grin
  { f: 120, armL: -46, armR: -46, rot: 0, turn: 0, bend: 0, lookY: 0.75, browY: -18, eyeScale: 1.15, mouthOpen: 0.5, mouthWidth: 0.5 },
  { f: 126, mouthOpen: 1, mouthWidth: 1, eyeScale: 1.05, browY: -8, ease: "out" },
  ...alternate(128, 138, 2, { armL: -46, armR: -40, rot: 1.5 }, { armL: -40, armR: -46, rot: -1.5 }),
  // rip it open
  { f: 141, armL: 60, armR: 60, rot: 0, sy: 1.05, browY: -14, ease: "snap" },
  // wind up and toss
  { f: 146, armL: -15, armR: -15, sy: 0.9, y: 6, lookY: -0.2, eyeScale: 1.05 },
  { f: 150, armL: 70, armR: 70, sy: 1.05, y: -4, lookY: -0.9, bend: -6, ease: "snap" },
  { f: 156, y: 0, sy: 1, lookY: -0.9, ease: "out" },
  { f: 158, mouthOpen: 1, mouthWidth: 0.75 },
  { f: 164, lookY: 0.1, bend: 0 },
  // gulp!
  { f: 166, mouthOpen: 0, mouthWidth: 0.55, sy: 0.82, squint: 1, armL: 20, armR: 20, eyeScale: 1, browY: -6, lookY: 0, ease: "snap" },
  { f: 171, sy: 1.03, ease: "out" },
  { f: 175, sy: 1 },
  ...alternate(172, 196, 6, { mouthOpen: 0.08, cheeks: 1, sy: 1 }, { mouthOpen: 0.3, cheeks: 0.55, sy: 0.97 }),
  ...alternate(172, 196, 12, { turn: 0.12, rot: 2 }, { turn: -0.12, rot: -2 }),
  ...alternate(172, 196, 8, { armL: -45, armR: -30 }, { armL: -30, armR: -45 }),
]);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SnackScene: React.FC = () => {
  const f = useCurrentFrame();
  const pose = poseAt(SNACK_KEYS, f);
  const belly = rigToScreen(pose, ANCHOR, SCALE, 200, 345);

  // pack: pops into his hands, shakes, gets ripped away
  const packIn = interpolate(f, [120, 127], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const packFly = interpolate(f, [141, 156], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  // gum: pops out, then an arc from the hands into the mouth
  const gumIn = interpolate(f, [141, 147], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const tossT = interpolate(f, [150, 166], [0, 1], clamp);
  const start = rigToScreen(poseAt(SNACK_KEYS, 150), ANCHOR, SCALE, 200, 345);
  const mouth = rigToScreen(poseAt(SNACK_KEYS, 166), ANCHOR, SCALE, 200, 300);
  const gumX = f < 150 ? belly[0] : start[0] + (mouth[0] - start[0]) * tossT + Math.sin(Math.PI * tossT) * 40;
  const gumY = f < 150 ? belly[1] - 30 : start[1] + (mouth[1] - start[1]) * tossT - Math.sin(Math.PI * tossT) * 560;

  return (
    <>
      <World cameraY={interpolate(f, [0, 26], [700, 0], { ...clamp, easing: Easing.inOut(Easing.cubic) })} />
      <AnimatedMonster keys={SNACK_KEYS} style={rigBox(ANCHOR, WIDTH)} />
      {f >= 120 && f < 156 ? (
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{
            position: "absolute",
            width: 420,
            left: belly[0] - 210 + packFly * 560,
            top: belly[1] - 100 - packFly * 1500,
            scale: packIn * (1 - packFly * 0.4),
            rotate: `${pose.rot * 2 + packFly * 620}deg`,
            filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.25))",
          }}
        />
      ) : null}
      {f >= 141 && f < 166 ? (
        <GumPiece
          style={{
            position: "absolute",
            width: 150,
            left: gumX - 75,
            top: gumY - 60,
            scale: gumIn * (1 - tossT * 0.4),
            rotate: `${tossT * 540}deg`,
          }}
        />
      ) : null}
      {[
        { at: 176, x: 270, rot: -20 },
        { at: 182, x: 800, rot: 18 },
        { at: 186, x: 350, rot: 8 },
      ].map((m, i) => {
        const t = f - m.at;
        if (t < 0) return null;
        return (
          <MelonSlice
            key={i}
            style={{
              position: "absolute",
              width: 110,
              left: m.x - 55,
              top: 860 - t * 7,
              rotate: `${m.rot + Math.sin(t / 4) * 10}deg`,
              scale: interpolate(t, [0, 5], [0, 1], clamp),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 460,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 150,
          ...candyText(colors.logoRed, colors.white, 13),
          scale: interpolate(f, [174, 182], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) }),
          rotate: `${-6 + Math.sin(f / 5) * 3}deg`,
        }}
      >
        Miam !
      </div>
    </>
  );
};
