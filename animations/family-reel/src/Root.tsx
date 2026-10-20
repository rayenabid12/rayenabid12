import "./theme";
import { Composition, Folder } from "remotion";
import { Bookend } from "./Bookend";
import { CharacterReel } from "./CharacterReel";
import { ClipScene } from "./ClipScene";
import { FamilyReel } from "./FamilyReel";
import { NameCard } from "./NameCard";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="FamilyReel" component={FamilyReel} durationInFrames={5520} fps={24} width={1920} height={1080} />
      <Folder name="Characters">
        <Composition id="GirlReel" component={CharacterReel} durationInFrames={898} fps={24} width={1920} height={1080} defaultProps={{ who: "girl" }} />
        <Composition id="BoyReel" component={CharacterReel} durationInFrames={898} fps={24} width={1920} height={1080} defaultProps={{ who: "boy" }} />
        <Composition id="MomReel" component={CharacterReel} durationInFrames={898} fps={24} width={1920} height={1080} defaultProps={{ who: "mom" }} />
        <Composition id="DadReel" component={CharacterReel} durationInFrames={898} fps={24} width={1920} height={1080} defaultProps={{ who: "dad" }} />
        <Composition id="GrandmaReel" component={CharacterReel} durationInFrames={898} fps={24} width={1920} height={1080} defaultProps={{ who: "grandma" }} />
        <Composition id="GrandpaReel" component={CharacterReel} durationInFrames={898} fps={24} width={1920} height={1080} defaultProps={{ who: "grandpa" }} />
      </Folder>
      <Folder name="Scenes">
        <Composition id="Intro" component={Bookend} durationInFrames={108} fps={24} width={1920} height={1080} defaultProps={{ title: "Meet the family" }} />
        <Composition id="NameCard" component={NameCard} durationInFrames={48} fps={24} width={1920} height={1080} defaultProps={{ who: "mom" }} />
        <Composition id="EmotionsClip" component={ClipScene} durationInFrames={452} fps={24} width={1920} height={1080} defaultProps={{ clip: "mom_emotions", title: "Emotions", showEmotions: true }} />
      </Folder>
    </>
  );
};
