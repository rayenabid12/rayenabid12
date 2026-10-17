import type React from "react";

// The pink monster's back garden at night, with the whole sky above it (WORLD coordinates).
// The ground is at y = 1500; the sky goes up to y = -2600.
export const GROUND = 1500;
export const DOOR_X = 260;
export const BUSH_X = 900;
export const FLOWERS_X = 1180;
// The heart-shaped constellation, and the empty spot where the little star belongs.
export const CONSTELLATION: [number, number][] = [
  [800, -1180], [700, -1300], [620, -1420], [560, -1540], [620, -1640], [720, -1660], [800, -1580],
  [880, -1660], [980, -1640], [1040, -1540], [980, -1420], [900, -1300],
];
export const GAP_INDEX = 4;
export const GAP = CONSTELLATION[GAP_INDEX];

const rand = (i: number, s: number) => {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// The sky: gradient, a moon, twinkling stars and the constellation. `lit` 0..1 completes it.
export const NightSky: React.FC<{ f: number; lit: number; gapHint: number }> = ({ f, lit, gapHint }) => (
  <svg viewBox="-1200 -2800 3600 4400" style={{ position: "absolute", left: -1200, top: -2800, width: 3600, height: 4400, overflow: "visible" }}>
    <defs>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#070B2A" />
        <stop offset="55%" stopColor="#141C52" />
        <stop offset="100%" stopColor="#2C2F74" />
      </linearGradient>
      <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#FFF7D6" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#FFF7D6" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect x={-1200} y={-2800} width={3600} height={4400} fill="url(#nightSky)" />
    <circle cx={1500} cy={-900} r={420} fill="url(#moonGlow)" />
    <circle cx={1500} cy={-900} r={150} fill="#FFF4C9" />
    <circle cx={1450} cy={-950} r={30} fill="#EFE3B0" />
    <circle cx={1550} cy={-850} r={22} fill="#EFE3B0" />
    {Array.from({ length: 160 }, (_, i) => {
      const x = -1100 + rand(i, 1) * 3400;
      const y = -2700 + rand(i, 2) * 3300;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(f / (8 + rand(i, 3) * 10) + i));
      return <circle key={i} cx={x} cy={y} r={2 + rand(i, 4) * 4} fill="#FFFFFF" opacity={tw * 0.8} />;
    })}
    {/* the constellation */}
    {lit > 0 ? (
      <path
        d={`M ${CONSTELLATION.map((p) => p.join(" ")).join(" L ")} Z`}
        stroke="#FFE9A8"
        strokeWidth={6}
        fill="none"
        opacity={0.7}
        strokeDasharray={2200}
        strokeDashoffset={2200 * (1 - lit)}
      />
    ) : null}
    {CONSTELLATION.map(([x, y], i) =>
      i === GAP_INDEX ? (
        <circle key={i} cx={x} cy={y} r={34} fill="none" stroke="#FFE9A8" strokeWidth={4} strokeDasharray="10 10" opacity={gapHint * (0.5 + 0.5 * Math.sin(f / 4))} />
      ) : (
        <g key={i}>
          <circle cx={x} cy={y} r={36 + lit * 20} fill="#FFE9A8" opacity={0.15 + lit * 0.15} />
          <circle cx={x} cy={y} r={12 + lit * 4} fill="#FFF6D0" opacity={0.6 + 0.4 * Math.abs(Math.sin(f / 9 + i))} />
        </g>
      ),
    )}
  </svg>
);

