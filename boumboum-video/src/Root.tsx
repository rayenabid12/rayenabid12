import { Composition, Folder, staticFile } from "remotion";
import { BoumBoumPromo } from "./BoumBoumPromo";
import { FlavorScene } from "./scenes/FlavorScene";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BoumBoumPromo"
        component={BoumBoumPromo}
        durationInFrames={405}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Scenes">
        <Composition
          id="Intro"
          component={IntroScene}
          durationInFrames={90}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ tagline: "Bubble Gum fourré" }}
        />
        <Composition
          id="Pasteque"
          component={FlavorScene}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            flavor: "PASTÈQUE",
            subtitle: "Fourré coulis goût",
            stripeA: "#2E9E3E",
            stripeB: "#1F7A2E",
            heroSrc: staticFile("gum-pasteque.webp"),
            packSrc: staticFile("packs-pasteque.webp"),
          }}
        />
        <Composition
          id="Fraise"
          component={FlavorScene}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            flavor: "FRAISE",
            subtitle: "Fourré goût",
            stripeA: "#E01F3D",
            stripeB: "#B5122C",
            heroSrc: staticFile("pack-fraise.webp"),
            packSrc: staticFile("box-fraise.webp"),
          }}
        />
        <Composition
          id="Outro"
          component={OutroScene}
          durationInFrames={120}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ cta: "Fais BOUM !", badge: "Colorants naturels" }}
        />
      </Folder>
    </>
  );
};
