import type React from "react";
import { useCurrentFrame } from "remotion";
import { BoumMonster } from "./BoumMonster";
import { animatedPose, type Key, type Pose } from "./pose";

// Plays a keyed reaction through the physics pass. `override` lets a scene
// layer its own channels (e.g. position) on top of the reaction.
export const AnimatedMonster: React.FC<{
  keys: Key[];
  override?: Partial<Pose>;
  shadow?: boolean;
  style?: React.CSSProperties;
}> = ({ keys, override, shadow, style }) => {
  const frame = useCurrentFrame();
  const pose = { ...animatedPose(keys, frame), ...override };
  return <BoumMonster pose={pose} shadow={shadow} style={style} />;
};
