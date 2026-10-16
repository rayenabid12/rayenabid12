import type React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { GumPiece, MelonSlice } from "../Props";
import { clamp, GROUND_Y, lerp, monsterBox, mouthY, World } from "../World";

const SIZE = 580;
const HOPS = [1320, 1060, 800, 540]; // x positions between hops

// He hops in, waves, unwraps a Boum Boum and catches the gum in his mouth.
export const HelloScene: React.FC = () => {
  const f = useCurrentFrame();

  // three hops, 14 frames each
  const hop = Math.min(Math.floor(f / 14), 2);
  const p = f < 42 ? (f - hop * 14) / 14 : 1;
  const x = f < 42 ? HOPS[hop] + (HOPS[hop + 1] - HOPS[hop]) * p : 540;
  const air = f < 42 ? Math.sin(Math.PI * p) * 140 : 0;
  const landing = f < 42 ? (p < 0.18 && hop > 0 ? 0.8 : 1 + 0.1 * Math.sin(Math.PI * p)) : lerp(f, [42, 45, 51], [0.76, 1.08, 1]);
  const gulp = lerp(f, [135, 138, 144], [1, 0.82, 1]);
  const chewing = f >= 135;
  const chew = chewing ? Math.sin((f - 135) / 2.4) : 0;

  // the pack, then the gum piece
  const packIn = interpolate(f, [76, 84], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const packFly = interpolate(f, [102, 118], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const gumIn = interpolate(f, [102, 108], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  // toss arc into the mouth (mouth sits ~180px above the feet line... at y 1335)
  const tossT = lerp(f, [110, 135], [0, 1]);
  const mouth = mouthY(GROUND_Y - 20, SIZE);
  const gumY = 1380 + (mouth - 1380) * tossT - Math.sin(Math.PI * tossT) * 560;
  const gumX = 540 + Math.sin(Math.PI * tossT) * 40;
  const holding = f >= 76 && f < 110;

  return (
    <>
      <World cameraX={0} cameraY={0} />
      <Monster
        lookX={f < 42 ? -0.6 : 0}
        lookY={holding ? 0.7 : f >= 110 && f < 135 ? -0.9 + tossT * 1.5 : 0}
        brow={holding && f < 92 ? "surprised" : "happy"}
        blink={lerp(f, [62, 64, 67], [0, 1, 0])}
        squint={chewing ? 1 : 0}
        mouthOpen={chewing ? 0 : f >= 118 ? 1 : holding ? 0.55 : 0.95}
        mouthWidth={chewing ? 0.6 : f >= 118 ? 0.7 : 1}
        cheeks={chewing ? 0.55 + chew * 0.45 : 0}
        rightArm={f >= 42 && f < 76 ? 125 + Math.sin((f - 42) / 2.6) * 22 : holding ? 38 : chewing ? 20 + chew * 6 : 6}
        leftArm={holding ? 38 : chewing ? 20 - chew * 6 : 6}
        squash={landing * gulp * (chewing ? 1 + chew * 0.03 : 1)}
        style={{ ...monsterBox(x, GROUND_Y - 20 - air, SIZE) }}
      />
      {f >= 76 && f < 118 ? (
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{
            position: "absolute",
            width: 440,
            left: 540 - 220 + packFly * 520,
            top: 1290 - packFly * 1500,
            scale: packIn * (1 - packFly * 0.4),
            rotate: `${f < 102 ? Math.sin(f * 1.3) * (f > 90 ? 9 : 2) : packFly * 600}deg`,
            filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.25))",
          }}
        />
      ) : null}
      {f >= 102 && f < 135 ? (
        <GumPiece
          style={{
            position: "absolute",
            width: 150,
            left: gumX - 75,
            top: gumY - 60,
            scale: gumIn * (1 - tossT * 0.35),
            rotate: `${tossT * 540}deg`,
          }}
        />
      ) : null}
      {/* yum: melon slices float up around his head */}
      {[
        { at: 142, x: 300, rot: -20 },
        { at: 149, x: 760, rot: 18 },
        { at: 156, x: 380, rot: 8 },
        { at: 162, x: 700, rot: -12 },
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
              top: 880 - t * 7,
              rotate: `${m.rot + Math.sin(t / 4) * 10}deg`,
              scale: lerp(t, [0, 5], [0, 1]),
              opacity: lerp(t, [14, 24], [1, 0]),
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 470,
          textAlign: "center",
          fontFamily: displayFont,
          fontSize: 150,
          ...candyText(colors.logoRed, colors.white, 13),
          scale: interpolate(f, [146, 154], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) }),
          rotate: `${-6 + Math.sin(f / 5) * 3}deg`,
        }}
      >
        Miam !
      </div>
    </>
  );
};
