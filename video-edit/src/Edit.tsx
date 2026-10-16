import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandBg } from "./components/BrandBg";
import { FULL, FaceCard, Punch, TOP, type Rect } from "./components/FaceCard";
import { Knot3D, FloatingShapes, Sphere3D } from "./components/ThreeD";
import { Flash } from "./components/Transitions";
import {
  AnyBrandDecor,
  AnyBrandText,
  BriefDecor,
  BriefText,
  FirstDecor,
  FirstText,
  HookText,
  MarketText,
  OutroText,
  PhaseText,
  ResearchDecor,
  ResearchText,
} from "./scenes/Beats";

// Source: public/graded.mp4. The speaker is segmented and the room re-lit purple
// (scripts/purple_grade.py). Silences cut (adaptive silencedetect @ -33.9 dB):
// 0–0.26s, 1.17–1.46s, 4.29–4.62s, 5.60–5.97s, 7.19–7.54s.
const SRC = staticFile("graded.mp4");

// The speaker opens full screen, settles once into the TOP card, and stays there.
const CARD_TRACK: [number, Rect][] = [
  [0, FULL],
  [20, FULL],
  [42, TOP],
];
// Beats where the speaker is on screen; in between, full-screen graphics take over.
const CARD_SHOWN: [number, number][] = [
  [0, 62], // hook
  [104, 134], // step 01
  [174, 211], // in this phase
  [256, 312], // market research
];

