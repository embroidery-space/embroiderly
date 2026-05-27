import { Bounds, Container, Graphics, Rectangle, RenderLayer } from "pixi.js";
import type { DestroyOptions } from "pixi.js";

import {
  DisplayMode,
  DisplaySettings,
  Fabric,
  FullStitch,
  FullStitchKind,
  Grid,
  Layer,
  Layers,
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
} from "~/lib/pattern/";
import type { Stitch } from "~/lib/pattern/";
import { LayerLayout } from "~/lib/types/";

import { STITCH_SCALE_FACTOR } from "../../constants.ts";
import { TextureManager } from "../../texture-manager.ts";

import { FabricView } from "./fabric.ts";
import { GridView } from "./grid.ts";
import { ReferenceImageView } from "./image.ts";
import { Rulers } from "./rulers.ts";
import {
  StitchGraphics,
  StitchGraphicsContainer,
  StitchParticle,
  StitchParticleContainer,
  StitchSymbol,
  StitchSymbolsContainer,
  StitchesHint,
} from "./stitches.ts";

interface LayerContainers {
  fullstitches: StitchParticleContainer;
  petitestitches: StitchParticleContainer;
  halfstitches: StitchParticleContainer;
  quarterstitches: StitchParticleContainer;
  symbols: StitchSymbolsContainer;
  specialstitches: StitchGraphicsContainer;
  backstitches: StitchGraphicsContainer;
  straightstitches: StitchGraphicsContainer;
  frenchknots: StitchGraphicsContainer;
  beads: StitchGraphicsContainer;
}

const STITCH_TYPES_BEFORE_GRID = [
  "fullstitches",
  "petitestitches",
  "halfstitches",
  "quarterstitches",
  "symbols",
] as const;
const STITCH_TYPES_AFTER_GRID = [
  "specialstitches",
  "backstitches",
  "straightstitches",
  "frenchknots",
  "beads",
] as const;

function createLayerContainers(layerIndex: number): LayerContainers {
  return {
    fullstitches: new StitchParticleContainer({ label: `Layer ${layerIndex} Full Stitches` }),
    petitestitches: new StitchParticleContainer({ label: `Layer ${layerIndex} Petite Stitches` }),
    halfstitches: new StitchParticleContainer({ label: `Layer ${layerIndex} Half Stitches` }),
    quarterstitches: new StitchParticleContainer({ label: `Layer ${layerIndex} Quarter Stitches` }),
    symbols: new StitchSymbolsContainer({ label: `Layer ${layerIndex} Symbols` }),
    specialstitches: new StitchGraphicsContainer({
      label: `Layer ${layerIndex} Special Stitches`,
      eventMode: "passive",
      interactiveChildren: true,
    }),
    backstitches: new StitchGraphicsContainer({
      label: `Layer ${layerIndex} Back Stitches`,
      eventMode: "passive",
      interactiveChildren: true,
    }),
    straightstitches: new StitchGraphicsContainer({
      label: `Layer ${layerIndex} Straight Stitches`,
      eventMode: "passive",
      interactiveChildren: true,
    }),
    frenchknots: new StitchGraphicsContainer({
      label: `Layer ${layerIndex} French Knots`,
      eventMode: "passive",
      interactiveChildren: true,
    }),
    beads: new StitchGraphicsContainer({
      label: `Layer ${layerIndex} Beads`,
      eventMode: "passive",
      interactiveChildren: true,
    }),
  };
}

export class PatternView extends Container {
  #textureManager: TextureManager;

  private palette: readonly PaletteItem[];
  private layers: Layers;
  private specialStitchModels: SpecialStitchModel[];

  private displayMode: DisplayMode | undefined;
  private showSymbols = false;

  #referenceImage = new ReferenceImageView();

  #fabric = new FabricView();
  #grid = new GridView();
  #rulers = new Rulers();

  #layerLayout: LayerLayout = LayerLayout.ByStitchType;
  #layerContainers = new Map<number, LayerContainers>();

  #stitchesHint = new StitchesHint();

  #overlay = new RenderLayer();

