import type React from "react";
import { useId } from "react";
import { useCurrentFrame } from "remotion";

// The Boum Boum monster: a posable rig drawn after the packaging character.
// viewBox 0 0 400 500, feet rest on y = 470.

export type Brow = "neutral" | "happy" | "worried" | "determined" | "surprised";

export type MonsterPose = {
  readonly blink?: number; // 0 open .. 1 closed (upper lid)
  readonly squint?: number; // 0 .. 1 happy closed eyes ("^ ^")
  readonly wink?: boolean; // closes the right eye only
  readonly brow?: Brow;
  readonly lookX?: number; // -1 .. 1
  readonly lookY?: number; // -1 .. 1
  readonly eyeScale?: number;
  readonly mouthOpen?: number; // 0 closed smile .. 1 wide grin
  readonly mouthWidth?: number; // 1 full grin .. 0.25 small "o"
  readonly cheeks?: number; // 0 .. 1 puffed (chewing)
  readonly leftArm?: number; // degrees, + raises outward
  readonly rightArm?: number;
  readonly squash?: number; // 1 = rest, <1 squashed, >1 stretched
  readonly legSwing?: number; // extra leg dangle amount (floating)
  readonly shadow?: boolean;
  readonly style?: React.CSSProperties;
};

const INK = "#4B0B2A";
const BROWS: Record<Brow, { y: number; tilt: number }> = {
  neutral: { y: 0, tilt: 0 },
  happy: { y: -8, tilt: -6 },
  worried: { y: -6, tilt: 16 },
  determined: { y: 8, tilt: -18 },
  surprised: { y: -22, tilt: 0 },
};

const Eye: React.FC<{
  cx: number;
  side: 1 | -1;
  p: Required<Pick<MonsterPose, "blink" | "squint" | "lookX" | "lookY" | "eyeScale">>;
  brow: { y: number; tilt: number };
  id: string;
}> = ({ cx, side, p, brow, id }) => {
  const cy = 190;
  const rx = 46 * p.eyeScale;
  const ry = 50 * p.eyeScale;
  const ix = cx + p.lookX * 15;
  const iy = cy + p.lookY * 15;
  const lidY = cy - ry + 2 * ry * p.blink; // bottom edge of upper lid
  const clip = `eye${side}${id}`;
  if (p.squint > 0.5) {
    return (
      <g>
        <path
          d={`M ${cx - 36} ${cy + 12} Q ${cx} ${cy - 36} ${cx + 36} ${cy + 12}`}
          stroke={INK}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
        />
        <path
          d={`M ${cx - 30} ${cy - ry - 18} Q ${cx} ${cy - ry - 34} ${cx + 30} ${cy - ry - 18}`}
          stroke={INK}
          strokeWidth={9}
          strokeLinecap="round"
          fill="none"
          transform={`translate(0 ${brow.y}) rotate(${brow.tilt * side} ${cx} ${cy - ry - 24})`}
        />
      </g>
    );
  }
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
        </clipPath>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx + 3} ry={ry + 3} fill="#C9407F" opacity={0.35} />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#white${id})`} />
        <circle cx={ix} cy={iy} r={27 * p.eyeScale} fill={`url(#iris${id})`} />
        <circle cx={ix} cy={iy} r={12 * p.eyeScale} fill="#0A1530" />
        <circle cx={ix - 9} cy={iy - 10} r={8 * p.eyeScale} fill="white" />
        <circle cx={ix + 9} cy={iy + 8} r={3.5 * p.eyeScale} fill="white" opacity={0.9} />
        {/* upper lid */}
        <rect x={cx - rx - 5} y={cy - ry - 60} width={rx * 2 + 10} height={lidY - (cy - ry - 60)} fill={`url(#body${id})`} />
      </g>
      {/* lash line follows the upper lid */}
      <path
        d={`M ${cx - rx * 0.95} ${Math.max(lidY, cy - ry * 0.75) + 6} Q ${cx} ${lidY - 14 + 10 * p.blink} ${cx + rx * 0.95} ${Math.max(lidY, cy - ry * 0.75) + 6}`}
        stroke={INK}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        opacity={p.blink > 0.95 ? 1 : 0.9}
      />
      {/* brow */}
      <path
        d={`M ${cx - 30} ${cy - ry - 18} Q ${cx} ${cy - ry - 34} ${cx + 30} ${cy - ry - 18}`}
        stroke={INK}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
        transform={`translate(0 ${brow.y}) rotate(${brow.tilt * side} ${cx} ${cy - ry - 24})`}
      />
    </g>
  );
};

