import type { ContainerOptions, TextStyleOptions } from "pixi.js";

export const STITCH_SCALE_FACTOR = 1 / 100;

export const DEFAULT_TEXT_STYLE_OPTIONS: TextStyleOptions = { fill: 0x000000, fontSize: 64 };

export const DEFAULT_CONTAINER_OPTIONS: ContainerOptions = {
  eventMode: "none",
  interactive: false,
  interactiveChildren: false,
  cullable: false,
  cullableChildren: true,
};
