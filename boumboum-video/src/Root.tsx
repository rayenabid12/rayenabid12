import { Composition, Folder, Still, staticFile } from "remotion";
import { Ep2BoumBoo } from "./episodes/ep2/Ep2BoumBoo";
import { Ep3Duel } from "./episodes/ep3/Ep3Duel";
import { Ep4Birthday } from "./episodes/ep4/Ep4Birthday";
import { EP5_DURATION, Ep5Origin } from "./episodes/ep5/Ep5Origin";
import { EP6_DURATION, Ep6Hero } from "./episodes/ep6/Ep6Hero";
import { BoumFinal } from "./final/BoumFinal";
import { BoumStory } from "./story/BoumStory";
import { CharacterSheet } from "./story/CharacterSheet";
import { DuoLineup } from "./rig/DuoLineup";
import { MELO_REEL_DURATION, MeloReaction, MeloReactionGrid, MeloReactionReel } from "./rig/MeloReactions";
import { MELO_REACTIONS } from "./rig/meloKeys";
import { MeloSheet, ModelSheet } from "./rig/ModelSheet";
import { REEL_DURATION, ReactionGrid, ReactionReel } from "./rig/ReactionReel";
import { BoumBoumPromo } from "./BoumBoumPromo";
import { BubblePop } from "./bubblepop/BubblePop";
import { KineticType } from "./kinetic/KineticType";
import { BiteScene } from "./bubblepop/scenes/BiteScene";
import { PayoffScene } from "./bubblepop/scenes/PayoffScene";
import { FlavorScene } from "./scenes/FlavorScene";
import { IntroScene } from "./scenes/IntroScene";
import { OutroScene } from "./scenes/OutroScene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Series">
        <Composition
          id="Ep2BoumBoo"
          component={Ep2BoumBoo}
          durationInFrames={900}
          fps={30}
          width={1080}
          height={1920}
        />
        <Composition id="Ep3Duel" component={Ep3Duel} durationInFrames={900} fps={30} width={1080} height={1920} />
        <Composition id="Ep4Birthday" component={Ep4Birthday} durationInFrames={900} fps={30} width={1080} height={1920} />
        <Composition id="Ep5Origin" component={Ep5Origin} durationInFrames={EP5_DURATION} fps={30} width={1080} height={1920} />
        <Composition id="Ep6Hero" component={Ep6Hero} durationInFrames={EP6_DURATION} fps={30} width={1080} height={1920} />
      </Folder>
      <Composition
        id="BoumFinal"
        component={BoumFinal}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BoumStory"
        component={BoumStory}
        durationInFrames={600}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Character">
        <Still id="ModelSheet" component={ModelSheet} width={3840} height={2500} />
        <Still id="MeloSheet" component={MeloSheet} width={3840} height={2500} />
        <Still id="DuoLineup" component={DuoLineup} width={1920} height={1080} />
        <Composition id="MeloReactionReel" component={MeloReactionReel} durationInFrames={MELO_REEL_DURATION} fps={30} width={1920} height={1080} />
        <Composition id="MeloReactionGrid" component={MeloReactionGrid} durationInFrames={300} fps={30} width={1920} height={1080} />
        {MELO_REACTIONS.map((r, i) => (
          <Composition
            key={r.id}
            id={`Melo-${r.id}`}
            component={MeloReaction}
            defaultProps={{ index: i }}
            durationInFrames={r.duration}
            fps={30}
            width={1080}
            height={1080}
          />
        ))}
        <Composition
          id="ReactionReel"
          component={ReactionReel}
          durationInFrames={REEL_DURATION}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="ReactionGrid"
          component={ReactionGrid}
          durationInFrames={200}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
      <Still id="CharacterSheet" component={CharacterSheet} width={1920} height={1080} />
      <Composition
        id="KineticType"
        component={KineticType}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="BubblePop"
        component={BubblePop}
        durationInFrames={450}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="BubblePop-Scenes">
        <Composition
          id="PastequeBite"
          component={BiteScene}
          durationInFrames={125}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            flavor: "PASTÈQUE",
            subtitle: "Fourré coulis",
            bg: "#2E9E3E",
            bgLight: "#5CC46A",
            titleOutline: "#1F7A2E",
            gooColor: "#C70D3A",
            gooLight: "#FF7A9A",
            heroSrc: staticFile("gum-pasteque.webp"),
            packSrc: staticFile("packs-pasteque.webp"),
            mascotSide: "left",
            biteFrame: 50,
          }}
        />
        <Composition
          id="FraiseBite"
          component={BiteScene}
          durationInFrames={105}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{
            flavor: "FRAISE",
            subtitle: "Fourré goût",
            bg: "#E01F3D",
            bgLight: "#FF5A73",
            titleOutline: "#B5122C",
            gooColor: "#D3123F",
            gooLight: "#FF8FA8",
            heroSrc: staticFile("pack-fraise.webp"),
            packSrc: staticFile("box-fraise.webp"),
            mascotSide: "right",
            biteFrame: 38,
          }}
        />
        <Composition
          id="Payoff"
          component={PayoffScene}
          durationInFrames={76}
          fps={30}
          width={1080}
          height={1920}
          defaultProps={{ cta: "Fais BOUM !" }}
        />
      </Folder>
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
