import type React from "react";
import { Easing, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Goo } from "../../bubblepop/Goo";
import { bodyFont, candyText, colors, displayFont } from "../../theme";
import { Monster } from "../Monster";
import { GumPiece, Strawberry } from "../Props";
import { clamp, GROUND_Y, lerp, monsterBox, World } from "../World";

const SIZE = 470;
const GUM_TOP = 1215; // where he lands on the giant gum
const BERRY_TOP = 1190;

const Title: React.FC<{ small: string; big: string; at: number; out: number }> = ({ small, big, at, out }) => {
  const f = useCurrentFrame();
  const s = interpolate(f, [at, at + 8, out, out + 6], [0, 1, 1, 0], {
    ...clamp,
    easing: Easing.out(Easing.back(2)),
  });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", scale: s }}>
      <div style={{ fontFamily: bodyFont, fontWeight: 700, fontSize: 70, color: colors.greenDark }}>
        {small}
      </div>
      <div style={{ fontFamily: displayFont, fontSize: 210, lineHeight: 1, ...candyText(colors.logoRed, colors.white, 15), rotate: "-4deg" }}>
        {big}
      </div>
    </div>
  );
};

// He lands on a giant gum (splat of watermelon filling), then bounces onto a strawberry.
export const FlavorScene: React.FC = () => {
  const f = useCurrentFrame();
  const pan = interpolate(f, [45, 66], [0, 900], { ...clamp, easing: Easing.inOut(Easing.cubic) });

  // fall in, land, bounce over, land again
  let feetY: number;
  if (f < 5) feetY = interpolate(f, [0, 5], [-300, GUM_TOP], clamp);
  else if (f < 45) feetY = GUM_TOP - Math.abs(Math.sin(((f - 5) / 20) * Math.PI)) * (f > 18 ? 40 : 0);
  else if (f < 66) {
    const t = (f - 45) / 21;
    feetY = GUM_TOP + (BERRY_TOP - GUM_TOP) * t - Math.sin(Math.PI * t) * 520;
  } else feetY = BERRY_TOP - Math.abs(Math.sin(((f - 66) / 22) * Math.PI)) * (f > 80 ? 36 : 0);

  const squash = f < 45 ? lerp(f, [5, 8, 14], [0.6, 1.12, 1]) : f < 66 ? 1.12 : lerp(f, [66, 69, 75], [0.62, 1.1, 1]);
  const yum = (f >= 10 && f < 45) || f >= 72;

  return (
    <>
      <World cameraX={pan} />
      <GumPiece style={{ position: "absolute", width: 720, left: 540 - 360 - pan, top: GROUND_Y - 520 }} />
      <Strawberry style={{ position: "absolute", width: 560, left: 1440 - 280 - pan, top: GROUND_Y - 600 }} />
      <Monster
        brow={yum ? "happy" : "surprised"}
        squint={yum ? 1 : 0}
        mouthOpen={1}
        mouthWidth={yum ? 1 : 0.6}
        leftArm={yum ? 95 + Math.sin(f / 3) * 20 : 120}
        rightArm={yum ? 95 + Math.cos(f / 3) * 20 : 120}
        legSwing={f < 5 || (f >= 45 && f < 66) ? 1 : 0}
        squash={squash}
        shadow={false}
        style={{ ...monsterBox(540, feetY, SIZE) }}
      />
      <Sequence from={5} durationInFrames={60} layout="none" name="Watermelon splash">
        <Goo x={540 - pan} y={GUM_TOP + 20} color="#C70D3A" light="#FF7A9A" />
      </Sequence>
      <Sequence from={66} layout="none" name="Strawberry splash">
        <Goo x={540} y={BERRY_TOP + 20} color="#D3123F" light="#FF8FA8" />
      </Sequence>
      <Title small="Fourré coulis goût" big="PASTÈQUE !" at={8} out={44} />
      <Title small="Fourré goût" big="FRAISE !" at={69} out={200} />
    </>
  );
};
