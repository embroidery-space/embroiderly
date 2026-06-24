import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import type { Language } from "./i18n";
import { setAppUi } from "./session";

const IMAGES_PATH = path.join(fileURLToPath(new URL("../..", import.meta.url)), "public", "images");

/** Returns (and creates) the destination directory for "Overview" screenshots of the given language. */
export function overviewDest(language: Language) {
  const dest = path.join(IMAGES_PATH, language, "overview");
  fs.mkdirSync(dest, { recursive: true });
  return dest;
}

/** Returns (and creates) the destination directory for a "Guide" screenshot of the given language. */
export function guideDest(language: Language, ...segments: string[]) {
  const dest = path.join(IMAGES_PATH, language, "guide", ...segments);
  fs.mkdirSync(dest, { recursive: true });
  return dest;
}

/** Composites a dark-themed and a light-themed screenshot into one, split diagonally top-left/bottom-right. */
export async function stitchImagesDiagonally(dark: string, light: string, output: string) {
  const width = 1920;
  const height = 1080;

  const topLeftTriangle = await sharp(dark)
    .resize(width, height)
    .composite([
      {
        input: Buffer.from(`
          <svg width="${width}" height="${height}">
            <polygon points="0,0 ${width},0 0,${height}" fill="white" />
          </svg>
        `),
        blend: "dest-in",
      },
    ])
    .toBuffer();

  await sharp(light)
    .resize(width, height)
    .composite([{ input: topLeftTriangle, blend: "over" }])
    .toFile(output);
}

/**
 * Captures the same view in both themes (running `perThemeAction` before each capture) and stitches them diagonally into `outputPath`.
 * Covers the "dark/light split" screenshots used throughout the "Overview" guide.
 */
export async function dualThemeScreenshot(tag: string, outputPath: string, perThemeAction?: () => Promise<void>) {
  await setAppUi({ theme: "dark" });
  await perThemeAction?.();
  const dark = (await browser.saveFullPageScreen(`${tag}-dark`)) as { fileName: string; path: string };

  await setAppUi({ theme: "light" });
  await perThemeAction?.();
  const light = (await browser.saveFullPageScreen(`${tag}-light`)) as { fileName: string; path: string };

  await stitchImagesDiagonally(path.join(dark.path, dark.fileName), path.join(light.path, light.fileName), outputPath);
}
