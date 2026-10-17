import type React from "react";
import { interpolate } from "remotion";
import { displayFont } from "../../theme";

// A tall city building on a stormy afternoon, in WORLD coordinates (street at y = 3000).
export const GROUND = 3000;
export const WALL = { x0: 100, x1: 330, top: 2850 }; // the low wall of the opening gag
export const FACADE = { x0: 560, x1: 1200 };
export const ROOF = 700; // roof level (feet)
export const AWNING_Y = 2550;
export const BALCONIES = [2150, 1700, 1250];
export const PIPE_X = 1150;
export const KITTEN_SPOT: [number, number] = [600, ROOF]; // the broken corner of the roof

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Sky behind everything (screen space). `sun` 0..1 clears the storm.
export const StormSky: React.FC<{ sun: number }> = ({ sun }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #3D4766 0%, #5B6685 50%, #7D869F 100%)" }} />
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #5EC8F2 0%, #9FE0F7 60%, #DDF6FF 100%)", opacity: sun }} />
  </>
);

// Storm clouds drifting (screen space); they part when the sun comes back.
export const Clouds: React.FC<{ f: number; sun: number }> = ({ f, sun }) => (
  <>
    {[
      [-200, 120, 700, 0.5],
      [420, 60, 800, 0.35],
      [100, 360, 600, 0.6],
      [640, 330, 560, 0.45],
    ].map(([x, y, w, sp], i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x + f * sp * (i % 2 ? -1 : 1) + (i % 2 ? 1 : -1) * sun * 900,
          top: y - sun * 200,
          width: w,
          height: w * 0.42,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at 50% 40%, ${sun > 0.5 ? "#FFFFFF" : "#6A7390"} 0%, ${sun > 0.5 ? "#F0F6FF" : "#4E5774"} 70%, rgba(0,0,0,0) 72%)`,
          opacity: 0.95 - sun * 0.4,
        }}
      />
    ))}
  </>
);

// Rain (screen space). `wind` tilts it; `amount` 0..1.
export const Rain: React.FC<{ f: number; wind: number; amount: number }> = ({ f, wind, amount }) =>
  amount <= 0 ? null : (
    <>
      {Array.from({ length: 90 }, (_, i) => {
        const x = (i * 157) % 1240 - 80;
        const y = ((i * 263 + f * 44) % 2120) - 140;
        return <div key={i} style={{ position: "absolute", left: x - y * wind * 0.35, top: y, width: 3, height: 64, background: "rgba(200,215,255,0.45)", rotate: `${wind * 20}deg`, opacity: amount }} />;
      })}
    </>
  );

const Windows: React.FC<{ x: number; y: number; cols: number; rows: number; gx: number; gy: number; lit: (i: number) => number; seed: number }> = ({ x, y, cols, rows, gx, gy, lit, seed }) => (
  <>
    {Array.from({ length: cols * rows }, (_, i) => {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const on = lit(i) > 0.5 || Math.sin((i + 1) * 9.7 + seed) > 0.6;
      return (
        <g key={i}>
          <rect x={x + c * gx} y={y + r * gy} width={90} height={130} rx={12} fill={on ? "#FFE7A3" : "#3A4466"} />
          <rect x={x + c * gx + 43} y={y + r * gy} width={4} height={130} fill={on ? "#E6C27A" : "#2C3452"} />
        </g>
      );
    })}
  </>
);

const Balcony: React.FC<{ y: number }> = ({ y }) => (
  <g>
    <rect x={FACADE.x0 + 180} y={y} width={320} height={22} fill="#8C6A5A" />
    {Array.from({ length: 9 }, (_, i) => (
      <rect key={i} x={FACADE.x0 + 186 + i * 38} y={y - 110} width={8} height={110} fill="#5E4A44" />
    ))}
    <rect x={FACADE.x0 + 180} y={y - 118} width={320} height={12} rx={6} fill="#5E4A44" />
    <rect x={FACADE.x0 + 210} y={y - 46} width={46} height={46} rx={8} fill="#E06A5A" />
    <ellipse cx={FACADE.x0 + 233} cy={y - 60} rx={30} ry={22} fill="#5CB85C" />
  </g>
);

// The street, the building and its neighbours. `cheer` 0..1 opens and lights the windows at the end;
// `crack` 0..1 breaks the roof corner.
export const City: React.FC<{ f: number; cheer: number; crack: number }> = ({ f, cheer, crack }) => {
  const sway = Math.sin(f / 12) * 3;
  return (
    <svg viewBox="-800 -400 3200 4000" style={{ position: "absolute", left: -800, top: -400, width: 3200, height: 4000, overflow: "visible" }}>
      {/* far skyline */}
      {[[-800, 1500, 300], [-520, 1100, 260], [1700, 900, 300], [2050, 1300, 320]].map(([x, top, w], i) => (
        <rect key={i} x={x} y={top} width={w} height={GROUND - top} fill="#56607E" />
      ))}
      {/* left neighbour (short) */}
      <rect x={-460} y={1900} width={720} height={GROUND - 1900} fill="#7A6A8A" />
      <rect x={-480} y={1870} width={760} height={40} fill="#5E5070" />
      <Windows x={-400} y={1980} cols={4} rows={4} gx={160} gy={220} lit={(i) => (cheer > 0.5 && i % 3 === 0 ? 1 : 0)} seed={2} />
      {/* right neighbour */}
      <rect x={1260} y={1000} width={600} height={GROUND - 1000} fill="#6A7A96" />
      <rect x={1240} y={970} width={640} height={40} fill="#526078" />
      <Windows x={1320} y={1080} cols={3} rows={8} gx={170} gy={230} lit={(i) => (cheer > 0.5 && i % 4 === 1 ? 1 : 0)} seed={5} />
      {/* the building */}
      <rect x={FACADE.x0} y={ROOF} width={FACADE.x1 - FACADE.x0} height={GROUND - ROOF} fill="#E9A07A" />
      {Array.from({ length: 23 }, (_, i) => (
        <rect key={i} x={FACADE.x0} y={ROOF + 40 + i * 100} width={FACADE.x1 - FACADE.x0} height={4} fill="#D88A66" opacity={0.6} />
      ))}
      <Windows x={FACADE.x0 + 60} y={860} cols={4} rows={6} gx={150} gy={300} lit={(i) => (cheer > 0.5 && (i === 1 || i === 6 || i === 13 || i === 18) ? 1 : 0)} seed={8} />
      {BALCONIES.map((y) => (
        <Balcony key={y} y={y} />
      ))}
      {/* roof parapet; the left corner breaks */}
      <rect x={FACADE.x0 + 120} y={ROOF - 40} width={FACADE.x1 - FACADE.x0 - 100} height={40} fill="#B86A4E" />
      <g transform={`translate(${FACADE.x0 + 120} ${ROOF}) rotate(${-crack * 70}) translate(${-(FACADE.x0 + 120)} ${-ROOF}) translate(${-crack * 60} ${crack * 260})`} opacity={1 - Math.max(0, crack - 0.7) * 3}>
        <rect x={FACADE.x0 - 20} y={ROOF - 40} width={140} height={40} fill="#B86A4E" />
        <path d={`M ${FACADE.x0 - 20} ${ROOF} L ${FACADE.x0 + 120} ${ROOF} L ${FACADE.x0 + 100} ${ROOF + 30} L ${FACADE.x0 + 40} ${ROOF + 18} Z`} fill="#9A5440" />
      </g>
      {/* antenna */}
      <g transform={`rotate(${sway} 1050 ${ROOF - 40})`}>
        <rect x={1046} y={ROOF - 360} width={8} height={320} fill="#3A3A4A" />
        <rect x={980} y={ROOF - 330} width={140} height={8} fill="#3A3A4A" />
        <rect x={1000} y={ROOF - 270} width={100} height={8} fill="#3A3A4A" />
      </g>
      {/* drainpipe */}
      <rect x={PIPE_X + 10} y={ROOF - 20} width={30} height={GROUND - ROOF + 20} fill="#7A8296" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={PIPE_X} y={ROOF + 120 + i * 190} width={50} height={14} rx={4} fill="#5C6478" />
      ))}
      {/* shop + awning */}
      <rect x={FACADE.x0} y={2620} width={FACADE.x1 - FACADE.x0} height={GROUND - 2620} fill="#F3C7DD" />
      <rect x={FACADE.x0 + 60} y={2700} width={300} height={220} rx={14} fill="#FFE7A6" />
      <rect x={FACADE.x0 + 420} y={2680} width={160} height={GROUND - 2680} rx={10} fill="#8C3B67" />
      <text x={FACADE.x0 + 210} y={2670} textAnchor="middle" fontFamily={displayFont} fontSize={40} fill="#B8578C">BONBONS</text>
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M ${FACADE.x0 + 40 + i * 60} ${AWNING_Y} L ${FACADE.x0 + 100 + i * 60} ${AWNING_Y} L ${FACADE.x0 + 100 + i * 60} ${AWNING_Y + 60} Q ${FACADE.x0 + 70 + i * 60} ${AWNING_Y + 90} ${FACADE.x0 + 40 + i * 60} ${AWNING_Y + 60} Z`} fill={i % 2 ? "#FFF2F7" : "#F06AA8"} />
      ))}
      {/* the low wall */}
      <rect x={WALL.x0} y={WALL.top} width={WALL.x1 - WALL.x0} height={GROUND - WALL.top} fill="#A39A9A" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={WALL.x0 + (i % 2) * 40 + Math.floor(i / 2) * 80} y={WALL.top + 10 + (i % 2) * 70} width={70} height={60} fill="#8E8585" opacity={0.6} />
      ))}
      {/* sidewalk + street + puddles */}
      <rect x={-800} y={GROUND} width={3200} height={120} fill="#8D93A6" />
      <rect x={-800} y={GROUND + 120} width={3200} height={30} fill="#B5BACB" />
      <rect x={-800} y={GROUND + 150} width={3200} height={1500} fill="#4A5068" />
      {[[-200, 40], [700, 70], [1500, 50]].map(([px, py], i) => (
        <ellipse key={i} cx={px} cy={GROUND + py} rx={110} ry={16} fill="#B9C4E6" opacity={0.5 + 0.2 * Math.sin(f / 5 + i)} />
      ))}
    </svg>
  );
};

