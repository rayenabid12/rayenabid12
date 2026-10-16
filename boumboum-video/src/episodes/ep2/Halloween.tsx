import type React from "react";
import { useId } from "react";
import { interpolateColors, useCurrentFrame } from "remotion";

// Episode 2 props, drawn in the same glossy candy style as the mascot.

const INK = "#2A0F33";

// The ghost: posable, with a wavy tail and a pink "covered in gum" state.
// Drawn centered on (0,0) in a 300x360 box; `size` is the on-screen width.
export type GhostPose = {
  mouth?: number; // 0 closed .. 1 wide "BOUH"
  happy?: number; // 0 .. 1 closed "^ ^" eyes
  scared?: number; // 0 .. 1 big round eyes
  pink?: number; // 0 white .. 1 covered in pink gum
  arms?: number; // 0 down .. 1 raised spooky
  lean?: number; // degrees
  tongue?: number;
};

export const Ghost: React.FC<GhostPose & { readonly x: number; readonly y: number; readonly size: number }> = ({
  x,
  y,
  size,
  mouth = 0.2,
  happy = 0,
  scared = 0,
  pink = 0,
  arms = 0,
  lean = 0,
  tongue = 0,
}) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const s = size / 300;
  const body = interpolateColors(pink, [0, 1], ["#F6F2FF", "#F9A6CB"]);
  const shade = interpolateColors(pink, [0, 1], ["#C9C0E8", "#E5679F"]);
  const bob = Math.sin(frame / 9) * 10;
  // wavy tail: five scallops, gently rippling
  const tail = Array.from({ length: 5 }, (_, i) => {
    const x0 = 110 - i * 44;
    return `Q ${x0 - 22} ${(152 + Math.sin(frame / 5 + i) * 8).toFixed(1)} ${x0 - 44} 118`;
  }).join(" ");
  const d = `M -110 10 C -110 -90 -60 -150 0 -150 C 60 -150 110 -90 110 10 L 110 118 ${tail} Z`;
  const eyeRy = 26 * (1 + scared * 0.45);
  const eyeRx = 18 * (1 + scared * 0.35);
  return (
    <svg
      viewBox="-150 -190 300 360"
      style={{
        position: "absolute",
        width: size,
        height: size * 1.2,
        left: x - size / 2,
        top: y - size * 0.63 + bob * s,
        overflow: "visible",
        rotate: `${lean}deg`,
        filter: pink < 0.5 ? "drop-shadow(0 0 30px rgba(220,210,255,0.55))" : "drop-shadow(0 16px 18px rgba(0,0,0,0.25))",
      }}
    >
      <defs>
        <radialGradient id={`g${id}`} cx="40%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="55%" stopColor={body} />
          <stop offset="100%" stopColor={shade} />
        </radialGradient>
      </defs>
      {/* arms */}
      {[-1, 1].map((side) => (
        <ellipse
          key={side}
          cx={side * 118}
          cy={20}
          rx={26}
          ry={44}
          fill={`url(#g${id})`}
          transform={`rotate(${side * (20 + arms * 110)} ${side * 100} ${-10})`}
        />
      ))}
      <path d={d} fill={`url(#g${id})`} />
      <ellipse cx={-40} cy={-110} rx={34} ry={14} fill="white" opacity={0.6} transform="rotate(-25 -40 -110)" />
      {/* face */}
      {happy > 0.5 ? (
        [-40, 40].map((ex) => (
          <path key={ex} d={`M ${ex - 20} -44 Q ${ex} -76 ${ex + 20} -44`} stroke={INK} strokeWidth={9} strokeLinecap="round" fill="none" />
        ))
      ) : (
        [-40, 40].map((ex) => (
          <g key={ex}>
            <ellipse cx={ex} cy={-50} rx={eyeRx} ry={eyeRy} fill={INK} />
            <circle cx={ex - 5} cy={-60} r={5} fill="white" opacity={0.85} />
          </g>
        ))
      )}
      <ellipse cx={0} cy={14} rx={22 + mouth * 22} ry={8 + mouth * 30} fill={INK} />
      {tongue > 0 ? <ellipse cx={0} cy={26 + mouth * 18} rx={14} ry={10 * tongue + 4} fill="#E8456E" /> : null}
      {pink > 0.2 ? (
        <g opacity={(pink - 0.2) / 0.8}>
          {/* gum blobs and drips */}
          <circle cx={-70} cy={-100} r={20} fill="#F7A3C8" />
          <circle cx={78} cy={-60} r={16} fill="#F7A3C8" />
          <path d="M 30 -140 C 50 -150 70 -130 60 -110 C 56 -98 66 -80 54 -76 C 44 -72 44 -92 40 -104 C 36 -116 16 -132 30 -140 Z" fill="#F7A3C8" />
          <path d="M -96 40 C -90 60 -92 80 -84 92 C -78 102 -66 96 -70 84 C -74 70 -82 54 -96 40 Z" fill="#F7A3C8" />
          <circle cx={-60} cy={-10} r={14} fill="#EE79B1" opacity={0.6} />
          <circle cx={60} cy={-10} r={14} fill="#EE79B1" opacity={0.6} />
        </g>
      ) : null}
    </svg>
  );
};

