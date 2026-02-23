import { Container, Graphics, GraphicsContext, Texture } from "pixi.js";
import type { Renderer, TextureSourceOptions } from "pixi.js";

import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind, DisplayMode } from "~/lib/pattern/";
import { mm2px } from "~/utils/";

const DEFAULT_TEXTURE_SOURCE_OPTIONS: Partial<TextureSourceOptions> = {
  resolution: window.devicePixelRatio,
  antialias: true,
  scaleMode: "linear",
};

/** Options for configuring the texture manager. */
export interface TextureManagerOptions {
  /** Whether stitches should have an outline stroke. */
  outlineStitches?: boolean;
  /** Options for the texture source. */
  textureSourceOptions?: TextureSourceOptions;
}

/** Options for creating stitch figure graphics. */
interface StitchFigureOptions {
  /** Whether the figure should have an outline stroke. */
  outlined: boolean;
}

/**
 * Manages the textures used to render stitches.
 * This class is responsible for creating and caching stitch textures.
 */
export class TextureManager {
  #renderer: Renderer;
  #textureSourceOptions: TextureSourceOptions;
  #outlineStitches: boolean;

  #cache = new Map<string, unknown>();

  /**
   * Creates a new texture manager instance.
   * @param renderer The Pixi.js renderer instance (e.g. `app.renderer`).
   * @param options Options for configuring the texture manager.
   */
  constructor(renderer: Renderer, options?: TextureManagerOptions) {
    this.#renderer = renderer;
    this.#textureSourceOptions = { ...DEFAULT_TEXTURE_SOURCE_OPTIONS, ...options?.textureSourceOptions };
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
    const options: StitchFigureOptions = { outlined: this.#outlineStitches };
    const figure = (() => {
      if (mode === DisplayMode.Stitches) {
        if (kind === FullStitchKind.Full) return createFullStitchShapeFigure(options);
        return createPetiteStitchShapeFigure(options);
      }

      // In the solid and mixed mode, full stitches are rendered as solid figures.
      if (kind === FullStitchKind.Full) return createFullStitchSolidFigure(options);

      return createPetiteStitchSolidFigure(options);
    })();
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
    const options: StitchFigureOptions = { outlined: this.#outlineStitches };
    const figure = (() => {
      if (mode === DisplayMode.Solid) {
        if (kind === PartStitchKind.Half) return createHalfStitchSolidFigure(options);
        return createQuarterStitchSolidFigure(options);
      }

      // In the shape and mixed mode, part stitches are rendered as shape figures.
      if (kind === PartStitchKind.Half) return createHalfStitchShapeFigure(options);

      return createQuarterStitchShapeFigure(options);
    })();
    return this.#createTexture(figure);
  }

  getNodeTexture(kind: NodeStitchKind, bead = Bead.default()) {
    const stitchCachekey = kind === NodeStitchKind.FrenchKnot ? kind : `${kind}-${bead.diameter}x${bead.length}`;

    let texture = this.#cache.get(stitchCachekey) as GraphicsContext;
    if (!texture) {
      texture = kind === NodeStitchKind.FrenchKnot ? this.#createFrenchKnotTexture() : this.#createBeadTexture(bead);
      this.#cache.set(stitchCachekey, texture);
    }

    return texture;
  }

  #createFrenchKnotTexture() {
    const options: StitchFigureOptions = { outlined: this.#outlineStitches };
    return createFrenchKnotFigure(options);
  }

  #createBeadTexture(bead: Bead) {
    const options: StitchFigureOptions = { outlined: this.#outlineStitches };
    return createBeadFigure(bead, options);
  }

  #createTexture(container: Container, textureSourceOptions?: Partial<TextureSourceOptions>) {
    const texture = this.#renderer.generateTexture({
      target: container,
      textureSourceOptions: { ...this.#textureSourceOptions, ...textureSourceOptions },
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

function createFullStitchSolidFigure(options: StitchFigureOptions) {
  const graphics = new Graphics().rect(0, 0, 100, 100).fill(0xffffff);
  if (options.outlined) graphics.stroke({ width: 2, alignment: 0.5, color: 0x000000 });
  return graphics;
}
function createFullStitchShapeFigure(options: StitchFigureOptions) {
  const graphics = new Graphics()
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
  if (options.outlined) graphics.stroke({ width: 2, alignment: 0.5, color: 0x000000 });
  return graphics;
}

function createPetiteStitchSolidFigure(options: StitchFigureOptions) {
  const graphics = new Graphics().rect(0, 0, 50, 50).fill(0xffffff);
  if (options.outlined) graphics.stroke({ width: 1, alignment: 0.5, color: 0x000000 });
  return graphics;
}
function createPetiteStitchShapeFigure(options: StitchFigureOptions) {
  const graphics = new Graphics()
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
  if (options.outlined) graphics.stroke({ width: 1, alignment: 0.5, color: 0x000000 });
  return graphics;
}

function createHalfStitchSolidFigure(options: StitchFigureOptions) {
  const graphics = new Graphics().rect(0, 50, 50, 50).rect(50, 0, 50, 50).fill(0xffffff);
  if (options.outlined) graphics.stroke({ width: 2, alignment: 0.5, color: 0x000000 });
  return graphics;
}
function createHalfStitchShapeFigure(options: StitchFigureOptions) {
  const graphics = new Graphics()
    .poly([
      { x: 100, y: 0 },
      { x: 100, y: 35 },
      { x: 35, y: 100 },
      { x: 0, y: 100 },
      { x: 0, y: 65 },
      { x: 65, y: 0 },
    ])
    .fill(0xffffff);
  if (options.outlined) graphics.stroke({ width: 2, alignment: 0.5, color: 0x000000 });
  return graphics;
}

function createQuarterStitchSolidFigure(options: StitchFigureOptions) {
  const graphics = new Graphics().rect(0, 0, 50, 50).fill(0xffffff);
  if (options.outlined) graphics.stroke({ width: 1, alignment: 0.5, color: 0x000000 });
  return graphics;
}
function createQuarterStitchShapeFigure(options: StitchFigureOptions) {
  const graphics = new Graphics()
    .poly([
      { x: 50, y: 0 },
      { x: 50, y: 25 },
      { x: 25, y: 49 },
      { x: 0, y: 50 },
      { x: 0, y: 25 },
      { x: 25, y: 0 },
    ])
    .fill(0xffffff);
  if (options.outlined) graphics.stroke({ width: 1, alignment: 0.5, color: 0x000000 });
  return graphics;
}

function createFrenchKnotFigure(options: StitchFigureOptions) {
  const context = new GraphicsContext().circle(25, 25, 25).fill(0xffffff);
  if (options.outlined) context.stroke({ pixelLine: true, alignment: 0.5, color: 0x000000 });
  return context;
}
function createBeadFigure(bead: Bead, options: StitchFigureOptions) {
  const width = mm2px(bead.diameter) * 10;
  const height = mm2px(bead.length) * 10;
  const context = new GraphicsContext().roundRect(0, 0, width, height, width * 0.4).fill(0xffffff);
  if (options.outlined) context.stroke({ pixelLine: true, alignment: 0.5, color: 0x000000 });
  return context;
}
