import type React from "react";
import { Easing, Img, interpolate, staticFile } from "remotion";
import { displayFont } from "../../theme";

// The candy factory where the pink monster was born, in WORLD coordinates.
// The hall is huge on purpose: the monster is tiny in it.
export const FLOOR = 2650;
export const BELT = 2250; // conveyor top
export const BELT_START = 200;
export const BELT_END = 3400;
export const NOZZLE: [number, number] = [520, 1900]; // bubble machine nozzle tip
export const BIRTH_BUBBLE: [number, number] = [640, 1900]; // where the first bubble grows
export const DRIP: [number, number] = [640, 1480]; // filling pipe tap
export const SCAN_X = 1900; // quality-control scanner
export const TRAP_X = 2000; // trapdoor in the belt, right after the scanner
export const BIN_X = 2040; // reject bin under the belt
export const TASTE_X = 2900; // tasting machine
export const DRIP_Y = 1960; // dripper pipe along the line
export const PLATFORM_Y = 1750;
export const PACK_X = 4700;
export const PACK_W = 300;
export const PACK_H = 553;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------- exterior (screen space)
export const Exterior: React.FC<{ f: number }> = ({ f }) => {
  const push = interpolate(f, [0, 95], [1, 1.9], { ...clamp, easing: Easing.in(Easing.quad) });
  const flash = f % 60 > 52 && f % 60 < 56 ? 0.5 : 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "linear-gradient(180deg, #0B1033 0%, #1D1F5C 60%, #3B2A6E 100%)" }}>
      {Array.from({ length: 40 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 211) % 1080, top: (i * 97) % 900, width: 4, height: 4, borderRadius: 2, background: "white", opacity: 0.3 + 0.5 * Math.abs(Math.sin(f / 15 + i)) }} />
      ))}
      <div style={{ position: "absolute", left: 760, top: 210, width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, #FFFBE6, #F4E7B0)", boxShadow: "0 0 90px 30px rgba(255,245,200,0.35)" }} />
      <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, scale: push, transformOrigin: "50% 62%" }}>
        {/* the factory */}
        <rect x={120} y={1060} width={840} height={760} fill="#1A1440" />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${120 + i * 140} 1060 L ${190 + i * 140} 960 L ${260 + i * 140} 1060 Z`} fill="#241B55" />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M ${190 + i * 140} 960 L ${260 + i * 140} 1060 L ${236 + i * 140} 1060 L ${190 + i * 140} 994 Z`} fill="#6E7BD6" opacity={0.35} />
        ))}
        <rect x={780} y={760} width={80} height={300} fill="#140F33" />
        <rect x={770} y={740} width={100} height={30} fill="#241B55" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={820 + Math.sin(f / 20 + i) * 20} cy={700 - i * 70 - (f % 40)} r={30 + i * 12} fill="#3B3570" opacity={0.5 - i * 0.12} />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <rect key={i} x={170 + (i % 6) * 130} y={1180 + Math.floor(i / 6) * 220} width={80} height={130} rx={12} fill={(i * 7) % 5 === 0 ? "#FFD978" : "#2C2366"} opacity={(i * 7) % 5 === 0 ? 0.8 : 1} />
        ))}
        {/* sign, unlit */}
        <rect x={300} y={1080} width={480} height={80} rx={16} fill="#2C2366" stroke="#4A3F8C" strokeWidth={4} />
        <text x={540} y={1137} textAnchor="middle" fontFamily={displayFont} fontSize={56} fill="#5A4E9E">BOUM BOUM</text>
        <rect x={0} y={1820} width={1080} height={100} fill="#100C28" />
      </svg>
      {/* rain */}
      {Array.from({ length: 70 }, (_, i) => {
        const x = (i * 157) % 1180 - 60;
        const y = ((i * 263 + f * 38) % 2100) - 120;
        return <div key={i} style={{ position: "absolute", left: x - y * 0.15, top: y, width: 3, height: 60, background: "rgba(180,200,255,0.35)", rotate: "9deg" }} />;
      })}
      <div style={{ position: "absolute", inset: 0, background: "white", opacity: flash }} />
    </div>
  );
};

