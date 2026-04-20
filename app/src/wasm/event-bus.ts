import EventEmitter from "eventemitter3";

import type {
  DisplaySettings,
  Fabric,
  Grid,
  Layer,
  LayerVisibility,
  PaletteItem,
  PaletteSettings,
  PatternInfo,
  PdfExportOptions,
  ReferenceImage,
  ReferenceImageSettings,
  Symbol,
} from "~/lib/pattern/";
import type { Stitch } from "~/lib/pattern/";

export interface EditorEvents {
  "stitches:add": [{ layerIndex: number; stitches: Stitch[] }];
  "stitches:remove": [{ layerIndex: number; stitches: Stitch[] }];

  "fabric:update": [Fabric];

  "palette:add_palette_item": [{ palitem: PaletteItem; palindex: number }];
  "palette:remove_palette_item": [number[]];
  "palette:update_display_settings": [PaletteSettings];
  "palette:sort": [number[]];
  "palette:reorder": [number[]];
  "palette:set_symbol": [{ palindex: number; symbol?: Symbol }];

  "pattern-info:update": [PatternInfo];

  "display:update": [DisplaySettings];

  "grid:update": [Grid];

  "layers:add": [{ index: number; layer: Layer }];
  "layers:remove": [number];
  "layers:rename": [{ layerIndex: number; name: string }];
  "layers:update_visibility": [{ layerIndex: number; visibility: LayerVisibility }];
  "layers:move": [number[]];

  "publish:update-pdf": [PdfExportOptions];

  "image:set": [ReferenceImage | undefined];
  "image:settings:update": [ReferenceImageSettings];

  "app:pattern-changed": [string];
  "app:pattern-checkpoint": [string];
}

export class EditorEventBus extends EventEmitter<EditorEvents> {}
