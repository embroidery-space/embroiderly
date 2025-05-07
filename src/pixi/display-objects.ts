import { Container, Graphics, GraphicsContext, ParticleContainer, Text, type TextStyleOptions } from "pixi.js";
import { STITCH_SCALE_FACTOR } from "./constants";
import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchDirection,
  PartStitchKind,
  type Stitch,
} from "#/schemas/pattern";

/** A `Graphics` object that contains a reference to the `Stitch` object it represents. */
export class StitchGraphics extends Graphics {
  readonly stitch: Stitch;

  constructor(stitch: Stitch, context?: GraphicsContext) {
    super(context);
    this.stitch = stitch;
  }
}

/** A wrapper around `ParticleContainer` that contains a kind of the stitches it holds. */
export class StitchParticleContainer extends ParticleContainer {
  readonly kind: FullStitchKind | PartStitchKind;

  constructor(kind: FullStitchKind | PartStitchKind) {
    super();
    this.kind = kind;
  }
}

const DEFAULT_SYMBOL_STYLE_OPTIONS: TextStyleOptions = { fill: 0x000000, fontSize: 64 };
export class Symbol extends Container {
  constructor(symbol: string, styleOptions: TextStyleOptions, stitch: FullStitch | PartStitch) {
    const { x, y, kind } = stitch;

    super({ x, y });
    this.eventMode = "none";
    this.interactive = false;
    this.interactiveChildren = false;
    this.setSize(1);

    const style = { ...DEFAULT_SYMBOL_STYLE_OPTIONS, ...styleOptions };

    const text = this.addChild(new Text({ text: symbol, style }));
    text.anchor.set(0.5);

    switch (kind) {
      case FullStitchKind.Full: {
        text.scale.set(STITCH_SCALE_FACTOR);
        text.position.set(0.5);
        break;
      }

      case PartStitchKind.Half: {
        text.scale.set(STITCH_SCALE_FACTOR / 2);

        const duplicate = this.addChild(new Text({ text: symbol, style }));
        duplicate.anchor.set(0.5);
        duplicate.scale.set(STITCH_SCALE_FACTOR / 2);

        if (stitch.direction === PartStitchDirection.Forward) {
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
