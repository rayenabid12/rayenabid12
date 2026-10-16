import type React from "react";
import { Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { GumPiece, MelonSlice } from "../Props";
import { clamp, ease, GROUND_Y, lastImpact, lerp, monsterBox, mouthY, World } from "../World";

const SIZE = 580;
const HOPS = [1360, 1080, 800, 540]; // x before each hop
const LANDS = [14, 29, 44, 135]; // hop landings + the gulp

// Feet position over time: three hops with a crouch before each takeoff.
const feet = (f: number) => {
  if (f >= 44) return { x: 540, y: GROUND_Y - 20 };
  const k = Math.min(Math.floor(f / 15), 2);
  const t = interpolate(f, [k * 15 + 3, k * 15 + 14], [0, 1], clamp);
  const x = HOPS[k] + (HOPS[k + 1] - HOPS[k]) * Easing.inOut(Easing.sin)(t);
  return { x, y: GROUND_Y - 20 - Math.sin(Math.PI * t) * 150 };
};

// He hops in, waves, unwraps a Boum Boum and catches the gum in his mouth.
export const HelloScene: React.FC = () => {
  const f = useCurrentFrame();
  const pos = feet(f);
  const prev = feet(f - 1);
  const vx = pos.x - prev.x;
  const vy = pos.y - prev.y;

  const hopPhase = f < 44 ? f % 15 : 99;
  const crouching = hopPhase < 3;
  const inAir = f < 44 && !crouching;
  const hopSquash = crouching ? 0.84 : inAir ? 1 + Math.abs(vy) * 0.008 : 1;

  const waving = f >= 48 && f < 74;
  const holding = f >= 76 && f < 106;
  const tossT = lerp(f, [110, 135], [0, 1]);
  const chewing = f >= 136;
  const chew = chewing ? Math.sin((f - 136) / 2.3) : 0;

  const packIn = interpolate(f, [76, 85], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
  const packFly = interpolate(f, [102, 118], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const gumIn = interpolate(f, [102, 108], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.5)) });
  const mouth = mouthY(GROUND_Y - 20, SIZE);
  const gumY = 1400 + (mouth - 1400) * tossT - Math.sin(Math.PI * tossT) * 600;
  const gumX = 540 + Math.sin(Math.PI * tossT) * 40;

  // arms: wave, hold the pack in front, fling apart on the rip, wind up and toss
  const waveArm = 128 + Math.sin((f - 48) / 2.6) * 24;
  const rightArm = waving
    ? waveArm
    : holding
      ? -46 + Math.sin(f * 1.3) * (f > 90 ? 6 : 0)
      : f >= 102 && f < 110
        ? ease(f, [102, 106, 110], [-46, 60, -20])
        : f >= 110 && f < 136
          ? ease(f, [110, 114, 124], [-20, 70, 20])
          : chewing
            ? -30 + chew * 6
            : inAir
              ? 40
              : ease(f, [44, 48, 74, 76], [10, 40, 40, -46]);
  const leftArm = holding
    ? -46
    : f >= 102 && f < 136
      ? ease(f, [102, 106, 110, 114, 124], [-46, 60, -20, 70, 20])
      : chewing
        ? -30 - chew * 6
        : inAir
          ? 40
          : 8;

  return (
    <>
      <World cameraX={0} cameraY={0} />
      <Monster
        lookX={f < 44 ? -0.7 : f >= 48 && f < 74 ? Math.sin(f / 9) * 0.15 : 0}
        lookY={holding ? 0.8 : f >= 110 && f < 136 ? -0.9 + tossT * 1.7 : 0}
        brow={holding && f < 88 ? "surprised" : "happy"}
        squint={ease(f, [134, 138], [0, 1])}
        mouthOpen={
          chewing
            ? 0.06 + Math.max(0, chew) * 0.22
            : f >= 110
              ? ease(f, [114, 128], [0.5, 1])
              : holding
                ? ease(f, [76, 82, 88, 92], [0.95, 0.45, 0.45, 0.85])
                : 0.95
        }
        mouthWidth={chewing ? 0.55 : f >= 114 ? ease(f, [114, 128], [1, 0.72]) : 1}
        cheeks={chewing ? 0.6 + chew * 0.4 : 0}
        rightArm={rightArm}
        leftArm={leftArm}
        armCurl={waving ? Math.sin((f - 48) / 2.6 - 1.2) * 0.9 : 0}
        tilt={waving ? Math.sin(f / 7) * 6 : chewing ? chew * 4 : f >= 110 && f < 136 ? -6 * Math.sin(Math.PI * tossT) : 0}
        lean={inAir ? -9 : f >= 106 && f < 110 ? -3 : 0}
        squash={hopSquash * ease(f, [134, 136, 141], [1, 0.82, 1]) * (chewing ? 1 + chew * 0.025 : 1)}
        impactAt={lastImpact(f, LANDS)}
        vy={vy}
        vx={vx}
        style={{ ...monsterBox(pos.x, pos.y, SIZE) }}
      />
      {f >= 76 && f < 118 ? (
        <Img
          src={staticFile("pack-pasteque-single.webp")}
          style={{
            position: "absolute",
            width: 440,
            left: 540 - 220 + packFly * 520,
            top: 1300 - packFly * 1500,
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
      {[
        { at: 142, x: 280, rot: -20 },
        { at: 149, x: 790, rot: 18 },
        { at: 156, x: 360, rot: 8 },
        { at: 162, x: 720, rot: -12 },
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
