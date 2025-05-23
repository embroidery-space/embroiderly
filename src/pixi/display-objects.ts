import { Container, Graphics, GraphicsContext, Particle, ParticleContainer, Text, Texture } from "pixi.js";
import type {
  ContainerOptions,
  ParticleContainerOptions,
  ParticleOptions,
  TextOptions,
  TextStyleOptions,
} from "pixi.js";
import { dequal } from "dequal/lite";

import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  type Stitch,
} from "#/schemas/pattern";

import { STITCH_SCALE_FACTOR } from "./constants.ts";

const DEFAULT_CONTAINER_OPTIONS: ContainerOptions = {
  eventMode: "none",
  interactive: false,
  interactiveChildren: false,
  cullable: false,
  cullableChildren: true,
};

/** A wrapper around `Container` that contains a kind of the stitches it holds. */
export class StitchGraphicsContainer extends Container {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  addStitch(stitch: Container) {
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

/** A `Graphics` object that contains a reference to the `Stitch` object it represents. */
export class StitchGraphics extends Graphics {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, context?: GraphicsContext) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, context });
    this.stitch = stitch;
  }
}

/** A wrapper around `ParticleContainer` that contains a kind of the stitches it holds. */
export class StitchParticleContainer extends ParticleContainer {
  constructor(options?: ParticleContainerOptions) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...options,
      dynamicProperties: {
        // The `position` dynamic property is `true` by default, but we don't need it here.
        position: false,
        ...options?.dynamicProperties,
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

/** A `Particle` object that contains a reference to the `Stitch` object it represents. */
export class StitchParticle extends Particle {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, options: Texture | ParticleOptions) {
    super(options);
    this.stitch = stitch;
  }
}

const DEFAULT_SYMBOL_STYLE_OPTIONS: TextStyleOptions = { fill: 0x000000, fontSize: 64 };
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

    const textStyle = { ...DEFAULT_SYMBOL_STYLE_OPTIONS, ...styleOptions };
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