// A cute jack-o'-lantern. viewBox 0 0 300 240.
export const Pumpkin: React.FC<{ readonly style?: React.CSSProperties; readonly glow?: number }> = ({ style, glow = 1 }) => {
  const id = useId().replace(/:/g, "");
  const frame = useCurrentFrame();
  const flicker = 0.8 + Math.sin(frame / 3) * 0.1 + Math.sin(frame / 7) * 0.1;
  return (
    <svg viewBox="0 0 300 240" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`p${id}`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FFB45C" />
          <stop offset="60%" stopColor="#F27A1A" />
          <stop offset="100%" stopColor="#B4500C" />
        </radialGradient>
      </defs>
      <ellipse cx={150} cy={232} rx={130} ry={10} fill="black" opacity={0.25} />
      {[[-80, 60], [80, 60], [-35, 78], [35, 78], [0, 84]].map(([dx, rx], i) => (
        <ellipse key={i} cx={150 + dx} cy={140} rx={rx} ry={95} fill={`url(#p${id})`} stroke="#C8600F" strokeWidth={3} />
      ))}
      <path d="M 146 52 C 140 30 150 14 168 10 L 172 22 C 160 26 156 38 160 52 Z" fill="#4E7A2A" />
      <g opacity={glow * flicker}>
        <path d="M 88 110 L 118 82 L 130 116 Z" fill="#FFE27A" />
        <path d="M 212 110 L 182 82 L 170 116 Z" fill="#FFE27A" />
        <path d="M 90 150 Q 150 210 210 150 Q 190 166 176 160 L 166 176 L 150 162 L 134 176 L 124 160 Q 110 166 90 150 Z" fill="#FFE27A" />
      </g>
      <ellipse cx={100} cy={92} rx={22} ry={10} fill="white" opacity={0.3} transform="rotate(-30 100 92)" />
    </svg>
  );
};

// A little bat, flapping. viewBox -60 -30 120 60.
export const Bat: React.FC<{ readonly x: number; readonly y: number; readonly size: number; readonly phase?: number }> = ({ x, y, size, phase = 0 }) => {
  const frame = useCurrentFrame();
  const flap = Math.sin(frame / 2 + phase);
  return (
    <svg viewBox="-60 -30 120 60" style={{ position: "absolute", left: x - size / 2, top: y - size / 4, width: size, height: size / 2, overflow: "visible" }}>
      <g transform={`scale(1 ${0.4 + 0.6 * Math.abs(flap)})`}>
        <path d="M 0 0 C -20 -20 -40 -22 -58 -8 C -46 -6 -42 4 -36 8 C -30 0 -22 2 -16 8 C -12 0 -6 0 0 6 Z" fill="#2A1238" />
        <path d="M 0 0 C 20 -20 40 -22 58 -8 C 46 -6 42 4 36 8 C 30 0 22 2 16 8 C 12 0 6 0 0 6 Z" fill="#2A1238" />
      </g>
      <ellipse cx={0} cy={2} rx={10} ry={12} fill="#3A1A4E" />
      <circle cx={-4} cy={-1} r={2.4} fill="#FFE27A" />
      <circle cx={4} cy={-1} r={2.4} fill="#FFE27A" />
    </svg>
  );
};

