import "pixi.js/math-extras";

import { CullerPlugin, extensions } from "pixi.js";
import { StitchFontsLoader } from "./extensions/stitch-fonts-loader";

extensions.add(CullerPlugin, StitchFontsLoader);

export * from "./components/";
export { STITCH_FONT_PREFIX } from "./extensions/";
export * from "./constants.ts";
export * from "./app.ts";
export * from "./viewport.ts";
export * from "./texture-manager.ts";
