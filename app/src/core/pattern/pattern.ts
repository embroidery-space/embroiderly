import { b } from "@zorsh/zorsh";
import { dequal } from "dequal/lite";
import { toByteArray } from "base64-js";
import { stringify as stringifyUuid } from "uuid";
import { Color } from "pixi.js";

import { ReferenceImage, ReferenceImageSettings } from "./image.ts";
import { PaletteItem } from "./palette.ts";
import {
  FullStitch,
  PartStitch,
  LineStitch,
  NodeStitch,
  SpecialStitch,
  SpecialStitchModel,
  type Stitch,
} from "./stitches.ts";
import { DisplayMode, DisplaySettings, Grid, LayersVisibility, PaletteSettings } from "./display.ts";
import { PdfExportOptions, PublishSettings } from "./publish.ts";

export class PatternInfo {
  title: string;
  author: string;
  copyright: string;
  description: string;

  constructor(data: b.infer<typeof PatternInfo.schema>) {
    this.title = data.title;
    this.author = data.author;
    this.copyright = data.copyright;
    this.description = data.description;
  }

  static readonly schema = b.struct({
    title: b.string(),
    author: b.string(),
    copyright: b.string(),
    description: b.string(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PatternInfo(PatternInfo.schema.deserialize(buffer));
  }

  static serialize(data: PatternInfo) {
    return PatternInfo.schema.serialize(data);
  }
}

export class Fabric {
  width: number;
  height: number;
  spi: [number, number];
  kind: string;
  name: string;
  color: Color;

  constructor(data: Fabric | b.infer<typeof Fabric.schema>) {
    this.width = data.width;
    this.height = data.height;
    this.spi = data.spi;
    this.kind = data.kind;
    this.name = data.name;
    this.color = new Color(data.color);
  }

  static readonly schema = b.struct({
    width: b.u16(),
    height: b.u16(),
    spi: b.tuple(b.u8(), b.u8()),
    kind: b.string(),
    name: b.string(),
    color: b.string(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new Fabric(Fabric.schema.deserialize(buffer));
  }

  static serialize(data: Fabric) {
    return Fabric.schema.serialize({ ...data, color: data.color.toHex().slice(1).toUpperCase() });
  }

  static default() {
    return new Fabric({ width: 100, height: 100, spi: [14, 14], name: "White", color: "FFFFFF", kind: "Aida" });
  }
}

/**
 * Represents a pattern in the embroidery application.
 *
 * **Emits:**
 * - `stitch:add` - Fired when a stitch is added to the pattern.
 * - `stitch:remove` - Fired when a stitch is removed from the pattern.
 */
export class Pattern extends EventTarget {
  readonly id: string;

  #referenceImage?: ReferenceImage;

  #info: PatternInfo;
  #fabric: Fabric;
  #palette: PaletteItem[];
  #fullstitches: FullStitch[];
  #partstitches: PartStitch[];
  #linestitches: LineStitch[];
  #nodestitches: NodeStitch[];
  #specialstitches: SpecialStitch[];
  #specialStitchModels: SpecialStitchModel[];

  #displaySettings: DisplaySettings;
  #publishSettings: PublishSettings;

  constructor(data: b.infer<typeof Pattern.schema>) {
    super();

    this.id = stringifyUuid(new Uint8Array(data.id));

    if (data.referenceImage) this.#referenceImage = new ReferenceImage(data.referenceImage);

    this.#info = new PatternInfo(data.info);
    this.#fabric = new Fabric(data.fabric);
    this.#palette = data.palette.map((item) => new PaletteItem(item));
    this.#fullstitches = data.fullstitches.map((stitch) => new FullStitch(stitch));
    this.#partstitches = data.partstitches.map((stitch) => new PartStitch(stitch));
    this.#linestitches = data.linestitches.map((stitch) => new LineStitch(stitch));
    this.#nodestitches = data.nodestitches.map((stitch) => new NodeStitch(stitch));
    this.#specialstitches = data.specialstitches.map((stitch) => new SpecialStitch(stitch));
    this.#specialStitchModels = data.specialStitchModels.map((model) => new SpecialStitchModel(model));

    this.#displaySettings = new DisplaySettings(data.displaySettings);
    this.#publishSettings = new PublishSettings(data.publishSettings);
  }

  static readonly schema = b.struct({
    id: b.array(b.u8(), 16),

    referenceImage: b.option(ReferenceImage.schema),

    info: PatternInfo.schema,
    fabric: Fabric.schema,
    palette: b.vec(PaletteItem.schema),
    fullstitches: b.vec(FullStitch.schema),
    partstitches: b.vec(PartStitch.schema),
    linestitches: b.vec(LineStitch.schema),
    nodestitches: b.vec(NodeStitch.schema),
    specialstitches: b.vec(SpecialStitch.schema),
    specialStitchModels: b.vec(SpecialStitchModel.schema),

    displaySettings: DisplaySettings.schema,
    publishSettings: PublishSettings.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new Pattern(Pattern.schema.deserialize(buffer));
  }

  get referenceImage() {
    return this.#referenceImage;
  }
  set referenceImage(image: ReferenceImage | undefined) {
    this.#referenceImage = image;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateReferenceImage, { detail: image }));
  }
  set referenceImageSettings(settings: ReferenceImageSettings) {
    if (!this.#referenceImage) return;
    this.#referenceImage.settings = settings;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateReferenceImageSettings, { detail: settings }));
  }

  get info() {
    return this.#info;
  }
  set info(info: PatternInfo) {
    this.#info = info;
  }

  get palette() {
    return this.#palette;
  }
  addPaletteItem(palitem: PaletteItem, palindex: number) {
    this.#palette.splice(palindex, 0, palitem);
  }
  removePaletteItem(palindex: number) {
    this.#palette.splice(palindex, 1);
  }

  get paletteDisplaySettings() {
    return this.#displaySettings.paletteSettings;
  }
  set paletteDisplaySettings(settings: PaletteSettings) {
    this.#displaySettings.paletteSettings = settings;
  }

  get fabric() {
    return this.#fabric;
  }
  set fabric(fabric: Fabric) {
    this.#fabric = fabric;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateFabric, { detail: fabric }));
  }

  get grid() {
    return this.#displaySettings.grid;
  }
  set grid(grid: Grid) {
    this.#displaySettings.grid = grid;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateGrid, { detail: grid }));
  }

  get fullstitches() {
    return this.#fullstitches;
  }
  get partstitches() {
    return this.#partstitches;
  }
  get linestitches() {
    return this.#linestitches;
  }
  get nodestitches() {
    return this.#nodestitches;
  }
  get specialstitches() {
    return this.#specialstitches;
  }
  get specialStitchModels() {
    return this.#specialStitchModels;
  }

  /**
   * Adds a stitch to the pattern.
   * Fires `stitch:add` event.
   * @param stitch The stitch to add.
   */
  addStitch(stitch: Stitch) {
    if (stitch instanceof FullStitch) this.#fullstitches.push(stitch);
    else if (stitch instanceof PartStitch) this.#partstitches.push(stitch);
    else if (stitch instanceof LineStitch) this.#linestitches.push(stitch);
    else this.#nodestitches.push(stitch);

    this.dispatchEvent(new CustomEvent(PatternEvent.AddStitch, { detail: stitch }));
  }

  /**
   * Removes a stitch from the pattern.
   * Fires `stitch:remove` event.
   * @param stitch The stitch to remove.
   */
  removeStitch(stitch: Stitch) {
    function removeStitchFromArray(array: Stitch[], stitch: Stitch) {
      const index = array.findIndex((item) => dequal(item, stitch));
      if (index !== -1) array.splice(index, 1);
    }

    if (stitch instanceof FullStitch) removeStitchFromArray(this.#fullstitches, stitch);
    else if (stitch instanceof PartStitch) removeStitchFromArray(this.#partstitches, stitch);
    else if (stitch instanceof LineStitch) removeStitchFromArray(this.#linestitches, stitch);
    else removeStitchFromArray(this.#nodestitches, stitch);

    this.dispatchEvent(new CustomEvent(PatternEvent.RemoveStitch, { detail: stitch }));
  }

  get defaultSymbolFont() {
    return this.#displaySettings.defaultSymbolFont;
  }

  get displayMode() {
    return this.#displaySettings.displayMode;
  }
  set displayMode(mode: DisplayMode | undefined) {
    if (this.#displaySettings.displayMode !== mode && mode !== undefined) this.#displaySettings.displayMode = mode;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateDisplayMode, { detail: mode }));
  }

  get showSymbols() {
    return this.#displaySettings.showSymbols;
  }
  set showSymbols(value: boolean) {
    this.#displaySettings.showSymbols = value;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateShowSymbols, { detail: value }));
  }

  get layersVisibility() {
    return this.#displaySettings.layersVisibility;
  }
  set layersVisibility(value: LayersVisibility) {
    this.#displaySettings.layersVisibility = value;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateLayersVisibility, { detail: value }));
  }

  get pdfExportOptions() {
    return this.#publishSettings.pdf;
  }
  set pdfExportOptions(options: PdfExportOptions) {
    this.#publishSettings.pdf = options;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdatePdfExportOptions, { detail: options }));
  }

  get allSymbolFonts() {
    const fonts = new Set<string>([this.defaultSymbolFont]);
    for (const palitem of this.palette) {
      if (palitem.symbolFont) fonts.add(palitem.symbolFont);
    }
    return Array.from(fonts);
  }
}

export const enum PatternEvent {
  UpdateReferenceImage = "image:set",
  UpdateReferenceImageSettings = "image:settings:update",

  UpdatePatternInfo = "pattern-info:update",

  UpdateFabric = "fabric:update",
  UpdateGrid = "grid:update",

  AddStitch = "stitches:add",
  RemoveStitch = "stitches:remove",

  AddPaletteItem = "palette:add_palette_item",
  RemovePaletteItem = "palette:remove_palette_item",
  UpdatePaletteDisplaySettings = "palette:update_display_settings",

  UpdateDisplayMode = "display:set_mode",
  UpdateShowSymbols = "display:show_symbols",
  UpdateLayersVisibility = "display:set_layers_visibility",

  UpdatePdfExportOptions = "publish:update-pdf",
}
