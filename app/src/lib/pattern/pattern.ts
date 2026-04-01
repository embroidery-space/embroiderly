import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { NIL as NIL_UUID, stringify as stringifyUuid } from "uuid";

import { DisplayMode, DisplaySettings, Grid } from "./display.ts";
import { Fabric } from "./fabric.ts";
import { ReferenceImage, ReferenceImageSettings } from "./image.ts";
import { Layers } from "./layers.ts";
import { Palette, PaletteSettings } from "./palette.ts";
import { PdfExportOptions, PublishSettings } from "./publish.ts";
import { FullStitch, PartStitch, LineStitch, SpecialStitchModel } from "./stitches.ts";
import type { Stitch } from "./stitches.ts";

export class PatternInfo {
  title: string;
  author: string;
  copyright: string;
  description: string;

  constructor(data?: b.infer<typeof PatternInfo.schema>) {
    this.title = data?.title ?? "";
    this.author = data?.author ?? "";
    this.copyright = data?.copyright ?? "";
    this.description = data?.description ?? "";
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
  #palette: Palette;
  #layers: Layers;
  #specialStitchModels: SpecialStitchModel[];

  #displaySettings: DisplaySettings;
  #publishSettings: PublishSettings;

  #effectiveDisplayMode: DisplayMode | undefined;

  constructor(data?: b.infer<typeof Pattern.schema>) {
    super();

    if (data) {
      this.id = stringifyUuid(new Uint8Array(data.id));

      if (data.referenceImage) this.#referenceImage = new ReferenceImage(data.referenceImage);

      this.#info = new PatternInfo(data.info);
      this.#fabric = new Fabric(data.fabric);
      this.#palette = new Palette(data.palette);
      this.#layers = new Layers(data.layers);
      this.#specialStitchModels = data.specialStitchModels.map((model) => new SpecialStitchModel(model));

      this.#displaySettings = new DisplaySettings(data.displaySettings);
      this.#publishSettings = new PublishSettings(data.publishSettings);
    } else {
      this.id = NIL_UUID;

      this.#info = new PatternInfo();
      this.#fabric = new Fabric();
      this.#palette = new Palette();
      this.#layers = new Layers();
      this.#specialStitchModels = [];

      this.#displaySettings = new DisplaySettings();
      this.#publishSettings = new PublishSettings();
    }

    this.#effectiveDisplayMode = this.#displaySettings.displayMode;
  }

  /** Returns `true` if the pattern is a new, empty pattern. */
  get isNil(): boolean {
    return this.id === NIL_UUID;
  }

  static readonly schema = b.struct({
    id: b.array(b.u8(), 16),

    referenceImage: b.option(ReferenceImage.schema),

    info: PatternInfo.schema,
    fabric: Fabric.schema,
    palette: Palette.schema,
    layers: Layers.schema,
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
  // oxlint-disable-next-line accessor-pairs
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

  get paletteDisplaySettings() {
    return this.#palette.settings;
  }
  set paletteDisplaySettings(settings: PaletteSettings) {
    this.#palette.settings = settings;
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

  get layers() {
    return this.#layers;
  }

  get fullstitches() {
    return this.#layers.get(0)!.fullstitches;
  }
  get partstitches() {
    return this.#layers.get(0)!.partstitches;
  }
  get linestitches() {
    return this.#layers.get(0)!.linestitches;
  }
  get nodestitches() {
    return this.#layers.get(0)!.nodestitches;
  }
  get specialstitches() {
    return this.#layers.get(0)!.specialstitches;
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
    const layer = this.#layers.get(0)!;
    if (stitch instanceof FullStitch) layer.fullstitches.push(stitch);
    else if (stitch instanceof PartStitch) layer.partstitches.push(stitch);
    else if (stitch instanceof LineStitch) layer.linestitches.push(stitch);
    else layer.nodestitches.push(stitch);

    this.dispatchEvent(new CustomEvent(PatternEvent.AddStitch, { detail: stitch }));
  }

  /**
   * Removes a stitch from the pattern.
   * Fires `stitch:remove` event.
   * @param stitch The stitch to remove.
   */
  removeStitch(stitch: Stitch) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function removeStitchFromArray(array: any[], stitch: any) {
      const index = array.findIndex((item) => item.equals(stitch));
      if (index !== -1) array.splice(index, 1);
    }

    const layer = this.#layers.get(0)!;
    if (stitch instanceof FullStitch) removeStitchFromArray(layer.fullstitches, stitch);
    else if (stitch instanceof PartStitch) removeStitchFromArray(layer.partstitches, stitch);
    else if (stitch instanceof LineStitch) removeStitchFromArray(layer.linestitches, stitch);
    else removeStitchFromArray(layer.nodestitches, stitch);

    this.dispatchEvent(new CustomEvent(PatternEvent.RemoveStitch, { detail: stitch }));
  }

  get displaySettings() {
    return this.#displaySettings;
  }
  set displaySettings(settings: DisplaySettings) {
    this.#displaySettings = settings;
    // Sync #effectiveDisplayMode: keep it aligned with new displayMode.
    this.#effectiveDisplayMode = settings.displayMode;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateDisplaySettings, { detail: settings }));
  }

  /**
   * Returns the effective display mode.
   * - When symbols are hidden, always returns a valid display mode (never `undefined`)
   * - When symbols are shown, returns the effective mode (can be `undefined` to hide stitches)
   */
  get displayMode() {
    return this.showSymbols ? this.#effectiveDisplayMode : this.#displaySettings.displayMode;
  }
  set displayMode(mode: DisplayMode | undefined) {
    this.#effectiveDisplayMode = mode;
    if (mode !== undefined) this.#displaySettings.displayMode = mode;

    this.dispatchEvent(new CustomEvent(PatternEvent.UpdateDisplayMode, { detail: this.displayMode }));
  }

  get showSymbols() {
    return this.#displaySettings.showSymbols;
  }

  get showGrid() {
    return this.#displaySettings.showGrid;
  }

  get showRulers() {
    return this.#displaySettings.showRulers;
  }

  get pdfExportOptions() {
    return this.#publishSettings.pdf;
  }
  set pdfExportOptions(options: PdfExportOptions) {
    this.#publishSettings.pdf = options;
    this.dispatchEvent(new CustomEvent(PatternEvent.UpdatePdfExportOptions, { detail: options }));
  }

  get allSymbolFonts() {
    const fonts = new Set<string>();
    for (const palitem of this.palette.items) {
      if (palitem.symbol?.font) fonts.add(palitem.symbol.font);
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

  UpdateDisplaySettings = "display:update",
  UpdateDisplayMode = "display:set_mode",

  UpdatePdfExportOptions = "publish:update-pdf",

  AddLayer = "layers:add",
  RemoveLayer = "layers:remove",
  RenameLayer = "layers:rename",
  UpdateLayerVisibility = "layers:update_visibility",
  MoveLayer = "layers:move",
}
