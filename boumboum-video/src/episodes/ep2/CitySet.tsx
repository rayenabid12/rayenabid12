import type React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { displayFont } from "../../theme";
import { Pumpkin } from "./Halloween";

// A candy city on Halloween night, in WORLD coordinates (sidewalk at y = 1500).
export const GROUND = 1500;

const WIN_ON = "#FFD978";
const WIN_OFF = "#2B1846";

// Rows of windows; `lit` picks which ones glow (deterministic).
const Windows: React.FC<{ x: number; y: number; cols: number; rows: number; w: number; h: number; gapX: number; gapY: number; seed: number }> = ({
  x, y, cols, rows, w, h, gapX, gapY, seed,
}) => (
  <>
    {Array.from({ length: cols * rows }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const lit = Math.sin((i + 1) * 12.9898 + seed) > -0.1;
      return (
        <g key={i}>
          <rect x={x + c * (w + gapX)} y={y + r * (h + gapY)} width={w} height={h} rx={w * 0.45} fill={lit ? WIN_ON : WIN_OFF} />
          {lit ? <rect x={x + c * (w + gapX) + w * 0.47} y={y + r * (h + gapY)} width={w * 0.06} height={h} fill="#E8A94A" /> : null}
        </g>
      );
    })}
  </>
);

// Distant skyline, drawn with parallax relative to the camera.
export const Skyline: React.FC<{ readonly cx: number }> = ({ cx }) => {
  const shift = (cx - 750) * 0.55; // moves slower than the street
  const towers = [
    [-700, 520, 260], [-420, 380, 200], [-200, 600, 240], [60, 300, 180], [260, 460, 220], [520, 250, 170],
    [700, 520, 260], [980, 360, 200], [1200, 640, 220], [1440, 300, 260], [1720, 480, 200], [1940, 380, 240], [2180, 560, 220],
  ];
  return (
    <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900 + shift, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
      {towers.map(([x, top, w], i) => (
        <g key={i}>
          <rect x={x} y={top} width={w} height={GROUND - top} fill={i % 2 ? "#2E1A50" : "#35205A"} />
          {i % 3 === 0 ? <path d={`M ${x + w / 2 - 6} ${top} L ${x + w / 2 - 6} ${top - 90} L ${x + w / 2 + 6} ${top - 90} L ${x + w / 2 + 6} ${top} Z`} fill="#2E1A50" /> : null}
          {Array.from({ length: Math.floor((GROUND - top) / 70) * 3 }, (_, k) => {
            const lit = Math.sin((k + i * 7) * 3.1) > 0.35;
            return lit ? <rect key={k} x={x + 26 + (k % 3) * ((w - 52) / 3)} y={top + 30 + Math.floor(k / 3) * 70} width={16} height={24} fill="#C9A0F0" opacity={0.55} /> : null;
          })}
        </g>
      ))}
    </svg>
  );
};

const Awning: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => {
  const stripes = Math.floor(w / 50);
  return (
    <g>
      {Array.from({ length: stripes }, (_, i) => (
        <path key={i} d={`M ${x + i * 50} ${y} L ${x + i * 50 + 50} ${y} L ${x + i * 50 + 50} ${y + 80} Q ${x + i * 50 + 25} ${y + 110} ${x + i * 50} ${y + 80} Z`} fill={i % 2 ? "#FFF2F7" : "#F06AA8"} />
      ))}
    </g>
  );
};

