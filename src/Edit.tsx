import React from "react";
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {Captions} from "./Captions";
import type {EditProps} from "./types";

const toFrames = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const Edit: React.FC<EditProps> = ({name, timeline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  if (!timeline) {
    return (
      <AbsoluteFill style={{backgroundColor: "#111", color: "#fff", justifyContent: "center", alignItems: "center", padding: 60, textAlign: "center", fontSize: 44, fontFamily: "sans-serif"}}>
        Нет public/{name}.timeline.json. Сначала: npm run audio -- {name}, npm run transcribe -- {name}, npm run timeline -- {name}
      </AbsoluteFill>
    );
  }

  const nowMs = (frame / fps) * 1000;
  const page = timeline.pages.find((p) => nowMs >= p.startMs && nowMs < p.endMs);

  return (
    <AbsoluteFill style={{backgroundColor: "#000"}}>
      {timeline.segments.map((s, i) => {
        const from = toFrames(s.newStartMs, fps);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, toFrames(s.newEndMs, fps) - from)}>
            <OffthreadVideo
              src={staticFile(timeline.source)}
              trimBefore={toFrames(s.origStartMs, fps)}
              trimAfter={toFrames(s.origEndMs, fps)}
              style={{width: "100%", height: "100%", objectFit: "cover"}}
            />
          </Sequence>
        );
      })}
      {page ? <Captions page={page} nowMs={nowMs} /> : null}
    </AbsoluteFill>
  );
};