// A spooky (but sweet) candy house with a creaking door. viewBox 0 0 440 820.
export const SpookyHouse: React.FC<{ readonly style?: React.CSSProperties; readonly door?: number; readonly eyes?: number }> = ({
  style,
  door = 0,
  eyes = 0,
}) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const blink = frame % 40 < 3 ? 0.1 : 1;
  return (
    <svg viewBox="0 0 440 820" style={{ overflow: "visible", ...style }}>
      <defs>
        <linearGradient id={`h${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7B3FA0" />
          <stop offset="100%" stopColor="#4E2470" />
        </linearGradient>
      </defs>
      <rect x={30} y={250} width={380} height={570} rx={18} fill={`url(#h${id})`} />
      <path d="M 0 270 L 220 60 L 440 270 Z" fill="#3A1A55" />
      {/* pink gum dripping off the roof */}
      <path d="M 10 262 L 430 262 L 430 282 Q 410 320 396 282 Q 370 300 352 282 Q 330 340 312 282 Q 280 300 260 282 Q 240 330 222 282 Q 190 300 170 282 Q 150 326 130 282 Q 100 300 82 282 Q 64 316 48 282 Q 30 296 10 282 Z" fill="#F78CC0" />
      <circle cx={220} cy={170} r={44} fill="#FFE27A" opacity={0.9} />
      <circle cx={220} cy={170} r={44} fill="none" stroke="#2A1238" strokeWidth={10} />
      <path d="M 220 126 L 220 214 M 176 170 L 264 170" stroke="#2A1238" strokeWidth={8} />
      {/* door */}
      <rect x={110} y={400} width={220} height={420} rx={110} fill="#120A1E" />
      {eyes > 0 ? (
        <g opacity={eyes}>
          <ellipse cx={192} cy={560} rx={14} ry={20 * blink} fill="#FFF7D6" />
          <ellipse cx={248} cy={560} rx={14} ry={20 * blink} fill="#FFF7D6" />
        </g>
      ) : null}
      <g transform={`translate(110 0) scale(${1 - door * 0.88} 1) translate(-110 0)`}>
        <path d="M 110 820 L 110 510 C 110 450 160 400 220 400 C 280 400 330 450 330 510 L 330 820 Z" fill="#9A4FC2" stroke="#3A1A55" strokeWidth={8} />
        <circle cx={300} cy={620} r={12} fill="#FFE27A" />
        <path d="M 150 520 L 290 520 M 150 640 L 290 640" stroke="#7B3FA0" strokeWidth={8} />
      </g>
    </svg>
  );
};

// Ghost-sheet costume, in rig space (drawn over the mascot). His real eyes show through the holes.
export const SHEET_PATH =
  "M 200 40 C 300 40 372 110 372 220 C 372 280 380 330 384 362 Q 352 392 320 362 Q 288 394 256 364 Q 224 396 192 364 Q 160 396 128 364 Q 96 394 64 362 Q 34 390 16 360 C 20 330 28 280 28 220 C 28 110 100 40 200 40 Z " +
  "M 109 190 A 36 42 0 1 0 181 190 A 36 42 0 1 0 109 190 Z M 219 190 A 36 42 0 1 0 291 190 A 36 42 0 1 0 219 190 Z";

export const Sheet: React.FC = () => {
  const id = useId().replace(/:/g, "");
  return (
    <g>
      <defs>
        <radialGradient id={`s${id}`} cx="40%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="70%" stopColor="#F1EDF8" />
          <stop offset="100%" stopColor="#CFC6E6" />
        </radialGradient>
      </defs>
      <path d={SHEET_PATH} fill={`url(#s${id})`} fillRule="evenodd" />
      <path d="M 120 250 C 130 300 120 330 128 362 M 280 250 C 270 300 282 330 272 362" stroke="#D9D1EC" strokeWidth={6} fill="none" />
    </g>
  );
};

// Pumpkin candy bucket. viewBox 0 0 200 200 (handle included).
export const BucketShape: React.FC = () => (
  <g>
    <path d="M 40 70 C 40 10 160 10 160 70" stroke="#2A1238" strokeWidth={8} fill="none" />
    <ellipse cx={100} cy={120} rx={78} ry={66} fill="#F27A1A" />
    <ellipse cx={100} cy={120} rx={44} ry={64} fill="#F58A2E" />
    <ellipse cx={100} cy={64} rx={64} ry={14} fill="#B4500C" />
    <circle cx={76} cy={60} r={12} fill="#F78CC0" />
    <circle cx={118} cy={58} r={10} fill="#7FD36B" />
    <path d="M 70 112 L 84 98 L 90 116 Z M 130 112 L 116 98 L 110 116 Z M 74 140 Q 100 164 126 140" fill="#2A1238" stroke="#2A1238" strokeWidth={4} />
  </g>
);
