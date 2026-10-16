import type React from "react";
import { useId } from "react";

// Vector props drawn in the same glossy style as the mascot.

// A Boum Boum gum: green shell, pink cross-section, glossy red filling. Drawn in 300x240.
export const GumShape: React.FC<{ readonly flavor?: "pasteque" | "fraise"; readonly shadow?: boolean }> = ({
  flavor = "pasteque",
  shadow = true,
}) => {
  const id = useId().replace(/:/g, "");
  const shell = flavor === "pasteque" ? ["#B5E86A", "#5DAA2E", "#3D7F1C"] : ["#FFD3E3", "#F7A3C5", "#D9709C"];
  return (
    <g>
      <defs>
        <linearGradient id={`shell${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={shell[0]} />
          <stop offset="60%" stopColor={shell[1]} />
          <stop offset="100%" stopColor={shell[2]} />
        </linearGradient>
        <radialGradient id={`fill${id}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FF8FAA" />
          <stop offset="55%" stopColor="#E0164A" />
          <stop offset="100%" stopColor="#A10A30" />
        </radialGradient>
      </defs>
      {shadow ? <ellipse cx={150} cy={226} rx={130} ry={12} fill="black" opacity={0.15} /> : null}
      <path d="M 70 40 L 240 40 C 290 40 300 210 240 210 L 70 210 Z" fill={`url(#shell${id})`} />
      <ellipse cx={240} cy={125} rx={40} ry={85} fill={shell[2]} opacity={0.35} />
      <ellipse cx={80} cy={125} rx={70} ry={86} fill={shell[1]} />
      <ellipse cx={80} cy={125} rx={60} ry={76} fill="#F9B9CF" />
      <path d="M 52 95 C 70 70 112 80 112 110 C 112 140 92 150 86 175 C 82 196 56 196 56 172 C 56 150 36 125 52 95 Z" fill={`url(#fill${id})`} />
      <ellipse cx={72} cy={100} rx={14} ry={8} fill="white" opacity={0.7} transform="rotate(-30 72 100)" />
      <ellipse cx={170} cy={58} rx={60} ry={9} fill="white" opacity={0.35} />
    </g>
  );
};

export const GumPiece: React.FC<{ readonly style?: React.CSSProperties; readonly flavor?: "pasteque" | "fraise" }> = ({
  style,
  flavor = "pasteque",
}) => (
  <svg viewBox="0 0 300 240" style={{ overflow: "visible", ...style }}>
    <GumShape flavor={flavor} />
  </svg>
);

// Cartoon strawberry. viewBox 0 0 300 320.
export const Strawberry: React.FC<{ readonly style?: React.CSSProperties }> = ({ style }) => {
  const id = useId().replace(/:/g, "");
  const seeds = [
    [100, 120], [150, 105], [200, 120], [80, 170], [130, 160], [175, 158], [220, 172],
    [105, 215], [150, 205], [195, 215], [130, 255], [172, 254], [150, 290],
  ];
  return (
    <svg viewBox="0 0 300 320" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`berry${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#FF7A8E" />
          <stop offset="50%" stopColor="#E3123B" />
          <stop offset="100%" stopColor="#A30C2A" />
        </radialGradient>
      </defs>
      <ellipse cx={150} cy={312} rx={110} ry={10} fill="black" opacity={0.15} />
      <path d="M 150 300 C 90 290 30 220 30 140 C 30 90 80 70 150 78 C 220 70 270 90 270 140 C 270 220 210 290 150 300 Z" fill={`url(#berry${id})`} />
      {seeds.map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx={5} ry={8} fill="#FFE08A" />
      ))}
      <ellipse cx={95} cy={115} rx={28} ry={14} fill="white" opacity={0.5} transform="rotate(-35 95 115)" />
      <path d="M 150 82 C 120 40 70 50 60 70 C 95 70 115 80 150 92 C 185 80 205 70 240 70 C 230 50 180 40 150 82 Z" fill="#3FA34D" />
      <path d="M 150 90 C 130 60 110 70 100 92 C 125 88 140 92 150 100 C 160 92 175 88 200 92 C 190 70 170 60 150 90 Z" fill="#2E8A3C" />
      <rect x={144} y={30} width={12} height={50} rx={6} fill="#2E8A3C" />
    </svg>
  );
};

// Small watermelon wedge icon. viewBox 0 0 120 100.
export const MelonSlice: React.FC<{ readonly style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 120 100" style={{ overflow: "visible", ...style }}>
    <path d="M 6 14 Q 60 120 114 14 Z" fill="#2E9E3E" />
    <path d="M 14 14 Q 60 104 106 14 Z" fill="#F4FBD9" />
    <path d="M 20 14 Q 60 92 100 14 Z" fill="#F0304F" />
    {[[42, 30], [60, 44], [78, 30], [60, 26]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={3.5} ry={6} fill="#3A1020" />
    ))}
  </svg>
);

// Comic burst behind "BOUM !". viewBox -200 -200 400 400.
export const Starburst: React.FC<{ readonly color: string; readonly style?: React.CSSProperties }> = ({ color, style }) => {
  const pts: string[] = [];
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const r = i % 2 === 0 ? 190 : 130 + ((i * 37) % 30);
    pts.push(`${Math.cos(a) * r},${Math.sin(a) * r}`);
  }
  return (
    <svg viewBox="-200 -200 400 400" style={{ overflow: "visible", ...style }}>
      <polygon points={pts.join(" ")} fill={color} stroke="white" strokeWidth={10} strokeLinejoin="round" />
    </svg>
  );
};

// Soft bubble-gum cloud. viewBox 0 0 400 200.
export const Cloud: React.FC<{ readonly style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 400 200" style={{ overflow: "visible", ...style }}>
    <g fill="white" opacity={0.92}>
      <circle cx={110} cy={120} r={70} />
      <circle cx={200} cy={90} r={90} />
      <circle cx={295} cy={120} r={68} />
      <rect x={60} y={120} width={290} height={70} rx={35} />
    </g>
    <circle cx={175} cy={60} r={22} fill="#FFE6F1" opacity={0.9} />
  </svg>
);
