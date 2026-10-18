import type React from "react";

// Boum Boum Land, in WORLD coordinates (ground at y = 1500, the path runs left to right).
// Every piece is drawn in full colour; the scene greys it out with `Lit` until it is lit.
export const GROUND = 1500;
export const RIVER: [number, number] = [2990, 3370];
export const RAVINE: [number, number] = [3900, 4400];
export const STONES = [3100, 3230];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rgb = (c: string) => (c.startsWith("#") ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.slice(4, -1).split(",").map(Number));
export const mix = (a: string, b: string, t: number) => {
  const pa = rgb(a);
  const pb = rgb(b);
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp01(t))).join(",")})`;
};

// Screen-space sky: grey and flat, or candy blue and pink.
export const CandySky: React.FC<{ lit: number }> = ({ lit }) => (
  <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${mix("#C4C6CE", "#7FD3FF", lit)} 0%, ${mix("#E6E6EA", "#FFE3F1", lit)} 100%)` }} />
);

const svgBox = (x0: number, x1: number, top: number, bottom: number): React.CSSProperties => ({ position: "absolute", left: x0, top, width: x1 - x0, height: bottom - top, overflow: "visible" });

export const hillY = (x: number) => GROUND - 300 - 110 * Math.sin(x / 430) - 50 * Math.sin(x / 170 + 1);

