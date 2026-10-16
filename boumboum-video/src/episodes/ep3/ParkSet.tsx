import type React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";
import { Cloud } from "../../story/Props";
import { bodyFont, displayFont } from "../../theme";

// A sunny city park, in WORLD coordinates (grass line at y = 1500).
// Same city as Episode 2, now in daylight.
export const GROUND = 1500;

// Sky in screen space, with a slight parallax on the camera's height.
export const DaySky: React.FC<{ readonly cy: number }> = ({ cy }) => {
  const frame = useCurrentFrame();
  const lift = (cy - 1000) * 0.15;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #5EC8F2 0%, #9FE0F7 55%, #DDF6FF 100%)" }} />
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 180 - lift,
          width: 230,
          height: 230,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFF6B8 0%, #FFE066 60%, #FFD23F 100%)",
          boxShadow: "0 0 120px 50px rgba(255, 230, 120, 0.55)",
          rotate: `${frame * 0.3}deg`,
        }}
      />
      {[
        [-120, 300, 420, 0.25],
        [520, 520, 300, 0.4],
        [140, 760, 260, 0.33],
      ].map(([x, y, w, sp], i) => (
        <Cloud key={i} style={{ position: "absolute", width: w, left: ((x + frame * sp + 1500) % 1500) - 300, top: y - lift * 1.4 }} />
      ))}
    </>
  );
};

// Pastel daytime skyline behind the park (parallax relative to the camera).
export const DaySkyline: React.FC<{ readonly cx: number }> = ({ cx }) => {
  const shift = (cx - 700) * 0.5;
  const towers = [
    [-700, 640, 260], [-420, 520, 200], [-200, 700, 240], [60, 470, 180], [260, 600, 220], [520, 430, 170],
    [700, 640, 260], [980, 500, 200], [1200, 720, 220], [1440, 460, 260], [1720, 600, 200], [1940, 520, 240], [2180, 680, 220],
  ];
  const tints = ["#F7C6DD", "#C9E8B8", "#FBE3B0", "#D9CFF2"];
  return (
    <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900 + shift, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
      {towers.map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={GROUND - top} rx={10} fill={tints[i % 4]} />
          {Array.from({ length: Math.floor((GROUND - top) / 80) * 3 }, (_, k) => (
            <rect key={k} x={x + 26 + (k % 3) * ((w - 52) / 3)} y={top + 34 + Math.floor(k / 3) * 80} width={18} height={28} rx={6} fill="white" opacity={0.55} />
          ))}
        </g>
      ))}
    </svg>
  );
};

const Tree: React.FC<{ x: number; s?: number; tone?: number }> = ({ x, s = 1, tone = 0 }) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 25 + x) * 4;
  const leaf = tone ? ["#5DBB4A", "#79D15E", "#9BE07E"] : ["#3FA845", "#5CC35A", "#86D96E"];
  return (
    <g transform={`translate(${x} ${GROUND}) scale(${s})`}>
      <path d="M -34 0 C -30 -120 -40 -260 -24 -380 L 24 -380 C 40 -260 30 -120 34 0 Z" fill="#9A6A45" />
      <path d="M -8 -300 C -40 -340 -80 -350 -110 -340" stroke="#9A6A45" strokeWidth={22} strokeLinecap="round" fill="none" />
      <g transform={`rotate(${sway} 0 -380)`}>
        <circle cx={-110} cy={-430} r={130} fill={leaf[0]} />
        <circle cx={110} cy={-440} r={130} fill={leaf[0]} />
        <circle cx={0} cy={-560} r={160} fill={leaf[1]} />
        <circle cx={-60} cy={-470} r={120} fill={leaf[1]} />
        <circle cx={70} cy={-480} r={110} fill={leaf[2]} />
        <circle cx={-40} cy={-610} r={60} fill={leaf[2]} opacity={0.7} />
        {[[-120, -420], [90, -520], [10, -600], [130, -400]].map(([fx, fy], i) => (
          <circle key={i} cx={fx} cy={fy} r={14} fill="#FF6F91" />
        ))}
      </g>
    </g>
  );
};

const Bush: React.FC<{ x: number; w: number }> = ({ x, w }) => (
  <g>
    <ellipse cx={x} cy={GROUND - 10} rx={w / 2} ry={w * 0.32} fill="#4CAF50" />
    <ellipse cx={x - w * 0.25} cy={GROUND - 30} rx={w * 0.3} ry={w * 0.26} fill="#66C35C" />
    <ellipse cx={x + w * 0.22} cy={GROUND - 36} rx={w * 0.28} ry={w * 0.24} fill="#7BD06A" />
  </g>
);

const Flowers: React.FC<{ x: number; n: number; seed: number }> = ({ x, n, seed }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const fx = x + i * 46 + Math.sin(i * 7.1 + seed) * 12;
      const fy = GROUND + 30 + Math.cos(i * 3.3 + seed) * 18;
      const c = ["#FF6F91", "#FFD84D", "#FFFFFF", "#C77DFF"][(i + seed) % 4];
      return (
        <g key={i}>
          <rect x={fx - 2} y={fy} width={4} height={24} fill="#3E9A3A" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={fx + Math.cos((a * Math.PI) / 180) * 8} cy={fy + Math.sin((a * Math.PI) / 180) * 8} r={7} fill={c} />
          ))}
          <circle cx={fx} cy={fy} r={6} fill="#FFB020" />
        </g>
      );
    })}
  </g>
);