  constructor(pattern: Pattern, textureManager: TextureManager) {
    super({ label: "Pattern", isRenderGroup: true });
    this.#textureManager = textureManager;

    this.palette = pattern.palette.items;
    this.layers = pattern.layers;
    this.specialStitchModels = pattern.specialStitchModels;

    this.setFabric(pattern.fabric);
    this.setGrid(pattern.grid);

    if (pattern.referenceImage) this.setReferenceImage(pattern.referenceImage, { fit: false });

    // Initialize layer containers.
    for (const layer of pattern.layers.items) {
      this.#layerContainers.set(layer.index, createLayerContainers(layer.index));
    }

    // Set display settings.
    this.setShowSymbols(pattern.showSymbols);
    this.setShowGrid(pattern.showGrid);
    this.setShowRulers(pattern.showRulers);
    this.setDisplayMode(pattern.displayMode);

    // Add stitches from each layer to their containers.
    // This must be performed after display settings are set (textures need to be initialized).
    for (const layer of pattern.layers.items) {
      const lc = this.#layerContainers.get(layer.index)!;

      for (const stitch of layer.fullstitches) {
        this.addFullStitch(stitch, lc);
        this.addSymbol(stitch, lc);
      }
      for (const stitch of layer.partstitches) {
        this.addPartStitch(stitch, lc);
        this.addSymbol(stitch, lc);
      }
      for (const stitch of layer.linestitches) {
        this.addLineStitch(stitch, lc);
      }
      for (const stitch of layer.nodestitches) {
        this.addNodeStitch(stitch, lc);
      }
      for (const stitch of layer.specialstitches) {
        this.addSpecialStitch(stitch, lc);
      }
    }

    // Assemble the scene graph and wire the overlay.
    this.#rebuildSceneGraph();
    this.#overlay.attach(this.#referenceImage.controls);
  }

  override destroy(options?: DestroyOptions) {
    this.palette = [];
    this.specialStitchModels = [];

    super.destroy(options);
  }

  setFabric(fabric: Fabric) {
    const { width, height } = fabric;
    this.#fabric.setFabric(fabric);

    // Set the container bounds.
    this.boundsArea = new Rectangle(0, 0, width, height);

    // If the grid is set, adjust it to the new fabric.
    const grid = this.#grid.original;
    if (grid) {
      this.#grid.setGrid(width, height, grid);
      this.#rulers.setRulers(width, height, grid.majorLinesInterval);
    }
  }

  setGrid(grid: Grid) {
    const { width, height } = this.#fabric.original;
    this.#grid.setGrid(width, height, grid);
    this.#rulers.setRulers(width, height, grid.majorLinesInterval);
  }

  addStitch(stitch: Stitch, layerIndex: number) {
    const lc = this.#layerContainers.get(layerIndex);
    if (!lc) return;

    if (stitch instanceof FullStitch) this.addFullStitch(stitch, lc);
    else if (stitch instanceof PartStitch) this.addPartStitch(stitch, lc);
    else if (stitch instanceof LineStitch) this.addLineStitch(stitch, lc);
    else this.addNodeStitch(stitch, lc);

    this.addSymbol(stitch, lc);
  }

  removeStitch(stitch: Stitch, layerIndex: number) {
    const lc = this.#layerContainers.get(layerIndex);
    if (!lc) return;

    if (stitch instanceof FullStitch) this.removeFullStitch(stitch, lc);
    else if (stitch instanceof PartStitch) this.removePartStitch(stitch, lc);
    else if (stitch instanceof LineStitch) this.removeLineStitch(stitch, lc);
    else this.removeNodeStitch(stitch, lc);

    this.removeSymbol(stitch, lc);
  }

  private addSymbol(stitch: Stitch, lc: LayerContainers) {
    if (stitch instanceof LineStitch || stitch instanceof NodeStitch) return;

    const palitem = this.palette[stitch.palindex]!;
    const symbol = new StitchSymbol(stitch, palitem.symbol);

    lc.symbols.addStitch(symbol);
  }

  private removeSymbol(stitch: Stitch, lc: LayerContainers) {
    lc.symbols.removeStitch(stitch);
  }

  private addFullStitch(stitch: FullStitch, lc: LayerContainers) {
    const { x, y, palindex, kind } = stitch;

    const particle = new StitchParticle(stitch, {
      texture: kind === FullStitchKind.Full ? lc.fullstitches.texture : lc.petitestitches.texture,
      x,
      y,
      tint: this.palette[palindex]!.color,
      scaleX: STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
    });

    if (kind === FullStitchKind.Full) lc.fullstitches.addStitch(particle);
    else lc.petitestitches.addStitch(particle);
  }

  private removeFullStitch(stitch: FullStitch, lc: LayerContainers) {
    if (stitch.kind === FullStitchKind.Full) lc.fullstitches.removeStitch(stitch);
    else lc.petitestitches.removeStitch(stitch);
  }