// « BRAVO ! » from the windows at the end (world coordinates).
export const Cheers: React.FC<{ f: number; from: number }> = ({ f, from }) => (
  <>
    {[
      [FACADE.x0 + 210, 1180, 0],
      [FACADE.x0 + 360, 1480, 6],
      [-250, 2200, 12],
      [1490, 1530, 3],
      [1660, 2240, 9],
    ].map(([x, y, d], i) => {
      const s = interpolate(f, [from + d, from + d + 6, from + d + 40, from + d + 46], [0, 1, 1, 0], { ...clamp });
      return s > 0 ? (
        <div key={i} style={{ position: "absolute", left: x - 120, top: y - 90, width: 240, textAlign: "center", fontFamily: displayFont, fontSize: 64, color: "white", WebkitTextStroke: "6px #E3123B", paintOrder: "stroke", scale: s, rotate: `${(i % 2 ? 1 : -1) * 8}deg` }}>
          BRAVO !
        </div>
      ) : null;
    })}
  </>
);

// A rainbow in the sky (screen space, behind the city), `t` 0..1 draws it in.
export const Rainbow: React.FC<{ t: number }> = ({ t }) =>
  t <= 0 ? null : (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, opacity: Math.min(1, t * 1.5) }}>
      {["#FF6F91", "#FFB04D", "#FFE066", "#7BD06A", "#5EC8F2", "#A78BFA"].map((c, i) => (
        <path key={c} d={`M ${-260 + i * 26} 1500 A ${820 - i * 26} ${820 - i * 26} 0 0 1 ${1380 - i * 26} 1500`} stroke={c} strokeWidth={26} fill="none" strokeDasharray={2700} strokeDashoffset={2700 * (1 - t)} opacity={0.8} />
      ))}
    </svg>
  );

