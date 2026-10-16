import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Punch } from "./components/Face";
import { AnyBrand } from "./scenes/AnyBrand";
import { BrandResearch } from "./scenes/BrandResearch";
import { MarketSplit } from "./scenes/MarketSplit";
import { Outro } from "./scenes/Outro";
import { HookOverlay, PhaseOverlay, StepOneOverlay } from "./scenes/Overlays";
import { TheBrief } from "./scenes/TheBrief";

// Source: public/graded.mp4 (colour-graded + voice-polished, see scripts/grade.sh).
// Silences cut out (adaptive silencedetect @ -33.9 dB): 0–0.26s, 1.17–1.46s,
// 4.29–4.62s, 5.60–5.97s, 7.19–7.54s. Long takes are split for punch-in zooms.
const SRC = staticFile("graded.mp4");

export const Edit: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#EADCFD" }}>
      {/* ---------- A-roll: talking head, jump cuts ---------- */}
      <Sequence name="A · hook" from={0} durationInFrames={31}>
        <Punch zoom={1.14}>
          <Video src={SRC} trimBefore={6} />
        </Punch>
      </Sequence>
      <Sequence name="B1 · any brand" from={31} durationInFrames={44}>
        <Punch zoom={1}>
          <Video src={SRC} trimBefore={42} />
        </Punch>
      </Sequence>
      <Sequence name="B2 · first thing" from={75} durationInFrames={44}>
        <Punch zoom={1.16}>
          <Video src={SRC} trimBefore={86} />
        </Punch>
      </Sequence>
      <Sequence name="C · brand research" from={119} durationInFrames={32}>
        <Punch zoom={1}>
          <Video src={SRC} trimBefore={137} />
        </Punch>
      </Sequence>
      <Sequence name="D · this phase" from={151} durationInFrames={39}>
        <Punch zoom={1.12}>
          <Video src={SRC} trimBefore={178} />
        </Punch>
      </Sequence>
      <Sequence name="E1 · the brief" from={190} durationInFrames={45}>
        <Punch zoom={1}>
          <Video src={SRC} trimBefore={225} />
        </Punch>
      </Sequence>
      <Sequence name="E2 · market research" from={235} durationInFrames={55}>
        <MarketSplit textDelay={18}>
          <Punch zoom={1.1}>
            <Video src={SRC} trimBefore={270} />
          </Punch>
        </MarketSplit>
      </Sequence>

      {/* ---------- Text overlays on the A-roll ---------- */}
      <Sequence name="Hook text" from={0} durationInFrames={31}>
        <HookOverlay />
      </Sequence>
      <Sequence name="Step 01 text" from={92} durationInFrames={27}>
        <StepOneOverlay />
      </Sequence>
      <Sequence name="Phase text" from={160} durationInFrames={30}>
        <PhaseOverlay />
      </Sequence>

      {/* ---------- B-roll (full screen, purple style) ---------- */}
      <Sequence name="B-roll · Any brand" from={56} durationInFrames={36}>
        <AnyBrand />
      </Sequence>
      <Sequence name="B-roll · Brand research" from={121} durationInFrames={39}>
        <BrandResearch />
      </Sequence>
      <Sequence name="B-roll · The brief" from={194} durationInFrames={40}>
        <TheBrief />
      </Sequence>
      <Sequence name="Outro" from={290} durationInFrames={36}>
        <Outro />
      </Sequence>

      {/* ---------- Sound design ---------- */}
      <Audio name="sfx hook pop" src={staticFile("sfx/select_003.wav")} from={6} volume={0.5} />
      <Audio name="sfx whoosh 1" src={staticFile("sfx/whoosh.wav")} from={50} volume={0.55} />
      <Audio name="sfx badge 1" src={staticFile("sfx/pluck_001.wav")} from={66} volume={0.45} />
      <Audio name="sfx badge 2" src={staticFile("sfx/pluck_001.wav")} from={69} volume={0.45} playbackRate={1.12} />
      <Audio name="sfx badge 3" src={staticFile("sfx/pluck_001.wav")} from={72} volume={0.45} playbackRate={1.25} />
      <Audio name="sfx badge 4" src={staticFile("sfx/pluck_001.wav")} from={75} volume={0.45} playbackRate={1.4} />
      <Audio name="sfx badge 5" src={staticFile("sfx/pluck_001.wav")} from={78} volume={0.45} playbackRate={1.5} />
      <Audio name="sfx swish out 1" src={staticFile("sfx/swish.wav")} from={87} volume={0.5} />
      <Audio name="sfx step pill" src={staticFile("sfx/maximize_006.wav")} from={92} volume={0.45} />
      <Audio name="sfx riser" src={staticFile("sfx/riser.wav")} from={121 - 1.2 * fps} volume={0.35} />
      <Audio name="sfx boom" src={staticFile("sfx/boom.wav")} from={121} volume={0.6} />
      <Audio name="sfx glitch" src={staticFile("sfx/glitch_002.wav")} from={129} volume={0.5} />
      <Audio name="sfx swish out 2" src={staticFile("sfx/swish.wav")} from={155} volume={0.5} />
      <Audio name="sfx whoosh 2" src={staticFile("sfx/whoosh.wav")} from={188} volume={0.55} />
      <Audio name="sfx tick 1" src={staticFile("sfx/click_002.wav")} from={206} volume={0.8} />
      <Audio name="sfx tick 2" src={staticFile("sfx/click_002.wav")} from={212} volume={0.8} />
      <Audio name="sfx tick 3" src={staticFile("sfx/click_002.wav")} from={218} volume={0.8} />
      <Audio name="sfx swish out 3" src={staticFile("sfx/swish.wav")} from={229} volume={0.5} />
      <Audio name="sfx split whoosh" src={staticFile("sfx/whoosh.wav")} from={243} volume={0.45} />
      <Audio name="sfx market pop" src={staticFile("sfx/select_003.wav")} from={255} volume={0.5} />
      <Audio name="sfx outro whoosh" src={staticFile("sfx/whoosh.wav")} from={286} volume={0.5} />
      <Audio name="sfx outro ding" src={staticFile("sfx/confirmation_002.wav")} from={292} volume={0.45} />
    </AbsoluteFill>
  );
};
