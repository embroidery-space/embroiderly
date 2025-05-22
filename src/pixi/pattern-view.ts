import { Container, Graphics } from "pixi.js";

import {
  AddedPaletteItemData,
  DisplayMode,
  Fabric,
  FullStitch,
  FullStitchKind,
  Grid,
  LineStitch,
  NodeStitch,
  PaletteItem,
  PaletteSettings,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  PatternInfo,
  PatternProject,
  SpecialStitch,
  SpecialStitchModel,
  type PatternKey,
  type Stitch,
} from "#/schemas";

import { STITCH_SCALE_FACTOR } from "./constants.ts";
import {
  StitchGraphics,
  StitchGraphicsContainer,
  StitchParticle,
  StitchParticleContainer,
  StitchSymbol,
} from "./display-objects.ts";
import { TextureManager } from "./texture-manager.ts";

/**
 * Represents the view of a pattern.
 * It contains all the pattern data along with the graphics objects to display them.
 */
export class PatternView {
  #key: PatternKey;
  #info: PatternInfo;

  #palette: PaletteItem[];
  paletteDisplaySettings: PaletteSettings;

  #fabric: Fabric;
  #grid: Grid;

  #showSymbols: boolean;
  #displayMode?: DisplayMode;
  #previousDisplayMode: DisplayMode;

  readonly defaultSymbolFont: string;

  #specialStitchModels: SpecialStitchModel[];

  readonly root = new Container({ isRenderGroup: true });
  private stages = {
    // lowest
    fabric: new Graphics(),
    fullstitches: new StitchParticleContainer(),
    petitestitches: new StitchParticleContainer(),
    halfstitches: new StitchParticleContainer(),
    quarterstitches: new StitchParticleContainer(),
    symbols: new StitchGraphicsContainer({ eventMode: "none" }),
    grid: new Graphics(),
    specialstitches: new Container(),
    lines: new StitchGraphicsContainer(),
    nodes: new StitchGraphicsContainer(),
    // highest
  };

  render?: () => void;

  constructor({ key, pattern, displaySettings }: PatternProject) {
    this.root.addChild(...Object.values(this.stages));

    this.#key = key;
    this.#info = pattern.info;

    this.#palette = pattern.palette;
    this.paletteDisplaySettings = displaySettings.paletteSettings;

    this.#fabric = pattern.fabric;
    this.#grid = displaySettings.grid;

    this.#showSymbols = displaySettings.showSymbols;
    this.#displayMode = displaySettings.displayMode;
    this.#previousDisplayMode = displaySettings.displayMode;

    this.defaultSymbolFont = displaySettings.defaultSymbolFont;

    this.#specialStitchModels = pattern.specialStitchModels;

    this.render = () => {
      this.fabric = this.#fabric;
      this.grid = this.#grid;

      for (const stitch of pattern.fullstitches) {
        this.addFullStitch(stitch);
        this.addSymbol(stitch);
      }
      for (const stitch of pattern.partstitches) {
        this.addPartStitch(stitch);
        this.addSymbol(stitch);
      }
      for (const stitch of pattern.linestitches) {
        this.addLineStitch(stitch);
        this.addSymbol(stitch);
      }
      for (const stitch of pattern.nodestitches) {
        this.addNodeStitch(stitch);
        this.addSymbol(stitch);
      }

      for (const specialstitch of pattern.specialstitches) this.addSpecialStitch(specialstitch);

      this.showSymbols = this.#showSymbols;
      this.displayMode = this.#displayMode;

      this.render = undefined;
    };
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
    return this.#showSymbols;
  }

  set showSymbols(value: boolean) {
    this.#showSymbols = value;
    this.stages.symbols.visible = value;
    this.stages.symbols.renderable = value;

    // Update the display mode since it depends on the `showSymbols` value.
    this.displayMode = this.#displayMode;
  }

  get key() {
    return this.#key;
  }

  get info() {
    return this.#info;
  }

  get fabric() {
    return this.#fabric;
  }

  set fabric(fabric: Fabric) {
    this.#fabric = fabric;
    this.stages.fabric.clear();
    this.stages.fabric.rect(0, 0, this.fabric.width, this.fabric.height).fill(this.fabric.color);

    // If the grid is set, adjust it to the new fabric.
    if (this.#grid) this.grid = this.#grid;
  }

  get grid() {
    return this.#grid;
  }

  set grid(grid: Grid) {
    this.#grid = grid;
    const { width, height } = this.fabric;
    this.stages.grid.clear();
    {
      // Draw horizontal minor lines.
      for (let i = 1; i < width; i++) {
        this.stages.grid.moveTo(i, 0);
        this.stages.grid.lineTo(i, height);
      }

      // Draw vertical minor lines.
      for (let i = 1; i < height; i++) {
        this.stages.grid.moveTo(0, i);
        this.stages.grid.lineTo(width, i);
      }

      const { thickness, color } = this.grid.minorLines;
      this.stages.grid.stroke({ width: thickness, color });
    }
    {
      const interval = this.grid.majorLinesInterval;

      // Draw horizontal major lines.
      for (let i = 0; i <= Math.ceil(height / interval); i++) {
        const point = Math.min(i * interval, height);
        this.stages.grid.moveTo(0, point);
        this.stages.grid.lineTo(width, point);
      }

      // Draw vertical major lines.
      for (let i = 0; i <= Math.ceil(width / interval); i++) {
        const point = Math.min(i * interval, width);
        this.stages.grid.moveTo(point, 0);
        this.stages.grid.lineTo(point, height);
      }

      const { thickness, color } = this.grid.majorLines;
      this.stages.grid.stroke({ width: thickness, color });
    }
  }

  get palette() {
    return this.#palette;
  }

  addPaletteItem(data: AddedPaletteItemData) {
    this.#palette.splice(data.palindex, 0, data.palitem);
  }

  removePaletteItem(palindex: number) {
    this.#palette.splice(palindex, 1);
  }

  get allStitchFonts() {
    const fonts = new Set<string>();
    fonts.add(this.defaultSymbolFont);
    for (const palitem of this.palette) {
      if (palitem.symbolFont) fonts.add(palitem.symbolFont);
    }
    return Array.from(fonts);
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

    const symbol = new StitchSymbol(stitch, palitem.symbol, {
      fontFamily: symbolFont ? [symbolFont, this.defaultSymbolFont] : this.defaultSymbolFont,
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
    this.stages.lines.addStitch(graphics);
  }

  removeLineStitch(stitch: LineStitch) {
    this.stages.lines.removeStitch(stitch);
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
    this.stages.nodes.addStitch(graphics);
  }

  removeNodeStitch(stitch: NodeStitch) {
    this.stages.nodes.removeStitch(stitch);
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
}