// ---------------------------------------------------------------- the hall
const Window: React.FC<{ x: number; y: number; w: number; h: number; f: number; bolt: number }> = ({ x, y, w, h, f, bolt }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={w / 2} fill="#141A4A" />
    <rect x={x + 16} y={y + 16} width={w - 32} height={h - 32} rx={(w - 32) / 2} fill="#20296B" />
    {Array.from({ length: 10 }, (_, i) => {
      const ry = y + 30 + ((i * 97 + f * 30) % (h - 60));
      return <rect key={i} x={x + 24 + ((i * 53) % (w - 48))} y={ry} width={3} height={36} fill="#7F8DE0" opacity={0.5} />;
    })}
    {bolt > 0 ? (
      <path d={`M ${x + w * 0.55} ${y + 20} L ${x + w * 0.4} ${y + h * 0.4} L ${x + w * 0.6} ${y + h * 0.45} L ${x + w * 0.42} ${y + h - 30}`} stroke="#FFFFFF" strokeWidth={10} fill="none" opacity={bolt} />
    ) : null}
    <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill="#141A4A" />
    <rect x={x} y={y + h * 0.45} width={w} height={12} fill="#141A4A" />
  </g>
);

const Lamp: React.FC<{ x: number; y: number; on: number }> = ({ x, y, on }) => (
  <g>
    <rect x={x - 4} y={-1200} width={8} height={y + 1200} fill="#2A2350" />
    <path d={`M ${x - 70} ${y + 60} L ${x + 70} ${y + 60} L ${x + 40} ${y} L ${x - 40} ${y} Z`} fill="#3B3570" />
    <ellipse cx={x} cy={y + 62} rx={40} ry={14} fill={on > 0.5 ? "#FFF3C4" : "#4A4380"} />
    {on > 0 ? <path d={`M ${x - 60} ${y + 64} L ${x + 60} ${y + 64} L ${x + 380} ${FLOOR} L ${x - 380} ${FLOOR} Z`} fill="#FFE9A8" opacity={0.2 * on} /> : null}
  </g>
);

const Gear: React.FC<{ x: number; y: number; r: number; a: number; color: string }> = ({ x, y, r, a, color }) => (
  <g transform={`translate(${x} ${y}) rotate(${a})`}>
    {Array.from({ length: 10 }, (_, i) => (
      <rect key={i} x={-r * 0.14} y={-r * 1.18} width={r * 0.28} height={r * 0.4} fill={color} transform={`rotate(${i * 36})`} />
    ))}
    <circle r={r} fill={color} />
    <circle r={r * 0.35} fill="#140F33" />
  </g>
);

