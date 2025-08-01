import { CullerPlugin, extensions } from "pixi.js";
import { StitchFontsLoader } from "./extensions/stitch-fonts-loader";

extensions.add(CullerPlugin, StitchFontsLoader);
export { STITCH_FONT_PREFIX } from "./extensions/stitch-fonts-loader";

export * from "./components/";
export * from "./constants.ts";
export * from "./pattern-canvas.ts";
export * from "./pattern-viewport.ts";
export * from "./texture-manager.ts";