// One slice of the world: far hills, near hills, grass and candy soil (or the river, or the ravine).
export const GroundChunk: React.FC<{ x0: number; x1: number }> = ({ x0, x1 }) => {
  const w = x1 - x0;
  const line = (y: (x: number) => number) =>
    Array.from({ length: 9 }, (_, i) => {
      const x = x0 + (w * i) / 8;
      return `${x},${y(x)}`;
    }).join(" L ");
  const far = line((x) => hillY(x) - 160 - 70 * Math.sin(x / 260));
  const near = line((x) => hillY(x) + 80);
  const inRiver = x0 >= RIVER[0] && x1 <= RIVER[1];
  const inRavine = x0 >= RAVINE[0] && x1 <= RAVINE[1];
  const top = GROUND - 1000;
  return (
    <svg style={svgBox(x0, x1 + 4, top, GROUND + 2400)} viewBox={`${x0} ${top} ${w + 4} 3400`}>
      <path d={`M ${far} L ${x1},${GROUND} L ${x0},${GROUND} Z`} fill="#D7C4FF" />
      <path d={`M ${near} L ${x1},${GROUND} L ${x0},${GROUND} Z`} fill="#9EE6B8" />
      {inRavine ? (
        <>
          <defs>
            <linearGradient id="pit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#8A6AB0" />
              <stop offset="0.25" stopColor="#4A3570" />
              <stop offset="1" stopColor="#1E1430" />
            </linearGradient>
          </defs>
          <path d={`M ${x0} ${GROUND - 4} C ${x0 + 60} ${GROUND + 200} ${x0 + 30} ${GROUND + 600} ${x0 + 90} ${GROUND + 2400} L ${x1 - 90} ${GROUND + 2400} C ${x1 - 30} ${GROUND + 600} ${x1 - 60} ${GROUND + 200} ${x1} ${GROUND - 4} Z`} fill="url(#pit)" />
        </>
      ) : inRiver ? (
        <>
          <rect x={x0} y={GROUND + 30} width={w + 4} height={2400} fill="#F7B6D2" />
          <path d={`M ${x0} ${GROUND - 8} Q ${x0 + 20} ${GROUND + 40} ${x0 + 60} ${GROUND + 40} L ${x1 - 60} ${GROUND + 40} Q ${x1 - 20} ${GROUND + 40} ${x1} ${GROUND - 8} L ${x1} ${GROUND + 2400} L ${x0} ${GROUND + 2400} Z`} fill="#F7B6D2" />
          <rect x={x0} y={GROUND + 260} width={w + 4} height={2400} fill="#EE9CC0" />
          <rect x={x0} y={GROUND + 520} width={w + 4} height={2400} fill="#E287B0" />
          <rect x={x0 + 40} y={GROUND + 30} width={w - 80} height={110} rx={30} fill="#FF5C8A" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M ${x0 + 70 + i * 75} ${GROUND + 44} q 18 -10 36 0`} stroke="#FFB3C8" strokeWidth={6} fill="none" strokeLinecap="round" />
          ))}
        </>
      ) : (
        <>
          <rect x={x0} y={GROUND} width={w + 4} height={2400} fill="#F7B6D2" />
          <rect x={x0} y={GROUND + 260} width={w + 4} height={2400} fill="#EE9CC0" />
          <rect x={x0} y={GROUND + 520} width={w + 4} height={2400} fill="#E287B0" />
          <rect x={x0} y={GROUND - 8} width={w + 4} height={60} fill="#8EE09A" />
          {Array.from({ length: Math.ceil(w / 60) }, (_, i) => (
            <circle key={i} cx={x0 + i * 60 + 30} cy={GROUND + 52} r={30} fill="#8EE09A" />
          ))}
          {Array.from({ length: Math.ceil(w / 90) }, (_, i) => (
            <rect key={`s${i}`} x={x0 + i * 90 + 20} y={GROUND + 130 + ((i * 37 + x0) % 90)} width={22} height={8} rx={4} fill={["#FFE066", "#7FD3FF", "#FFFFFF"][i % 3]} />
          ))}
        </>
      )}
    </svg>
  );
};

export const Lollipop: React.FC<{ x: number; h: number; r: number; color: string; sway?: number }> = ({ x, h, r, color, sway = 0 }) => (
  <svg style={svgBox(x - r - 20, x + r + 20, GROUND - h - r - 20, GROUND + 10)} viewBox={`${-r - 20} ${-h - r - 20} ${2 * r + 40} ${h + r + 30}`}>
    <g transform={`rotate(${sway} 0 0)`}>
      <rect x={-7} y={-h} width={14} height={h} rx={7} fill="#FFF7EE" stroke="#E8D6C8" strokeWidth={2} />
      <circle cx={0} cy={-h} r={r} fill={color} />
      <path d={`M 0 ${-h} m ${-r * 0.15} 0 a ${r * 0.15} ${r * 0.15} 0 1 1 ${r * 0.3} 0 a ${r * 0.35} ${r * 0.35} 0 1 1 ${-r * 0.65} 0 a ${r * 0.55} ${r * 0.55} 0 1 1 ${r * 1.05} 0 a ${r * 0.75} ${r * 0.75} 0 1 1 ${-r * 1.45} 0`} stroke="white" strokeWidth={r * 0.13} fill="none" opacity={0.85} />
      <ellipse cx={-r * 0.4} cy={-h - r * 0.45} rx={r * 0.22} ry={r * 0.12} fill="white" opacity={0.6} />
    </g>
  </svg>
);

export const Gumdrop: React.FC<{ x: number; s: number; color: string }> = ({ x, s, color }) => (
  <svg style={svgBox(x - 80 * s, x + 80 * s, GROUND - 120 * s, GROUND + 10)} viewBox="-80 -120 160 130">
    <path d="M -75 4 C -75 -70 -40 -112 0 -112 C 40 -112 75 -70 75 4 Z" fill={color} />
    {[[-30, -60], [10, -85], [35, -40], [-10, -25], [-45, -20]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={5} fill="white" opacity={0.75} />
    ))}
    <ellipse cx={-30} cy={-80} rx={14} ry={8} fill="white" opacity={0.4} transform="rotate(-35 -30 -80)" />
  </svg>
);

export const GumHouse: React.FC<{ x: number; door: number }> = ({ x, door }) => (
  <svg style={svgBox(x - 280, x + 280, GROUND - 520, GROUND + 10)} viewBox="-280 -520 560 530">
    <path d="M -250 6 C -250 -330 -130 -460 0 -460 C 130 -460 250 -330 250 6 Z" fill="#FF8FC6" />
    <path d="M -250 6 C -250 -330 -130 -460 0 -460 C 130 -460 250 -330 250 6 Z" fill="none" stroke="#E2649F" strokeWidth={10} />
    <ellipse cx={-110} cy={-330} rx={50} ry={26} fill="white" opacity={0.4} transform="rotate(-35 -110 -330)" />
    <rect x={-14} y={-520} width={28} height={70} rx={10} fill="#FFF7EE" />
    <circle cx={0} cy={-530} r={26} fill="#FFE066" />
    <circle cx={150} cy={-210} r={48} fill="#FFF7EE" stroke="#E2649F" strokeWidth={8} />
    <path d="M -95 6 L -95 -170 A 95 95 0 0 1 95 -170 L 95 6 Z" fill="#7A3A5E" />
    <g transform={`translate(-95 0) scale(${1 - door * 0.85} 1)`}>
      <path d="M 0 6 L 0 -170 A 95 95 0 0 1 190 -170 L 190 6 Z" fill="#B8578C" stroke="#8C3A68" strokeWidth={6} />
      <circle cx={160} cy={-90} r={10} fill="#FFE066" />
    </g>
  </svg>
);

// A gum tree with a round candy-floss canopy.
export const GumTree: React.FC<{ x: number }> = ({ x }) => (
  <svg style={svgBox(x - 260, x + 260, GROUND - 720, GROUND + 10)} viewBox="-260 -720 520 730">
    <path d="M -34 6 C -30 -200 -40 -380 -10 -480 L 20 -480 C 40 -380 30 -200 40 6 Z" fill="#C98E5C" />
    <path d="M 0 -380 C -60 -420 -120 -440 -150 -470" stroke="#C98E5C" strokeWidth={22} fill="none" strokeLinecap="round" />
    {[[-110, -520, 120], [60, -560, 140], [-20, -640, 110], [140, -470, 90], [-170, -440, 80]].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? "#FFB3DA" : "#FF8FC6"} />
    ))}
    {[[-60, -600], [90, -620], [20, -500], [-140, -500]].map(([cx, cy], i) => (
      <circle key={i} cx={cx} cy={cy} r={14} fill="#FF4F6F" />
    ))}
  </svg>
);

// The big candy mountain beyond the ravine, with whipped-cream snow.
export const CandyMountain: React.FC<{ x: number }> = ({ x }) => (
  <svg style={svgBox(x - 900, x + 900, GROUND - 1000, GROUND + 10)} viewBox="-900 -1000 1800 1010">
    <path d="M -900 6 L -300 -760 C -220 -860 -160 -880 -80 -800 L 0 -720 L 120 -900 C 180 -980 240 -960 300 -880 L 900 6 Z" fill="#B48CFF" />
    <path d="M -380 -660 L -300 -760 C -220 -860 -160 -880 -80 -800 L -10 -730 C -60 -690 -90 -720 -130 -680 C -180 -720 -220 -660 -270 -700 C -320 -650 -350 -690 -380 -660 Z" fill="#FFF7EE" />
    <path d="M 60 -810 L 120 -900 C 180 -980 240 -960 300 -880 L 360 -800 C 320 -770 290 -800 260 -770 C 220 -810 190 -760 150 -790 C 110 -760 90 -800 60 -810 Z" fill="#FFF7EE" />
    {[-560, -300, 0, 300, 560].map((sx, i) => (
      <path key={i} d={`M ${sx} 6 L ${sx + 120} -${300 + (i % 2) * 120}`} stroke="#9A6FEA" strokeWidth={26} strokeLinecap="round" opacity={0.6} />
    ))}
  </svg>
);

// The heart-shaped sun that sleeps behind the mountain.
export const HeartSun: React.FC<{ x: number; y: number; awake: number }> = ({ x, y, awake }) => (
  <svg style={svgBox(x - 200, x + 200, y - 200, y + 200)} viewBox="-200 -200 400 400">
    <circle r={190} fill="#FFE066" opacity={0.25 * awake} />
    <path d="M 0 120 C -160 20 -170 -90 -90 -120 C -40 -138 -10 -110 0 -80 C 10 -110 40 -138 90 -120 C 170 -90 160 20 0 120 Z" fill="#FFD23F" stroke="#FFB020" strokeWidth={8} />
    {awake > 0.5 ? (
      <>
        <path d="M -60 -40 q 15 -18 30 0" stroke="#7A3A1E" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 30 -40 q 15 -18 30 0" stroke="#7A3A1E" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M -40 0 Q 0 40 40 0" stroke="#7A3A1E" strokeWidth={8} fill="#FF6F91" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M -60 -36 q 15 12 30 0" stroke="#7A3A1E" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 30 -36 q 15 12 30 0" stroke="#7A3A1E" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M -12 14 Q 0 20 12 14" stroke="#7A3A1E" strokeWidth={7} fill="none" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const Eyes: React.FC<{ happy: number; sad: number; dx: number; y: number; r: number }> = ({ happy, sad, dx, y, r }) =>
  happy > 0.5 ? (
    <>
      <path d={`M ${-dx - r} ${y} q ${r} ${-r * 1.4} ${r * 2} 0`} stroke="#2B1A2E" strokeWidth={r * 0.6} fill="none" strokeLinecap="round" />
      <path d={`M ${dx - r} ${y} q ${r} ${-r * 1.4} ${r * 2} 0`} stroke="#2B1A2E" strokeWidth={r * 0.6} fill="none" strokeLinecap="round" />
    </>
  ) : (
    <>
      <circle cx={-dx} cy={y} r={r} fill="#2B1A2E" />
      <circle cx={dx} cy={y} r={r} fill="#2B1A2E" />
      <circle cx={-dx + r * 0.3} cy={y - r * 0.35} r={r * 0.35} fill="white" />
      <circle cx={dx + r * 0.3} cy={y - r * 0.35} r={r * 0.35} fill="white" />
      {sad > 0 ? (
        <>
          <path d={`M ${-dx - r * 1.2} ${y - r * 1.6} l ${r * 1.8} ${r * 0.7 * sad}`} stroke="#2B1A2E" strokeWidth={r * 0.4} strokeLinecap="round" />
          <path d={`M ${dx + r * 1.2} ${y - r * 1.6} l ${-r * 1.8} ${r * 0.7 * sad}`} stroke="#2B1A2E" strokeWidth={r * 0.4} strokeLinecap="round" />
        </>
      ) : null}
    </>
  );

const Mouth: React.FC<{ smile: number; y: number; w: number }> = ({ smile, y, w }) => (
  <path d={`M ${-w} ${y} Q 0 ${y + smile * w * 1.1} ${w} ${y}`} stroke="#2B1A2E" strokeWidth={w * 0.28} fill={smile > 0.4 ? "#FF6F91" : "none"} strokeLinecap="round" />
);

// The lollipop flower: droop 0..1 bends it to the ground; happy 0..1.
export const FlowerFriend: React.FC<{ x: number; droop: number; happy: number; f: number }> = ({ x, droop, happy, f }) => (
  <svg style={svgBox(x - 260, x + 260, GROUND - 420, GROUND + 10)} viewBox="-260 -420 520 430">
    <g transform={`rotate(${droop * 72 + Math.sin(f / 12) * 3 * (1 - droop)} 0 0)`}>
      <path d="M 0 6 C -10 -100 14 -200 0 -270" stroke="#3E9A3A" strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 0 -110 C -40 -150 -100 -140 -120 -110 C -80 -90 -40 -90 0 -110 Z" fill="#5CC35A" />
      <path d="M 4 -170 C 44 -210 104 -200 124 -170 C 84 -150 44 -150 4 -170 Z" fill="#5CC35A" />
      <g transform="translate(0 -320)">
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <ellipse key={i} cx={Math.cos(a) * 70} cy={Math.sin(a) * 70} rx={34} ry={22} fill={i % 2 ? "#FF8FC6" : "#FFB3DA"} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 70} ${Math.sin(a) * 70})`} />;
        })}
        <circle r={62} fill="#FFE066" />
        <circle r={62} fill="none" stroke="#FFB020" strokeWidth={6} />
        <Eyes happy={happy} sad={1 - happy} dx={22} y={-8} r={8} />
        <Mouth smile={happy * 2 - 1} y={20} w={18} />
        <circle cx={-38} cy={14} r={9} fill="#FF8FA3" opacity={0.6 * happy} />
        <circle cx={38} cy={14} r={9} fill="#FF8FA3" opacity={0.6 * happy} />
      </g>
    </g>
  </svg>
);

