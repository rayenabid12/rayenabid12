import type React from "react";
import { LABEL, MARGIN } from "./design";

type LabelsProps = {
  readonly color: string;
  readonly tl?: string;
  readonly tr?: string;
  readonly bl?: string;
  readonly br?: string;
};

// Small editorial captions pinned to the four corners of the frame.
export const Labels: React.FC<LabelsProps> = ({ color, tl, tr, bl, br }) => {
  const base: React.CSSProperties = {
    position: "absolute",
    fontFamily: LABEL,
    fontWeight: 600,
    fontSize: 26,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color,
  };
  return (
    <>
      {tl ? <div style={{ ...base, top: 64, left: MARGIN }}>{tl}</div> : null}
      {tr ? <div style={{ ...base, top: 64, right: MARGIN, textAlign: "right" }}>{tr}</div> : null}
      {bl ? <div style={{ ...base, bottom: 64, left: MARGIN }}>{bl}</div> : null}
      {br ? <div style={{ ...base, bottom: 64, right: MARGIN, textAlign: "right" }}>{br}</div> : null}
    </>
  );
};