const Mouth: React.FC<{ open: number; width: number; id: string }> = ({ open, width, id }) => {
  const x = 200;
  const y = 292;
  const hw = 100 * width;
  if (open < 0.04) {
    return (
      <path
        d={`M ${x - hw} ${y} Q ${x} ${y + 34 * width} ${x + hw} ${y}`}
        stroke={INK}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const depth = 18 + 78 * open;
  const top = 26 * width;
  const d = `M ${x - hw} ${y} Q ${x} ${y + top} ${x + hw} ${y} C ${x + hw * 0.95} ${y + depth * 1.05} ${x + hw * 0.45} ${y + depth * 1.3} ${x} ${y + depth * 1.3} C ${x - hw * 0.45} ${y + depth * 1.3} ${x - hw * 0.95} ${y + depth * 1.05} ${x - hw} ${y} Z`;
  const clip = `mouth${id}`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill="#6E0A22" />
      <g clipPath={`url(#${clip})`}>
        {width > 0.55 ? (
          <path
            d={`M ${x - hw} ${y - 4} Q ${x} ${y + top - 4} ${x + hw} ${y - 4} L ${x + hw} ${y + 14 + 6 * open} Q ${x} ${y + top + 14 + 6 * open} ${x - hw} ${y + 14 + 6 * open} Z`}
            fill="white"
          />
        ) : null}
        <ellipse cx={x} cy={y + depth * 1.25} rx={hw * 0.6} ry={depth * 0.45} fill="#E8456E" />
        <ellipse cx={x - hw * 0.15} cy={y + depth * 1.1} rx={hw * 0.18} ry={depth * 0.1} fill="#FF8DAA" opacity={0.7} />
      </g>
      <path d={d} fill="none" stroke="#8F1440" strokeWidth={4} />
    </g>
  );
};

export const Monster: React.FC<MonsterPose> = ({
  blink = 0,
  squint = 0,
  wink = false,
  brow = "neutral",
  lookX = 0,
  lookY = 0,
  eyeScale = 1,
  mouthOpen = 0.8,
  mouthWidth = 1,
  cheeks = 0,
  leftArm = 0,
  rightArm = 0,
  squash = 1,
  legSwing = 0,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const breathe = 1 + Math.sin(frame / 9) * 0.012;
  const sy = squash * breathe;
  const sx = 1 / Math.sqrt(squash);
  const earWob = Math.sin(frame / 7) * 4;
  const legs = [
    { x: 112, w: 78, len: 96, phase: 0, splay: 28 },
    { x: 172, w: 80, len: 104, phase: 1.4, splay: 8 },
    { x: 234, w: 80, len: 100, phase: 2.2, splay: -8 },
    { x: 292, w: 76, len: 92, phase: 3.0, splay: -28 },
  ];
  const p = { blink, squint, lookX, lookY, eyeScale };
  const browShape = BROWS[brow];

  return (
    <svg viewBox="0 0 400 500" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`body${id}`} gradientUnits="userSpaceOnUse" cx={160} cy={150} r={360}>
          <stop offset="0%" stopColor="#FFC4DF" />
          <stop offset="40%" stopColor="#F78CC0" />
          <stop offset="78%" stopColor="#E85FA3" />
          <stop offset="100%" stopColor="#C94283" />
        </radialGradient>
        <radialGradient id={`white${id}`} cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F3F1F8" />
          <stop offset="100%" stopColor="#D9D3E8" />
        </radialGradient>
        <radialGradient id={`iris${id}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#8FD8FF" />
          <stop offset="55%" stopColor="#2F86E0" />
          <stop offset="100%" stopColor="#123F8C" />
        </radialGradient>
      </defs>
      {shadow ? <ellipse cx={200} cy={478} rx={150 * sx} ry={16} fill="black" opacity={0.18} /> : null}
      <g transform={`translate(200 470) scale(${sx} ${sy}) translate(-200 -470)`}>
        {/* legs */}
        {legs.map((l, i) => {
          const sway = Math.sin(frame / 8 + l.phase) * (4 + legSwing * 14);
          return (
            <g key={i} transform={`translate(${l.x} 374) rotate(${l.splay + sway})`}>
              <path
                d={`M ${-l.w / 2} 0 C ${-l.w / 2} ${l.len * 0.5} ${-l.w * 0.42} ${l.len * 0.75} ${-l.w * 0.4} ${l.len} A ${l.w * 0.4} ${l.w * 0.4} 0 0 0 ${l.w * 0.4} ${l.len} C ${l.w * 0.42} ${l.len * 0.75} ${l.w / 2} ${l.len * 0.5} ${l.w / 2} 0 Z`}
                fill={`url(#body${id})`}
              />
            </g>
          );
        })}
        {/* splash ears + flying drops */}
        <g transform={`rotate(${-earWob} 95 135)`}>
          <path d="M 104 104 C 72 94 30 100 14 122 C 0 144 16 166 36 158 C 52 152 62 146 86 152 Z" fill={`url(#body${id})`} />
        </g>
        <g transform={`rotate(${earWob} 305 135)`}>
          <path d="M 296 104 C 328 90 372 86 388 106 C 402 126 388 148 368 142 C 352 138 340 138 314 150 Z" fill={`url(#body${id})`} />
          <circle cx={366} cy={64} r={12} fill="#F78CC0" />
          <circle cx={392} cy={78} r={6} fill="#F78CC0" />
        </g>
        <circle cx={150} cy={36 + Math.sin(frame / 6) * 3} r={9} fill="#F78CC0" />
        {/* body */}
        <path
          d="M 200 58 C 296 58 360 124 360 214 C 360 292 340 340 326 386 C 316 412 280 418 200 418 C 120 418 84 412 74 386 C 60 340 40 292 40 214 C 40 124 104 58 200 58 Z"
          fill={`url(#body${id})`}
        />
        {/* arms, in front of the body so gestures read */}
        <g transform={`rotate(${leftArm} 62 262)`}>
          <path d="M 74 236 C 30 246 -8 296 -4 336 C 0 366 36 368 40 340 C 44 314 56 300 76 294 Z" fill={`url(#body${id})`} />
        </g>
        <g transform={`rotate(${-rightArm} 338 262)`}>
          <path d="M 326 236 C 370 246 408 296 404 336 C 400 366 364 368 360 340 C 356 314 344 300 324 294 Z" fill={`url(#body${id})`} />
        </g>
        {/* gloss */}
        <ellipse cx={128} cy={104} rx={46} ry={20} fill="white" opacity={0.45} transform="rotate(-28 128 104)" />
        <ellipse cx={92} cy={140} rx={10} ry={6} fill="white" opacity={0.4} transform="rotate(-50 92 140)" />
        {/* speckles */}
        {[
          [88, 262, 5], [104, 280, 3.5], [80, 290, 3], [312, 262, 5], [298, 282, 3.5], [322, 292, 3],
          [140, 380, 4], [262, 372, 4.5], [210, 395, 3],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#D24C8E" opacity={0.55} />
        ))}
        {/* cheeks (puff when chewing) */}
        <ellipse cx={100} cy={268} rx={34 + cheeks * 16} ry={24 + cheeks * 12} fill="#EE6AA9" opacity={0.35 + cheeks * 0.35} />
        <ellipse cx={300} cy={268} rx={34 + cheeks * 16} ry={24 + cheeks * 12} fill="#EE6AA9" opacity={0.35 + cheeks * 0.35} />
        <Eye cx={145} side={1} p={p} brow={browShape} id={id} />
        <Eye cx={255} side={-1} p={wink ? { ...p, squint: 1 } : p} brow={browShape} id={id} />
        <Mouth open={mouthOpen} width={mouthWidth} id={id} />
      </g>
    </svg>
  );
};
