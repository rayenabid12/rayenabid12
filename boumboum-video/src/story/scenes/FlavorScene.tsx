import type React from "react";
import { Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Goo } from "../../bubblepop/Goo";
import { bodyFont, candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { GumPiece, Strawberry } from "../Props";
import { clamp, ease, GROUND_Y, lastImpact, lerp, monsterBox, World } from "../World";

const SIZE = 470;
const GUM_TOP = 1215; // where he lands on the giant gum
const BERRY_TOP = 1190;
const LANDS = [5, 66];

const Title: React.FC<{ small: string; big: string; at: number; out: number }> = ({ small, big, at, out }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [at, at + 8, out, out + 6], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", scale: s }}>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 70, color: colors.greenDark }}>{small}</div>
      <div style={{ fontFamily: displayFont, fontSize: 210, lineHeight: 1, ...candyText(colors.logoRed, colors.white, 15), rotate: "-4deg" }}>
        {big}
      </div>
    </div>
  );
};

// Fall in, bounce on the gum, crouch, leap across, land on the strawberry.
const feetAt = (f: number) => {
  if (f < 5) return interpolate(f, [0, 5], [-300, GUM_TOP], clamp);
  if (f < 41) return GUM_TOP - (f > 18 ? Math.abs(Math.sin(((f - 18) / 11) * Math.PI)) * 34 : 0);
  if (f < 45) return GUM_TOP;
  if (f < 66) {
    const t = (f - 45) / 21;
    return GUM_TOP + (BERRY_TOP - GUM_TOP) * t - Math.sin(Math.PI * t) * 540;
  }
  return BERRY_TOP - (f > 80 ? Math.abs(Math.sin(((f - 80) / 11) * Math.PI)) * 30 : 0);
};

export const FlavorScene: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [45, 66], [0, 900], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const feetY = feetAt(f);
  const vy = feetY - feetAt(f - 1);
  const airborne = f < 5 || (f >= 45 && f < 66);
  const crouch = f >= 40 && f < 45;
  const yum = ease(f, [8, 12, 40, 44], [0, 1, 1, 0]) + ease(f, [70, 74], [0, 1]);
  const licking = (f >= 24 && f < 38) || (f >= 90 && f < 104);
  const lick = f < 60 ? (f - 24) / 14 : (f - 90) / 14;

  return (
    <>
      <World cameraX={pan} />
      <GumPiece style={{ position: "absolute", width: 720, left: 540 - 360 - pan, top: GROUND_Y - 520 }} />
      <Strawberry style={{ position: "absolute", width: 560, left: 1440 - 280 - pan, top: GROUND_Y - 600 }} />
      <Monster
        brow={yum > 0.5 ? "happy" : "surprised"}
        squint={licking ? 0 : yum}
        lookX={licking ? Math.sin(lick * Math.PI) * 0.6 : crouch ? 0.8 : 0}
        lookY={licking ? 0.3 : 0}
        mouthOpen={licking ? 0.55 : 1}
        mouthWidth={yum > 0.5 ? 1 : 0.6}
        tongue={licking ? Math.sin(Math.min(1, lick) * Math.PI) : 0}
        tongueX={licking ? -0.8 + lick * 1.6 : 0}
        leftArm={airborne ? 125 : crouch ? 30 : 95 + Math.sin(f / 3) * 22}
        rightArm={airborne ? 125 : crouch ? 30 : 95 + Math.cos(f / 3) * 22}
        armCurl={Math.sin(f / 3 - 1) * 0.7}
        legSwing={airborne ? 1 : 0}
        lean={crouch ? -6 : f >= 45 && f < 66 ? 12 : 0}
        tilt={yum > 0.5 ? Math.sin(f / 6) * 6 : 0}
        squash={crouch ? lerp(f, [40, 44], [1, 0.78]) : airborne ? 1.12 : (f < 60 ? lerp(f, [5, 8, 14], [0.72, 1.08, 1]) : lerp(f, [66, 69, 75], [0.72, 1.08, 1]))}
        impactAt={lastImpact(f, LANDS)}
        vy={vy}
        vx={f >= 45 && f < 66 ? 20 : 0}
        shadow={false}
        style={{ ...monsterBox(540, feetY, SIZE) }}
      />
      <Sequence from={5} durationInFrames={60} layout="none" name="Watermelon splash">
        <Goo x={540 - pan} y={GUM_TOP + 20} color="#C70D3A" light="#FF7A9A" />
      </Sequence>
      <Sequence from={66} layout="none" name="Strawberry splash">
        <Goo x={540} y={BERRY_TOP + 20} color="#D3123F" light="#FF8FA8" />
      </Sequence>
      <Title small="Fourré coulis goût" big="PASTÈQUE !" at={8} out={42} />
      <Title small="Fourré goût" big="FRAISE !" at={69} out={200} />
    </>
  );
};
