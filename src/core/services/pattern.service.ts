import EventEmitter from "eventemitter3";
import type { ReferenceImageSettings, Stitch } from "#/core/pattern/";

export const PatternEventBus = new EventEmitter<PatternEvents>();

interface PatternEvents {
  "add-stitch": Stitch;
  "remove-stitch": Stitch;

  "draw-line-hint": Stitch;
  "draw-node-hint": Stitch;

  "update-reference-image-settings": ReferenceImageSettings;
}
