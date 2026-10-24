// Проверка окружения: npm run doctor. Печатает, что готово, а что ещё нужно сделать.
import fs from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";
import {PROJECT, WHISPER_DIR, WHISPER_HOME, WHISPER_MODEL, hasSpaceOrNonAscii} from "./config.mjs";

let ok = true;
const line = (good, text, fix) => {
  console.log(`${good ? "✓" : "✗"} ${text}${good || !fix ? "" : `\n    → ${fix}`}`);
  if (!good) ok = false;
};

const major = Number(process.versions.node.split(".")[0]);
line(major >= 20, `Node.js ${process.versions.node}`, "поставь Node.js LTS (20 или новее): https://nodejs.org");

line(!hasSpaceOrNonAscii(PROJECT), `путь проекта без пробелов и кириллицы: ${PROJECT}`, "перенеси папку проекта, например в C:\\montazh или ~/montazh");

line(fs.existsSync(path.join(PROJECT, "node_modules", "remotion")), "зависимости установлены", "выполни npm install в папке проекта");

const ff = spawnSync("npx remotion ffmpeg -version", {shell: true, encoding: "utf8"});
line(ff.status === 0, `встроенный ffmpeg: ${(ff.stdout || "").split("\n")[0].trim() || "нет ответа"}`, "сначала npm install, потом повтори");

line(!hasSpaceOrNonAscii(WHISPER_HOME), `папка whisper без пробелов: ${WHISPER_HOME}`, "задай WHISPER_HOME, например C:\\whisper");

const exe = path.join(WHISPER_DIR, process.platform === "win32" ? "main.exe" : "main");
line(fs.existsSync(exe), `whisper.cpp установлен: ${WHISPER_DIR}`, "npm run setup:whisper");

const model = path.join(WHISPER_DIR, `ggml-${WHISPER_MODEL}.bin`);
line(fs.existsSync(model), `модель ${WHISPER_MODEL}: ${model}`, "npm run setup:whisper (medium весит ~1,5 ГБ)");

console.log(ok ? "\nВсё готово. Дальше: положи видео в public/ и следуй CLAUDE.md, раздел «Монтаж одного ролика»." : "\nИсправь пункты с ✗ и запусти npm run doctor ещё раз.");
process.exit(ok ? 0 : 1);
