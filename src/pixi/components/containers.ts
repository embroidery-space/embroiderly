import { dequal } from "dequal/lite";
import { Container, ParticleContainer } from "pixi.js";
import type { ContainerOptions, ParticleContainerOptions } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "../constants.ts";
import { StitchGraphics, StitchParticle, StitchSymbol } from "./stitches.ts";
import type { Stitch } from "#/schemas/pattern";

/** A wrapper around `Container` that contains a kind of the stitches it holds. */
export class StitchGraphicsContainer extends Container {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  addStitch(stitch: StitchGraphics | StitchSymbol) {
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
