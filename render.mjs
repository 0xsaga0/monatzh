// Проверочный кадр и финальный рендер.
// npm run still -- <name> [кадр]          → out/<name>-<кадр>.png  (решения принимаем на одном кадре)
// npm run render -- <name> [флаги remotion] → out/<name>.mp4       (например --concurrency=2 на 8 ГБ памяти)
import fs from "node:fs";
import path from "node:path";
import {OUT, PUBLIC, remotion} from "./config.mjs";

const [mode, name, ...rest] = process.argv.slice(2);
if (!name) {
  console.error(`Укажи имя ролика: npm run ${mode === "still" ? "still" : "render"} -- <name>`);
  process.exit(1);
}
if (!fs.existsSync(path.join(PUBLIC, `${name}.timeline.json`))) {
  console.error(`Нет public/${name}.timeline.json — сначала npm run timeline -- ${name}`);
  process.exit(1);
}

fs.mkdirSync(OUT, {recursive: true});
// props через файл: так не нужно экранировать JSON в командной строке Windows
const propsFile = path.join("out", `${name}.props.json`);
fs.writeFileSync(propsFile, JSON.stringify({name}));

if (mode === "still") {
  const frame = rest[0] ?? "30";
  remotion(["still", "src/index.ts", "Edit", path.join("out", `${name}-${frame}.png`), `--props=${propsFile}`, `--frame=${frame}`]);
} else {
  remotion(["render", "src/index.ts", "Edit", path.join("out", `${name}.mp4`), `--props=${propsFile}`, ...rest]);
}
