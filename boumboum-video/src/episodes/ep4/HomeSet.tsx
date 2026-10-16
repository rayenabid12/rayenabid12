import type React from "react";
import { Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { bodyFont, displayFont } from "../../theme";

// The pink monster's home: a cosy living room, in WORLD coordinates (floor at y = 1500).
export const GROUND = 1500;
export const TABLE_X = 860;
export const TABLE_TOP = 1300;
export const CALENDAR: [number, number] = [380, 880]; // centre
export const DOOR_X = 1560; // left edge of the door

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// A framed photo of the two friends (tiny vector portraits).
const Photo: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y}) rotate(-3)`}>
    <rect x={-120} y={-90} width={240} height={180} rx={14} fill="#B9834F" />
    <rect x={-104} y={-74} width={208} height={148} rx={8} fill="#BFEAFF" />
    <rect x={-104} y={30} width={208} height={44} fill="#8DD76F" />
    <ellipse cx={-38} cy={20} rx={44} ry={52} fill="#F38DBE" />
    <circle cx={-52} cy={6} r={9} fill="white" />
    <circle cx={-26} cy={6} r={9} fill="white" />
    <circle cx={-50} cy={8} r={4} fill="#1D2B5C" />
    <circle cx={-24} cy={8} r={4} fill="#1D2B5C" />
    <path d="M -54 30 Q -38 46 -22 30" stroke="#6E1235" strokeWidth={5} fill="none" strokeLinecap="round" />
    <ellipse cx={42} cy={22} rx={50} ry={48} fill="#7BCB4A" />
    {[12, 32, 52, 72].map((sx) => (
      <path key={sx} d={`M ${sx} -22 Q ${sx + 6} 22 ${sx} 66`} stroke="#2E7D32" strokeWidth={6} opacity={0.4} fill="none" />
    ))}
    <circle cx={30} cy={12} r={9} fill="white" />
    <circle cx={56} cy={12} r={9} fill="white" />
    <circle cx={31} cy={14} r={4} fill="#0E5C44" />
    <circle cx={57} cy={14} r={4} fill="#0E5C44" />
    <path d="M 28 36 Q 44 48 60 36" stroke="#6E0F22" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// Wall calendar: today is circled in green with a little watermelon doodle.
export const Calendar: React.FC<{ circle: number }> = ({ circle }) => {
  const [cx, cy] = CALENDAR;
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <rect x={-130} y={-150} width={260} height={300} rx={16} fill="white" stroke="#E6C9D8" strokeWidth={4} />
      <rect x={-130} y={-150} width={260} height={64} rx={16} fill="#E3123B" />
      <rect x={-130} y={-104} width={260} height={18} fill="#E3123B" />
      <text x={0} y={-104} textAnchor="middle" fontFamily={displayFont} fontSize={38} fill="white">OCTOBRE</text>
      {Array.from({ length: 28 }, (_, i) => {
        const c = i % 7;
        const r = Math.floor(i / 7);
        return <text key={i} x={-104 + c * 35} y={-48 + r * 44} textAnchor="middle" fontFamily={bodyFont} fontWeight={700} fontSize={22} fill={i === 15 ? "#2E9E3E" : "#9A7C8C"}>{i + 1}</text>;
      })}
      {/* today: hand-drawn green circle + watermelon doodle */}
      <path
        d="M 6 -10 C 46 -24 70 0 52 22 C 34 42 -10 34 -10 6 C -10 -14 16 -22 30 -18"
        transform="translate(-92 28) scale(0.9)"
        stroke="#2E9E3E"
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={240}
        strokeDashoffset={240 * (1 - circle)}
      />
      <g transform="translate(70 118)">
        <path d="M -36 -6 A 36 30 0 0 0 36 -6 Z" fill="#7BCB4A" />
        <path d="M -30 -6 A 30 24 0 0 0 30 -6 Z" fill="#FF6F91" />
        {[-14, 0, 14].map((sx) => (
          <ellipse key={sx} cx={sx} cy={4} rx={2.5} ry={4} fill="#2B1A12" />
        ))}
      </g>
      <text x={-30} y={128} textAnchor="middle" fontFamily={displayFont} fontSize={30} fill="#2E9E3E">MÉLO !</text>
    </g>
  );
};

// The room. `door` (0..1) opens the front door.
export const Home: React.FC<{ door: number }> = ({ door }) => {
  const frame = useCurrentFrame();
  return (
    <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900, top: 0, width: 3600, height: 2600, overflow: "visible" }}>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE3EF" />
          <stop offset="100%" stopColor="#FFD0E4" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3B07E" />
          <stop offset="100%" stopColor="#C98E5C" />
        </linearGradient>
      </defs>
      {/* wallpaper */}
      <rect x={-900} y={-600} width={3600} height={GROUND + 600} fill="url(#wall)" />
      {Array.from({ length: 46 }, (_, i) => (
        <rect key={i} x={-900 + i * 80} y={-600} width={34} height={GROUND + 600} fill="#FFF3F8" opacity={0.7} />
      ))}
      {Array.from({ length: 60 }, (_, i) => (
        <circle key={i} cx={-860 + (i % 30) * 120 + (Math.floor(i / 30) % 2) * 60} cy={-200 + Math.floor(i / 30) * 400 + ((i * 37) % 160)} r={8} fill="#F7A9CB" opacity={0.5} />
      ))}
      {/* window onto the city */}
      <g>
        <rect x={-330} y={560} width={420} height={560} rx={30} fill="#FFFFFF" />
        <rect x={-306} y={584} width={372} height={512} rx={18} fill="#9FE0F7" />
        {[[-300, 860, 90], [-200, 760, 80], [-110, 900, 70], [-30, 800, 90]].map(([bx, by, bw], i) => (
          <rect key={i} x={bx} y={by} width={bw} height={1096 - by} fill={["#F7C6DD", "#C9E8B8", "#FBE3B0", "#D9CFF2"][i]} />
        ))}
        <circle cx={-60 + Math.sin(frame / 40) * 4} cy={660} r={36} fill="#FFE066" />
        <rect x={-126} y={584} width={14} height={512} fill="#FFFFFF" />
        <rect x={-306} y={830} width={372} height={14} fill="#FFFFFF" />
        <path d="M -360 540 Q -250 700 -340 1140 L -370 1140 L -370 540 Z" fill="#F06AA8" />
        <path d="M 120 540 Q 10 700 100 1140 L 130 1140 L 130 540 Z" fill="#F06AA8" />
        <rect x={-380} y={524} width={520} height={26} rx={13} fill="#B8578C" />
      </g>
      <Photo x={720} y={780} />
      {/* shelf with a little plant */}
      <rect x={1080} y={940} width={260} height={18} rx={9} fill="#B9834F" />
      <path d="M 1150 940 L 1140 880 L 1200 880 L 1190 940 Z" fill="#F06AA8" />
      {[-30, -10, 10, 30].map((a, i) => (
        <ellipse key={i} cx={1170 + a} cy={850 - Math.abs(a) * 0.4} rx={14} ry={34} fill="#5CC35A" transform={`rotate(${a * 1.4} ${1170 + a} ${870})`} />
      ))}
      <rect x={1250} y={890} width={56} height={50} rx={8} fill="#FFD84D" />
      {/* sofa (left) */}
      <g>
        <rect x={-760} y={1250} width={560} height={200} rx={50} fill="#C77DFF" />
        <rect x={-780} y={1150} width={120} height={300} rx={50} fill="#B566F0" />
        <rect x={-300} y={1150} width={120} height={300} rx={50} fill="#B566F0" />
        <rect x={-660} y={1130} width={360} height={170} rx={50} fill="#D49BFF" />
        <rect x={-740} y={1440} width={30} height={60} fill="#7B4A2A" />
        <rect x={-260} y={1440} width={30} height={60} fill="#7B4A2A" />
      </g>
      {/* front door (right) */}
      <rect x={DOOR_X - 24} y={1000} width={248} height={GROUND - 1000} rx={20} fill="#B9834F" />
      <rect x={DOOR_X} y={1024} width={200} height={GROUND - 1024} fill="#5A2E4A" />
      <path d="M 1560 1500 L 1560 1060 L 1760 1060" stroke="#FFF3C4" strokeWidth={6} opacity={door} fill="none" />
      <g transform={`translate(${DOOR_X} 0) scale(${1 - door * 0.85} 1) translate(${-DOOR_X} 0)`}>
        <rect x={DOOR_X} y={1024} width={200} height={GROUND - 1024} fill="#F06AA8" stroke="#B8578C" strokeWidth={8} />
        <rect x={DOOR_X + 30} y={1060} width={140} height={150} rx={12} fill="#F48CBD" />
        <rect x={DOOR_X + 30} y={1250} width={140} height={200} rx={12} fill="#F48CBD" />
        <circle cx={DOOR_X + 170} cy={1280} r={12} fill="#FFD84D" />
      </g>
      {/* skirting + floor */}
      <rect x={-900} y={GROUND - 30} width={3600} height={34} fill="#FFFFFF" />
      <rect x={-900} y={GROUND} width={3600} height={1100} fill="url(#floor)" />
      {Array.from({ length: 30 }, (_, i) => (
        <rect key={i} x={-900 + i * 130 + (i % 2) * 40} y={GROUND} width={4} height={1100} fill="#B57A4A" opacity={0.5} />
      ))}
      <ellipse cx={TABLE_X} cy={GROUND + 120} rx={720} ry={90} fill="#FF9EC6" opacity={0.6} />
      <ellipse cx={TABLE_X} cy={GROUND + 120} rx={640} ry={70} fill="#FFC2DB" opacity={0.6} />
    </svg>
  );
};

// Party table (round, pink tablecloth).
export const Table: React.FC = () => (
  <svg viewBox="-900 0 3600 2600" style={{ position: "absolute", left: -900, top: 0, width: 3600, height: 2600, overflow: "visible", pointerEvents: "none" }}>
    <rect x={TABLE_X - 14} y={TABLE_TOP} width={28} height={GROUND - TABLE_TOP} fill="#7B4A2A" />
    <ellipse cx={TABLE_X} cy={GROUND - 4} rx={90} ry={14} fill="#7B4A2A" />
    <path d={`M ${TABLE_X - 200} ${TABLE_TOP} L ${TABLE_X + 200} ${TABLE_TOP} L ${TABLE_X + 220} ${TABLE_TOP + 110} Q ${TABLE_X + 180} ${TABLE_TOP + 130} ${TABLE_X + 140} ${TABLE_TOP + 110} Q ${TABLE_X + 100} ${TABLE_TOP + 130} ${TABLE_X + 60} ${TABLE_TOP + 110} Q ${TABLE_X + 20} ${TABLE_TOP + 130} ${TABLE_X - 20} ${TABLE_TOP + 110} Q ${TABLE_X - 60} ${TABLE_TOP + 130} ${TABLE_X - 100} ${TABLE_TOP + 110} Q ${TABLE_X - 140} ${TABLE_TOP + 130} ${TABLE_X - 180} ${TABLE_TOP + 110} L ${TABLE_X - 220} ${TABLE_TOP + 110} Z`} fill="#FFFFFF" />
    <ellipse cx={TABLE_X} cy={TABLE_TOP} rx={200} ry={26} fill="#F06AA8" />
  </svg>
);

// Birthday banner on a string. `hang` (0..1) drops the right end; `appear` scales it in.
export const Banner: React.FC<{ appear: number; drop: number }> = ({ appear, drop }) => {
  const frame = useCurrentFrame();
  const letters = "JOYEUX ANNIV' MÉLO".split("");
  const x1 = 470;
  const x2 = 1270;
  const y1 = 600;
  const y2 = 630 + drop * 420;
  const sag = 70 * (1 - drop * 0.6);
  const at = (t: number): [number, number] => [x1 + (x2 - x1) * t * (1 - drop * 0.35), y1 + (y2 - y1) * t + 4 * sag * t * (1 - t)];
  return (
    <g opacity={appear > 0 ? 1 : 0} transform={`translate(${x1} ${y1}) scale(${appear}) translate(${-x1} ${-y1})`}>
      <path d={`M ${x1} ${y1} Q ${(x1 + at(1)[0]) / 2} ${(y1 + y2) / 2 + sag * 2} ${at(1)[0]} ${y2}`} stroke="#8C3B67" strokeWidth={4} fill="none" />
      {letters.map((ch, i) => {
        const t = (i + 0.5) / letters.length;
        const [lx, ly] = at(t);
        const sw = Math.sin(frame / 10 + i) * 3 + drop * (i - 4) * 4;
        return ch === " " ? null : (
          <g key={i} transform={`translate(${lx} ${ly}) rotate(${sw})`}>
            <path d="M -20 0 L 20 0 L 20 46 L 0 60 L -20 46 Z" fill={["#F06AA8", "#7BCB4A", "#FFD84D", "#C77DFF"][i % 4]} />
            <text x={0} y={36} textAnchor="middle" fontFamily={displayFont} fontSize={30} fill="white">{ch}</text>
          </g>
        );
      })}
    </g>
  );
};

// Three-tier birthday cake, drawn around its base centre. wobble: degrees; squash 0..1 collapses it.
export const Cake: React.FC<{ x: number; y: number; scale?: number; wobble?: number; squash?: number }> = ({ x, y, scale = 1, wobble = 0, squash = 0 }) => {
  const sy = 1 - squash * 0.62;
  const sx = 1 + squash * 0.35;
  return (
    <svg style={{ position: "absolute", left: x - 200, top: y - 400, width: 400, height: 400, overflow: "visible" }} viewBox="-200 -400 400 400">
      <g transform={`scale(${scale}) rotate(${wobble} 0 0) scale(${sx} ${sy})`}>
        <ellipse cx={0} cy={0} rx={150} ry={16} fill="#FFFFFF" />
        <rect x={-130} y={-110} width={260} height={110} rx={20} fill="#F38DBE" />
        <path d="M -130 -96 Q -110 -70 -90 -96 Q -70 -70 -50 -96 Q -30 -70 -10 -96 Q 10 -70 30 -96 Q 50 -70 70 -96 Q 90 -70 110 -96 Q 120 -80 130 -96 L 130 -110 L -130 -110 Z" fill="#FFF3F8" />
        <rect x={-96} y={-200} width={192} height={96} rx={18} fill="#8BD86A" />
        <path d="M -96 -188 Q -80 -166 -64 -188 Q -48 -166 -32 -188 Q -16 -166 0 -188 Q 16 -166 32 -188 Q 48 -166 64 -188 Q 80 -166 96 -188 L 96 -200 L -96 -200 Z" fill="#FFF3F8" />
        <rect x={-62} y={-276} width={124} height={82} rx={16} fill="#F38DBE" />
        <ellipse cx={0} cy={-276} rx={62} ry={12} fill="#FFF3F8" />
        {[-40, 0, 40].map((cx) => (
          <circle key={cx} cx={cx} cy={-290} r={12} fill="#E3123B" />
        ))}
        {[-100, -60, -20, 20, 60, 100].map((cx, i) => (
          <circle key={cx} cx={cx} cy={-50} r={6} fill={i % 2 ? "#FFD84D" : "#7BCB4A"} />
        ))}
      </g>
      {squash > 0.4
        ? [[-170, -20, 40], [160, -16, 34], [-120, 6, 26], [130, 8, 30], [0, 10, 30]].map(([sx2, sy2, r], i) => (
            <ellipse key={i} cx={sx2 * Math.min(1, squash * 1.2)} cy={sy2} rx={r} ry={r * 0.45} fill={i % 2 ? "#F38DBE" : "#FFF3F8"} />
          ))
        : null}
    </svg>
  );
};

// The present: a Pastèque pack with a pink bow (rig-sized group, centred on 0,0).
export const Gift: React.FC = () => (
  <g>
    <image href={staticFile("pack-pasteque-single.webp")} x={-120} y={-58} width={240} height={115} />
    <rect x={-12} y={-60} width={24} height={118} fill="#F06AA8" />
    <path d="M 0 -58 C -40 -100 -80 -70 -50 -50 C -30 -40 -10 -52 0 -58 Z" fill="#F06AA8" />
    <path d="M 0 -58 C 40 -100 80 -70 50 -50 C 30 -40 10 -52 0 -58 Z" fill="#F06AA8" />
    <circle cx={0} cy={-58} r={12} fill="#E3123B" />
  </g>
);

// A floating bubble-balloon on a string (world coordinates).
export const BubbleBalloon: React.FC<{ x: number; y: number; r: number; tone: string; light: string }> = ({ x, y, r, tone, light }) => {
  const frame = useCurrentFrame();
  const bob = Math.sin(frame / 12 + x) * 8;
  return (
    <svg style={{ position: "absolute", left: x - r * 1.5, top: y - r * 1.5 + bob, width: r * 3, height: r * 5, overflow: "visible" }} viewBox={`${-r * 1.5} ${-r * 1.5} ${r * 3} ${r * 5}`}>
      <path d={`M 0 ${r} Q ${r * 0.3} ${r * 1.8} 0 ${r * 2.6} Q ${-r * 0.3} ${r * 3.2} 0 ${r * 3.5}`} stroke="#B8578C" strokeWidth={3} fill="none" />
      <circle r={r} fill={tone} opacity={0.92} stroke="rgba(255,255,255,0.7)" strokeWidth={3} />
      <ellipse cx={-r * 0.38} cy={-r * 0.4} rx={r * 0.24} ry={r * 0.13} fill={light} opacity={0.85} transform={`rotate(-35 ${-r * 0.38} ${-r * 0.4})`} />
    </svg>
  );
};

// Falling confetti (screen space), starting at `from`.
export const Confetti: React.FC<{ from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const t = frame - from;
  if (t < 0) return null;
  return (
    <>
      {Array.from({ length: 60 }, (_, i) => {
        const x = ((i * 137) % 1080) + Math.sin(t / 9 + i) * 30;
        const y = -60 - ((i * 53) % 700) + t * (9 + (i % 5) * 2);
        const c = ["#F06AA8", "#7BCB4A", "#FFD84D", "#C77DFF", "#FFFFFF"][i % 5];
        return (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: 18, height: 28, background: c, borderRadius: 4, rotate: `${t * (6 + (i % 7)) + i * 40}deg`, opacity: interpolate(t, [0, 4], [0, 1], clamp) }}
          />
        );
      })}
    </>
  );
};

export const popIn = (f: number, at: number) => interpolate(f, [at, at + 8], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
