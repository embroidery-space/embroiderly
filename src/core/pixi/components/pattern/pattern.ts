import { Bounds, Container, Graphics, Rectangle, RenderLayer } from "pixi.js";

import {
  DisplayMode,
  Fabric,
  FullStitch,
  FullStitchKind,
  Grid,
  LayersVisibility,
  LineStitch,
  LineStitchKind,
  NodeStitch,
  NodeStitchKind,
  PaletteItem,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  Pattern,
  ReferenceImage,
  ReferenceImageSettings,
  SpecialStitch,
  SpecialStitchModel,
  type Stitch,
} from "#/core/pattern/";

import { STITCH_SCALE_FACTOR } from "#/core/pixi/constants.ts";
import { TextureManager } from "#/core/pixi/texture-manager.ts";

import { Rulers } from "../ui/";
import { Hint } from "../hint.ts";
import { ReferenceImageView } from "./image.ts";
import { FabricView } from "./fabric.ts";
import { GridView } from "./grid.ts";
import {
  StitchGraphics,
  StitchGraphicsContainer,
  StitchParticle,
  StitchParticleContainer,
  StitchSymbol,
  StitchSymbolsContainer,
} from "./stitches.ts";

export class PatternView extends Container {
  private palette: PaletteItem[];
  private specialStitchModels: SpecialStitchModel[];

  private displayMode: DisplayMode | undefined;
  private previousDisplayMode: DisplayMode;

  private showSymbols: boolean;
  private layersVisibility: LayersVisibility;

  private defaultSymbolFont: string;

  private stages = {
    // lowest
    fabric: new FabricView(),

    referenceImage: new ReferenceImageView(),

    fullstitches: new StitchParticleContainer({ label: "Full Stitches" }),
    petitestitches: new StitchParticleContainer({ label: "Petite Stitches" }),

    halfstitches: new StitchParticleContainer({ label: "Half Stitches" }),
    quarterstitches: new StitchParticleContainer({ label: "Quarter Stitches" }),

    symbols: new StitchSymbolsContainer({ label: "Symbols" }),

    grid: new GridView(),

    specialstitches: new StitchGraphicsContainer({
      label: "Special Stitches",
      eventMode: "passive",
      interactiveChildren: true,
    }),
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

    hint: new Hint(),
    rulers: new Rulers(),
    // highest
  };
  private overlay = new RenderLayer();

  constructor(pattern: Pattern) {
    super({ label: "Pattern", isRenderGroup: true });

    this.palette = pattern.palette;

    this.setFabric(pattern.fabric);
    this.setGrid(pattern.grid);

    this.setShowSymbols(pattern.showSymbols);
    this.setDisplayMode(pattern.displayMode);
    this.setLayersVisibility(pattern.layersVisibility);

    this.defaultSymbolFont = pattern.defaultSymbolFont;

    if (pattern.referenceImage) this.setReferenceImage(pattern.referenceImage, { fit: false });

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

    this.specialStitchModels = pattern.specialStitchModels;
    for (const specialstitch of pattern.specialstitches) {
      this.addSpecialStitch(specialstitch);
    }

    // Configure the stages and overlay.
    this.addChild(...Object.values(this.stages), this.overlay);
    this.overlay.attach(this.stages.referenceImage.controls);
  }

  setFabric(fabric: Fabric) {
    const { width, height } = fabric;
    this.stages.fabric.setFabric(fabric);

    // Set the container bounds.
    this.boundsArea = new Rectangle(0, 0, width, height);

    const grid = this.stages.grid.original;
    if (grid) {
      // If the grid is set, adjust it to the new fabric.
      this.stages.grid.setGrid(width, height, grid);
    }
  }