// Everything that does not move much: walls, windows, pipes, catwalk, machines' bodies.
export const Hall: React.FC<{ f: number; power: number; bolt: number; beltPos: number }> = ({ f, power, bolt, beltPos }) => {
  const spin = beltPos * 0.6;
  return (
    <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
      <defs>
        <linearGradient id="hallWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E2462" />
          <stop offset="100%" stopColor="#3B2E80" />
        </linearGradient>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C9D3FF" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#C9D3FF" stopOpacity={0} />
        </linearGradient>
      </defs>
      <rect x={-800} y={-1200} width={6400} height={FLOOR + 1200} fill="url(#hallWall)" />
      {/* glass roof (sawtooth) */}
      {Array.from({ length: 16 }, (_, i) => (
        <g key={i}>
          <path d={`M ${-800 + i * 400} -900 L ${-600 + i * 400} -1200 L ${-400 + i * 400} -900 Z`} fill="#20296B" />
          <path d={`M ${-600 + i * 400} -1200 L ${-400 + i * 400} -900 L ${-450 + i * 400} -900 L ${-600 + i * 400} -1125 Z`} fill="#6E7BD6" opacity={0.25 + bolt * 0.6} />
        </g>
      ))}
      <rect x={-800} y={-920} width={6400} height={40} fill="#0F1238" />
      {/* tall windows with rain + moonbeams */}
      {[-500, 900, 2300, 3700].map((wx) => (
        <g key={wx}>
          <Window x={wx} y={-700} w={360} h={1100} f={f} bolt={bolt} />
          <path d={`M ${wx + 20} 400 L ${wx + 340} 400 L ${wx + 900} ${FLOOR} L ${wx + 300} ${FLOOR} Z`} fill="url(#beam)" opacity={1 - power * 0.6} />
        </g>
      ))}
      {/* pipes along the wall */}
      <path d="M -800 -300 L 5600 -300" stroke="#2F2A66" strokeWidth={50} />
      <path d="M -800 -200 L 5600 -200" stroke="#3A3478" strokeWidth={26} />
      <path d={`M 600 -1150 L 600 -600 L 300 -600 L 300 1420`} stroke="#3A3478" strokeWidth={30} fill="none" />
      {/* catwalk */}
      <rect x={-800} y={1150} width={6400} height={30} fill="#2B2560" />
      {Array.from({ length: 64 }, (_, i) => (
        <rect key={i} x={-800 + i * 100} y={1060} width={8} height={90} fill="#2B2560" />
      ))}
      <rect x={-800} y={1056} width={6400} height={10} fill="#2B2560" />
      {/* background gears */}
      <Gear x={1300} y={700} r={160} a={spin} color="#272063" />
      <Gear x={1530} y={850} r={100} a={-spin * 1.6} color="#2E2770" />
      <Gear x={3200} y={600} r={200} a={-spin * 0.8} color="#272063" />
      <Gear x={4300} y={800} r={130} a={spin * 1.2} color="#2E2770" />
      {/* hanging lamps */}
      {[0, 1100, 2200, 3300, 4400].map((lx) => (
        <Lamp key={lx} x={lx + 200} y={900} on={power} />
      ))}
      {/* floor */}
      <rect x={-800} y={FLOOR} width={6400} height={400} fill="#1B1640" />
      <rect x={-800} y={FLOOR} width={6400} height={16} fill="#3A3478" />

      {/* filling tank (up high) with the pipe down to the tap */}
      <g>
        <rect x={500} y={700} width={280} height={420} rx={60} fill="#7A1630" />
        <rect x={520} y={720} width={240} height={380} rx={50} fill="#A51C3E" />
        <ellipse cx={600} cy={800} rx={50} ry={90} fill="#E0164A" opacity={0.5} />
        <text x={640} y={960} textAnchor="middle" fontFamily={displayFont} fontSize={60} fill="#FFD3E3" opacity={0.7 + power * 0.3}>COULIS</text>
        <rect x={628} y={1120} width={24} height={DRIP[1] - 1120} fill="#5A1024" />
        <rect x={610} y={DRIP[1] - 20} width={60} height={30} rx={8} fill="#3F0A1A" />
      </g>
      {/* bubble machine: tank on legs, gauges, horizontal nozzle */}
      <g>
        <rect x={250} y={2000} width={20} height={FLOOR - 2000} fill="#2F2A66" />
        <rect x={430} y={2000} width={20} height={FLOOR - 2000} fill="#2F2A66" />
        <rect x={200} y={1420} width={300} height={600} rx={60} fill="#B8578C" />
        <rect x={220} y={1440} width={260} height={560} rx={50} fill="#F06AA8" />
        <ellipse cx={290} cy={1540} rx={30} ry={70} fill="white" opacity={0.25} />
        <text x={350} y={1530} textAnchor="middle" fontFamily={displayFont} fontSize={54} fill="#FFF3F8">BULLES</text>
        <g transform="translate(350 1680)">
          <circle r={70} fill="#FFF3F8" stroke="#8C3B67" strokeWidth={8} />
          {[-60, -30, 0, 30, 60].map((a) => (
            <rect key={a} x={-3} y={-62} width={6} height={14} fill="#8C3B67" transform={`rotate(${a})`} />
          ))}
          <path d="M 0 0 L 0 -52" stroke="#E3123B" strokeWidth={8} strokeLinecap="round" transform={`rotate(${-70 + power * (120 + Math.sin(f / 4) * 10)})`} />
          <circle r={10} fill="#8C3B67" />
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={250 + i * 42} y={1950} width={28} height={16} rx={6} fill={power > 0.5 && Math.floor(f / 5 + i) % 3 === 0 ? "#7BFF8A" : "#3B3570"} />
        ))}
        <rect x={480} y={NOZZLE[1] - 26} width={NOZZLE[0] - 470} height={52} rx={14} fill="#8C3B67" />
        <rect x={NOZZLE[0] - 20} y={NOZZLE[1] - 34} width={26} height={68} rx={8} fill="#5A2E4A" />
      </g>
      {/* conveyor belt */}
      <g>
        {Array.from({ length: Math.floor((BELT_END - BELT_START) / 400) + 1 }, (_, i) => (
          <rect key={i} x={BELT_START + 60 + i * 400} y={BELT + 60} width={24} height={FLOOR - BELT - 60} fill="#2F2A66" />
        ))}
        <rect x={BELT_START} y={BELT} width={BELT_END - BELT_START} height={70} rx={35} fill="#2B2B3A" />
        <clipPath id="beltClip">
          <rect x={BELT_START} y={BELT} width={BELT_END - BELT_START} height={70} rx={35} />
        </clipPath>
        <g clipPath="url(#beltClip)">
          {Array.from({ length: Math.floor((BELT_END - BELT_START) / 80) + 2 }, (_, i) => (
            <path key={i} d={`M ${BELT_START + i * 80 + (beltPos % 80) - 80} ${BELT + 6} l 30 29 l -30 29`} stroke="#4A4A60" strokeWidth={10} fill="none" />
          ))}
        </g>
        {[BELT_START + 35, BELT_END - 35].map((rx) => (
          <Gear key={rx} x={rx} y={BELT + 35} r={30} a={beltPos * 2} color="#575770" />
        ))}
        <rect x={BELT_START} y={BELT + 66} width={BELT_END - BELT_START} height={16} fill="#E3123B" />
      </g>
      {/* the drop at the end of the line: a dark pit with turning gears */}
      <rect x={BELT_END + 40} y={BELT + 120} width={600} height={1000} fill="#0C0A22" />
      <Gear x={BELT_END + 220} y={FLOOR + 40} r={150} a={spin * 1.5} color="#1E1950" />
      <Gear x={BELT_END + 470} y={FLOOR - 80} r={110} a={-spin * 2} color="#241E5C" />
      {/* quality-control scanner (frame; the beam is drawn separately) */}
      <g>
        <rect x={SCAN_X - 220} y={1640} width={50} height={BELT - 1640 + 80} fill="#3B3570" />
        <rect x={SCAN_X + 170} y={1640} width={50} height={BELT - 1640 + 80} fill="#3B3570" />
        <rect x={SCAN_X - 250} y={1590} width={500} height={170} rx={30} fill="#4A4290" />
        <text x={SCAN_X} y={1580} textAnchor="middle" fontFamily={displayFont} fontSize={50} fill="#9AA0E8">CONTRÔLE</text>
      </g>
      {/* reject bin (back), under the belt */}
      <rect x={BIN_X - 190} y={2440} width={380} height={FLOOR - 2440} rx={16} fill="#241E5C" />
      {/* tasting machine (tower; probe + meter drawn separately) */}
      <g>
        <rect x={TASTE_X + 200} y={1250} width={90} height={FLOOR - 1250} fill="#3B3570" />
        <rect x={TASTE_X - 60} y={1300} width={350} height={80} rx={30} fill="#4A4290" />
        <rect x={TASTE_X - 40} y={1380} width={80} height={60} rx={14} fill="#5D5D80" />
      </g>
      {/* dripper pipe along the line (fed by the filling tank) */}
      <path d={`M 652 1480 L 652 ${DRIP_Y} L ${BELT_END - 20} ${DRIP_Y}`} stroke="#5A1024" strokeWidth={22} fill="none" />
      {Array.from({ length: 26 }, (_, i) => (
        <path key={i} d={`M ${300 + i * 120 - 16} ${DRIP_Y + 8} L ${300 + i * 120 + 16} ${DRIP_Y + 8} L ${300 + i * 120 + 6} ${DRIP_Y + 34} L ${300 + i * 120 - 6} ${DRIP_Y + 34} Z`} fill="#3F0A1A" />
      ))}
      {/* printing platform */}
      <g>
        <rect x={4200} y={PLATFORM_Y} width={760} height={50} rx={16} fill="#4A4290" />
        {[4260, 4880].map((lx) => (
          <rect key={lx} x={lx} y={PLATFORM_Y + 50} width={40} height={FLOOR - PLATFORM_Y - 50} fill="#3B3570" />
        ))}
        <rect x={PACK_X - 260} y={1000} width={30} height={PLATFORM_Y - 1000} fill="#3B3570" />
        <rect x={PACK_X + 230} y={1000} width={30} height={PLATFORM_Y - 1000} fill="#3B3570" />
        <rect x={PACK_X - 280} y={980} width={560} height={40} rx={12} fill="#4A4290" />
      </g>
    </svg>
  );
};

