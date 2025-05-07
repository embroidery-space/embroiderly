import { extensions } from "pixi.js";
import { StitchFontsLoader } from "./extensions/stitch-fonts-loader";

extensions.add(StitchFontsLoader);

export * from "./constants";
export * from "./display-objects";
export * from "./texture-manager";
export * from "./pattern-canvas";
export * from "./pattern-view";
export { STITCH_FONT_PREFIX } from "./extensions/stitch-fonts-loader";
