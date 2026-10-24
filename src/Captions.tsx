import React from "react";
import {AbsoluteFill, useVideoConfig} from "remotion";
import {captionFont} from "./fonts";
import {CAPTIONS} from "./style";
import type {Page} from "./types";

// Обводка из 16 теней по кругу — ровнее, чем -webkit-text-stroke на кириллице
const outline = (width: number, color: string) =>
  Array.from({length: 16}, (_, i) => {
    const a = (i / 16) * Math.PI * 2;
    return `${(Math.cos(a) * width).toFixed(2)}px ${(Math.sin(a) * width).toFixed(2)}px 0 ${color}`;
  }).join(", ");

export const Captions: React.FC<{page: Page; nowMs: number}> = ({page, nowMs}) => {
  const {width} = useVideoConfig();
  const fontSize = Math.round(width * CAPTIONS.fontSizePctOfWidth);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          top: `${CAPTIONS.topPct}%`,
          left: `${CAPTIONS.sidePaddingPct}%`,
          right: `${CAPTIONS.sidePaddingPct}%`,
          transform: "translateY(-50%)",
          textAlign: "center",
          fontFamily: captionFont,
          fontWeight: CAPTIONS.fontWeight,
          fontSize,
          lineHeight: 1.15,
          textTransform: CAPTIONS.uppercase ? "uppercase" : "none",
          textShadow: outline(Math.max(1, fontSize * CAPTIONS.strokePctOfFont), CAPTIONS.strokeColor),
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
        }}
      >
        {page.tokens.map((t, i) => (
          <span key={i} style={{color: t.fromMs <= nowMs && nowMs < t.toMs ? CAPTIONS.activeColor : CAPTIONS.color}}>
            {t.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
