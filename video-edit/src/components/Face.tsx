import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// Punch-in zoom on each jump cut (hides the cut) with a slow push during the clip.
export const Punch: React.FC<{
  children: React.ReactNode;
  zoom: number;
  push?: number;
}> = ({ children, zoom, push = 0.03 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "50% 32%",
        scale: String(
          interpolate(frame, [0, durationInFrames], [zoom, zoom + push], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        ),
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// Soft lavender fade at the bottom so overlay text reads on top of the shot.
export const BottomFade: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(180deg, rgba(234,220,253,0) 52%, rgba(234,220,253,0.55) 78%, rgba(214,190,250,0.85) 100%)",
    }}
  />
);
