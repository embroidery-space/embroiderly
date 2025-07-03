import { Bounds, Container, Graphics, Text } from "pixi.js";

import { STITCH_SCALE_FACTOR } from "../constants.ts";
import { DEFAULT_CONTAINER_OPTIONS } from "../display-objects.ts";
import { MAX_SCALE } from "../pattern-viewport.ts";

export class Rulers extends Container {
  #width!: number;
  #height!: number;
  #interval!: number;

  #stages = {
    horizontal: new Container({ ...DEFAULT_CONTAINER_OPTIONS, y: -0.25, label: "Horizontal Rulers" }),
    vertical: new Container({ ...DEFAULT_CONTAINER_OPTIONS, x: -0.25, label: "Vertical Rulers" }),
  };

  constructor() {
    super({ ...DEFAULT_CONTAINER_OPTIONS, label: "Rulers" });
    this.addChild(...Object.values(this.#stages));
  }

  /**
   * Sets the rulers' dimensions and interval.
   *
   * @param width - The width of the pattern in stitches.
   * @param height - The height of the pattern in stitches.
   * @param interval - The interval between major lines in stitches.
   */
  setRulers(width: number, height: number, interval: number) {
    this.#width = width;
    this.#height = height;
    this.#interval = interval;

    this.renderRulers();
  }

  /**
   * Renders the rulers.
   *
   * @param zoom - The zoom level (1-100) to adjust the ruler position and scale.
   * @param bounds - The bounds of the viewport to adjust the ruler position.
   */
  renderRulers(zoom?: number, bounds?: Bounds) {
    this.clear();

    const scaleCoefficient = zoom ? 4 - (4 - 1) * (Math.log(zoom) / Math.log(MAX_SCALE)) : 1;
    const scale = STITCH_SCALE_FACTOR * scaleCoefficient;

    // Draw horizontal ruler.
    for (let i = 0; i <= Math.ceil(this.#width / this.#interval); i++) {
      const value = Math.min(i * this.#interval, this.#width);

      const label = new Text({
        scale,
        anchor: { x: 0.5, y: 0 },
        text: value,
        style: { fill: 0xffffff, fontSize: 64 },
      });
      label.position.set(value, -label.height);

      this.#stages.horizontal.addChild(label);
    }

    // Draw vertical ruler.
    for (let i = 0; i <= Math.ceil(this.#height / this.#interval); i++) {
      const value = Math.min(i * this.#interval, this.#height);

      const label = new Text({
        scale,
        anchor: { x: 0, y: 0.5 },
        text: value,
        style: { fill: 0xffffff, fontSize: 64 },
      });
      label.position.set(-label.width, value);

      this.#stages.vertical.addChild(label);
    }

    if (bounds) {
      this.#adjustHorizontalRuler(bounds, zoom);
      this.#adjustVerticalRuler(bounds, zoom);
    }
  }

  #adjustHorizontalRuler(bounds: Bounds, zoom = 1) {
    const rulerHeight = this.#stages.horizontal.height * zoom;

    const outOfBounds = bounds.y - rulerHeight < 0;
    if (outOfBounds) {
      const backgroundAlreadyExists = this.#stages.horizontal.getChildAt(0) instanceof Graphics;
      if (!backgroundAlreadyExists) {
        const background = new Graphics()
          .rect(0, -this.#stages.horizontal.height, this.#width, this.#stages.horizontal.height)
          .fill({ color: 0x000000, alpha: 0.75 });
        this.#stages.horizontal.addChildAt(background, 0);
      }

      this.#stages.horizontal.position.y = Math.abs(Math.min(0, bounds.y / zoom));
      this.#stages.horizontal.pivot.y = -this.#stages.horizontal.height;
    } else {
      if (this.#stages.horizontal.getChildAt(0) instanceof Graphics) {
        this.#stages.horizontal.removeChildAt(0);
      }

      this.#stages.horizontal.position.y = -0.25;
      this.#stages.horizontal.pivot.y = 0;
    }
  }

  #adjustVerticalRuler(bounds: Bounds, zoom = 1) {
    const rulerWidth = this.#stages.vertical.width * zoom;

    const outOfBounds = bounds.x - rulerWidth < 0;
    if (outOfBounds) {
      const backgroundAlreadyExists = this.#stages.vertical.getChildAt(0) instanceof Graphics;
      if (!backgroundAlreadyExists) {
        const background = new Graphics()
          .rect(-this.#stages.vertical.width, 0, this.#stages.vertical.width, this.#height)
          .fill({ color: 0x000000, alpha: 0.75 });
        this.#stages.vertical.addChildAt(background, 0);
      }

      this.#stages.vertical.position.x = Math.abs(Math.min(0, bounds.x / zoom));
      this.#stages.vertical.pivot.x = -this.#stages.vertical.width;
    } else {
      if (this.#stages.vertical.getChildAt(0) instanceof Graphics) {
        this.#stages.vertical.removeChildAt(0);
      }

      this.#stages.vertical.position.x = -0.25;
      this.#stages.vertical.pivot.x = 0;
    }
  }

  private clear() {
    this.#stages.horizontal.removeChildren();
    this.#stages.vertical.removeChildren();
  }
}
