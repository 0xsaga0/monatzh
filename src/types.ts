// Формат public/<name>.timeline.json — его пишет scripts/build-timeline.mjs.

export type Segment = {
  // где кусок лежит в исходнике
  origStartMs: number;
  origEndMs: number;
  // где он стоит в готовом ролике (паузы между кусками вырезаны)
  newStartMs: number;
  newEndMs: number;
};

export type Token = {text: string; fromMs: number; toMs: number};

export type Page = {startMs: number; endMs: number; text: string; tokens: Token[]};

export type Timeline = {
  source: string;
  fps: number;
  width: number;
  height: number;
  durationMs: number;
  segments: Segment[];
  pages: Page[];
};

export type EditProps = {name: string; timeline: Timeline | null};
