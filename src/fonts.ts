import {loadFont} from "@remotion/google-fonts/Montserrat";

// Подключаем только то начертание и те алфавиты, что реально нужны:
// каждое лишнее начертание — лишние сетевые запросы в каждой вкладке рендера.
export const {fontFamily: captionFont} = loadFont("normal", {
  weights: ["700"],
  subsets: ["cyrillic", "latin"],
});
