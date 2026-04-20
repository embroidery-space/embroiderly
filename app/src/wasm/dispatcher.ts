import { b } from "@zorsh/zorsh";
import { stringify as stringifyUuid } from "uuid";

import {
  AddedLayerData,
  AddedPaletteItemData,
  DisplaySettings,
  Fabric,
  Grid,
  PaletteSettings,
  PatternInfo,
  PdfExportOptions,
  ReferenceImage,
  ReferenceImageSettings,
  RenamedLayerData,
  SetSymbolData,
  UpdatedLayerVisibilityData,
  deserializeStitchesEvent,
} from "~/lib/pattern/";
import { LoggerService } from "~/services/";

import type { EditorEventBus } from "./event-bus.ts";

/**
 * Borsh enum discriminant -> event name and deserializer.
 * Order must match the `EditorEvent` enum declaration in `crates/embroiderly-editor/src/event.rs`.
 */
const HANDLERS: Array<(bus: EditorEventBus, payload: Uint8Array) => void> = [
  (bus, payload) => bus.emit("stitches:add", deserializeStitchesEvent(payload)),
  (bus, payload) => bus.emit("stitches:remove", deserializeStitchesEvent(payload)),

  (bus, payload) => bus.emit("fabric:update", Fabric.deserialize(payload)),

  (bus, payload) => {
    const { palitem, palindex } = AddedPaletteItemData.deserialize(payload);
    bus.emit("palette:add_palette_item", { palitem, palindex });
  },
  (bus, payload) => bus.emit("palette:remove_palette_item", b.vec(b.u32()).deserialize(payload)),
  (bus, payload) => bus.emit("palette:update_display_settings", PaletteSettings.deserialize(payload)),
  (bus, payload) => bus.emit("palette:sort", b.vec(b.u32()).deserialize(payload)),
  (bus, payload) => bus.emit("palette:reorder", b.vec(b.u32()).deserialize(payload)),
  (bus, payload) => {
    const { palindex, symbol } = SetSymbolData.deserialize(payload);
    bus.emit("palette:set_symbol", { palindex, symbol });
  },

  (bus, payload) => bus.emit("pattern-info:update", PatternInfo.deserialize(payload)),

  (bus, payload) => bus.emit("display:update", DisplaySettings.deserialize(payload)),

  (bus, payload) => bus.emit("grid:update", Grid.deserialize(payload)),

  (bus, payload) => {
    const { index, layer } = AddedLayerData.deserialize(payload);
    bus.emit("layers:add", { index, layer });
  },
  (bus, payload) => bus.emit("layers:remove", b.u32().deserialize(payload)),
  (bus, payload) => bus.emit("layers:rename", RenamedLayerData.deserialize(payload)),
  (bus, payload) => bus.emit("layers:update_visibility", UpdatedLayerVisibilityData.deserialize(payload)),
  (bus, payload) => bus.emit("layers:move", b.vec(b.u32()).deserialize(payload)),

  (bus, payload) => bus.emit("publish:update-pdf", PdfExportOptions.deserialize(payload)),

  (bus, payload) => bus.emit("image:set", ReferenceImage.deserialize(payload)),
  (bus, payload) => bus.emit("image:settings:update", ReferenceImageSettings.deserialize(payload)),

  (bus, payload) => bus.emit("app:pattern-changed", stringifyUuid(payload)),
];

/** Creates a dispatcher that decodes a raw Borsh-encoded `EditorEvent` (discriminant byte followed by payload) and emits the deserialized domain value on the event bus. */
export function createDispatcher(bus: EditorEventBus) {
  return (data: Uint8Array) => {
    const discriminant = data[0];
    if (discriminant === undefined || discriminant >= HANDLERS.length) {
      LoggerService.warn(`Unknown EditorEvent discriminant: ${discriminant}`);
      return;
    }

    HANDLERS[discriminant]!(bus, data.subarray(1));
  };
}