// The very first pack: blank, then printed top to bottom (`print` 0..1) with the real Fraise pack.
export const FirstPack: React.FC<{ print: number; glow: number }> = ({ print, glow }) => {
  const top = PLATFORM_Y - PACK_H;
  const left = PACK_X - PACK_W / 2;
  return (
    <>
      <div style={{ position: "absolute", left, top, width: PACK_W, height: PACK_H, borderRadius: 26, background: "linear-gradient(90deg, #F2F2F7, #FFFFFF 50%, #E6E6EE)", boxShadow: `0 0 ${60 * glow}px ${20 * glow}px rgba(255,220,240,${0.8 * glow})` }}>
        <div style={{ position: "absolute", left: 30, right: 30, top: 60, height: 120, border: "6px dashed #D0D0DC", borderRadius: 20 }} />
        <div style={{ position: "absolute", left: 60, right: 60, top: 240, height: 200, border: "6px dashed #D0D0DC", borderRadius: "50%" }} />
      </div>
      <div style={{ position: "absolute", left, top, width: PACK_W, height: PACK_H * print, overflow: "hidden" }}>
        <Img src={staticFile("pack-fraise.webp")} style={{ width: PACK_W, height: PACK_H, display: "block" }} />
      </div>
    </>
  );
};

// Printer gantry: a bar with a glowing print head at `y` (world).
export const PrinterHead: React.FC<{ y: number; on: number }> = ({ y, on }) => (
  <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
    <rect x={PACK_X - 250} y={y - 30} width={500} height={60} rx={16} fill="#5D5D80" />
    <rect x={PACK_X - 200} y={y + 24} width={400} height={14} rx={7} fill="#7BFFF0" opacity={on} />
    <path d={`M ${PACK_X - 200} ${y + 38} L ${PACK_X + 200} ${y + 38} L ${PACK_X + 170} ${y + 90} L ${PACK_X - 170} ${y + 90} Z`} fill="#7BFFF0" opacity={0.25 * on} />
    {[-160, -80, 0, 80, 160].map((dx) => (
      <circle key={dx} cx={PACK_X + dx} cy={y} r={10} fill={on > 0.5 ? "#FFD84D" : "#3B3570"} />
    ))}
  </svg>
);

