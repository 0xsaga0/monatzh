import {Config} from "@remotion/cli/config";

// Правило 9 из RULES.md: промежуточные кадры — PNG, не JPEG, и CRF 16.
// Картинка чище, а файл на практике даже меньше.
Config.setVideoImageFormat("png");
Config.setCrf(16);
Config.setOverwriteOutput(true);
