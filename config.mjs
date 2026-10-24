// Общие настройки и помощники для скриптов. Запускать из корня проекта через npm run.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawnSync} from "node:child_process";

export const PROJECT = process.cwd();
export const PUBLIC = path.join(PROJECT, "public");
export const OUT = path.join(PROJECT, "out");

// Whisper живёт отдельно от проекта, в папке без пробелов и кириллицы:
// установщик whisper.cpp ломается на пробелах в пути.
export const WHISPER_HOME =
  process.env.WHISPER_HOME || (process.platform === "win32" ? "C:\\whisper" : path.join(os.homedir(), "whisper"));
export const WHISPER_DIR = path.join(WHISPER_HOME, "whisper.cpp");
export const WHISPER_VERSION = "1.5.5";
export const WHISPER_MODEL = process.env.WHISPER_MODEL || "medium"; // на слабом ПК — small
export const LANGUAGE = process.env.WHISPER_LANG || "ru";

const VIDEO_EXT = [".mp4", ".mov", ".mkv", ".webm", ".m4v"];

export const needName = () => {
  const name = process.argv[2];
  if (!name) {
    console.error("Укажи имя ролика без расширения, например: npm run audio -- myclip");
    process.exit(1);
  }
  return name;
};

// public/<name>.mp4 | .mov | … → имя файла внутри public/
export const findSource = (name) => {
  for (const ext of VIDEO_EXT) {
    if (fs.existsSync(path.join(PUBLIC, name + ext))) return name + ext;
  }
  console.error(`Не найден исходник public/${name}.mp4 (или .mov/.mkv/.webm/.m4v). Положи видео в папку public/.`);
  process.exit(1);
};

const quote = (a) => (/[\s"]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);

// npx remotion <args>: ffmpeg и ffprobe уже встроены в Remotion, отдельно ставить не нужно
export const remotion = (args, {capture = false} = {}) => {
  const r = spawnSync(["npx", "remotion", ...args].map(quote).join(" "), {
    shell: true,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) {
    if (capture) console.error(r.stderr);
    console.error(`Команда упала: npx remotion ${args.join(" ")}`);
    process.exit(r.status ?? 1);
  }
  return r.stdout;
};

export const hasSpaceOrNonAscii = (p) => /[^\x21-\x7E\\/:]/.test(p);
