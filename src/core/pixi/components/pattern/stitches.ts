import { dequal } from "dequal/lite";
import { Container, Graphics, GraphicsContext, Particle, ParticleContainer, Text, Texture } from "pixi.js";
import type {
  ContainerOptions,
  ParticleContainerOptions,
  ParticleOptions,
  TextOptions,
  TextStyleOptions,
} from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS, DEFAULT_TEXT_STYLE_OPTIONS, STITCH_SCALE_FACTOR } from "#/core/pixi/constants.ts";
import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  type Stitch,
} from "#/core/pattern/";

export interface StitchContainer<G> {
  /**
   * Adds a stitch to the container.
   * @param stitch The stitch display object to add.
   */
  addStitch(stitch: G): void;

  /**
   * Removes a stitch from the container.
   * @param stitch The stitch object (the struct, not the display object) to remove.
   */
  removeStitch(stitch: Stitch): void;
}

export class StitchGraphicsContainer extends Container implements StitchContainer<StitchGraphics> {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  addStitch(stitch: StitchGraphics) {
    this.addChild(stitch);
  }

  removeStitch(stitch: Stitch) {
    const index = this.children.findIndex((item) => {
      const graphics = item as StitchGraphics;
      return dequal(graphics.stitch, stitch);
    });
    if (index !== -1) this.removeChildAt(index);
  }
}

export class StitchGraphics extends Graphics {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, context?: GraphicsContext) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, context });
    this.stitch = stitch;
  }
}

export class StitchParticleContainer extends ParticleContainer implements StitchContainer<StitchParticle> {
  constructor(options?: Omit<ParticleContainerOptions, "dynamicProperties">) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...options,
      dynamicProperties: {
        position: false,
        rotation: false,
        scale: false,
        color: false,
      },
    });
  }

  addStitch(stitch: StitchParticle) {
    this.addParticle(stitch);
  }

  removeStitch(stitch: Stitch) {
    const index = this.particleChildren.findIndex((item) => {
      const particle = item as StitchParticle;
      return dequal(particle.stitch, stitch);
    });
    if (index !== -1) this.removeParticleAt(index);
  }
}

export class StitchParticle extends Particle {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, options: Texture | ParticleOptions) {
    super(options);
    this.stitch = stitch;
  }
}

export class StitchSymbolsContainer extends Container implements StitchContainer<StitchSymbol> {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  addStitch(stitch: StitchSymbol) {
    this.addChild(stitch);
  }

  removeStitch(stitch: Stitch) {
    const index = this.children.findIndex((item) => {
      const symbol = item as StitchSymbol;
      return dequal(symbol.stitch, stitch);
    });
    if (index !== -1) this.removeChildAt(index);
  }
}

export class StitchSymbol extends Container {
  readonly stitch: FullStitch | PartStitch;

  constructor(stitch: FullStitch | PartStitch, symbol: string, styleOptions: TextStyleOptions) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      x: stitch.x,
      y: stitch.y,
      cullable: true,
    });
    this.setSize(1);

    this.stitch = stitch;

    const textStyle = { ...DEFAULT_TEXT_STYLE_OPTIONS, ...styleOptions };
    const textOptions: TextOptions = { anchor: 0.5 };
    const text = this.addChild(new Text({ text: symbol, style: textStyle, ...textOptions }));

    switch (this.stitch.kind) {
      case FullStitchKind.Full: {
        text.scale.set(STITCH_SCALE_FACTOR);
        text.position.set(0.5);
        break;
      }

      case PartStitchKind.Half: {
        text.scale.set(STITCH_SCALE_FACTOR / 2);

        const duplicate = this.addChild(new Text({ text: symbol, style: textStyle, ...textOptions }));
        duplicate.scale.set(STITCH_SCALE_FACTOR / 2);

        if (this.stitch.direction === PartStitchDirection.Forward) {
          text.position.set(0.25, 0.75);
          duplicate.position.set(0.75, 0.25);
        } else {
          text.position.set(0.25, 0.25);
          duplicate.position.set(0.75, 0.75);
        }
        break;
      }

      case FullStitchKind.Petite:
      case PartStitchKind.Quarter: {
        text.scale.set(STITCH_SCALE_FACTOR / 2);
        text.position.set(0.25);
        break;
      }
    }
  }
}