// A little grey kitten, drawn around (0,0) = between its feet, about 110 units wide.
// meow 0..1 opens the mouth; scared 0..1 flattens the ears and puffs the fur; happy closes the eyes.
export const KittenShape: React.FC<{ f: number; meow?: number; scared?: number; happy?: number; lick?: number; look?: number }> = ({ f, meow = 0, scared = 0, happy = 0, lick = 0, look = 0 }) => {
  const tail = Math.sin(f / 6) * 20 * (1 - scared * 0.6);
  const tremble = scared * Math.sin(f * 2.4) * 2;
  const ear = scared * 30;
  return (
    <g transform={`translate(${tremble} 0)`}>
      <path d={`M 34 -26 C 70 -30 70 -80 ${60 + tail * 0.4} ${-100 + Math.abs(tail) * 0.2}`} stroke="#8A8FA3" strokeWidth={12} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-34} rx={44 + scared * 6} ry={34 + scared * 4} fill="#9AA0B4" />
      <ellipse cx={0} cy={-26} rx={26} ry={22} fill="#F2F3F7" />
      {[-24, -8, 8, 24].map((lx) => (
        <ellipse key={lx} cx={lx} cy={-4} rx={9} ry={7} fill="#F2F3F7" />
      ))}
      <g transform="translate(0 -84)">
        <path d={`M -34 -14 L -40 -52 L -12 -30 Z`} fill="#9AA0B4" transform={`rotate(${-ear} -26 -24)`} />
        <path d={`M 34 -14 L 40 -52 L 12 -30 Z`} fill="#9AA0B4" transform={`rotate(${ear} 26 -24)`} />
        <path d={`M -30 -20 L -34 -44 L -18 -30 Z`} fill="#F7B6C8" transform={`rotate(${-ear} -26 -24)`} />
        <path d={`M 30 -20 L 34 -44 L 18 -30 Z`} fill="#F7B6C8" transform={`rotate(${ear} 26 -24)`} />
        <ellipse rx={42} ry={36} fill="#9AA0B4" />
        <path d="M -10 -34 L -6 -20 M 0 -36 L 0 -20 M 10 -34 L 6 -20" stroke="#7A8094" strokeWidth={4} strokeLinecap="round" />
        {happy > 0.5 ? (
          <>
            <path d="M -24 -2 Q -16 -10 -8 -2" stroke="#2B2E3A" strokeWidth={4} fill="none" strokeLinecap="round" />
            <path d="M 8 -2 Q 16 -10 24 -2" stroke="#2B2E3A" strokeWidth={4} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx={-16} cy={-2} rx={11} ry={13 + scared * 2} fill="#2B2E3A" />
            <ellipse cx={16} cy={-2} rx={11} ry={13 + scared * 2} fill="#2B2E3A" />
            <circle cx={-13 + look * 4} cy={-6} r={4} fill="white" />
            <circle cx={19 + look * 4} cy={-6} r={4} fill="white" />
          </>
        )}
        <path d="M -4 10 L 4 10 L 0 15 Z" fill="#F28FA8" />
        <ellipse cx={0} cy={20} rx={7 * (0.6 + meow)} ry={2 + meow * 9} fill="#7A2F45" />
        {lick > 0 ? <ellipse cx={4} cy={26 + lick * 8} rx={6} ry={4 + lick * 8} fill="#F28FA8" /> : null}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M ${sd * 14} 12 L ${sd * 46} 6`} stroke="#E6E8EF" strokeWidth={2} />
            <path d={`M ${sd * 14} 16 L ${sd * 46} 18`} stroke="#E6E8EF" strokeWidth={2} />
          </g>
        ))}
      </g>
    </g>
  );
};

// Mélo's leaf umbrella (rig coordinates, drawn in his `over` slot).
export const LeafUmbrella: React.FC<{ open: number }> = ({ open }) =>
  open <= 0 ? null : (
    <g transform={`translate(200 70) scale(${open} 1)`}>
      <rect x={-6} y={-120} width={12} height={120} fill="#3B6E1F" />
      <path d="M -230 -110 C -200 -230 200 -230 230 -110 C 160 -140 80 -120 0 -110 C -80 -120 -160 -140 -230 -110 Z" fill="#5FBF3A" />
      <path d="M 0 -210 L 0 -110 M -120 -190 L -60 -115 M 120 -190 L 60 -115" stroke="#3B8A22" strokeWidth={5} fill="none" />
    </g>
  );