// The park: fence, trees, bushes, path and lamp posts. Mélo's tree trunk sits at x ~ 1230.
export const Park: React.FC = () => (
  <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
    {/* far hedge + fence */}
    <rect x={-900} y={GROUND - 170} width={3600} height={170} fill="#7CCB6A" />
    <path d={`M -900 ${GROUND - 170} ${Array.from({ length: 46 }, (_, i) => `Q ${-900 + i * 80 + 40} ${GROUND - 215} ${-900 + (i + 1) * 80} ${GROUND - 170}`).join(" ")} L 2700 ${GROUND - 160} L -900 ${GROUND - 160} Z`} fill="#7CCB6A" />
    {Array.from({ length: 60 }, (_, i) => (
      <g key={i}>
        <rect x={-900 + i * 60} y={GROUND - 120} width={18} height={110} rx={8} fill="#FFF7EE" />
      </g>
    ))}
    <rect x={-900} y={GROUND - 96} width={3600} height={12} fill="#FFF7EE" />
    <rect x={-900} y={GROUND - 50} width={3600} height={12} fill="#FFF7EE" />

    <Tree x={-420} s={0.9} tone={1} />
    <Tree x={1230} s={1.05} />
    <Tree x={2000} s={0.85} tone={1} />
    <Bush x={-120} w={240} />
    <Bush x={1560} w={260} />
    <Bush x={2300} w={220} />

    {/* lamp posts */}
    {[-650, 1750].map((lx) => (
      <g key={lx}>
        <rect x={lx - 9} y={900} width={18} height={GROUND - 900} fill="#3F6B5A" />
        <rect x={lx - 30} y={860} width={60} height={56} rx={16} fill="#FFF3C4" stroke="#3F6B5A" strokeWidth={8} />
      </g>
    ))}

    {/* grass + path */}
    <rect x={-900} y={GROUND - 10} width={3600} height={1110} fill="#8DD76F" />
    <rect x={-900} y={GROUND - 10} width={3600} height={18} fill="#6EC05A" />
    <path d={`M -900 ${GROUND + 70} C 0 ${GROUND + 40} 1400 ${GROUND + 110} 2700 ${GROUND + 70} L 2700 ${GROUND + 210} C 1400 ${GROUND + 250} 0 ${GROUND + 180} -900 ${GROUND + 210} Z`} fill="#F4DDB4" />
    <Flowers x={-500} n={8} seed={1} />
    <Flowers x={1450} n={7} seed={3} />
    <rect x={-900} y={GROUND + 330} width={3600} height={800} fill="#7ACB5F" />
  </svg>
);

// Chalk scoreboard on a post. `rose` (the pink monster) / `melo` scores; `team` (0..1) flips it to « ÉQUIPE ! ».
export const Scoreboard: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly rose: number;
  readonly melo: number;
  readonly appear: number;
  readonly team: number;
  readonly bumpAt?: number;
}> = ({ x, y, rose, melo, appear, team, bumpAt = -100 }) => {
  const frame = useCurrentFrame();
  const bump = interpolate(frame, [bumpAt, bumpAt + 4, bumpAt + 12], [1, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chalk: React.CSSProperties = { fontFamily: bodyFont, fontWeight: 700, color: "#FDFDF5", textShadow: "0 0 6px rgba(255,255,255,0.35)" };
  return (
    <div style={{ position: "absolute", left: x - 190, top: y, width: 380, height: GROUND - y, scale: appear * bump, transformOrigin: "50% 100%" }}>
      <div style={{ position: "absolute", left: 175, top: 250, width: 30, height: GROUND - y - 250, background: "#9A6A45", borderRadius: 8 }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 380, height: 270, background: "#2F4A3A", border: "16px solid #B9834F", borderRadius: 24, boxSizing: "border-box", boxShadow: "0 10px 0 rgba(0,0,0,0.15)" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - team, display: "flex", alignItems: "center", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...chalk, fontSize: 40, color: "#FFB3CF" }}>BOUM</div>
            <div style={{ ...chalk, fontFamily: displayFont, fontSize: 110, lineHeight: 1 }}>{rose}</div>
          </div>
          <div style={{ ...chalk, fontSize: 60 }}>–</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...chalk, fontSize: 40, color: "#B8F59A" }}>MÉLO</div>
            <div style={{ ...chalk, fontFamily: displayFont, fontSize: 110, lineHeight: 1 }}>{melo}</div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: team, scale: 0.6 + team * 0.4 }}>
          <div style={{ ...chalk, fontFamily: displayFont, fontSize: 84, rotate: "-6deg" }}>
            <span style={{ color: "#FFB3CF" }}>ÉQUI</span>
            <span style={{ color: "#B8F59A" }}>PE !</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const clampX = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const easeIO = Easing.inOut(Easing.cubic);