  private addPartStitch(stitch: PartStitch, lc: LayerContainers) {
    const { x, y, palindex, kind, direction } = stitch;

    const particle = new StitchParticle(stitch, {
      texture: kind === PartStitchKind.Half ? lc.halfstitches.texture : lc.quarterstitches.texture,
      x,
      y,
      tint: this.palette[palindex]!.color,
      scaleX: direction === PartStitchDirection.Forward ? STITCH_SCALE_FACTOR : -STITCH_SCALE_FACTOR,
      scaleY: STITCH_SCALE_FACTOR,
      anchorX: direction === PartStitchDirection.Forward ? 0 : 1,
    });

    if (kind === PartStitchKind.Half) lc.halfstitches.addStitch(particle);
    else lc.quarterstitches.addStitch(particle);
  }

  private removePartStitch(stitch: PartStitch, lc: LayerContainers) {
    if (stitch.kind === PartStitchKind.Half) lc.halfstitches.removeStitch(stitch);
    else lc.quarterstitches.removeStitch(stitch);
  }

  private addLineStitch(stitch: LineStitch, lc: LayerContainers) {
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

    if (stitch.kind === LineStitchKind.Back) lc.backstitches.addStitch(graphics);
    else lc.straightstitches.addStitch(graphics);
  }

  private removeLineStitch(stitch: LineStitch, lc: LayerContainers) {
    if (stitch.kind === LineStitchKind.Back) lc.backstitches.removeStitch(stitch);
    else lc.straightstitches.removeStitch(stitch);
  }

