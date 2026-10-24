// Один раз: ставит whisper.cpp и модель распознавания. npm run setup:whisper
// На Windows скачивается готовая сборка, на macOS/Linux whisper.cpp собирается из исходников (нужны git и make).
import fs from "node:fs";
import {downloadWhisperModel, installWhisperCpp} from "@remotion/install-whisper-cpp";
import {WHISPER_DIR, WHISPER_HOME, WHISPER_MODEL, WHISPER_VERSION, hasSpaceOrNonAscii} from "./config.mjs";

if (hasSpaceOrNonAscii(WHISPER_HOME)) {
  console.error(`В пути ${WHISPER_HOME} есть пробел или кириллица — установка whisper.cpp на таком пути падает. Задай WHISPER_HOME, например C:\\whisper.`);
  process.exit(1);
}

fs.mkdirSync(WHISPER_HOME, {recursive: true});
// установщик скачивает архив в текущую папку — работаем из папки без пробелов
process.chdir(WHISPER_HOME);

console.log(`whisper.cpp ${WHISPER_VERSION} → ${WHISPER_DIR}`);
await installWhisperCpp({to: WHISPER_DIR, version: WHISPER_VERSION, printOutput: true});

console.log(`Модель ${WHISPER_MODEL} → ${WHISPER_DIR}`);
let last = -1;
const {alreadyExisted} = await downloadWhisperModel({
  model: WHISPER_MODEL,
  folder: WHISPER_DIR,
  onProgress: (downloaded, total) => {
    const pct = Math.floor((downloaded / total) * 100);
    if (pct >= last + 10) {
      last = pct;
      console.log(`  ${pct}%`);
    }
  },
});
console.log(alreadyExisted ? "Модель уже была скачана." : "Модель скачана.");
console.log("Готово. Проверь: npm run doctor");
