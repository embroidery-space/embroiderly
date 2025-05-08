import { extensions } from "pixi.js";
import { StitchFontsLoader } from "./extensions/stitch-fonts-loader";

extensions.add(StitchFontsLoader);
export { STITCH_FONT_PREFIX } from "./extensions/stitch-fonts-loader";

export * from "./constants";
export * from "./display-objects";
export * from "./pattern-canvas";
export * from "./pattern-view";
export * from "./texture-manager";
export * from "./plugins/input-manager";