  setGrid(grid: Grid) {
    const { width, height } = this.stages.fabric.original;
    this.stages.grid.setGrid(width, height, grid);
    this.stages.rulers.setRulers(width, height, grid.majorLinesInterval);
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

  private addSymbol(stitch: Stitch) {
    if (stitch instanceof LineStitch || stitch instanceof NodeStitch) return;

    const palitem = this.palette[stitch.palindex]!;
    const symbolFont = palitem.symbolFont;
    const defaultSymbolFont = this.defaultSymbolFont;

    const symbol = new StitchSymbol(stitch, palitem.symbol, {
      fontFamily: symbolFont ? [symbolFont, defaultSymbolFont] : defaultSymbolFont,
    });

    this.stages.symbols.addStitch(symbol);
  }

  private removeSymbol(stitch: Stitch) {
    this.stages.symbols.removeStitch(stitch);
  }

  private addFullStitch(stitch: FullStitch) {
    const { x, y, palindex, kind } = stitch;

    const particle = new StitchParticle(stitch, {
      texture: kind === FullStitchKind.Full ? this.stages.fullstitches.texture : this.stages.petitestitches.texture,
      x,
      y,
      tint: this.palette[palindex]!.color,
      scaleX: STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
    });

    if (kind === FullStitchKind.Full) this.stages.fullstitches.addStitch(particle);
    else this.stages.petitestitches.addStitch(particle);
  }

  private removeFullStitch(stitch: FullStitch) {
    if (stitch.kind === FullStitchKind.Full) this.stages.fullstitches.removeStitch(stitch);
    else this.stages.petitestitches.removeStitch(stitch);
  }

  private addPartStitch(stitch: PartStitch) {
    const { x, y, palindex, kind, direction } = stitch;

    const particle = new StitchParticle(stitch, {
      texture: kind === PartStitchKind.Half ? this.stages.halfstitches.texture : this.stages.quarterstitches.texture,
      x,
      y,
      tint: this.palette[palindex]!.color,
      scaleX: direction === PartStitchDirection.Forward ? STITCH_SCALE_FACTOR : -STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
      anchorX: direction === PartStitchDirection.Forward ? 0 : 1,
    });

    if (kind === PartStitchKind.Half) this.stages.halfstitches.addStitch(particle);
    else this.stages.quarterstitches.addStitch(particle);
  }

  private removePartStitch(stitch: PartStitch) {
    if (stitch.kind === PartStitchKind.Half) this.stages.halfstitches.removeStitch(stitch);
    else this.stages.quarterstitches.removeStitch(stitch);
  }

  private addLineStitch(stitch: LineStitch) {
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
      .stroke({ width: 0.2, color: this.palette[palindex]!.color, cap: "round" });
    graphics.eventMode = "static";

    if (stitch.kind === LineStitchKind.Back) this.stages.backstitches.addStitch(graphics);
    else this.stages.straightstitches.addStitch(graphics);
  }

  private removeLineStitch(stitch: LineStitch) {
    if (stitch.kind === LineStitchKind.Back) this.stages.backstitches.removeStitch(stitch);
    else this.stages.straightstitches.removeStitch(stitch);
  }

  private addNodeStitch(stitch: NodeStitch) {
    const { x, y, palindex, kind, rotated } = stitch;
    const palitem = this.palette[palindex]!;

    const graphics = new StitchGraphics(stitch, TextureManager.getNodeTexture(kind));
    graphics.eventMode = "static";
    graphics.tint = palitem.color;
    graphics.pivot.set(graphics.width / 2, graphics.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    if (rotated) graphics.angle = 90;

    if (kind === NodeStitchKind.FrenchKnot) this.stages.frenchknots.addStitch(graphics);
    else this.stages.beads.addStitch(graphics);
  }

  private removeNodeStitch(stitch: NodeStitch) {
    if (stitch.kind === NodeStitchKind.FrenchKnot) this.stages.frenchknots.removeStitch(stitch);
    else this.stages.beads.removeStitch(stitch);
  }

  private addSpecialStitch(specialStitch: SpecialStitch) {
    const { x, y, rotation, flip, palindex, modindex } = specialStitch;
    const model = this.specialStitchModels[modindex]!;

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

  setDisplayMode(displayMode: DisplayMode | undefined) {
    this.displayMode = this.showSymbols ? displayMode : (displayMode ?? this.previousDisplayMode);
    if (displayMode) {
      this.previousDisplayMode = displayMode;
      this.stages.fullstitches.texture = TextureManager.getFullStitchTexture(displayMode, FullStitchKind.Full);
      this.stages.petitestitches.texture = TextureManager.getFullStitchTexture(displayMode, FullStitchKind.Petite);
      this.stages.halfstitches.texture = TextureManager.getPartStitchTexture(displayMode, PartStitchKind.Half);
      this.stages.quarterstitches.texture = TextureManager.getPartStitchTexture(displayMode, PartStitchKind.Quarter);
    }

    const visible = Boolean(this.displayMode);
    this.stages.fullstitches.visible = visible;
    this.stages.petitestitches.visible = visible;
    this.stages.halfstitches.visible = visible;
    this.stages.quarterstitches.visible = visible;
  }

  setShowSymbols(value: boolean) {
    this.showSymbols = value;
    this.stages.symbols.visible = value;
    this.stages.symbols.renderable = value;

    // If the display mode is set, update it since it depends on the `showSymbols` value.
    this.setDisplayMode(this.displayMode);
  }

  setLayersVisibility(layersVisibility: LayersVisibility) {
    this.layersVisibility = layersVisibility;
    for (const [layer, visible] of Object.entries(this.layersVisibility)) {
      const stage = this.stages[layer as keyof typeof this.stages];
      if (stage) {
        stage.visible = visible;
        stage.renderable = visible;
      }
    }
  }

  async setReferenceImage(
    image: ReferenceImage,
    options?: {
      /**
       * Whether to fit the image withing the pattern or not.
       * It is useful to scale a new image down for a better look.
       * @default true
       */
      fit?: boolean;
    },
  ) {
    // Set the image and its settings.
    await this.stages.referenceImage.setImage(image);

    if (options?.fit ?? true) {
      const { width, height } = this.stages.fabric;
      this.stages.referenceImage.fit(width, height);
    }
  }

  removeReferenceImage() {
    this.stages.referenceImage.removeImage();
  }

  focusReferenceImage() {
    this.stages.referenceImage.focus();
  }

  blurReferenceImage() {
    this.stages.referenceImage.blur();
  }

  get referenceImageSettings() {
    return this.stages.referenceImage.settings;
  }
  set referenceImageSettings(settings: ReferenceImageSettings) {
    this.stages.referenceImage.settings = settings;
  }

  drawLineHint(stitch: LineStitch) {
    const palitem = this.palette[stitch.palindex]!;
    this.stages.hint.drawLine(stitch, palitem.color);
  }

  drawNodeHint(stitch: NodeStitch) {
    const palitem = this.palette[stitch.palindex]!;
    this.stages.hint.drawNode(stitch, palitem.color);
  }

  /**
   * Adjusts the zoom level of the pattern view.
   * @param zoom - The zoom level in range 1 to 100.
   */
  adjustZoom(zoom: number, bounds?: Bounds) {
    this.stages.grid.renderGrid();
    this.stages.rulers.renderRulers(zoom, bounds);
  }
}
