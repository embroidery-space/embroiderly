import { Container, Graphics, Matrix, RenderTexture } from "pixi.js";
import type { Renderer, RenderOptions, TextureSourceOptions } from "pixi.js";
import { TEXTURE_STROKE } from "./constants";
import { ObjectedMap } from "#/utils/map";
import { mm2px } from "#/utils/measurement";
import { Bead, FullStitchKind, NodeStitchKind, PartStitchKind, View } from "#/schemas/pattern";

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

  #fullstitches = new Map<View, Record<FullStitchKind, RenderTexture>>();
  #partstitches = new Map<View, Record<PartStitchKind, RenderTexture>>();

  #frenchKnot?: RenderTexture;
  #beads = new ObjectedMap<Bead, RenderTexture>();

  view = View.Solid;

  init(renderer: Renderer, textureSourceOptions?: TextureSourceOptions) {
    this.#renderer = renderer;
    this.#textureSourceOptions = Object.assign({}, DEFAULT_TEXTURE_SOURCE_OPTIONS, textureSourceOptions);
  }

  getFullStitchTexture(kind: FullStitchKind) {
    let textures = this.#fullstitches.get(this.view);
    if (!textures) {
      textures = this.#createFullStitchTextures();
      this.#fullstitches.set(this.view, textures);
    }
    return textures[kind];
  }

  #createFullStitchTextures() {
    if (this.view === View.Solid) {
      return {
        [FullStitchKind.Full]: (() => {
          const shape = new Graphics().rect(0, 0, 100, 100).fill(0xffffff);
          return this.#createTexture(shape, { width: 100, height: 100 });
        })(),
        [FullStitchKind.Petite]: (() => {
          const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { width: 50, height: 50 });
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
          return this.#createTexture(shape, { width: 100, height: 100 });
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
          return this.#createTexture(shape, { width: 50, height: 50 });
        })(),
      };
    }
  }

  getPartStitchTexture(kind: PartStitchKind) {
    let textures = this.#partstitches.get(this.view);
    if (!textures) {
      textures = this.#createPartStitchTextures();
      this.#partstitches.set(this.view, textures);
    }
    return textures[kind];
  }

  #createPartStitchTextures() {
    if (this.view === View.Solid) {
      return {
        [PartStitchKind.Half]: (() => {
          const shape = new Graphics().rect(1, 51, 48, 48).rect(51, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { width: 100, height: 100 });
        })(),
        [PartStitchKind.Quarter]: (() => {
          const shape = new Graphics().rect(1, 1, 48, 48).stroke(TEXTURE_STROKE).fill(0xffffff);
          return this.#createTexture(shape, { width: 50, height: 50 });
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
          return this.#createTexture(shape, { width: 100, height: 100 });
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
          return this.#createTexture(shape, { width: 50, height: 50 });
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
    const shape = new Graphics().circle(0, 0, 24).stroke(TEXTURE_STROKE).fill(0xffffff);
    return this.#createTexture(shape, { width: 50, height: 50 }, { transform: new Matrix(1, 0, 0, 1, 25, 25) });
  }

  #createBeadTexture(bead: Bead) {
    const width = mm2px(bead.diameter) * 10;
    const height = mm2px(bead.length) * 10;
    const shape = new Graphics()
      .roundRect(1, 2, width - 2, height - 4, (width - 2) * 0.4)
      .stroke(TEXTURE_STROKE)
      .fill(0xffffff);
    return this.#createTexture(shape, { width, height });
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
}
