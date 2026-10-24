// Шаг 1: звук из видео в формате, который понимает whisper (моно, 16 кГц, WAV).
// npm run audio -- <name>   →   public/<name>.wav
import path from "node:path";
import {findSource, needName, remotion} from "./config.mjs";

const name = needName();
const src = findSource(name);
remotion(["ffmpeg", "-y", "-loglevel", "error", "-i", path.join("public", src), "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", path.join("public", `${name}.wav`)]);
console.log(`Готово: public/${name}.wav`);
