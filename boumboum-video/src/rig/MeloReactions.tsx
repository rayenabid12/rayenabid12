import type React from "react";
import { AbsoluteFill, Easing, interpolate, Loop, Sequence, useCurrentFrame } from "remotion";
import { bodyFont, candyText, displayFont } from "../theme";
import { BoumMonster, bendWeight } from "./BoumMonster";
import { BUBBLE_KEYS, BUBBLE_POP, MELO_REACTIONS } from "./meloKeys";
import { animatedPose, type Key } from "./pose";

const GREEN = "#2E9E3E";
const INK = "#1D4A26";

// Pastèque gum bubble (green, like his pack), in rig space, anchored on the mouth.
const MeloBubble: React.FC<{ frame: number; mx: number }> = ({ frame, mx }) => {
  const fs = BUBBLE_KEYS.map(([f]) => f);
  const rs = BUBBLE_KEYS.map(([, r]) => r);
  if (frame < fs[0]) return null;
  if (frame >= BUBBLE_POP) {
    // fast burst: a flash ring and droplets flung outward, gone in 7 frames
    const t = (frame - BUBBLE_POP) / 7;
    if (t > 1) return null;
    const e = Easing.out(Easing.cubic)(t);
    const R = rs[rs.length - 1];
    const cy = 304 + R * 0.42;
    return (
      <g opacity={1 - t * t}>
        <circle cx={mx} cy={cy} r={R + e * 50} fill="none" stroke="#FFFFFF" strokeWidth={16 * (1 - e)} />
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2 + 0.3;
          if (Math.sin(a) < -0.55) return null; // keep the flecks off his eyes
          const d = R + e * 150;
          return <circle key={i} cx={mx + Math.cos(a) * d} cy={cy + Math.sin(a) * d} r={11 * (1 - e * 0.5)} fill="#7FD15A" />;
        })}
      </g>
    );
  }
  const r0 = interpolate(frame, fs, rs, { extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const wob = r0 > 20 ? Math.sin(frame / 3.2) * 0.025 : 0;
  const r = r0;
  const cx = mx;
  const cy = 304 + r * 0.42;
  return (
    <g transform={`translate(${cx} ${cy}) scale(${1 + wob} ${1 - wob})`}>
      <circle r={r} fill="#A8E68A" opacity={0.88} />
      <circle r={r} fill="none" stroke="#5DB33E" strokeWidth={4} opacity={0.6} />
      <ellipse cx={-r * 0.38} cy={-r * 0.4} rx={r * 0.24} ry={r * 0.13} fill="white" opacity={0.75} transform={`rotate(-35 ${-r * 0.38} ${-r * 0.4})`} />
      <circle cx={-r * 0.6} cy={-r * 0.08} r={r * 0.06} fill="white" opacity={0.55} />
    </g>
  );
};

const Melo: React.FC<{ keys: Key[]; bubble?: boolean; style: React.CSSProperties }> = ({ keys, bubble, style }) => {
  const frame = useCurrentFrame();
  const pose = animatedPose(keys, frame, true);
  const over = bubble ? <MeloBubble frame={frame} mx={200 + pose.bend * bendWeight(230)} /> : undefined;
  return <BoumMonster pose={pose} skin="melo" over={over} style={style} />;
};

const Title: React.FC<{ index: number; name: string; note: string; size?: number }> = ({ index, name, note, size = 1 }) => {
  const f = useCurrentFrame();
  const inn = interpolate(f, [0, 10], [0, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ opacity: inn, translate: `${(1 - inn) * -40}px 0px` }}>
      <div style={{ fontFamily: displayFont, fontSize: 52 * size, color: "#9ED68A" }}>{`Mélo · 0${index + 1} / 0${MELO_REACTIONS.length}`}</div>
      <div style={{ fontFamily: displayFont, fontSize: 110 * size, lineHeight: 1, ...candyText(GREEN, "#FFFFFF", 9) }}>{name}</div>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 38 * size, color: INK, marginTop: 14, lineHeight: 1.25 }}>{note}</div>
    </div>
  );
};

const bg = "radial-gradient(circle at 55% 45%, #FFFFFF 0%, #EAF9E0 55%, #CFEFBE 100%)";

// One reaction on its own square stage (for social / review).
export const MeloReaction: React.FC<{ index: number }> = ({ index }) => {
  const r = MELO_REACTIONS[index];
  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, bottom: 0, background: "#D3EEC2" }} />
      <div style={{ position: "absolute", left: 70, top: 60, width: 940 }}>
        <Title index={index} name={r.name} note={r.note} size={0.8} />
      </div>
      <Melo keys={r.keys} bubble={r.id === "bulle"} style={{ position: "absolute", width: 560, height: 700, left: 540 - 280, top: 960 - 658 }} />
    </AbsoluteFill>
  );
};

export const MELO_REEL_DURATION = MELO_REACTIONS.reduce((s, r) => s + r.duration, 0);

// All reactions back to back, 16:9.
export const MeloReactionReel: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: bg }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, height: 70, background: "#D3EEC2" }} />
      {MELO_REACTIONS.map((r, i) => {
        const from = at;
        at += r.duration;
        return (
          <Sequence key={r.id} from={from} durationInFrames={r.duration} name={r.name}>
            <div style={{ position: "absolute", left: 110, top: 360, width: 640 }}>
              <Title index={i} name={r.name} note={r.note} />
            </div>
            <Melo keys={r.keys} bubble={r.id === "bulle"} style={{ position: "absolute", width: 520, height: 650, left: 1180 - 260, top: 1010 - 611 }} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

// Everything looping at once, 4 + 3.
export const MeloReactionGrid: React.FC = () => (
  <AbsoluteFill style={{ background: "#F1FBEA" }}>
    {MELO_REACTIONS.map((r, i) => {
      const row = i < 4 ? 0 : 1;
      const col = i < 4 ? i : i - 4;
      const left = row === 0 ? col * 480 : 240 + col * 480;
      return (
        <div key={r.id} style={{ position: "absolute", left, top: row * 540, width: 480, height: 540, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 470, height: 70, background: "#D3EEC2" }} />
          <Loop durationInFrames={r.duration}>
            <Melo keys={r.keys} bubble={r.id === "bulle"} style={{ position: "absolute", width: 300, height: 375, left: 90, top: 475 - 352 }} />
          </Loop>
          <div style={{ position: "absolute", left: 22, top: 16, fontFamily: displayFont, fontSize: 40, color: GREEN }}>{r.name}</div>
        </div>
      );
    })}
  </AbsoluteFill>
);