// Little electric sparks travelling along the pipe from the roof to the machine.
export const SPARK_PATH: [number, number][] = [[600, -1150], [600, -600], [300, -600], [300, 1420]];
export const pointOnPath = (path: [number, number][], t: number): [number, number] => {
  const lens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  const total = lens.reduce((a, b) => a + b, 0);
  let d = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i]) {
      const k = d / lens[i];
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * k, path[i][1] + (path[i + 1][1] - path[i][1]) * k];
    }
    d -= lens[i];
  }
  return path[path.length - 1];
};


// One gum on the line. `filled` 0..1 gives it a glowing liquid heart.
export const LineGum: React.FC<{ x: number; filled: number; scanned?: number }> = ({ x, filled, scanned = 0 }) => {
  const w = 200;
  const h = 160;
  return (
    <svg viewBox="0 0 300 240" style={{ position: "absolute", left: x - w / 2, top: BELT - h + 10, width: w, height: h, overflow: "visible" }}>
      {filled > 0 ? <circle cx={80} cy={125} r={110 + filled * 40} fill="#FF6F91" opacity={0.35 * filled} /> : null}
      <path d="M 70 40 L 240 40 C 290 40 300 210 240 210 L 70 210 Z" fill="#E8B9CC" />
      <path d="M 70 40 L 240 40 C 270 40 285 90 288 120 L 70 120 Z" fill="#F4D3E1" />
      <ellipse cx={80} cy={125} rx={70} ry={86} fill="#D9A1B8" />
      <ellipse cx={80} cy={125} rx={60} ry={76} fill="#F6E4EC" />
      <ellipse cx={170} cy={58} rx={60} ry={9} fill="white" opacity={0.35} />
      <g opacity={filled}>
        <ellipse cx={80} cy={125} rx={54} ry={70} fill="#FF8FB0" opacity={0.6} />
        <path d="M 52 95 C 70 70 112 80 112 110 C 112 140 92 150 86 175 C 82 196 56 196 56 172 C 56 150 36 125 52 95 Z" fill="#E0164A" />
        <ellipse cx={72} cy={100} rx={14} ry={8} fill="white" opacity={0.75} transform="rotate(-30 72 100)" />
      </g>
      {scanned > 0 ? <text x={150} y={-20} textAnchor="middle" fontFamily={displayFont} fontSize={90} fill="#7BFF8A" opacity={scanned}>✓</text> : null}
    </svg>
  );
};

