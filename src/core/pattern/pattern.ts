import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Bounds, Color, Container, Graphics, Rectangle } from "pixi.js";
import { stringify as stringifyUuid } from "uuid";

import {
  PatternGrid,
  Rulers,
  STITCH_SCALE_FACTOR,
  StitchGraphics,
  StitchGraphicsContainer,
  StitchParticle,
  StitchParticleContainer,
  StitchSymbol,
  TextureManager,
} from "#/core/pixi//";

import { PaletteItem } from "./palette.ts";
import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  LineStitch,
  LineStitchKind,
  NodeStitch,
  NodeStitchKind,
  SpecialStitch,
  SpecialStitchModel,
  type Stitch,
} from "./stitches.ts";
import { DisplayMode, DisplaySettings, Grid, LayersVisibility, PaletteSettings } from "./display.ts";
import { PublishSettings } from "./publish.ts";

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

export class Pattern {
  readonly id: string;
  info: PatternInfo;

  #fabric!: Fabric;
  #grid!: Grid;

  #palette: PaletteItem[];

  #specialStitchModels: SpecialStitchModel[];

  displaySettings: DisplaySettings;
  publishSettings: PublishSettings;

  #displayMode: DisplayMode | undefined;
  #previousDisplayMode: DisplayMode;

  private stages = {
    // lowest
    fabric: new Graphics({ label: "Fabric" }),
    fullstitches: new StitchParticleContainer({ label: "Full Stitches" }),
    petitestitches: new StitchParticleContainer({ label: "Petite Stitches" }),
    halfstitches: new StitchParticleContainer({ label: "Half Stitches" }),
    quarterstitches: new StitchParticleContainer({ label: "Quarter Stitches" }),
    symbols: new StitchGraphicsContainer({ label: "Symbols" }),
    grid: new PatternGrid(),
    specialstitches: new Container({ label: "Special Stitches" }),
    backstitches: new StitchGraphicsContainer({
      label: "Back Stitches",
      eventMode: "passive",
      interactiveChildren: true,
    }),
    straightstitches: new StitchGraphicsContainer({
      label: "Straight Stitches",
      eventMode: "passive",
      interactiveChildren: true,
    }),
    frenchknots: new StitchGraphicsContainer({
      label: "French Knots",
      eventMode: "passive",
      interactiveChildren: true,
    }),
    beads: new StitchGraphicsContainer({
      label: "Beads",
      eventMode: "passive",
      interactiveChildren: true,
    }),
    rulers: new Rulers(),
    // highest
  };
  readonly root = new Container({
    label: "Pattern View",
    isRenderGroup: true,
    children: Object.values(this.stages),
  });

  constructor(data: b.infer<typeof Pattern.schema>) {
    this.id = stringifyUuid(new Uint8Array(data.id));
    this.info = new PatternInfo(data.info);

    this.fabric = new Fabric(data.fabric);
    this.grid = new Grid(data.displaySettings.grid);

    this.#palette = data.palette.map((item) => new PaletteItem(item));

    this.displaySettings = new DisplaySettings(data.displaySettings);
    this.publishSettings = new PublishSettings(data.publishSettings);

    this.#previousDisplayMode = this.#displayMode = data.displaySettings.displayMode;
    this.showSymbols = data.displaySettings.showSymbols;

    for (const stitch of data.fullstitches.map((stitch) => new FullStitch(stitch))) {
      this.addFullStitch(stitch);
      this.addSymbol(stitch);
    }
    for (const stitch of data.partstitches.map((stitch) => new PartStitch(stitch))) {
      this.addPartStitch(stitch);
      this.addSymbol(stitch);
    }
    for (const stitch of data.linestitches.map((stitch) => new LineStitch(stitch))) {
      this.addLineStitch(stitch);
      this.addSymbol(stitch);
    }
    for (const stitch of data.nodestitches.map((stitch) => new NodeStitch(stitch))) {
      this.addNodeStitch(stitch);
      this.addSymbol(stitch);
    }

    this.#specialStitchModels = data.specialStitchModels.map((model) => new SpecialStitchModel(model));
    for (const specialstitch of data.specialstitches.map((stitch) => new SpecialStitch(stitch))) {
      this.addSpecialStitch(specialstitch);
    }
  }

