import { extensions } from "pixi.js";
import { StitchFontsLoader } from "./extensions/stitch-fonts-loader";

extensions.add(StitchFontsLoader);
export { STITCH_FONT_PREFIX } from "./extensions/stitch-fonts-loader";

export * from "./constants.ts";
export * from "./display-objects.ts";
export * from "./pattern-canvas.ts";
export * from "./pattern-viewport.ts";
export * from "./pattern-view.ts";
export * from "./texture-manager.ts";