// The garden: house with a lit window and door, fence, tree, the bush where the star lands, flowers.
export const Garden: React.FC<{ f: number; door: number }> = ({ f, door }) => (
  <svg viewBox="-1200 -2800 3600 4400" style={{ position: "absolute", left: -1200, top: -2800, width: 3600, height: 4400, overflow: "visible" }}>
    {/* distant hills */}
    <path d={`M -1200 ${GROUND - 260} Q -600 ${GROUND - 420} 0 ${GROUND - 280} Q 700 ${GROUND - 140} 1300 ${GROUND - 330} Q 1900 ${GROUND - 470} 2400 ${GROUND - 280} L 2400 ${GROUND} L -1200 ${GROUND} Z`} fill="#1E2660" />
    {/* the house */}
    <rect x={-500} y={GROUND - 760} width={900} height={760} fill="#F3B6CF" />
    <path d={`M -560 ${GROUND - 740} L -50 ${GROUND - 1120} L 460 ${GROUND - 740} Z`} fill="#B8578C" />
    <rect x={-360} y={GROUND - 600} width={220} height={240} rx={20} fill="#FFE29A" />
    <rect x={-254} y={GROUND - 600} width={8} height={240} fill="#E2B865" />
    <rect x={-360} y={GROUND - 484} width={220} height={8} fill="#E2B865" />
    <path d={`M -360 ${GROUND - 600} L -360 ${GROUND - 360} L -470 ${GROUND - 380} L -470 ${GROUND - 620} Z`} fill="#F06AA8" opacity={0.8} />
    {/* the door (opens at `door`) */}
    <rect x={DOOR_X - 110} y={GROUND - 380} width={220} height={380} rx={14} fill="#FFE29A" />
    <g transform={`translate(${DOOR_X - 110} 0) scale(${1 - door * 0.8} 1) translate(${-(DOOR_X - 110)} 0)`}>
      <rect x={DOOR_X - 110} y={GROUND - 380} width={220} height={380} rx={14} fill="#8C3B67" />
      <circle cx={DOOR_X + 70} cy={GROUND - 190} r={12} fill="#FFD84D" />
    </g>
    <path d={`M ${DOOR_X - 110} ${GROUND} L ${DOOR_X + 110} ${GROUND} L ${DOOR_X + 300} ${GROUND + 160} L ${DOOR_X - 290} ${GROUND + 160} Z`} fill="#FFE29A" opacity={0.18 * door} />
    {/* fence */}
    {Array.from({ length: 26 }, (_, i) => (
      <rect key={i} x={420 + i * 70} y={GROUND - 170} width={22} height={170} rx={10} fill="#6E6AA8" />
    ))}
    <rect x={420} y={GROUND - 130} width={1820} height={14} fill="#6E6AA8" />
    {/* tree */}
    <g transform={`translate(1650 ${GROUND})`}>
      <path d="M -40 0 C -34 -150 -46 -320 -26 -460 L 26 -460 C 46 -320 34 -150 40 0 Z" fill="#4A3A5E" />
      <g transform={`rotate(${Math.sin(f / 30) * 2} 0 -460)`}>
        <circle cx={-130} cy={-520} r={150} fill="#24406A" />
        <circle cx={120} cy={-530} r={150} fill="#24406A" />
        <circle cx={0} cy={-660} r={180} fill="#2C4C7A" />
      </g>
    </g>
    {/* grass */}
    <rect x={-1200} y={GROUND - 10} width={3600} height={1200} fill="#2E5A4A" />
    <rect x={-1200} y={GROUND - 10} width={3600} height={16} fill="#3C7058" />
    {Array.from({ length: 60 }, (_, i) => (
      <path key={i} d={`M ${-1100 + i * 60} ${GROUND + 6} l 8 -26 l 8 26`} fill="#3C7058" />
    ))}
    {/* flowers */}
    {Array.from({ length: 7 }, (_, i) => {
      const x = FLOWERS_X - 160 + i * 52;
      const y = GROUND - 30 - (i % 3) * 22;
      return (
        <g key={i}>
          <rect x={x - 2} y={y} width={4} height={GROUND - y} fill="#3C7058" />
          {[0, 72, 144, 216, 288].map((a) => (
            <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 12} cy={y + Math.sin((a * Math.PI) / 180) * 12} r={10} fill={["#F7A9CB", "#C9B6FF", "#FFE29A"][i % 3]} />
          ))}
          <circle cx={x} cy={y} r={7} fill="#FFB020" />
        </g>
      );
    })}
    {/* fireflies */}
    {Array.from({ length: 10 }, (_, i) => (
      <circle key={i} cx={300 + rand(i, 7) * 1600 + Math.sin(f / 20 + i) * 40} cy={GROUND - 200 - rand(i, 8) * 400 + Math.cos(f / 17 + i) * 30} r={6} fill="#E8FF9A" opacity={0.3 + 0.7 * Math.abs(Math.sin(f / 10 + i * 2))} />
    ))}
  </svg>
);