  static readonly schema = b.struct({
    id: b.array(b.u8(), 16),

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

  get fabric() {
    return this.#fabric;
  }

  set fabric(fabric: Fabric) {
    this.#fabric = fabric;
    this.stages.fabric.clear();
    this.stages.fabric.rect(0, 0, this.fabric.width, this.fabric.height).fill(this.fabric.color);

    // Set the container bounds.
    this.root.boundsArea = new Rectangle(0, 0, this.fabric.width, this.fabric.height);

    // If the grid is set, adjust it to the new fabric.
    if (this.#grid) this.grid = this.#grid;
  }

  get grid() {
    return this.#grid;
  }

  set grid(grid: Grid) {
    this.#grid = grid;

    const { width, height } = this.fabric;
    this.stages.grid.setGrid(width, height, grid);
    this.stages.rulers.setRulers(width, height, grid.majorLinesInterval);
  }

  get layersVisibility() {
    return this.displaySettings.layersVisibility;
  }
  set layersVisibility(layersVisibility: LayersVisibility) {
    this.displaySettings.layersVisibility = layersVisibility;
    for (const [layer, visible] of Object.entries(layersVisibility)) {
      const stage = this.stages[layer as keyof typeof this.stages];
      if (stage) {
        stage.visible = visible;
        stage.renderable = visible;
      }
    }
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
    return this.displaySettings.paletteSettings;
  }

  set paletteDisplaySettings(settings: PaletteSettings) {
    this.displaySettings.paletteSettings = settings;
  }

  addStitch(stitch: Stitch) {
    if (stitch instanceof FullStitch) this.addFullStitch(stitch);
    else if (stitch instanceof PartStitch) this.addPartStitch(stitch);
    else if (stitch instanceof LineStitch) this.addLineStitch(stitch);
    else this.addNodeStitch(stitch);
    this.addSymbol(stitch);
  }

  removeStitch(stitch: Stitch) {
    if (stitch instanceof FullStitch) this.removeFullStitch(stitch);
    else if (stitch instanceof PartStitch) this.removePartStitch(stitch);
    else if (stitch instanceof LineStitch) this.removeLineStitch(stitch);
    else this.removeNodeStitch(stitch);
    this.removeSymbol(stitch);
  }

  addSymbol(stitch: Stitch) {
    if (stitch instanceof LineStitch || stitch instanceof NodeStitch) return;

    const palitem = this.#palette[stitch.palindex]!;
    const symbolFont = palitem.symbolFont;
    const defaultSymbolFont = this.displaySettings.defaultSymbolFont;

    const symbol = new StitchSymbol(stitch, palitem.symbol, {
      fontFamily: symbolFont ? [symbolFont, defaultSymbolFont] : defaultSymbolFont,
    });

    this.stages.symbols.addStitch(symbol);
  }

  removeSymbol(stitch: Stitch) {
    this.stages.symbols.removeStitch(stitch);
  }

  addFullStitch(stitch: FullStitch) {
    const { x, y, palindex, kind } = stitch;

    const particle = new StitchParticle(stitch, {
      texture: TextureManager.shared.getFullStitchTexture(this.displayMode ?? this.#previousDisplayMode, kind),
      x,
      y,
      tint: this.#palette[palindex]!.color,
      scaleX: STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
    });

    if (kind === FullStitchKind.Full) this.stages.fullstitches.addStitch(particle);
    else this.stages.petitestitches.addStitch(particle);
  }

  removeFullStitch(stitch: FullStitch) {
    if (stitch.kind === FullStitchKind.Full) this.stages.fullstitches.removeStitch(stitch);
    else this.stages.petitestitches.removeStitch(stitch);
  }

  addPartStitch(stitch: PartStitch) {
    const { x, y, palindex, kind, direction } = stitch;

    const particle = new StitchParticle(stitch, {
      texture: TextureManager.shared.getPartStitchTexture(this.displayMode ?? this.#previousDisplayMode, kind),
      x,
      y,
      tint: this.#palette[palindex]!.color,
      scaleX: direction === PartStitchDirection.Forward ? STITCH_SCALE_FACTOR : -STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
      anchorX: direction === PartStitchDirection.Forward ? 0 : 1,
    });

    if (kind === PartStitchKind.Half) this.stages.halfstitches.addStitch(particle);
    else this.stages.quarterstitches.addStitch(particle);
  }

  removePartStitch(stitch: PartStitch) {
    if (stitch.kind === PartStitchKind.Half) this.stages.halfstitches.removeStitch(stitch);
    else this.stages.quarterstitches.removeStitch(stitch);
  }

  addLineStitch(stitch: LineStitch) {
    const { x, y, palindex } = stitch;

    const start = { x: x[0], y: y[0] };
    const end = { x: x[1], y: y[1] };

    const graphics = new StitchGraphics(stitch)
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a larger width to make it look like a border.
      .stroke({ width: 0.225, color: 0x000000, cap: "round" })
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a smaller width to make it look like a fill.
      .stroke({ width: 0.2, color: this.#palette[palindex]!.color, cap: "round" });
    graphics.eventMode = "static";

    if (stitch.kind === LineStitchKind.Back) this.stages.backstitches.addStitch(graphics);
    else this.stages.straightstitches.addStitch(graphics);
  }

  removeLineStitch(stitch: LineStitch) {
    if (stitch.kind === LineStitchKind.Back) this.stages.backstitches.removeStitch(stitch);
    else this.stages.straightstitches.removeStitch(stitch);
  }

  addNodeStitch(stitch: NodeStitch) {
    const { x, y, palindex, kind, rotated } = stitch;
    const palitem = this.#palette[palindex]!;

    const graphics = new StitchGraphics(stitch, TextureManager.shared.getNodeTexture(kind));
    graphics.eventMode = "static";
    graphics.tint = palitem.color;
    graphics.pivot.set(graphics.width / 2, graphics.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    if (rotated) graphics.angle = 90;

    if (kind === NodeStitchKind.FrenchKnot) this.stages.frenchknots.addStitch(graphics);
    else this.stages.beads.addStitch(graphics);
  }

  removeNodeStitch(stitch: NodeStitch) {
    if (stitch.kind === NodeStitchKind.FrenchKnot) this.stages.frenchknots.removeStitch(stitch);
    else this.stages.beads.removeStitch(stitch);
  }

  addSpecialStitch(specialStitch: SpecialStitch) {
    const { x, y, rotation, flip, palindex, modindex } = specialStitch;
    const model = this.#specialStitchModels[modindex]!;

    // Special stitches are very rare and complex so it is easier to draw them using graphics.
    const graphics = new Graphics();

    for (const { points } of model.curvedstitches) {
      // Draw a polyline with a larger width to make it look like a border.
      graphics.poly(points.flat(), false).stroke({ width: 0.225, color: 0x000000, cap: "round", join: "round" });
      // Draw a polyline with a smaller width to make it look like a fill.
      graphics.poly(points.flat(), false).stroke({ width: 0.2, cap: "round", join: "round" });
    }

    for (const { x, y } of model.linestitches) {
      const start = { x: x[0], y: y[0] };
      const end = { x: x[1], y: y[1] };
      graphics
        // Draw a line with a larger width to make it look like a border.
        .moveTo(start.x, start.y)
        .lineTo(end.x, end.y)
        .stroke({ width: 0.225, color: 0x000000, cap: "round" })
        // Draw a line with a smaller width to make it look like a fill.
        .moveTo(start.x, start.y)
        .lineTo(end.x, end.y)
        .stroke({ width: 0.2, cap: "round" });
    }

    // Decrease the scale factor to draw the nodes with more points.
    graphics.scale.set(0.1);
    for (const { x, y } of model.nodestitches) {
      // All nodes are french knotes there.
      graphics
        .circle(x * 10, y * 10, 5)
        .stroke({ pixelLine: true, color: 0x000000, cap: "round" })
        .fill(0xffffff);
    }
    graphics.scale.set(1);

    graphics.tint = this.palette[palindex]!.color;
    graphics.position.set(x, y);
    graphics.angle = rotation;
    if (flip[0]) graphics.scale.x = -1;
    if (flip[1]) graphics.scale.y = -1;

    this.stages.specialstitches.addChild(graphics);
  }

  /**
   * Adjusts the zoom level of the pattern view.
   * @param zoom - The zoom level in range 1 to 100.
   */
  adjustZoom(zoom: number, bounds?: Bounds) {
    this.stages.grid.renderGrid();
    this.stages.rulers.renderRulers(zoom, bounds);
  }

  get displayMode() {
    return this.#displayMode;
  }

  set displayMode(displayMode: DisplayMode | undefined) {
    this.#displayMode = this.showSymbols ? displayMode : (displayMode ?? this.#previousDisplayMode);
    if (displayMode) {
      this.#previousDisplayMode = displayMode;
      this.stages.fullstitches.texture = TextureManager.shared.getFullStitchTexture(displayMode, FullStitchKind.Full);
      this.stages.petitestitches.texture = TextureManager.shared.getFullStitchTexture(
        displayMode,
        FullStitchKind.Petite,
      );
      this.stages.halfstitches.texture = TextureManager.shared.getPartStitchTexture(displayMode, PartStitchKind.Half);
      this.stages.quarterstitches.texture = TextureManager.shared.getPartStitchTexture(
        displayMode,
        PartStitchKind.Quarter,
      );
    }

    const visible = this.#displayMode !== undefined;
    this.stages.fullstitches.visible = visible;
    this.stages.petitestitches.visible = visible;
    this.stages.halfstitches.visible = visible;
    this.stages.quarterstitches.visible = visible;
  }

  get showSymbols() {
    return this.displaySettings.showSymbols;
  }

  set showSymbols(value: boolean) {
    this.displaySettings.showSymbols = value;
    this.stages.symbols.visible = value;
    this.stages.symbols.renderable = value;

    // Update the display mode since it depends on the `showSymbols` value.
    this.displayMode = this.#displayMode;
  }

  get allStitchFonts() {
    const fonts = new Set<string>();
    fonts.add(this.displaySettings.defaultSymbolFont);
    for (const palitem of this.palette) {
      if (palitem.symbolFont) fonts.add(palitem.symbolFont);
    }
    return Array.from(fonts);
  }
}
