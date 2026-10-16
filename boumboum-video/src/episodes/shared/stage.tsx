import type React from "react";
import { Easing, interpolate } from "remotion";
import { rigToScreen } from "../../final/kit";
import { bendWeight } from "../../rig/BoumMonster";
import { animatedPose, type Key, type Pose } from "../../rig/pose";
import { displayFont } from "../../theme";

// Staging toolkit shared by the two-character episodes (Ep. 3+): world-space
// rig helpers, gum bubbles, pops, speech balloons, keyed cameras and text pops.

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
export const io = Easing.inOut(Easing.cubic);
export const lerp = (f: number, i: number[], o: number[], easing = io) =>
  interpolate(f, i, o, { ...clamp, easing });

export type Who = "pink" | "melo";

// World-space helpers for the pink monster and Mélo, each with its own feet anchor.
export const makeDuo = ({
  pinkAt,
  meloAt,
  width,
  pinkKeys,
  meloKeys,
}: {
  pinkAt: [number, number];
  meloAt: [number, number];
  width: number;
  pinkKeys: Key[];
  meloKeys: Key[];
}) => {
  const SCALE = width / 400;
  // Poses at fixed frames (prop anchors) are simulated once and cached.
  const poseCache = new Map<string, Pose>();
  const poseOf = (w: "pink" | "melo", frame: number) => {
    const key = `${w}${frame}`;
    let p = poseCache.get(key);
    if (!p) {
      p = animatedPose(w === "pink" ? pinkKeys : meloKeys, frame, true);
      poseCache.set(key, p);
    }
    return p;
  };
  const anchorOf = (w: Who) => (w === "pink" ? pinkAt : meloAt);
  const toWorld = (w: Who, p: Pose, rx: number, ry: number) =>
    rigToScreen(p, anchorOf(w), SCALE, rx, ry);
  const mouthOf = (w: Who, p: Pose) =>
    toWorld(
      w,
      p,
      200 + p.turn * 105 + p.bend * bendWeight(230),
      w === "pink" ? 296 : 306,
    );
  // A hand position (rig -> world). side: "L" | "R" as drawn on screen.
  const handOf = (w: Who, p: Pose, side: "L" | "R") => {
    const melo = w === "melo";
    const a = Math.abs(p.turn);
    const armY = melo ? 262 : 252;
    const base = side === "L" ? (melo ? 30 : 74) : melo ? 370 : 326;
    const sx =
      200 +
      (base - 200) * (1 - a * (melo ? 0.12 : 0.5)) +
      p.turn * 30 +
      p.bend * bendWeight(armY);
    const ang = ((side === "L" ? 118 + p.armL : 62 - p.armR) * Math.PI) / 180;
    return toWorld(w, p, sx + Math.cos(ang) * 134, armY + Math.sin(ang) * 134);
  };

  return { SCALE, poseOf, toWorld, mouthOf, handOf };
};

export const PINK_GUM = ["#FFE3EF", "#F9A6CB", "#EE79B1"];
export const MELO_GUM = ["#EFFFE0", "#A8E68A", "#6CC24A"];

// Big bubbles turn see-through so the face behind stays readable.
export const Bubble: React.FC<{
  x: number;
  y: number;
  r: number;
  tone: string[];
  wob?: number;
  id: string;
  opacity?: number;
}> = ({
  x,
  y,
  r,
  tone,
  wob = 0,
  id,
  opacity = 0.93 - interpolate(r, [80, 200], [0, 0.33], clamp),
}) => (
  <svg
    style={{
      position: "absolute",
      left: x - r * 1.2,
      top: y - r * 1.2,
      width: r * 2.4,
      height: r * 2.4,
      overflow: "visible",
    }}
    viewBox="-120 -120 240 240"
  >
    <defs>
      <radialGradient id={id} cx="38%" cy="32%" r="75%">
        <stop offset="0%" stopColor={tone[0]} />
        <stop offset="60%" stopColor={tone[1]} />
        <stop offset="100%" stopColor={tone[2]} />
      </radialGradient>
    </defs>
    <g transform={`scale(${1 + wob} ${1 - wob})`} opacity={opacity}>
      <circle
        r={100}
        fill={`url(#${id})`}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={3}
      />
      <ellipse
        cx={-38}
        cy={-42}
        rx={24}
        ry={12}
        fill="white"
        opacity={0.8}
        transform="rotate(-35 -38 -42)"
      />
      <circle cx={-60} cy={-6} r={6} fill="white" opacity={0.6} />
    </g>
  </svg>
);

export const PopBurst: React.FC<{
  x: number;
  y: number;
  at: number;
  r: number;
  tones: string[];
  f: number;
  n?: number;
}> = ({ x, y, at, r, tones, f, n = 12 }) => {
  const t = (f - at) / 14;
  if (t < 0 || t > 1) return null;
  const e = Easing.out(Easing.cubic)(t);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - (r + e * 120),
          top: y - (r + e * 120),
          width: (r + e * 120) * 2,
          height: (r + e * 120) * 2,
          borderRadius: "50%",
          border: `${18 * (1 - e)}px solid white`,
          opacity: 1 - t,
        }}
      />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.2;
        const d = r + e * (180 + (i % 3) * 60);
        const sz = 34 + ((i * 17) % 26);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - sz / 2,
              top: y + Math.sin(a) * d + e * e * 80 - sz / 2,
              width: sz,
              height: sz * 0.72,
              borderRadius: "48% 52% 40% 60% / 55% 45% 55% 45%",
              background: tones[i % tones.length],
              opacity: 1 - t * t,
            }}
          />
        );
      })}
    </>
  );
};

// Speech balloon in world coordinates (tail points down-left or down-right).
export const Say: React.FC<{
  x: number;
  y: number;
  from: number;
  to: number;
  text: string;
  color: string;
  f: number;
  tail?: "left" | "right";
  size?: number;
}> = ({ x, y, from, to, text, color, f, tail = "left", size = 64 }) => {
  const s = interpolate(f, [from, from + 6, to, to + 5], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.out(Easing.back(2.2)),
  });
  if (s <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -100%",
        scale: s,
        transformOrigin: tail === "left" ? "10% 100%" : "90% 100%",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 40,
          padding: "16px 34px",
          boxShadow: "0 8px 0 rgba(0,0,0,0.12)",
          fontFamily: displayFont,
          fontSize: size,
          color,
          whiteSpace: "nowrap",
          position: "relative",
        }}
      >
        {text}
        <div
          style={{
            position: "absolute",
            bottom: -26,
            [tail === "left" ? "left" : "right"]: 40,
            width: 0,
            height: 0,
            borderLeft: "18px solid transparent",
            borderRight: "18px solid transparent",
            borderTop: "30px solid white",
          }}
        />
      </div>
    </div>
  );
};

export type Cam = [number, number, number, number]; // frame, cx, cy, zoom

export const camAt = (keys: Cam[], f: number) => {
  if (keys.length === 1)
    return { cx: keys[0][1], cy: keys[0][2], z: keys[0][3] };
  const fs = keys.map((c) => c[0]);
  const at = (i: number) =>
    interpolate(
      f,
      fs,
      keys.map((c) => c[i]),
      { ...clamp, easing: io },
    );
  return { cx: at(1), cy: at(2), z: at(3) };
};

export const Pop: React.FC<{
  f: number;
  at: number;
  out: number;
  top: number;
  children: React.ReactNode;
}> = ({ f, at, out, top, children }) => {
  const s = interpolate(f, [at, at + 8, out, out + 6], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.out(Easing.back(2.2)),
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        textAlign: "center",
        scale: s,
      }}
    >
      {children}
    </div>
  );
};