  private addNodeStitch(stitch: NodeStitch, lc: LayerContainers) {
    const { x, y, palindex, kind, rotated } = stitch;
    const palitem = this.palette[palindex]!;

    const graphics = new StitchGraphics(stitch, this.#textureManager.getNodeTexture(kind));
    graphics.eventMode = "static";
    graphics.tint = palitem.color;
    graphics.pivot.set(graphics.width / 2, graphics.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    if (rotated) graphics.angle = 90;

    if (kind === NodeStitchKind.FrenchKnot) lc.frenchknots.addStitch(graphics);
    else lc.beads.addStitch(graphics);
  }

  private removeNodeStitch(stitch: NodeStitch, lc: LayerContainers) {
    if (stitch.kind === NodeStitchKind.FrenchKnot) lc.frenchknots.removeStitch(stitch);
    else lc.beads.removeStitch(stitch);
  }

  private addSpecialStitch(specialStitch: SpecialStitch, lc: LayerContainers) {
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

    lc.specialstitches.addChild(graphics);
  }

  setDisplayMode(displayMode: DisplayMode | undefined) {
    this.displayMode = displayMode;
    for (const [index, lc] of this.#layerContainers) {
      const layer = this.layers.get(index);
      if (layer) this.#syncLayerContainers(lc, layer);
    }
  }

  setShowSymbols(value: boolean) {
    this.showSymbols = value;
    this.setDisplayMode(this.displayMode);
  }

  setShowGrid(value: boolean) {
    this.#grid.visible = value;
    this.#grid.renderable = value;
  }

  setShowRulers(value: boolean) {
    this.#rulers.visible = value;
    this.#rulers.renderable = value;
  }

  setDisplaySettings(settings: DisplaySettings) {
    this.setDisplayMode(settings.displayMode);
    this.setShowSymbols(settings.showSymbols);
    this.setShowGrid(settings.showGrid);
    this.setShowRulers(settings.showRulers);
  }

  addLayer(layerIndex: number) {
    const lc = createLayerContainers(layerIndex);
    this.#layerContainers.set(layerIndex, lc);

    const layer = this.layers.get(layerIndex);
    if (layer) this.#syncLayerContainers(lc, layer);

    this.#rebuildSceneGraph();
  }

  removeLayer(layerIndex: number) {
    const lc = this.#layerContainers.get(layerIndex);
    if (!lc) return;

    this.#layerContainers.delete(layerIndex);
    for (const container of Object.values(lc)) container.destroy({ children: true });

    this.#rebuildSceneGraph();
  }

  updateLayerVisibility(layerIndex: number) {
    const lc = this.#layerContainers.get(layerIndex);
    const layer = this.layers.get(layerIndex);
    if (lc && layer) this.#syncLayerContainers(lc, layer);
  }

  reorderLayers() {
    this.#rebuildSceneGraph();
  }

  get layerLayout() {
    return this.#layerLayout;
  }
  set layerLayout(value: LayerLayout) {
    if (value === this.#layerLayout) return;
    this.#layerLayout = value;
    this.#rebuildSceneGraph();
  }

  #rebuildSceneGraph() {
    this.removeChildren();

    const visualLayers = this.layers.itemsInVisualOrder
      .reverse()
      .map((l) => this.#layerContainers.get(l.index))
      .filter(Boolean) as LayerContainers[];

    const [stitchTypesBeforeGrid, stitchTypesAfterGrid] =
      this.#layerLayout === LayerLayout.ByLayerOrder
        ? this.#assembleLayerFirstOrder(visualLayers)
        : this.#assembleStitchFirstOrder(visualLayers);

    this.addChild(
      this.#fabric,
      this.#referenceImage,
      ...stitchTypesBeforeGrid,
      this.#grid,
      ...stitchTypesAfterGrid,
      this.#stitchesHint,
      this.#rulers,
      this.#overlay,
    );
  }

  #assembleStitchFirstOrder(layers: LayerContainers[]): [Container[], Container[]] {
    const beforeGrid: Container[] = [];
    for (const type of STITCH_TYPES_BEFORE_GRID) {
      for (const lc of layers) beforeGrid.push(lc[type]);
    }

    const afterGrid: Container[] = [];
    for (const type of STITCH_TYPES_AFTER_GRID) {
      for (const lc of layers) afterGrid.push(lc[type]);
    }

    return [beforeGrid, afterGrid];
  }

  #assembleLayerFirstOrder(layers: LayerContainers[]): [Container[], Container[]] {
    const beforeGrid: Container[] = [];
    const afterGrid: Container[] = [];

    for (const lc of layers) {
      for (const type of STITCH_TYPES_BEFORE_GRID) beforeGrid.push(lc[type]);
      for (const type of STITCH_TYPES_AFTER_GRID) afterGrid.push(lc[type]);
    }

    return [beforeGrid, afterGrid];
  }

  #syncLayerContainers(lc: LayerContainers, layer: Layer) {
    const d = Boolean(this.displayMode);
    const l = layer.visible;

    if (this.displayMode) {
      lc.fullstitches.texture = this.#textureManager.getFullStitchTexture(this.displayMode, FullStitchKind.Full); // oxfmt-ignore
      lc.petitestitches.texture = this.#textureManager.getFullStitchTexture(this.displayMode, FullStitchKind.Petite); // oxfmt-ignore
      lc.halfstitches.texture = this.#textureManager.getPartStitchTexture(this.displayMode, PartStitchKind.Half); // oxfmt-ignore
      lc.quarterstitches.texture = this.#textureManager.getPartStitchTexture(this.displayMode, PartStitchKind.Quarter); // oxfmt-ignore
    }

    lc.fullstitches.visible = l && layer.fullstitchesVisible && d;
    lc.petitestitches.visible = l && layer.petitestitchesVisible && d;
    lc.halfstitches.visible = l && layer.halfstitchesVisible && d;
    lc.quarterstitches.visible = l && layer.quarterstitchesVisible && d;
    lc.symbols.visible = l && this.showSymbols;
    lc.symbols.renderable = l && this.showSymbols;
    lc.specialstitches.visible = l && layer.specialstitchesVisible;
    lc.backstitches.visible = l && layer.backstitchesVisible;
    lc.straightstitches.visible = l && layer.straightstitchesVisible;
    lc.frenchknots.visible = l && layer.frenchknotsVisible;
    lc.beads.visible = l && layer.beadsVisible;
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
    await this.#referenceImage.setImage(image);

    if (options?.fit ?? true) {
      const { width, height } = this.#fabric;
      this.#referenceImage.fit(width, height);
    }
  }

  removeReferenceImage() {
    this.#referenceImage.removeImage();
  }

  focusReferenceImage() {
    this.#referenceImage.focus();
  }

  blurReferenceImage() {
    this.#referenceImage.blur();
  }

  get referenceImageSettings() {
    return this.#referenceImage.settings;
  }
  set referenceImageSettings(settings: ReferenceImageSettings) {
    this.#referenceImage.settings = settings;
  }

  drawLineHint(stitch: LineStitch) {
    const palitem = this.palette[stitch.palindex]!;
    this.#stitchesHint.drawLine(stitch, palitem.color);
  }

  drawNodeHint(stitch: NodeStitch) {
    const palitem = this.palette[stitch.palindex]!;
    this.#stitchesHint.drawNode(stitch, palitem.color, this.#textureManager.getNodeTexture(stitch.kind));
  }

  /**
   * Adjusts the zoom level of the pattern view.
   * @param zoom - The zoom level in range 1 to 100.
   * @param bounds - The bounds of the viewport to adjust the ruler position.
   */
  adjustZoom(zoom: number, bounds?: Bounds) {
    this.#grid.renderGrid();
    this.#rulers.renderRulers(zoom, bounds);
  }
}
