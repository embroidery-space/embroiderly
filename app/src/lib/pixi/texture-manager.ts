import { Container, Graphics, GraphicsContext, Texture } from "pixi.js";
import type { Renderer, StrokeStyle, TextureSourceOptions } from "pixi.js";

import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind, DisplayMode } from "~/lib/pattern/";
import type { TextureManagerOptions } from "~/lib/types/";

const TEXTURE_SOURCE_OPTIONS: Partial<TextureSourceOptions> = {
  resolution: window.devicePixelRatio,
  antialias: true,
  scaleMode: "linear",
};

const STITCH_OUTLINE: StrokeStyle = { width: 2, alignment: 0.5, color: 0x000000 };

const PIXELS_IN_MM = 96 / 25.4; // DPI / inches

/**
 * Manages the textures used to render stitches.
 * This class is responsible for creating and caching stitch textures.
 */
export class TextureManager {
  #renderer: Renderer;

  #outlineStitches: boolean;

  #cache = new Map<string, unknown>();

  /**
   * Creates a new texture manager instance.
   * @param renderer The Pixi.js renderer instance (e.g. `app.renderer`).
   * @param options Options for configuring the texture manager.
   */
  constructor(renderer: Renderer, options?: TextureManagerOptions) {
    this.#renderer = renderer;

    this.#outlineStitches = options?.outlineStitches ?? true;
  }

  getFullStitchTexture(mode: DisplayMode, kind: FullStitchKind) {
    const stitchCachekey = `${kind}Stitch${mode}`;

    let texture = this.#cache.get(stitchCachekey) as Texture;
    if (!texture) {
      texture = this.#createFullStitchTexture(mode, kind);
      this.#cache.set(stitchCachekey, texture);
    }

    return texture;
  }

  #createFullStitchTexture(mode: DisplayMode, kind: FullStitchKind) {
    let figure;
    if (mode === DisplayMode.Stitches) {
      if (kind === FullStitchKind.Full) figure = createFullStitchShapeFigure();
      else figure = createPetiteStitchShapeFigure();
    } else {
      // In the solid and mixed mode, full stitches are rendered as solid figures.
      if (kind === FullStitchKind.Full) figure = createFullStitchSolidFigure();
      else figure = createPetiteStitchSolidFigure();
    }

    if (this.#outlineStitches) figure.stroke(STITCH_OUTLINE);

    return this.#createTexture(figure);
  }

  getPartStitchTexture(mode: DisplayMode, kind: PartStitchKind) {
    const stitchCachekey = `${kind}Stitch${mode}`;

    let texture = this.#cache.get(stitchCachekey) as Texture;
    if (!texture) {
      texture = this.#createPartStitchTexture(mode, kind);
      this.#cache.set(stitchCachekey, texture);
    }

    return texture;
  }

  #createPartStitchTexture(mode: DisplayMode, kind: PartStitchKind) {
    let figure;
    if (mode === DisplayMode.Solid) {
      if (kind === PartStitchKind.Half) figure = createHalfStitchSolidFigure();
      else figure = createQuarterStitchSolidFigure();
    } else {
      // In the shape and mixed mode, part stitches are rendered as shape figures.
      if (kind === PartStitchKind.Half) figure = createHalfStitchShapeFigure();
      else figure = createQuarterStitchShapeFigure();
    }

    if (this.#outlineStitches) figure.stroke(STITCH_OUTLINE);

    return this.#createTexture(figure);
  }

  getNodeTexture(kind: NodeStitchKind, bead = new Bead()) {
    const stitchCachekey = kind === NodeStitchKind.FrenchKnot ? kind : `${kind}-${bead.diameter}x${bead.length}`;

    let texture = this.#cache.get(stitchCachekey) as GraphicsContext;
    if (!texture) {
      texture = kind === NodeStitchKind.FrenchKnot ? createFrenchKnotFigure() : createBeadFigure(bead);
      if (this.#outlineStitches) texture.stroke(STITCH_OUTLINE);

      this.#cache.set(stitchCachekey, texture);
    }

    return texture;
  }

  #createTexture(container: Container) {
    const texture = this.#renderer.generateTexture({
      target: container,
      textureSourceOptions: TEXTURE_SOURCE_OPTIONS,
    });

    // The container is temporary, so we should destroy it to free resources.
    container.destroy(true);

    return texture;
  }

  destroy() {
    // Clear the cache and destroy all textures.
    for (const texture of this.#cache.values()) (texture as Texture | GraphicsContext).destroy(true);
    this.#cache.clear();
  }
}

function createFullStitchSolidFigure() {
  return new Graphics().rect(0, 0, 100, 100).fill(0xffffff);
}
function createFullStitchShapeFigure() {
  return new Graphics()
    .poly([
      { x: 0, y: 0 },
      { x: 30, y: 0 },
      { x: 50, y: 20 },
      { x: 70, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 30 },
      { x: 80, y: 50 },
      { x: 100, y: 70 },
      { x: 100, y: 100 },
      { x: 70, y: 100 },
      { x: 50, y: 80 },
      { x: 30, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 70 },
      { x: 20, y: 50 },
      { x: 0, y: 30 },
    ])
    .fill(0xffffff);
}

function createPetiteStitchSolidFigure() {
  return new Graphics().rect(0, 0, 50, 50).fill(0xffffff);
}
function createPetiteStitchShapeFigure() {
  return new Graphics()
    .poly([
      { x: 0, y: 0 },
      { x: 15, y: 0 },
      { x: 25, y: 10 },
      { x: 35, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 15 },
      { x: 40, y: 25 },
      { x: 50, y: 35 },
      { x: 50, y: 50 },
      { x: 35, y: 50 },
      { x: 25, y: 40 },
      { x: 15, y: 50 },
      { x: 0, y: 50 },
      { x: 0, y: 35 },
      { x: 10, y: 25 },
      { x: 0, y: 15 },
    ])
    .fill(0xffffff);
}

function createHalfStitchSolidFigure() {
  return new Graphics().rect(0, 50, 50, 50).rect(50, 0, 50, 50).fill(0xffffff);
}
function createHalfStitchShapeFigure() {
  return new Graphics()
    .poly([
      { x: 100, y: 0 },
      { x: 100, y: 35 },
      { x: 35, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 65 },
      { x: 65, y: 0 },
    ])
    .fill(0xffffff);
}

function createQuarterStitchSolidFigure() {
  return new Graphics().rect(0, 0, 50, 50).fill(0xffffff);
}
function createQuarterStitchShapeFigure() {
  return new Graphics()
    .poly([
      { x: 50, y: 0 },
      { x: 50, y: 25 },
      { x: 25, y: 49 },
      { x: 0, y: 50 },
      { x: 0, y: 25 },
      { x: 25, y: 0 },
    ])
    .fill(0xffffff);
}

function createFrenchKnotFigure() {
  return new GraphicsContext().circle(25, 25, 25).fill(0xffffff);
}
function createBeadFigure(bead: Bead) {
  const width = bead.diameter * PIXELS_IN_MM * 10;
  const height = bead.length * PIXELS_IN_MM * 10;
  return new GraphicsContext().roundRect(0, 0, width, height, width * 0.4).fill(0xffffff);
}
