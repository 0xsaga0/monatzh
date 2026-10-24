// Шаг 4: нарезка пауз и страницы субтитров → public/<name>.timeline.json (его читает Remotion).
// npm run timeline -- <name>
// Берёт вычитанный public/<name>.words.fixed.json, а если его нет — сырой public/<name>.words.json.
import fs from "node:fs";
import path from "node:path";
import {createTikTokStyleCaptions} from "@remotion/captions";
import {PUBLIC, findSource, needName, remotion} from "./config.mjs";

const GAP_MS = 400; // паузы длиннее — вырезаются (правило 7)
const PAD_MS = 80; // запас у границы слова, чтобы не было щелчка (правило 7)
const COMBINE_MS = 900; // сколько слов показывать одной страницей субтитров
const FPS = 30;

const name = needName();
const source = findSource(name);
const fixedFile = path.join(PUBLIC, `${name}.words.fixed.json`);
const rawFile = path.join(PUBLIC, `${name}.words.json`);
const wordsFile = fs.existsSync(fixedFile) ? fixedFile : rawFile;
if (!fs.existsSync(wordsFile)) {
  console.error(`Нет public/${name}.words.json — сначала npm run transcribe -- ${name}`);
  process.exit(1);
}
if (wordsFile === rawFile) console.warn(`⚠ Субтитры не вычитаны: нет public/${name}.words.fixed.json (правило 2). Беру сырой текст.`);

const words = JSON.parse(fs.readFileSync(wordsFile, "utf8")).filter((w) => w.text.trim());

// размер кадра и длительность исходника; у видео с телефона учитываем поворот
const probe = JSON.parse(
  remotion(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation:stream_tags=rotate:format=duration", "-of", "json", path.join("public", source)], {capture: true}),
);
const stream = probe.streams[0];
const rotation = Math.abs(Number(stream.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ?? stream.tags?.rotate ?? 0));
const [width, height] = rotation === 90 || rotation === 270 ? [stream.height, stream.width] : [stream.width, stream.height];
const totalMs = Math.round(Number(probe.format.duration) * 1000);

// куски речи между длинными паузами; хвост после последнего слова отрезается
const raw = [];
let start = words[0].startMs > GAP_MS ? Math.max(0, words[0].startMs - PAD_MS) : 0;
for (let i = 0; i < words.length - 1; i++) {
  if (words[i + 1].startMs - words[i].endMs > GAP_MS) {
    const end = Math.min(totalMs, words[i].endMs + PAD_MS);
    raw.push({origStartMs: start, origEndMs: end});
    start = Math.max(end, words[i + 1].startMs - PAD_MS);
  }
}
raw.push({origStartMs: start, origEndMs: Math.min(totalMs, words[words.length - 1].endMs + PAD_MS)});

let cursor = 0;
const segments = raw
  .filter((s) => s.origEndMs > s.origStartMs)
  .map((s) => {
    const seg = {...s, newStartMs: cursor, newEndMs: cursor + (s.origEndMs - s.origStartMs)};
    cursor = seg.newEndMs;
    return seg;
  });

const toNew = (ms) => {
  for (const s of segments) if (ms >= s.origStartMs && ms <= s.origEndMs) return s.newStartMs + (ms - s.origStartMs);
  return ms < segments[0].origStartMs ? 0 : segments[segments.length - 1].newEndMs;
};

// точки в конце фраз не ставим (правило 2), многоточие оставляем
const remapped = words.map((w) => ({...w, text: w.text.replace(/(?<!\.)\.$/, ""), startMs: toNew(w.startMs), endMs: toNew(w.endMs)}));

const {pages} = createTikTokStyleCaptions({captions: remapped, combineTokensWithinMilliseconds: COMBINE_MS});

const timeline = {
  source,
  fps: FPS,
  width,
  height,
  durationMs: cursor,
  segments,
  pages: pages.map((p) => ({startMs: p.startMs, endMs: p.startMs + p.durationMs, text: p.text, tokens: p.tokens.map(({text, fromMs, toMs}) => ({text, fromMs, toMs}))})),
};
fs.writeFileSync(path.join(PUBLIC, `${name}.timeline.json`), JSON.stringify(timeline, null, 2));

const sec = (ms) => (ms / 1000).toFixed(1);
console.log(`Готово: public/${name}.timeline.json — ${width}×${height}, ${segments.length} кусков, ${timeline.pages.length} страниц субтитров`);
console.log(`Длина: ${sec(totalMs)} с → ${sec(cursor)} с (вырезано ${sec(totalMs - cursor)} с пауз и хвоста)`);
