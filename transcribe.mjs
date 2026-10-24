// Шаг 2: распознавание речи с временем каждого слова (основа караоке-субтитров).
// npm run transcribe -- <name>   →   public/<name>.words.json + public/<name>.txt (текст для вычитки)
import fs from "node:fs";
import path from "node:path";
import {toCaptions, transcribe} from "@remotion/install-whisper-cpp";
import {LANGUAGE, PUBLIC, WHISPER_DIR, WHISPER_HOME, WHISPER_MODEL, WHISPER_VERSION, needName} from "./config.mjs";

const name = needName();
const wav = path.join(PUBLIC, `${name}.wav`);
if (!fs.existsSync(wav)) {
  console.error(`Нет public/${name}.wav — сначала npm run audio -- ${name}`);
  process.exit(1);
}
if (!fs.existsSync(path.join(WHISPER_DIR, `ggml-${WHISPER_MODEL}.bin`))) {
  console.error("whisper.cpp или модель не установлены — сначала npm run setup:whisper");
  process.exit(1);
}

// whisper.cpp вызывается без кавычек вокруг путей: работаем из папки без пробелов
const tmp = path.join(WHISPER_HOME, `${name}.wav`);
fs.copyFileSync(wav, tmp);
process.chdir(WHISPER_HOME);

console.log(`Распознаю ${name}.wav (модель ${WHISPER_MODEL}, язык ${LANGUAGE}). На процессоре это примерно ×2 от длины записи.`);
let last = -1;
const whisperCppOutput = await transcribe({
  model: WHISPER_MODEL,
  whisperPath: WHISPER_DIR,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: tmp,
  tokenLevelTimestamps: true,
  language: LANGUAGE,
  printOutput: false,
  onProgress: (p) => {
    const pct = Math.min(100, Math.floor(p * 100));
    if (pct >= last + 10) {
      last = pct;
      console.log(`  ${pct}%`);
    }
  },
});
fs.rmSync(tmp, {force: true});

const {captions} = toCaptions({whisperCppOutput});

// whisper отдаёт куски слов («попроб» + «овать», «Rem» + «otion»); кусок без пробела в начале
// приклеиваем к предыдущему — так караоке подсвечивает слово целиком, а вычитывать проще
const words = [];
for (const c of captions) {
  const prev = words[words.length - 1];
  if (prev && !c.text.startsWith(" ")) {
    prev.text += c.text;
    prev.endMs = c.endMs;
    prev.confidence = Math.min(prev.confidence ?? 1, c.confidence ?? 1);
  } else {
    words.push({...c});
  }
}

fs.writeFileSync(path.join(PUBLIC, `${name}.words.json`), JSON.stringify(words, null, 2));
fs.writeFileSync(path.join(PUBLIC, `${name}.txt`), words.map((c) => c.text).join("").trim() + "\n");
console.log(`Готово: public/${name}.words.json (${words.length} слов). Текст для вычитки — public/${name}.txt`);
