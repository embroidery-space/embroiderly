import { Container, Graphics, GraphicsContext, Particle, Text, Texture } from "pixi.js";
import type { ParticleOptions, TextOptions, TextStyleOptions } from "pixi.js";

import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  type Stitch,
} from "#/schemas/pattern";

import { DEFAULT_CONTAINER_OPTIONS, DEFAULT_TEXT_STYLE_OPTIONS, STITCH_SCALE_FACTOR } from "../constants.ts";

/** A `Graphics` object that contains a reference to the `Stitch` object it represents. */
export class StitchGraphics extends Graphics {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, context?: GraphicsContext) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, context });
    this.stitch = stitch;
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