// A little cloud with a face; sad clouds cry raindrops.
export const CloudFriend: React.FC<{ x: number; y: number; happy: number; f: number; s?: number }> = ({ x, y, happy, f, s = 1 }) => (
  <svg style={svgBox(x - 170 * s, x + 170 * s, y - 120 * s, y + 220 * s)} viewBox="-170 -120 340 340">
    {happy < 0.5
      ? [0, 1, 2].map((i) => {
          const t = ((f + i * 7) % 20) / 20;
          return <path key={i} d={`M ${-50 + i * 50} ${40 + t * 160} q 8 14 0 20 q -8 -6 0 -20 Z`} fill="#9AD8FF" opacity={1 - t} />;
        })
      : null}
    {[[-90, 10, 60], [-40, -30, 75], [40, -35, 70], [95, 5, 58], [0, 20, 70]].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill="white" />
    ))}
    <ellipse cx={0} cy={55} rx={140} ry={26} fill="#FFD6EA" />
    <Eyes happy={happy} sad={1 - happy} dx={34} y={-6} r={11} />
    <Mouth smile={happy * 2 - 1} y={28} w={20} />
    <circle cx={-62} cy={22} r={12} fill="#FF8FA3" opacity={0.7} />
    <circle cx={62} cy={22} r={12} fill="#FF8FA3" opacity={0.7} />
  </svg>
);

// A little wrapped-candy fish, drawn around (0,0), about 120 wide, facing right.
export const FishShape: React.FC<{ happy: number }> = ({ happy }) => (
  <g>
    <path d="M -50 0 L -88 -32 L -80 0 L -88 32 Z" fill="#FFB020" />
    <ellipse rx={56} ry={36} fill="#FF9A3C" />
    {[-24, -4, 16].map((sx) => (
      <path key={sx} d={`M ${sx} -34 Q ${sx + 10} 0 ${sx} 34`} stroke="#FFD27A" strokeWidth={7} fill="none" />
    ))}
    <circle cx={26} cy={-8} r={8} fill="white" />
    {happy > 0.5 ? <path d="M 20 -8 q 6 -8 12 0" stroke="#2B1A2E" strokeWidth={4} fill="none" strokeLinecap="round" /> : <circle cx={28} cy={-8} r={5} fill="#2B1A2E" />}
    <path d={happy > 0.5 ? "M 34 10 Q 42 20 50 8" : "M 38 12 Q 44 6 50 12"} stroke="#2B1A2E" strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);