// The bush where the star falls (drawn in front of the characters; `part` 0..1 opens the leaves).
export const StarBush: React.FC<{ part: number; glow: number }> = ({ part, glow }) => (
  <svg viewBox="-1200 -2800 3600 4400" style={{ position: "absolute", left: -1200, top: -2800, width: 3600, height: 4400, overflow: "visible" }}>
    {glow > 0 ? <circle cx={BUSH_X} cy={GROUND - 90} r={160} fill="#FFE9A8" opacity={0.25 * glow} /> : null}
    <g transform={`translate(${-part * 70} 0) rotate(${-part * 12} ${BUSH_X - 100} ${GROUND})`}>
      <ellipse cx={BUSH_X - 90} cy={GROUND - 60} rx={120} ry={90} fill="#2F6B4F" />
      <ellipse cx={BUSH_X - 120} cy={GROUND - 100} rx={80} ry={70} fill="#3A7D5C" />
    </g>
    <g transform={`translate(${part * 70} 0) rotate(${part * 12} ${BUSH_X + 100} ${GROUND})`}>
      <ellipse cx={BUSH_X + 90} cy={GROUND - 60} rx={120} ry={90} fill="#2F6B4F" />
      <ellipse cx={BUSH_X + 120} cy={GROUND - 100} rx={80} ry={70} fill="#3A7D5C" />
    </g>
  </svg>
);

// The little star (drawn around 0,0, about 100 units wide).
// glow 0..1 (fades when far from the sky), mood: 0 scared, 1 happy, 2 sleepy, 3 laughing.
export const StarShape: React.FC<{ f: number; glow: number; mood: number; size?: number; tilt?: number }> = ({ f, glow, mood, size = 1, tilt = 0 }) => {
  const g = Math.max(0, Math.min(1.3, glow));
  const flicker = g < 0.7 ? 0.75 + 0.25 * Math.abs(Math.sin(f * 0.9)) : 1;
  const body = g > 0.5 ? "#FFE066" : g > 0.3 ? "#E9DB9A" : "#C9C3A6";
  const pts = Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? 24 : 52;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${Math.cos(a) * r},${Math.sin(a) * r}`;
  }).join(" ");
  const blink = Math.floor(f / 50) % 3 === 0 && f % 50 < 3;
  return (
    <g transform={`scale(${size}) rotate(${tilt})`}>
      <circle r={120 * g} fill="#FFE9A8" opacity={0.18 * g * flicker} />
      <circle r={80 * g} fill="#FFF3C4" opacity={0.3 * g * flicker} />
      <polygon points={pts} fill={body} stroke="#F2B930" strokeWidth={4} strokeLinejoin="round" opacity={0.6 + 0.4 * flicker} />
      <ellipse cx={-14} cy={-14} rx={8} ry={4} fill="white" opacity={0.7} transform="rotate(-30 -14 -14)" />
      {/* face */}
      {mood === 2 || mood === 3 || blink ? (
        <>
          <path d={mood === 3 ? "M -16 -2 Q -10 -10 -4 -2" : "M -16 -4 Q -10 0 -4 -4"} stroke="#5A3A10" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d={mood === 3 ? "M 4 -2 Q 10 -10 16 -2" : "M 4 -4 Q 10 0 16 -4"} stroke="#5A3A10" strokeWidth={3} fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx={-10} cy={-3} rx={5} ry={mood === 0 ? 7 : 6} fill="#3A2408" />
          <ellipse cx={10} cy={-3} rx={5} ry={mood === 0 ? 7 : 6} fill="#3A2408" />
          <circle cx={-8} cy={-6} r={2} fill="white" />
          <circle cx={12} cy={-6} r={2} fill="white" />
        </>
      )}
      {mood === 0 ? <path d="M -6 12 Q 0 7 6 12" stroke="#5A3A10" strokeWidth={3} fill="none" strokeLinecap="round" /> : mood === 3 ? <ellipse cx={0} cy={11} rx={7} ry={6} fill="#B5481E" /> : <path d="M -7 8 Q 0 15 7 8" stroke="#5A3A10" strokeWidth={3} fill="none" strokeLinecap="round" />}
      <circle cx={-18} cy={7} r={5} fill="#FF9AA8" opacity={0.6} />
      <circle cx={18} cy={7} r={5} fill="#FF9AA8" opacity={0.6} />
    </g>
  );
};
