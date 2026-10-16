import type React from "react";
import { useId } from "react";
import { useCurrentFrame } from "remotion";
import type { Pose } from "./pose";

// The Boum Boum monster, rig v2. Drawn in a 400x500 space, feet on y = 470.
// Supports head turns (front -> 3/4 -> profile), a jelly bend of the whole
// body, blended expressions and physics-driven ears, arms and legs.

export const PALETTE = {
  bodyLight: "#FFC4DF",
  body: "#F78CC0",
  bodyMid: "#E85FA3",
  bodyShadow: "#C94283",
  speckle: "#D24C8E",
  cheek: "#EE6AA9",
  ink: "#4B0B2A",
  irisLight: "#8FD8FF",
  iris: "#2F86E0",
  irisDark: "#123F8C",
  mouth: "#6E0A22",
  lip: "#8F1440",
  tongue: "#E8456E",
};

const FEET = 470;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
// how strongly a point at height y follows the jelly bend (feet 0 -> top ~1)
const bendWeight = (y: number) => Math.pow(clamp((FEET - y) / 412, 0, 1.3), 1.6);

// Apply a point warp to an SVG path made of M/L/C/Q commands.
const warpPath = (d: string, warp: (x: number, y: number) => [number, number]) => {
  const tokens = d.match(/[MLCQZ]|-?\d*\.?\d+/g) ?? [];
  const out: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/[MLCQZ]/.test(t)) {
      out.push(t);
      i++;
    } else {
      const [x, y] = warp(parseFloat(t), parseFloat(tokens[i + 1]));
      out.push(x.toFixed(1), y.toFixed(1));
      i += 2;
    }
  }
  return out.join(" ");
};

const BODY = "M 200 58 C 296 58 360 124 360 214 C 360 292 340 340 326 386 C 316 412 280 418 200 418 C 120 418 84 412 74 386 C 60 340 40 292 40 214 C 40 124 104 58 200 58 Z";
const EAR_L = "M 104 104 C 72 94 30 100 14 122 C 0 144 16 166 36 158 C 52 152 62 146 86 152 Z";
const EAR_R = "M 296 104 C 328 90 372 86 388 106 C 402 126 388 148 368 142 C 352 138 340 138 314 150 Z";

type EyeProps = {
  cx: number;
  cy: number;
  scaleX: number;
  side: 1 | -1; // 1 = his right side of the drawing (viewer's left)
  blink: number;
  squint: number;
  lookX: number;
  lookY: number;
  size: number;
  pupil: number;
  browY: number;
  browTilt: number;
  id: string;
  fill: string;
};

const Eye: React.FC<EyeProps> = (p) => {
  const rx = 46 * p.size;
  const ry = 50 * p.size;
  const ix = p.cx + p.lookX * 15;
  const iy = p.cy + p.lookY * 15;
  const open = 1 - clamp((p.squint - 0.15) / 0.5, 0, 1); // eye shrinks as it closes happily
  const arc = clamp((p.squint - 0.45) / 0.25, 0, 1);
  const lidY = p.cy - ry + 2 * ry * p.blink;
  const clip = `eye${p.side}${p.id}`;
  const browCx = p.cx;
  const browCy = p.cy - ry - 24 + p.browY;
  return (
    <g transform={`translate(${p.cx} 0) scale(${p.scaleX} 1) translate(${-p.cx} 0)`}>
      {open > 0.02 ? (
        <g transform={`translate(0 ${p.cy}) scale(1 ${open}) translate(0 ${-p.cy})`}>
          <defs>
            <clipPath id={clip}>
              <ellipse cx={p.cx} cy={p.cy} rx={rx} ry={ry} />
            </clipPath>
          </defs>
          <ellipse cx={p.cx} cy={p.cy} rx={rx + 3} ry={ry + 3} fill={PALETTE.bodyShadow} opacity={0.35} />
          <g clipPath={`url(#${clip})`}>
            <ellipse cx={p.cx} cy={p.cy} rx={rx} ry={ry} fill={`url(#white${p.id})`} />
            <circle cx={ix} cy={iy} r={27 * p.size} fill={`url(#iris${p.id})`} />
            <circle cx={ix} cy={iy} r={12 * p.size * p.pupil} fill="#0A1530" />
            <circle cx={ix - 9} cy={iy - 10} r={8 * p.size} fill="white" />
            <circle cx={ix + 9} cy={iy + 8} r={3.5 * p.size} fill="white" opacity={0.9} />
            <rect x={p.cx - rx - 5} y={p.cy - ry - 60} width={rx * 2 + 10} height={lidY - (p.cy - ry - 60)} fill={p.fill} />
          </g>
          <path
            d={`M ${p.cx - rx * 0.95} ${Math.max(lidY, p.cy - ry * 0.75) + 6} Q ${p.cx} ${lidY - 14 + 10 * p.blink} ${p.cx + rx * 0.95} ${Math.max(lidY, p.cy - ry * 0.75) + 6}`}
            stroke={PALETTE.ink}
            strokeWidth={7}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ) : null}
      {arc > 0 ? (
        <path
          d={`M ${p.cx - 36} ${p.cy + 12} Q ${p.cx} ${p.cy - 36} ${p.cx + 36} ${p.cy + 12}`}
          stroke={PALETTE.ink}
          strokeWidth={10}
          strokeLinecap="round"
          fill="none"
          opacity={arc}
        />
      ) : null}
      <path
        d={`M ${browCx - 30} ${browCy + 6} Q ${browCx} ${browCy - 10} ${browCx + 30} ${browCy + 6}`}
        stroke={PALETTE.ink}
        strokeWidth={9}
        strokeLinecap="round"
        fill="none"
        transform={`rotate(${-p.browTilt * p.side} ${browCx} ${browCy})`}
      />
    </g>
  );
};