// Scene-change "camera kicks": the whole stage gently punches in and settles.
const KICKS = [18, 56, 96, 128, 172, 205, 252, 309];

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let kick = 0;
  for (const k of KICKS) {
    if (frame >= k) kick = Math.max(kick, 0.02 * Math.exp(-(frame - k) / 8));
  }
  return (
    <AbsoluteFill
      style={{
        scale: String(interpolate(frame, [0, durationInFrames], [1, 1.04]) + kick),
        rotate: `${interpolate(frame, [0, durationInFrames], [0, 0.6])}deg`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Edit: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ backgroundColor: "#EADCFD", overflow: "hidden" }}>
      <Stage>
        <BrandBg petals="top-right" />
        <FloatingShapes />

        {/* ---------- Graphics behind the speaker ---------- */}
        <Sequence name="Any brand · 3D sphere" from={58} durationInFrames={44}>
          <Sphere3D />
        </Sequence>
        <Sequence name="Any brand · badges" from={58} durationInFrames={44}>
          <AnyBrandDecor />
        </Sequence>
        <Sequence name="Step 01 · band" from={98} durationInFrames={36}>
          <FirstDecor />
        </Sequence>
        <Sequence name="Research · pulse + lens" from={130} durationInFrames={46}>
          <ResearchDecor />
        </Sequence>
        <Sequence name="Brief · document" from={207} durationInFrames={49}>
          <BriefDecor />
        </Sequence>
        <Sequence name="Outro · 3D knot" from={309} durationInFrames={60}>
          <Knot3D />
        </Sequence>

        {/* ---------- Speaker card: jump cuts (≈0.2s breaths kept) with punch-ins ---------- */}
        <FaceCard track={CARD_TRACK} shown={CARD_SHOWN}>
          <Sequence name="A · hook" from={0} durationInFrames={34}>
            <Punch zoom={1.1}>
              <Video src={SRC} trimBefore={4} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="B1 · any brand" from={34} durationInFrames={46}>
            <Punch zoom={1}>
              <Video src={SRC} trimBefore={41} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="B2 · first thing" from={80} durationInFrames={45}>
            <Punch zoom={1.15}>
              <Video src={SRC} trimBefore={87} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="C · brand research" from={125} durationInFrames={36}>
            <Punch zoom={1.05}>
              <Video src={SRC} trimBefore={135} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="D · this phase" from={161} durationInFrames={44}>
            <Punch zoom={1.12}>
              <Video src={SRC} trimBefore={176} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="E1 · the brief" from={205} durationInFrames={48}>
            <Punch zoom={1}>
              <Video src={SRC} trimBefore={223} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="E2 · market research" from={253} durationInFrames={56}>
            <Punch zoom={1.12}>
              <Video src={SRC} trimBefore={271} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
        </FaceCard>

        {/* ---------- Kinetic type in front ---------- */}
        <Sequence name="Hook · text" from={0} durationInFrames={60}>
          <HookText />
        </Sequence>
        <Sequence name="Any brand · text" from={58} durationInFrames={44}>
          <AnyBrandText />
        </Sequence>
        <Sequence name="Step 01 · text" from={98} durationInFrames={36}>
          <FirstText />
        </Sequence>
        <Sequence name="Research · text" from={130} durationInFrames={46}>
          <ResearchText />
        </Sequence>
        <Sequence name="Phase · text" from={172} durationInFrames={42}>
          <PhaseText />
        </Sequence>
        <Sequence name="Brief · text" from={207} durationInFrames={49}>
          <BriefText />
        </Sequence>
        <Sequence name="Market · text" from={254} durationInFrames={59}>
          <MarketText />
        </Sequence>
        <Sequence name="Outro · text" from={309} durationInFrames={60}>
          <OutroText />
        </Sequence>
      </Stage>

      {/* Lavender flashes on the big impacts */}
      <Sequence name="Flash · BRAND RESEARCH" from={141} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Flash · SAVE" from={315} durationInFrames={8}>
        <Flash />
      </Sequence>

      {/* ---------- Sound design ---------- */}
      <Audio name="sfx impact · open" src={staticFile("sfx/impact_soft.wav")} from={0} volume={0.55} />
      <Audio name="sfx whoosh · hero" src={staticFile("sfx/whoosh.wav")} from={14} volume={0.45} />
      <Audio name="sfx punch · BUILDING" src={staticFile("sfx/punch.wav")} from={30} volume={0.5} />
      <Audio name="sfx swish · corner" src={staticFile("sfx/swish.wav")} from={54} volume={0.45} />
      <Audio name="sfx impact · BRAND" src={staticFile("sfx/impact.wav")} from={69} volume={0.5} />
      <Audio name="sfx badges" src={staticFile("sfx/pluck_001.wav")} from={68} volume={0.3} playbackRate={1.3} />
      <Audio name="sfx whoosh · step" src={staticFile("sfx/whoosh.wav")} from={92} volume={0.45} />
      <Audio name="sfx pop · STEP" src={staticFile("sfx/maximize_006.wav")} from={102} volume={0.35} />
      <Audio name="sfx punch · FIRST" src={staticFile("sfx/punch.wav")} from={110} volume={0.5} />
      <Audio name="sfx riser" src={staticFile("sfx/riser.wav")} from={141 - 1.2 * fps} volume={0.3} />
      <Audio name="sfx impact · BRAND RESEARCH" src={staticFile("sfx/impact.wav")} from={141} volume={0.7} />
      <Audio name="sfx boom tail" src={staticFile("sfx/boom.wav")} from={141} volume={0.3} />
      <Audio name="sfx plate · RESEARCH" src={staticFile("sfx/plate.wav")} from={148} volume={0.3} />
      <Audio name="sfx scribble 1" src={staticFile("sfx/swish.wav")} from={154} volume={0.3} playbackRate={1.3} />
      <Audio name="sfx whoosh · phase" src={staticFile("sfx/whoosh.wav")} from={168} volume={0.45} />
      <Audio name="sfx punch · PHASE" src={staticFile("sfx/punch.wav")} from={189} volume={0.45} />
      <Audio name="sfx swish · brief" src={staticFile("sfx/swish.wav")} from={201} volume={0.45} />
      <Audio name="sfx impact · BRIEF" src={staticFile("sfx/impact_soft.wav")} from={223} volume={0.7} />
      <Audio name="sfx tick 1" src={staticFile("sfx/click_002.wav")} from={229} volume={0.8} />
      <Audio name="sfx tick 2" src={staticFile("sfx/click_002.wav")} from={236} volume={0.8} />
      <Audio name="sfx tick 3" src={staticFile("sfx/click_002.wav")} from={243} volume={0.8} />
      <Audio name="sfx whoosh · market" src={staticFile("sfx/whoosh.wav")} from={248} volume={0.45} />
      <Audio name="sfx bars rise" src={staticFile("sfx/riser.wav")} from={268} volume={0.15} playbackRate={1.6} />
      <Audio name="sfx impact · MARKET" src={staticFile("sfx/impact.wav")} from={292} volume={0.55} />
      <Audio name="sfx whoosh · outro" src={staticFile("sfx/whoosh.wav")} from={305} volume={0.45} />
      <Audio name="sfx impact · SAVE" src={staticFile("sfx/impact.wav")} from={315} volume={0.65} />
      <Audio name="sfx ding · follow" src={staticFile("sfx/confirmation_002.wav")} from={323} volume={0.35} />
    </AbsoluteFill>
  );
};
