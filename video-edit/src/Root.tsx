import { Composition } from "remotion";
import { Edit } from "./Edit";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BrandResearchReel"
      component={Edit}
      durationInFrames={369}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
