import { Audio, Video } from "@remotion/media";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrandBg } from "./components/BrandBg";
import {
  CORNER_L,
  CORNER_R,
  FULL,
  FaceCard,
  GONE,
  HERO,
  Punch,
  RIGHT,
  TOP,
  type Rect,
} from "./components/FaceCard";
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

// Where the speaker's card sits over time (frame, rect).
const CARD_TRACK: [number, Rect][] = [
  [0, FULL],
  [14, FULL],
  [24, HERO],
  [49, HERO],
  [57, CORNER_R],
  [89, CORNER_R],
  [97, RIGHT],
  [116, RIGHT],
  [124, CORNER_L],
  [155, CORNER_L],
  [163, TOP],
  [187, TOP],
  [195, CORNER_R],
  [232, CORNER_R],
  [242, TOP],
  [286, TOP],
  [294, GONE],
];

// Scene-change "camera kicks": the whole stage punches in and settles.
const KICKS = [14, 49, 89, 116, 155, 187, 232, 286];

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  let kick = 0;
  for (const k of KICKS) {
    if (frame >= k) kick = Math.max(kick, 0.05 * Math.exp(-(frame - k) / 4));
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

        {/* ---------- Graphics behind the speaker ---------- */}
        <Sequence name="Any brand · sphere" from={52} durationInFrames={42}>
          <AnyBrandDecor />
        </Sequence>
        <Sequence name="Step 01 · band" from={92} durationInFrames={31}>
          <FirstDecor />
        </Sequence>
        <Sequence name="Research · pulse + lens" from={119} durationInFrames={41}>
          <ResearchDecor />
        </Sequence>
        <Sequence name="Brief · document" from={190} durationInFrames={46}>
          <BriefDecor />
        </Sequence>

        {/* ---------- Speaker card: jump cuts with punch-ins ---------- */}
        <FaceCard track={CARD_TRACK}>
          <Sequence name="A · hook" from={0} durationInFrames={31}>
            <Punch zoom={1.12}>
              <Video src={SRC} trimBefore={6} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="B1 · any brand" from={31} durationInFrames={44}>
            <Punch zoom={1}>
              <Video src={SRC} trimBefore={42} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="B2 · first thing" from={75} durationInFrames={44}>
            <Punch zoom={1.18}>
              <Video src={SRC} trimBefore={86} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="C · brand research" from={119} durationInFrames={32}>
            <Punch zoom={1.05}>
              <Video src={SRC} trimBefore={137} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="D · this phase" from={151} durationInFrames={39}>
            <Punch zoom={1.15}>
              <Video src={SRC} trimBefore={178} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="E1 · the brief" from={190} durationInFrames={45}>
            <Punch zoom={1}>
              <Video src={SRC} trimBefore={225} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
          <Sequence name="E2 · market research" from={235} durationInFrames={55}>
            <Punch zoom={1.14}>
              <Video src={SRC} trimBefore={270} objectFit="cover" style={{ width: "100%", height: "100%" }} />
            </Punch>
          </Sequence>
        </FaceCard>

        {/* ---------- Kinetic type in front ---------- */}
        <Sequence name="Hook · text" from={0} durationInFrames={56}>
          <HookText />
        </Sequence>
        <Sequence name="Any brand · text" from={52} durationInFrames={42}>
          <AnyBrandText />
        </Sequence>
        <Sequence name="Step 01 · text" from={92} durationInFrames={31}>
          <FirstText />
        </Sequence>
        <Sequence name="Research · text" from={119} durationInFrames={41}>
          <ResearchText />
        </Sequence>
        <Sequence name="Phase · text" from={158} durationInFrames={34}>
          <PhaseText />
        </Sequence>
        <Sequence name="Brief · text" from={190} durationInFrames={46}>
          <BriefText />
        </Sequence>
        <Sequence name="Market · text" from={234} durationInFrames={58}>
          <MarketText />
        </Sequence>
        <Sequence name="Outro · text" from={290} durationInFrames={36}>
          <OutroText />
        </Sequence>
      </Stage>

      {/* Lavender flashes on the big beats */}
      <Sequence name="Flash · research" from={126} durationInFrames={8}>
        <Flash />
      </Sequence>
      <Sequence name="Flash · outro" from={292} durationInFrames={8}>
        <Flash />
      </Sequence>

      {/* ---------- Sound design ---------- */}
      <Audio name="sfx start click" src={staticFile("sfx/select_003.wav")} from={1} volume={0.4} />
      <Audio name="sfx whoosh · hero" src={staticFile("sfx/whoosh.wav")} from={10} volume={0.5} />
      <Audio name="sfx pop · BUILDING" src={staticFile("sfx/pluck_001.wav")} from={20} volume={0.55} />
      <Audio name="sfx whoosh · corner" src={staticFile("sfx/swish.wav")} from={47} volume={0.5} />
      <Audio name="sfx pop · BRAND" src={staticFile("sfx/maximize_006.wav")} from={63} volume={0.45} />
      <Audio name="sfx badges" src={staticFile("sfx/pluck_001.wav")} from={62} volume={0.35} playbackRate={1.3} />
      <Audio name="sfx whoosh · step" src={staticFile("sfx/whoosh.wav")} from={86} volume={0.5} />
      <Audio name="sfx pop · FIRST" src={staticFile("sfx/select_003.wav")} from={100} volume={0.5} />
      <Audio name="sfx riser" src={staticFile("sfx/riser.wav")} from={128 - 1.2 * fps} volume={0.3} />
      <Audio name="sfx boom · BRAND" src={staticFile("sfx/boom.wav")} from={128} volume={0.6} />
      <Audio name="sfx glitch · RESEARCH" src={staticFile("sfx/glitch_002.wav")} from={133} volume={0.5} />
      <Audio name="sfx scribble 1" src={staticFile("sfx/swish.wav")} from={138} volume={0.35} playbackRate={1.4} />
      <Audio name="sfx whoosh · phase" src={staticFile("sfx/whoosh.wav")} from={152} volume={0.5} />
      <Audio name="sfx pop · PHASE" src={staticFile("sfx/pluck_001.wav")} from={170} volume={0.5} />
      <Audio name="sfx whoosh · brief" src={staticFile("sfx/swish.wav")} from={186} volume={0.5} />
      <Audio name="sfx pop · BRIEF" src={staticFile("sfx/maximize_006.wav")} from={204} volume={0.45} />
      <Audio name="sfx tick 1" src={staticFile("sfx/click_002.wav")} from={208} volume={0.8} />
      <Audio name="sfx tick 2" src={staticFile("sfx/click_002.wav")} from={214} volume={0.8} />
      <Audio name="sfx tick 3" src={staticFile("sfx/click_002.wav")} from={220} volume={0.8} />
      <Audio name="sfx whoosh · market" src={staticFile("sfx/whoosh.wav")} from={229} volume={0.5} />
      <Audio name="sfx pop · MARKET" src={staticFile("sfx/select_003.wav")} from={264} volume={0.5} />
      <Audio name="sfx scribble 2" src={staticFile("sfx/swish.wav")} from={268} volume={0.35} playbackRate={1.4} />
      <Audio name="sfx whoosh · outro" src={staticFile("sfx/whoosh.wav")} from={284} volume={0.5} />
      <Audio name="sfx ding · SAVE" src={staticFile("sfx/confirmation_002.wav")} from={296} volume={0.45} />
    </AbsoluteFill>
  );
};
