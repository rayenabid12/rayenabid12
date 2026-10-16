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
  held?: React.ReactNode;
  over?: React.ReactNode;
  alive?: boolean; // moving holds, natural blinks, horizontal smear stretch
  style?: React.CSSProperties;
}> = ({ keys, override, shadow, held, over, alive = false, style }) => {
  const frame = useCurrentFrame();
  const pose = { ...animatedPose(keys, frame, alive), ...override };
  return <BoumMonster pose={pose} shadow={shadow} held={held} over={over} style={style} />;
};
