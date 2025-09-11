import type { ContainerOptions, TextStyleOptions } from "pixi.js";

/**
 * The minimum scale of the pattern.
 * At this scale, the pattern is displayed as 1 pixel per full stitch.
 */
export const MIN_SCALE = 1;
/**
 * The maximum scale of the pattern.
 * At this scale, the pattern is displayed as 100 pixels per full stitch.
 */
export const MAX_SCALE = 100;
/**
 * The scale factor of display objects.
 * It is used to downscale the display objects, which are rendered in higher resolutions for better visual quality.
 */
export const STITCH_SCALE_FACTOR = MIN_SCALE / MAX_SCALE;

export const DEFAULT_TEXT_STYLE_OPTIONS: TextStyleOptions = { fill: 0x000000, fontSize: 64 };

/**
 * Default options for containers:
 * - Disables interaction events (both on the container and its children).
 * - Disables culling of the container (but not its children).
 */
export const DEFAULT_CONTAINER_OPTIONS: ContainerOptions = {
  eventMode: "none",
  interactive: false,
  interactiveChildren: false,
  cullable: false,
  cullableChildren: true,
};
