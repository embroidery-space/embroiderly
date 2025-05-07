import { Container, Graphics, RenderTexture } from "pixi.js";
import { GraphicsContext, type Renderer, type RenderOptions, type TextureSourceOptions } from "pixi.js";
import { GRAPHICS_STROKE, TEXTURE_STROKE } from "./constants";
import { ObjectedMap } from "#/utils/map";
import { mm2px } from "#/utils/measurement";
import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind, DisplayMode } from "#/schemas/index.ts";

const DEFAULT_TEXTURE_SOURCE_OPTIONS: Partial<TextureSourceOptions> = {
  resolution: window.devicePixelRatio,
  antialias: true,
  scaleMode: "linear",
};

/**
 * Manages the textures used to render stitches.
 * This class is responsible for creating and caching the textures.
 */
export class TextureManager {
  static shared = new TextureManager();

  #renderer!: Renderer;
  #textureSourceOptions!: TextureSourceOptions;

  #fullstitches = new Map<DisplayMode, Record<FullStitchKind, RenderTexture>>();
  #partstitches = new Map<DisplayMode, Record<PartStitchKind, RenderTexture>>();

  #frenchKnot?: GraphicsContext;
  #beads = new ObjectedMap<Bead, GraphicsContext>();

  init(renderer: Renderer, textureSourceOptions?: TextureSourceOptions) {
    this.#renderer = renderer;
    this.#textureSourceOptions = Object.assign({}, DEFAULT_TEXTURE_SOURCE_OPTIONS, textureSourceOptions);
  }

  getFullStitchTexture(mode: DisplayMode, kind: FullStitchKind) {
    let textures = this.#fullstitches.get(mode);
    if (!textures) {
      textures = this.#createFullStitchTextures(mode);
      this.#fullstitches.set(mode, textures);
    }
    return textures[kind];
  }

