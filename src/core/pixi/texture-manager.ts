import { Container, Graphics, Texture } from "pixi.js";
import { GraphicsContext, type Renderer, type TextureSourceOptions } from "pixi.js";
import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind, DisplayMode } from "#/core/pattern/";
import { mm2px } from "#/utils/measurement";

const DEFAULT_TEXTURE_SOURCE_OPTIONS: Partial<TextureSourceOptions> = {
  resolution: window.devicePixelRatio,
  antialias: true,
  scaleMode: "linear",
};

/**
 * Manages the textures used to render stitches.
 * This class is responsible for creating and caching stitch textures.
 */
class TextureManagerClass {
  #renderer!: Renderer;
  #textureSourceOptions!: TextureSourceOptions;

  #cache = new Map<string, unknown>();

  /**
   * Initializes the texture manager.
   * @param renderer The Pixi.js renderer instance (e.g. `app.renderer`).
   * @param textureSourceOptions Options for the texture source.
   */
  init(renderer: Renderer, textureSourceOptions?: TextureSourceOptions) {
    this.#renderer = renderer;
    this.#textureSourceOptions = { ...DEFAULT_TEXTURE_SOURCE_OPTIONS, ...textureSourceOptions };
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
    const figure = (() => {
      if (mode === DisplayMode.Stitches) {
        if (kind === FullStitchKind.Full) return createFullStitchShapeFigure();
        else return createPetiteStitchShapeFigure();
      } else {
        // In the solid and mixed mode, full stitches are rendered as solid figures.
        if (kind === FullStitchKind.Full) return createFullStitchSolidFigure();
        else return createPetiteStitchSolidFigure();
      }
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
    const figure = (() => {
      if (mode === DisplayMode.Solid) {
        if (kind === PartStitchKind.Half) return createHalfStitchSolidFigure();
        else return createQuarterStitchSolidFigure();
      } else {
        // In the shape and mixed mode, part stitches are rendered as shape figures.
        if (kind === PartStitchKind.Half) return createHalfStitchShapeFigure();
        else return createQuarterStitchShapeFigure();
      }
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
    return createFrenchKnotFigure();
  }

  #createBeadTexture(bead: Bead) {
    return createBeadFigure(bead);
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
    this.#cache.forEach((texture) => (texture as Texture | GraphicsContext).destroy(true));
    this.#cache.clear();

    // Reset the renderer and texture source options.
    this.#renderer = null as unknown as Renderer;
    this.#textureSourceOptions = null as unknown as TextureSourceOptions;
  }
}
export const TextureManager = new TextureManagerClass();

function createFullStitchSolidFigure() {
  return new Graphics().rect(0, 0, 100, 100).fill(0xffffff).stroke({ width: 2, alignment: 0.5, color: 0x000000 });
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
    .fill(0xffffff)
    .stroke({ width: 2, alignment: 0.5, color: 0x000000 });
}

function createPetiteStitchSolidFigure() {
  return new Graphics().rect(0, 0, 50, 50).fill(0xffffff).stroke({ width: 1, alignment: 0.5, color: 0x000000 });
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
    .fill(0xffffff)
    .stroke({ width: 1, alignment: 0.5, color: 0x000000 });
}

function createHalfStitchSolidFigure() {
  return new Graphics()
    .rect(0, 50, 50, 50)
    .rect(50, 0, 50, 50)
    .fill(0xffffff)
    .stroke({ width: 2, alignment: 0.5, color: 0x000000 });
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
    .stroke({ width: 2, alignment: 0.5, color: 0x000000 })
    .fill(0xffffff);
}

function createQuarterStitchSolidFigure() {
  return new Graphics().rect(0, 0, 50, 50).fill(0xffffff).stroke({ width: 1, alignment: 0.5, color: 0x000000 });
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
    .fill(0xffffff)
    .stroke({ width: 1, alignment: 0.5, color: 0x000000 });
}

function createFrenchKnotFigure() {
  return new GraphicsContext()
    .circle(25, 25, 25)
    .fill(0xffffff)
    .stroke({ pixelLine: true, alignment: 0.5, color: 0x000000 });
}
function createBeadFigure(bead: Bead) {
  const width = mm2px(bead.diameter) * 10;
  const height = mm2px(bead.length) * 10;
  return new GraphicsContext()
    .roundRect(0, 0, width, height, width * 0.4)
    .fill(0xffffff)
    .stroke({ pixelLine: true, alignment: 0.5, color: 0x000000 });
}