// Scanner beam + status screen + siren. state: 0 idle, 1 OK (green), 2 alarm (red).
export const ScannerFX: React.FC<{ f: number; state: number; power: number }> = ({ f, state, power }) => {
  const alarm = state === 2;
  const flash = alarm ? 0.6 + 0.4 * Math.sign(Math.sin(f * 1.3)) : 1;
  const c = alarm ? "#FF4F4F" : "#7BFF8A";
  return (
    <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
      <path d={`M ${SCAN_X - 130} 1760 L ${SCAN_X + 130} 1760 L ${SCAN_X + 175} ${BELT} L ${SCAN_X - 175} ${BELT} Z`} fill={c} opacity={power * (alarm ? 0.32 * flash : state === 1 ? 0.3 : 0.14)} />
      <rect x={SCAN_X - 150} y={1752} width={300} height={14} rx={7} fill={c} opacity={power} />
      <rect x={SCAN_X - 130} y={1620} width={260} height={110} rx={16} fill="#141238" />
      <text x={SCAN_X} y={1700} textAnchor="middle" fontFamily={displayFont} fontSize={alarm ? 58 : 80} fill={state === 0 ? "#3B3570" : c} opacity={alarm ? flash : 1}>
        {alarm ? "DÉFAUT" : "✓"}
      </text>
      <circle cx={SCAN_X} cy={1560} r={26} fill={alarm ? "#FF4F4F" : "#5A2030"} opacity={flash} />
      {alarm ? <circle cx={SCAN_X} cy={1560} r={90} fill="#FF4F4F" opacity={0.25 * flash} /> : null}
    </svg>
  );
};

