import React from "react";
import {CalculateMetadataFunction, Composition, staticFile} from "remotion";
import {Edit} from "./Edit";
import type {EditProps, Timeline} from "./types";

// Длительность и размер кадра берутся из public/<name>.timeline.json,
// поэтому один и тот же шаблон подходит и для вертикали, и для горизонтали.
const calculateMetadata: CalculateMetadataFunction<EditProps> = async ({props}) => {
  try {
    const res = await fetch(staticFile(`${props.name}.timeline.json`));
    if (!res.ok) throw new Error(String(res.status));
    const timeline = (await res.json()) as Timeline;
    return {
      fps: timeline.fps,
      width: timeline.width,
      height: timeline.height,
      durationInFrames: Math.max(1, Math.round((timeline.durationMs / 1000) * timeline.fps)),
      props: {...props, timeline},
    };
  } catch {
    return {fps: 30, width: 1080, height: 1920, durationInFrames: 90, props: {...props, timeline: null}};
  }
};

export const Root: React.FC = () => (
  <Composition
    id="Edit"
    component={Edit}
    fps={30}
    width={1080}
    height={1920}
    durationInFrames={90}
    defaultProps={{name: "input", timeline: null}}
    calculateMetadata={calculateMetadata}
  />
);