const StringLights: React.FC<{ x1: number; x2: number; y: number; sag: number }> = ({ x1, x2, y, sag }) => {
  const frame = useCurrentFrame();
  const n = Math.floor((x2 - x1) / 60);
  return (
    <g>
      <path d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`} stroke="#2A1238" strokeWidth={4} fill="none" />
      {Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        const bx = x1 + (x2 - x1) * t;
        const by = y + 4 * sag * t * (1 - t) * 1 + 10;
        const on = 0.6 + 0.4 * Math.abs(Math.sin(frame / 9 + i));
        return <ellipse key={i} cx={bx} cy={by} rx={10} ry={14} fill={i % 3 === 0 ? "#FF9A3C" : i % 3 === 1 ? "#C77DFF" : "#7FD36B"} opacity={on} />;
      })}
    </g>
  );
};

// Haunted townhouse door: center ~ (1210, 1290). door/eyes in 0..1.
export const CityStreet: React.FC<{ readonly door: number; readonly eyes: number }> = ({ door, eyes }) => {
  const frame = useCurrentFrame();
  const blink = frame % 40 < 3 ? 0.1 : 1;
  const doorX = 1110;
  const doorW = 200;
  return (
    <>
      <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
        <defs>
          <linearGradient id="haunted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6E3496" />
            <stop offset="100%" stopColor="#4A2270" />
          </linearGradient>
          <linearGradient id="shop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F3C7DD" />
            <stop offset="100%" stopColor="#D99BC0" />
          </linearGradient>
          <radialGradient id="lampGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFE9A8" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#FFE9A8" stopOpacity={0} />
          </radialGradient>
        </defs>

        {/* candy shop */}
        <rect x={-320} y={640} width={720} height={GROUND - 640} fill="url(#shop)" />
        <rect x={-340} y={610} width={760} height={50} rx={12} fill="#B8578C" />
        <Windows x={-240} y={720} cols={4} rows={2} w={90} h={130} gapX={60} gapY={60} seed={1} />
        <rect x={-260} y={1040} width={600} height={60} rx={16} fill="#E3123B" />
        <text x={40} y={1084} textAnchor="middle" fontFamily={displayFont} fontSize={52} fill="white">BONBONS</text>
        <Awning x={-280} y={1120} w={650} />
        <rect x={-250} y={1230} width={360} height={250} rx={14} fill="#FFE7A6" />
        {[[-200, 1330], [-120, 1310], [-40, 1340], [40, 1320]].map(([jx, jy], i) => (
          <g key={i}>
            <rect x={jx} y={jy} width={56} height={130} rx={14} fill="white" opacity={0.75} />
            <circle cx={jx + 28} cy={jy + 80} r={18} fill={["#F06AA8", "#7FD36B", "#FF9A3C", "#C77DFF"][i]} />
          </g>
        ))}
        <rect x={150} y={1250} width={170} height={250} rx={12} fill="#8C3B67" />
        <StringLights x1={-300} x2={400} y={1110} sag={30} />

        {/* apartment block */}
        <rect x={420} y={460} width={520} height={GROUND - 460} fill="#3E2466" />
        <rect x={405} y={430} width={550} height={44} rx={10} fill="#2C1750" />
        <Windows x={470} y={520} cols={4} rows={6} w={70} h={100} gapX={52} gapY={44} seed={4} />
        {[[470, 830], [700, 974]].map(([bx, by], i) => (
          <g key={i}>
            <rect x={bx - 14} y={by + 104} width={200} height={14} rx={6} fill="#2C1750" />
            <rect x={bx - 14} y={by + 64} width={6} height={44} fill="#2C1750" />
            <rect x={bx + 180} y={by + 64} width={6} height={44} fill="#2C1750" />
          </g>
        ))}
        <rect x={420} y={1360} width={520} height={140} fill="#33204F" />

        {/* haunted townhouse */}
        <rect x={960} y={300} width={520} height={GROUND - 300} fill="url(#haunted)" />
        <path d="M 940 300 L 1500 300 L 1500 330 Q 1480 380 1462 330 Q 1440 360 1420 330 Q 1396 400 1376 330 Q 1350 360 1330 330 Q 1306 384 1286 330 Q 1262 356 1242 330 Q 1218 394 1198 330 Q 1176 360 1156 330 Q 1132 380 1112 330 Q 1090 356 1070 330 Q 1046 390 1026 330 Q 1004 356 984 330 Q 962 370 940 330 Z" fill="#F78CC0" />
        <Windows x={1020} y={420} cols={3} rows={4} w={90} h={130} gapX={70} gapY={60} seed={9} />
        {/* front steps + door */}
        <rect x={1060} y={1440} width={300} height={30} rx={6} fill="#5A3A80" />
        <rect x={1080} y={1470} width={260} height={30} rx={6} fill="#6A4A92" />
        <path d={`M ${doorX - 24} ${GROUND - 60} L ${doorX - 24} 1150 C ${doorX - 24} 1060 ${doorX + doorW + 24} 1060 ${doorX + doorW + 24} 1150 L ${doorX + doorW + 24} ${GROUND - 60} Z`} fill="#2A1238" />
        <path d={`M ${doorX} ${GROUND - 60} L ${doorX} 1160 C ${doorX} 1090 ${doorX + doorW} 1090 ${doorX + doorW} 1160 L ${doorX + doorW} ${GROUND - 60} Z`} fill="#120A1E" />
        {eyes > 0 ? (
          <g opacity={eyes}>
            <ellipse cx={doorX + 74} cy={1260} rx={14} ry={20 * blink} fill="#FFF7D6" />
            <ellipse cx={doorX + 128} cy={1260} rx={14} ry={20 * blink} fill="#FFF7D6" />
          </g>
        ) : null}
        <g transform={`translate(${doorX} 0) scale(${1 - door * 0.88} 1) translate(${-doorX} 0)`}>
          <path d={`M ${doorX} ${GROUND - 60} L ${doorX} 1160 C ${doorX} 1090 ${doorX + doorW} 1090 ${doorX + doorW} 1160 L ${doorX + doorW} ${GROUND - 60} Z`} fill="#9A4FC2" stroke="#3A1A55" strokeWidth={8} />
          <circle cx={doorX + doorW - 30} cy={1300} r={12} fill="#FFE27A" />
          <path d={`M ${doorX + 30} 1200 L ${doorX + doorW - 30} 1200 M ${doorX + 30} 1330 L ${doorX + doorW - 30} 1330`} stroke="#7B3FA0" strokeWidth={8} />
        </g>
        <text x={doorX + doorW / 2} y={1046} textAnchor="middle" fontFamily={displayFont} fontSize={44} fill="#FFE27A">13</text>

        {/* building on the far right */}
        <rect x={1500} y={560} width={560} height={GROUND - 560} fill="#382060" />
        <Windows x={1560} y={620} cols={4} rows={5} w={70} h={100} gapX={56} gapY={50} seed={13} />

        {/* sidewalk, curb, road */}
        <rect x={-900} y={GROUND - 10} width={3600} height={110} fill="#8A7BA8" />
        {Array.from({ length: 30 }, (_, i) => (
          <rect key={i} x={-900 + i * 120} y={GROUND - 10} width={4} height={110} fill="#77699A" />
        ))}
        <rect x={-900} y={GROUND + 100} width={3600} height={26} fill="#B7A9D3" />
        <rect x={-900} y={GROUND + 126} width={3600} height={1000} fill="#2A2140" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={-900 + i * 240} y={GROUND + 330} width={130} height={18} rx={9} fill="#FFD978" opacity={0.7} />
        ))}

        {/* street lamps at the edges of the set */}
        {[-170, 1700].map((lx) => (
          <g key={lx}>
            <circle cx={lx} cy={880} r={170} fill="url(#lampGlow)" opacity={interpolate(Math.sin(frame / 20), [-1, 1], [0.75, 0.95])} />
            <rect x={lx - 10} y={880} width={20} height={GROUND - 870} fill="#1E1030" />
            <rect x={lx - 34} y={850} width={68} height={50} rx={14} fill="#FFE9A8" />
            <path d={`M ${lx - 44} 852 L ${lx + 44} 852 L ${lx + 28} 820 L ${lx - 28} 820 Z`} fill="#1E1030" />
          </g>
        ))}
      </svg>
      {/* decorations */}
      <Pumpkin style={{ position: "absolute", left: 1000, top: 1376, width: 90 }} />
      <Pumpkin style={{ position: "absolute", left: 1330, top: 1380, width: 86 }} />
      <Pumpkin style={{ position: "absolute", left: 1090, top: 690, width: 80 }} />
      <Pumpkin style={{ position: "absolute", left: 600, top: 930, width: 70 }} />
    </>
  );
};

// Little dust cloud on landings and runs (world coordinates).
export const DustPuff: React.FC<{ readonly x: number; readonly y: number; readonly at: number; readonly dir?: number }> = ({ x, y, at, dir = 0 }) => {
  const frame = useCurrentFrame();
  const t = (frame - at) / 16;
  if (t < 0 || t > 1) return null;
  return (
    <>
      {[-1, -0.4, 0.4, 1].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x + (s * 70 + dir * 40) * (0.4 + t) - 22,
            top: y - 20 - t * 30 - Math.abs(s) * 10,
            width: 44 + t * 40,
            height: 44 + t * 40,
            borderRadius: "50%",
            background: "#D9CCEE",
            opacity: (1 - t) * 0.6,
          }}
        />
      ))}
    </>
  );
};