  #createFullStitchTextures(mode: DisplayMode) {
    if (mode === DisplayMode.Solid || mode === DisplayMode.Mixed) {
      return {
        [FullStitchKind.Full]: (() => {
          const shape = new Graphics().rect(0, 0, 100, 100).fill(0xffffff);
          return this.#createTexture(shape, { label: "FullStitch-Solid", width: 100, height: 100 });
        })(),
        [FullStitchKind.Petite]: (() => {
          const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { label: "PetiteStitch-Solid", width: 50, height: 50 });
        })(),
      };
    } else {
      return {
        [FullStitchKind.Full]: (() => {
          const shape = new Graphics()
            .poly([
              { x: 1, y: 1 },
              { x: 30, y: 1 },
              { x: 50, y: 20 },
              { x: 70, y: 1 },
              { x: 99, y: 1 },
              { x: 99, y: 30 },
              { x: 80, y: 50 },
              { x: 99, y: 70 },
              { x: 99, y: 99 },
              { x: 70, y: 99 },
              { x: 50, y: 80 },
              { x: 30, y: 99 },
              { x: 1, y: 99 },
              { x: 1, y: 70 },
              { x: 20, y: 50 },
              { x: 1, y: 30 },
            ])
            .stroke(TEXTURE_STROKE)
            .fill(0xffffff);
          return this.#createTexture(shape, { label: "FullStitch-Stitches", width: 100, height: 100 });
        })(),
        [FullStitchKind.Petite]: (() => {
          const shape = new Graphics()
            .poly([
              { x: 1, y: 1 },
              { x: 15, y: 1 },
              { x: 25, y: 10 },
              { x: 35, y: 1 },
              { x: 49, y: 1 },
              { x: 49, y: 15 },
              { x: 40, y: 25 },
              { x: 49, y: 35 },
              { x: 49, y: 49 },
              { x: 35, y: 49 },
              { x: 25, y: 40 },
              { x: 15, y: 49 },
              { x: 1, y: 49 },
              { x: 1, y: 35 },
              { x: 10, y: 25 },
              { x: 1, y: 15 },
            ])
            .stroke(TEXTURE_STROKE)
            .fill(0xffffff);
          return this.#createTexture(shape, { label: "PetiteStitch-Stitches", width: 50, height: 50 });
        })(),
      };
    }
  }

  getPartStitchTexture(mode: DisplayMode, kind: PartStitchKind) {
    let textures = this.#partstitches.get(mode);
    if (!textures) {
      textures = this.#createPartStitchTextures(mode);
      this.#partstitches.set(mode, textures);
    }
    return textures[kind];
  }

  #createPartStitchTextures(mode: DisplayMode) {
    if (mode === DisplayMode.Solid) {
      return {
        [PartStitchKind.Half]: (() => {
          const shape = new Graphics().rect(1, 51, 48, 48).rect(51, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { label: "HalfStitch-Solid", width: 100, height: 100 });
        })(),
        [PartStitchKind.Quarter]: (() => {
          const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { label: "QuarterStitch-Solid", width: 50, height: 50 });
        })(),
      };
    } else {
      return {
        [PartStitchKind.Half]: (() => {
          const shape = new Graphics()
            .poly([
              { x: 99, y: 1 },
              { x: 99, y: 35 },
              { x: 35, y: 99 },
              { x: 1, y: 99 },
              { x: 1, y: 65 },
              { x: 65, y: 1 },
            ])
            .stroke(TEXTURE_STROKE)
            .fill(0xffffff);
          return this.#createTexture(shape, { label: "HalfStitch-Stitches", width: 100, height: 100 });
        })(),
        [PartStitchKind.Quarter]: (() => {
          const shape = new Graphics()
            .poly([
              { x: 49, y: 1 },
              { x: 49, y: 25 },
              { x: 25, y: 49 },
              { x: 1, y: 49 },
              { x: 1, y: 25 },
              { x: 25, y: 1 },
            ])
            .stroke(TEXTURE_STROKE)
            .fill(0xffffff);
          return this.#createTexture(shape, { label: "QuarterStitch-Stitches", width: 50, height: 50 });
        })(),
      };
    }
  }

  getNodeTexture(kind: NodeStitchKind, bead = Bead.default()) {
    if (kind === NodeStitchKind.FrenchKnot) {
      return (this.#frenchKnot ??= this.#createFrenchKnotTexture());
    }
    return this.#beads.get(bead) ?? this.#beads.set(bead, this.#createBeadTexture(bead));
  }

  #createFrenchKnotTexture() {
    return new GraphicsContext().circle(25, 25, 25).stroke(GRAPHICS_STROKE).fill(0xffffff);
  }

  #createBeadTexture(bead: Bead) {
    const width = mm2px(bead.diameter) * 10;
    const height = mm2px(bead.length) * 10;
    return (
      new GraphicsContext()
        // Set negative coordinates to rotate elements around their center.
        .roundRect(0, 0, width, height, width * 0.4)
        .stroke(GRAPHICS_STROKE)
        .fill(0xffffff)
    );
  }

  #createTexture(
    container: Container,
    textureSourceOptions?: Partial<TextureSourceOptions>,
    renderOptions?: Omit<RenderOptions, "container" | "target">,
  ) {
    const rt = RenderTexture.create({ ...this.#textureSourceOptions, ...textureSourceOptions });
    rt.resize(textureSourceOptions!.width!, textureSourceOptions!.height!);
    this.#renderer.render({ container, target: rt, ...renderOptions });
    container.destroy(true);
    return rt;
  }

  clear() {
    for (const textures of this.#fullstitches.values()) {
      for (const texture of Object.values(textures)) texture.destroy(true);
    }
    this.#fullstitches.clear();

    for (const textures of this.#partstitches.values()) {
      for (const texture of Object.values(textures)) texture.destroy(true);
    }
    this.#partstitches.clear();

    if (this.#frenchKnot) {
      this.#frenchKnot.destroy(true);
      this.#frenchKnot = undefined;
    }

    for (const texture of this.#beads.values()) texture.destroy(true);
    this.#beads.clear();
  }
}
