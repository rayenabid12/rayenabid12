import type React from "react";
import { AbsoluteFill } from "remotion";
import { displayFont } from "../theme";
import { Monster, type MonsterPose } from "./Monster";

const POSES: { label: string; pose: MonsterPose }[] = [
  { label: "Hello!", pose: { brow: "happy", mouthOpen: 0.9, rightArm: 130, leftArm: 10 } },
  { label: "Miam", pose: { squint: 1, brow: "happy", mouthOpen: 0, mouthWidth: 0.7, cheeks: 1 } },
  { label: "Determined", pose: { brow: "determined", mouthOpen: 0.25, mouthWidth: 0.3, lookY: -0.2 } },
  { label: "Uh-oh", pose: { brow: "worried", eyeScale: 1.12, mouthOpen: 0.35, mouthWidth: 0.4, lookX: 0.6, lookY: -0.6 } },
  { label: "BOUM!", pose: { brow: "surprised", eyeScale: 1.22, mouthOpen: 1, mouthWidth: 0.55, squash: 1.1, leftArm: 110, rightArm: 110 } },
  { label: "Yum!", pose: { brow: "happy", mouthOpen: 1, squint: 1, leftArm: 70, rightArm: 70 } },
];

// Model sheet for reviewing the mascot rig.
export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{ background: "#FFF1F7", flexDirection: "row", flexWrap: "wrap", padding: 60, gap: 20 }}>
    {POSES.map(({ label, pose }) => (
      <div key={label} style={{ width: 580, height: 480, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Monster {...pose} style={{ width: 340, height: 425 }} />
        <div style={{ fontFamily: displayFont, fontSize: 44, color: "#E3123B" }}>{label}</div>
      </div>
    ))}
  </AbsoluteFill>
);
