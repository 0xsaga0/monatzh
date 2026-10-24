// Стиль субтитров — правило 3 из RULES.md. Меняешь стиль — меняй здесь и в RULES.md одновременно.

export const CAPTIONS = {
  color: "#FFFFFF",
  activeColor: "#FFD700", // слово, которое звучит прямо сейчас
  strokeColor: "#000000",
  // 2,5% ширины кадра: 18 px при 720×1280, 27 px при 1080×1920
  fontSizePctOfWidth: 0.025,
  // обводка в долях размера шрифта: 1 px при 18 px
  strokePctOfFont: 1 / 18,
  fontWeight: 700,
  uppercase: true,
  // центр блока субтитров — 80% высоты кадра
  topPct: 80,
  sidePaddingPct: 6,
};
