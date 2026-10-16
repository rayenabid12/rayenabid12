import { AbsoluteFill } from "remotion";
import { BigWord, Pill, SmallCaps } from "../components/Headline";
import { BottomFade } from "../components/Face";
import { colors } from "../theme";

export const HookOverlay: React.FC = () => (
  <AbsoluteFill>
    <BottomFade />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
      <SmallCaps delay={0} size={48} style={{ marginBottom: 18 }}>
        When you start
      </SmallCaps>
      <BigWord delay={6} size={215}>
        BUILDING
      </BigWord>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const StepOneOverlay: React.FC = () => (
  <AbsoluteFill>
    <BottomFade />
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 260, gap: 18 }}
    >
      <Pill>STEP 01</Pill>
      <BigWord delay={4} size={250}>
        FIRST
      </BigWord>
      <SmallCaps delay={8} size={46}>
        thing to do
      </SmallCaps>
    </AbsoluteFill>
  </AbsoluteFill>
);

export const PhaseOverlay: React.FC = () => (
  <AbsoluteFill>
    <BottomFade />
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
      <SmallCaps size={50} color={colors.ink}>
        In this phase
      </SmallCaps>
      <SmallCaps size={40} delay={8} color={colors.purple} style={{ marginTop: 12 }}>
        ↓ you do 2 things
      </SmallCaps>
    </AbsoluteFill>
  </AbsoluteFill>
);
