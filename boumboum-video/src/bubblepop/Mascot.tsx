import type React from "react";
import { useId } from "react";

// Stand-in for the Boum Boum mascot, drawn in SVG (viewBox 400x440).
// Swap for the official artwork when available.

export const EYE_BLUE = "#2F6FD6";
const INK = "#4A0A26";

type EyeProps = {
  readonly cx: number;
  readonly cy: number;
  readonly open?: number; // 0 = closed, 1 = open
  readonly wink?: boolean;
  readonly lookX?: number; // -1..1
  readonly lookY?: number; // -1..1
  readonly scale?: number;
  readonly pupil?: number; // pupil size multiplier
};

export const Eye: React.FC<EyeProps> = ({
  cx,
  cy,
  open = 1,
  wink = false,
  lookX = 0,
  lookY = 0,
  scale = 1,
  pupil = 1,
}) => {
  if (wink) {
    return (
      <path
        d={`M ${cx - 38 * scale} ${cy + 4 * scale} Q ${cx} ${cy - 30 * scale} ${cx + 38 * scale} ${cy + 4 * scale}`}
        stroke={INK}
        strokeWidth={10 * scale}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const ix = cx + lookX * 14 * scale;
  const iy = cy + lookY * 16 * scale;
  return (
    <g
      transform={`translate(${cx} ${cy}) scale(1 ${Math.max(open, 0.04)}) translate(${-cx} ${-cy})`}
    >
      <ellipse
        cx={cx}
        cy={cy}
        rx={40 * scale}
        ry={46 * scale}
        fill="white"
        stroke={INK}
        strokeWidth={4 * scale}
      />
      <circle cx={ix} cy={iy} r={23 * scale} fill={EYE_BLUE} />
      <circle cx={ix} cy={iy} r={11 * scale * pupil} fill="#0B1A3A" />
      <circle cx={ix - 8 * scale} cy={iy - 9 * scale} r={6 * scale} fill="white" />
    </g>
  );
};

type MouthProps = {
  readonly x: number;
  readonly y: number;
  readonly open?: number; // 0 = closed smile, 1 = wide open
  readonly width?: number; // 1 = full grin, ~0.45 = small "o"
  readonly scale?: number;
};

export const Mouth: React.FC<MouthProps> = ({
  x,
  y,
  open = 0.5,
  width = 1,
  scale = 1,
}) => {
  const hw = 75 * width * scale;
  const depth = (20 + 95 * open) * scale;
  if (open < 0.05) {
    return (
      <path
        d={`M ${x - hw} ${y} Q ${x} ${y + 40 * scale} ${x + hw} ${y}`}
        stroke={INK}
        strokeWidth={8 * scale}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  return (
    <g>
      <path
        d={`M ${x - hw} ${y} Q ${x} ${y + depth * 1.6} ${x + hw} ${y} Q ${x} ${y + 10 * scale} ${x - hw} ${y} Z`}
        fill="#7A0E2E"
        stroke={INK}
        strokeWidth={5 * scale}
        strokeLinejoin="round"
      />
      {width > 0.7 ? (
        <rect
          x={x - 32 * scale}
          y={y + 5 * scale}
          width={64 * scale}
          height={Math.min(18, 30 * open) * scale}
          rx={6 * scale}
          fill="white"
        />
      ) : null}
      <ellipse
        cx={x}
        cy={y + depth * 0.6}
        rx={hw * 0.45}
        ry={depth * 0.22}
        fill="#F45B8C"
      />
    </g>
  );
};

type MascotProps = {
  readonly eyesOpen?: number;
  readonly wink?: boolean;
  readonly lookX?: number;
  readonly lookY?: number;
  readonly mouthOpen?: number;
  readonly mouthWidth?: number;
  readonly armWave?: number; // degrees
  readonly style?: React.CSSProperties;
};

export const Mascot: React.FC<MascotProps> = ({
  eyesOpen = 1,
  wink = false,
  lookX = 0,
  lookY = 0,
  mouthOpen = 0.6,
  mouthWidth = 1,
  armWave = 0,
  style,
}) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 440" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`body${id}`} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FFB3D6" />
          <stop offset="55%" stopColor="#F27BB4" />
          <stop offset="100%" stopColor="#D94C93" />
        </radialGradient>
      </defs>
      {/* antennae */}
      <ellipse cx={108} cy={72} rx={34} ry={20} transform="rotate(-35 108 72)" fill="#F27BB4" />
      <ellipse cx={294} cy={70} rx={34} ry={20} transform="rotate(35 294 70)" fill="#F27BB4" />
      {/* arms */}
      <path d="M 75 235 Q 20 250 22 300" stroke="#E763A6" strokeWidth={42} strokeLinecap="round" fill="none" />
      <g transform={`rotate(${armWave} 330 235)`}>
        <path d="M 325 235 Q 385 215 392 165" stroke="#E763A6" strokeWidth={42} strokeLinecap="round" fill="none" />
      </g>
      {/* gooey body */}
      <path
        d="M200 40 C290 40 340 110 340 190 C340 240 330 270 345 300 C360 330 380 340 375 365 C368 395 330 385 315 360 C305 380 300 410 270 412 C245 414 240 390 232 375 C225 395 215 420 190 418 C165 416 165 390 160 375 C150 395 130 410 108 400 C85 390 92 365 85 355 C60 370 25 360 28 330 C32 300 60 300 62 270 C62 240 60 220 60 190 C60 110 110 40 200 40 Z"
        fill={`url(#body${id})`}
      />
      {/* speckles like the packaging character */}
      {[
        [110, 300, 6], [135, 330, 4], [290, 310, 5], [270, 340, 7], [95, 140, 4], [305, 130, 5],
      ].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#D94C93" opacity={0.6} />
      ))}
      <ellipse cx={135} cy={95} rx={40} ry={20} fill="white" opacity={0.35} transform="rotate(-25 135 95)" />
      <Eye cx={150} cy={170} open={eyesOpen} lookX={lookX} lookY={lookY} />
      <Eye cx={250} cy={170} open={eyesOpen} lookX={lookX} lookY={lookY} wink={wink} />
      <Mouth x={200} y={240} open={mouthOpen} width={mouthWidth} />
    </svg>
  );
};