// Trapdoor in the belt: `open` 0..1.
export const Trapdoor: React.FC<{ open: number }> = ({ open }) =>
  open <= 0 ? null : (
    <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
      <rect x={TRAP_X - 130} y={BELT} width={260} height={70} fill="#0C0A22" />
      <rect x={TRAP_X - 130} y={BELT} width={260} height={30} rx={8} fill="#3A3A4E" transform={`rotate(${open * 82} ${TRAP_X - 130} ${BELT})`} />
    </svg>
  );

// Front wall of the reject bin (drawn over the monster).
export const BinFront: React.FC = () => (
  <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
    <rect x={BIN_X - 200} y={2510} width={400} height={FLOOR - 2510} rx={14} fill="#4A4290" />
    <rect x={BIN_X - 200} y={2510} width={400} height={22} fill="url(#hazard)" />
    <defs>
      <pattern id="hazard" width="40" height="22" patternUnits="userSpaceOnUse">
        <rect width="20" height="22" fill="#FFD84D" />
        <rect x="20" width="20" height="22" fill="#2B2560" />
      </pattern>
    </defs>
    <text x={BIN_X} y={2610} textAnchor="middle" fontFamily={displayFont} fontSize={56} fill="#9AA0E8">DÉFAUTS</text>
  </svg>
);

// Tasting machine: probe (tip at `probe` world y) and the flavour meter (needle in degrees, -70 = « Bof », +75 = max).
export const Taster: React.FC<{ probe: number; needle: number; wow: number }> = ({ probe, needle, wow }) => {
  const mx = TASTE_X + 250;
  const my = 1080;
  const arc = (a0: number, a1: number, r: number) => {
    const p = (a: number) => [mx + Math.sin((a * Math.PI) / 180) * r, my - Math.cos((a * Math.PI) / 180) * r];
    const [x0, y0] = p(a0);
    const [x1, y1] = p(a1);
    return `M ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1}`;
  };
  return (
    <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
      <rect x={TASTE_X - 14} y={1420} width={28} height={probe - 1420} fill="#8A8AA8" />
      <circle cx={TASTE_X} cy={probe} r={24} fill="#F06AA8" />
      {wow > 0 ? <circle cx={mx} cy={my} r={260 + wow * 60} fill="#FFD84D" opacity={0.25 * wow} /> : null}
      <circle cx={mx} cy={my} r={190} fill="#141238" stroke="#4A4290" strokeWidth={18} />
      <path d={arc(-75, -30, 150)} stroke="#6E6E8A" strokeWidth={28} fill="none" />
      <path d={arc(-28, 10, 150)} stroke="#FFD84D" strokeWidth={28} fill="none" />
      <path d={arc(12, 45, 150)} stroke="#FF9A3C" strokeWidth={28} fill="none" />
      <path d={arc(47, 78, 150)} stroke="#FF4F8B" strokeWidth={28} fill="none" />
      <text x={mx - 120} y={my + 90} textAnchor="middle" fontFamily={displayFont} fontSize={40} fill="#9AA0E8">bof</text>
      <text x={mx + 110} y={my + 90} textAnchor="middle" fontFamily={displayFont} fontSize={40} fill="#FF8FB8">waouh</text>
      <path d={`M ${mx} ${my} L ${mx} ${my - 135}`} stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" transform={`rotate(${needle} ${mx} ${my})`} />
      <circle cx={mx} cy={my} r={22} fill="#FFFFFF" />
      <text x={mx} y={my - 220} textAnchor="middle" fontFamily={displayFont} fontSize={52} fill="#9AA0E8">GOÛTOMÈTRE</text>
    </svg>
  );
};

// Dripper valves light up when the filling flows (`on` 0..1).
export const DripperLights: React.FC<{ on: number }> = ({ on }) =>
  on <= 0 ? null : (
    <svg viewBox="-800 -1200 6400 4200" style={{ position: "absolute", left: -800, top: -1200, width: 6400, height: 4200, overflow: "visible" }}>
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={300 + i * 120} cy={DRIP_Y} r={14} fill="#FF6F91" opacity={on} />
      ))}
    </svg>
  );