type MouthProps = {
  x: number;
  y: number;
  scaleX: number;
  open: number;
  width: number;
  smile: number;
  tongue: number;
  tongueX: number;
  id: string;
};

const Mouth: React.FC<MouthProps> = ({ x, y, scaleX, open, width, smile, tongue, tongueX, id }) => {
  const hw = 100 * width;
  const clipId = `mouth${id}`;
  if (open < 0.04) {
    return (
      <path
        d={`M ${x - hw * scaleX} ${y} Q ${x} ${y + 34 * width * smile} ${x + hw * scaleX} ${y}`}
        stroke={PALETTE.ink}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const depth = 18 + 78 * open;
  const top = 26 * width * smile;
  const d = `M ${x - hw} ${y} Q ${x} ${y + top} ${x + hw} ${y} C ${x + hw * 0.95} ${y + depth * 1.05} ${x + hw * 0.45} ${y + depth * 1.3} ${x} ${y + depth * 1.3} C ${x - hw * 0.45} ${y + depth * 1.3} ${x - hw * 0.95} ${y + depth * 1.05} ${x - hw} ${y} Z`;
  return (
    <g transform={`translate(${x} 0) scale(${scaleX} 1) translate(${-x} 0)`}>
      <defs>
        <clipPath id={clipId}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={PALETTE.mouth} />
      <g clipPath={`url(#${clipId})`}>
        {width > 0.55 && open > 0.12 ? (
          <path
            d={`M ${x - hw} ${y - 4} Q ${x} ${y + top - 4} ${x + hw} ${y - 4} L ${x + hw} ${y + 14 + 6 * open} Q ${x} ${y + top + 14 + 6 * open} ${x - hw} ${y + 14 + 6 * open} Z`}
            fill="white"
          />
        ) : null}
        <ellipse cx={x} cy={y + depth * 1.25} rx={hw * 0.6} ry={depth * 0.45} fill={PALETTE.tongue} />
        <ellipse cx={x - hw * 0.15} cy={y + depth * 1.1} rx={hw * 0.18} ry={depth * 0.1} fill="#FF8DAA" opacity={0.7} />
      </g>
      <path d={d} fill="none" stroke={PALETTE.lip} strokeWidth={4} />
      {tongue > 0.01 ? (
        <g transform={`translate(${x + tongueX * 62} ${y + depth * 1.05}) rotate(${tongueX * -40})`}>
          <path
            d={`M -34 0 C -36 ${40 * tongue} -20 ${70 * tongue} 0 ${70 * tongue} C 20 ${70 * tongue} 36 ${40 * tongue} 34 0 Z`}
            fill={PALETTE.tongue}
            stroke="#B5234F"
            strokeWidth={3}
          />
          <path d={`M 0 4 L 0 ${44 * tongue}`} stroke="#C2305A" strokeWidth={4} strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

const Arm: React.FC<{ sx: number; sy: number; angle: number; curl: number; fill: string }> = ({ sx, sy, angle, curl, fill }) => {
  const len = 134;
  const a = (angle * Math.PI) / 180;
  const hx = sx + Math.cos(a) * len;
  const hy = sy + Math.sin(a) * len;
  const mx = (sx + hx) / 2 - Math.sin(a) * curl * 40;
  const my = (sy + hy) / 2 + Math.cos(a) * curl * 40;
  return (
    <g>
      <path d={`M ${sx} ${sy} Q ${mx} ${my} ${hx} ${hy}`} stroke={fill} strokeWidth={48} strokeLinecap="round" fill="none" />
      <circle cx={hx} cy={hy} r={29} fill={fill} />
    </g>
  );
};

const LEGS = [
  { x: 112, w: 78, len: 96, phase: 0, splay: 28 },
  { x: 172, w: 80, len: 104, phase: 1.4, splay: 8 },
  { x: 234, w: 80, len: 100, phase: 2.2, splay: -8 },
  { x: 292, w: 76, len: 92, phase: 3.0, splay: -28 },
];

export const BoumMonster: React.FC<{ pose: Pose; shadow?: boolean; style?: React.CSSProperties }> = ({
  pose: p,
  shadow = true,
  style,
}) => {
  const frame = useCurrentFrame();
  const id = useId().replace(/:/g, "");
  const fill = `url(#body${id})`;
  const t = clamp(p.turn, -1, 1);
  const a = Math.abs(t);
  const breathe = 1 + Math.sin(frame / 12) * 0.008;

  const warp = (x: number, y: number): [number, number] => [x + p.bend * bendWeight(y), y];
  const bx = (y: number) => p.bend * bendWeight(y);

  // head turn: features slide toward the turn side, far side foreshortens
  const faceX = 200 + t * 105;
  const eyeSpread = 55 * (1 - a * 0.45);
  const nearSide = t >= 0 ? 1 : -1; // +1: viewer's-right eye is near
  const eyeL = { x: faceX - eyeSpread, s: t > 0 ? 1 - a * 0.55 : 1 };
  const eyeR = { x: faceX + eyeSpread, s: t < 0 ? 1 - a * 0.55 : 1 };
  const showL = !(t > 0.82);
  const showR = !(t < -0.82);
  const shoulder = (base: number) => 200 + (base - 200) * (1 - a * 0.5) + t * 30;
  const farArmIsLeft = t > 0.3;
  const farArmIsRight = t < -0.3;
  const legX = (x: number) => 200 + (x - 200) * (1 - a * 0.4) + t * 20;
  const lift = clamp(p.legLift, 0, 1);

  const shadowScale = clamp(1 + p.y / 700, 0.35, 1);
  const armLEl = <Arm sx={shoulder(74) + bx(252)} sy={252} angle={118 + p.armL} curl={p.curlL} fill={fill} />;
  const armREl = <Arm sx={shoulder(326) + bx(252)} sy={252} angle={62 - p.armR} curl={-p.curlR} fill={fill} />;

  return (
    <svg viewBox="0 0 400 500" style={{ overflow: "visible", ...style }}>
      <defs>
        <radialGradient id={`body${id}`} gradientUnits="userSpaceOnUse" cx={160 + t * 40} cy={150} r={360}>
          <stop offset="0%" stopColor={PALETTE.bodyLight} />
          <stop offset="40%" stopColor={PALETTE.body} />
          <stop offset="78%" stopColor={PALETTE.bodyMid} />
          <stop offset="100%" stopColor={PALETTE.bodyShadow} />
        </radialGradient>
        <radialGradient id={`white${id}`} cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="80%" stopColor="#F3F1F8" />
          <stop offset="100%" stopColor="#D9D3E8" />
        </radialGradient>
        <radialGradient id={`iris${id}`} cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor={PALETTE.irisLight} />
          <stop offset="55%" stopColor={PALETTE.iris} />
          <stop offset="100%" stopColor={PALETTE.irisDark} />
        </radialGradient>
      </defs>
      {shadow ? (
        <ellipse cx={200 + p.x} cy={478} rx={150 * shadowScale * p.sx} ry={16 * shadowScale} fill="black" opacity={0.18 * shadowScale} />
      ) : null}
      <g
        transform={`translate(${p.x} ${p.y}) rotate(${p.rot} 200 ${FEET}) translate(200 ${FEET}) scale(${p.sx * (1 - a * 0.08)} ${p.sy * breathe}) translate(-200 ${-FEET})`}
      >
        {/* legs */}
        {LEGS.map((l, i) => {
          const sway = Math.sin(frame / 8 + l.phase) * 3 + p.legSwing * (i < 2 ? 1 : -1);
          const splay = l.splay * (1 + p.legSpread) * (1 - lift * 0.5) + lift * (l.x < 200 ? 35 : -35);
          const len = l.len * (1 - lift * 0.35);
          return (
            <g key={i} transform={`translate(${legX(l.x)} 374) rotate(${splay + sway})`}>
              <path
                d={`M ${-l.w / 2} 0 C ${-l.w / 2} ${len * 0.5} ${-l.w * 0.42} ${len * 0.75} ${-l.w * 0.4} ${len} A ${l.w * 0.4} ${l.w * 0.4} 0 0 0 ${l.w * 0.4} ${len} C ${l.w * 0.42} ${len * 0.75} ${l.w / 2} ${len * 0.5} ${l.w / 2} 0 Z`}
                fill={fill}
              />
            </g>
          );
        })}
        {farArmIsLeft ? armLEl : null}
        {farArmIsRight ? armREl : null}
        {/* splash ears (far ear tucks in when turned) */}
        <g transform={`translate(${t > 0 ? t * 70 : t * 20} 0) translate(95 135) scale(${t > 0 ? 1 - a * 0.35 : 1}) rotate(${-p.earL}) translate(-95 -135)`}>
          <path d={warpPath(EAR_L, warp)} fill={fill} />
        </g>
        <g transform={`translate(${t < 0 ? t * 70 : t * 20} 0) translate(305 135) scale(${t < 0 ? 1 - a * 0.35 : 1}) rotate(${p.earR}) translate(-305 -135)`}>
          <path d={warpPath(EAR_R, warp)} fill={fill} />
          <circle cx={366 + bx(64)} cy={64 + p.earR * 0.3} r={12} fill={PALETTE.body} />
          <circle cx={392 + bx(78)} cy={78 + p.earR * 0.5} r={6} fill={PALETTE.body} />
        </g>
        <circle cx={150 + bx(36) + t * 30} cy={36 + Math.sin(frame / 6) * 3 + p.earL * 0.3} r={9} fill={PALETTE.body} />
        {/* body */}
        <path d={warpPath(BODY, warp)} fill={fill} />
        {!farArmIsLeft ? armLEl : null}
        {!farArmIsRight ? armREl : null}
        {/* gloss + speckles */}
        <ellipse cx={128 + bx(104) - t * 20} cy={104} rx={46} ry={20} fill="white" opacity={0.45} transform={`rotate(-28 ${128 + bx(104)} 104)`} />
        <ellipse cx={92 + bx(140)} cy={140} rx={10} ry={6} fill="white" opacity={0.4} transform={`rotate(-50 ${92 + bx(140)} 140)`} />
        {[
          [140, 380, 4], [262, 372, 4.5], [210, 395, 3],
        ].map(([x, y, r], i) => (
          <circle key={i} cx={x + bx(y) + t * 15} cy={y} r={r} fill={PALETTE.speckle} opacity={0.55} />
        ))}
        {/* face */}
        {p.back < 0.5 ? (
          <g transform={`translate(${bx(230)} 0)`}>
            {[
              [-112, 262, 5], [-96, 280, 3.5], [-120, 290, 3], [112, 262, 5], [98, 282, 3.5], [122, 292, 3],
            ].map(([dx, y, r], i) => {
              const side = dx < 0 ? -1 : 1;
              if (a > 0.6 && side !== nearSide) return null;
              return <circle key={i} cx={faceX + dx * (1 - a * 0.35)} cy={y} r={r} fill={PALETTE.speckle} opacity={0.55} />;
            })}
            {[-1, 1].map((side) => {
              if (a > 0.6 && side !== nearSide) return null;
              return (
                <ellipse
                  key={side}
                  cx={faceX + side * 100 * (1 - a * 0.35)}
                  cy={268}
                  rx={(34 + p.cheeks * 16) * (side === nearSide ? 1 : 1 - a * 0.5)}
                  ry={24 + p.cheeks * 12}
                  fill={PALETTE.cheek}
                  opacity={0.35 + p.cheeks * 0.35}
                />
              );
            })}
            {showL ? (
              <Eye cx={eyeL.x} cy={190} scaleX={eyeL.s} side={1} blink={p.blink} squint={p.squint} lookX={p.lookX + t * 0.5} lookY={p.lookY} size={p.eyeScale} pupil={p.pupil} browY={p.browY} browTilt={p.browTilt} id={id} fill={fill} />
            ) : null}
            {showR ? (
              <Eye cx={eyeR.x} cy={190} scaleX={eyeR.s} side={-1} blink={p.blink} squint={Math.max(p.squint, p.wink)} lookX={p.lookX + t * 0.5} lookY={p.lookY} size={p.eyeScale} pupil={p.pupil} browY={p.browY + p.wink * 8} browTilt={p.browTilt - p.wink * 10} id={id} fill={fill} />
            ) : null}
            <Mouth x={faceX} y={292} scaleX={1 - a * 0.4} open={p.mouthOpen} width={p.mouthWidth} smile={p.smile} tongue={p.tongue} tongueX={p.tongueX} id={id} />
          </g>
        ) : null}
      </g>
    </svg>
  );
};
