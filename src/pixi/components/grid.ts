import { Bounds, Container, Graphics, Text } from "pixi.js";

import type { Grid } from "#/schemas/";
import { STITCH_SCALE_FACTOR } from "../constants.ts";
import { DEFAULT_CONTAINER_OPTIONS } from "../display-objects.ts";
import { MAX_SCALE } from "../pattern-viewport.ts";

export class PatternGrid extends Container {
  #width!: number;
  #height!: number;
  #grid!: Grid;

  #stages = {
    // lowest
    grid: new Graphics({ ...DEFAULT_CONTAINER_OPTIONS, label: "Grid Lines" }),
    rulerX: new Container({ ...DEFAULT_CONTAINER_OPTIONS, y: -0.25, label: "Grid X Rulers" }),
    rulerY: new Container({ ...DEFAULT_CONTAINER_OPTIONS, x: -0.25, label: "Grid Y Rulers" }),
    // highest
  };

  constructor() {
    super({ ...DEFAULT_CONTAINER_OPTIONS, label: "Grid" });
    this.addChild(...Object.values(this.#stages));
  }

  setGrid(width: number, height: number, grid: Grid) {
    this.#width = width;
    this.#height = height;
    this.#grid = grid;

    this.renderGrid();
  }

  /**
   * Renders the grid lines and rulers.
   * @param zoom - The zoom level (1-100) to adjust the ruler position and scale.
   */
  renderGrid(zoom?: number, bounds?: Bounds) {
    this.clear();

    this.#renderMinorLines();
    this.#renderMajorLines();

    this.#renderRulers(zoom, bounds);
  }

  #renderMinorLines() {
    // Draw horizontal minor lines.
    for (let i = 1; i < this.#width; i++) {
      this.#stages.grid.moveTo(i, 0);
      this.#stages.grid.lineTo(i, this.#height);
    }

    // Draw vertical minor lines.
    for (let i = 1; i < this.#height; i++) {
      this.#stages.grid.moveTo(0, i);
      this.#stages.grid.lineTo(this.#width, i);
    }

    const { thickness, color } = this.#grid.minorLines;
    this.#stages.grid.stroke({ width: thickness, color });
  }

  #renderMajorLines() {
    const interval = this.#grid.majorLinesInterval;

    // Draw horizontal major lines.
    for (let i = 0; i <= Math.ceil(this.#height / interval); i++) {
      const point = Math.min(i * interval, this.#height);
      this.#stages.grid.moveTo(0, point);
      this.#stages.grid.lineTo(this.#width, point);
    }

    // Draw vertical major lines.
    for (let i = 0; i <= Math.ceil(this.#width / interval); i++) {
      const point = Math.min(i * interval, this.#width);
      this.#stages.grid.moveTo(point, 0);
      this.#stages.grid.lineTo(point, this.#height);
    }

    const { thickness, color } = this.#grid.majorLines;
    this.#stages.grid.stroke({ width: thickness, color });
  }

  #renderRulers(zoom?: number, bounds?: Bounds) {
    const interval = this.#grid.majorLinesInterval;

    const scaleCoefficient = zoom ? 4 - (4 - 1) * (Math.log(zoom) / Math.log(MAX_SCALE)) : 1;
    const scale = STITCH_SCALE_FACTOR * scaleCoefficient;

    // Draw horizontal ruler.
    for (let i = 0; i <= Math.ceil(this.#width / interval); i++) {
      const value = Math.min(i * interval, this.#width);

      const label = new Text({
        scale,
        anchor: { x: 0.5, y: 0 },
        text: value,
        style: { fill: 0xffffff, fontSize: 64 },
      });
      label.position.set(value, -label.height);

      this.#stages.rulerX.addChild(label);
    }

    // Draw vertical ruler.
    for (let i = 0; i <= Math.ceil(this.#height / interval); i++) {
      const value = Math.min(i * interval, this.#height);

      const label = new Text({
        scale,
        anchor: { x: 0, y: 0.5 },
        text: value,
        style: { fill: 0xffffff, fontSize: 64 },
      });
      label.position.set(-label.width, value);

      this.#stages.rulerY.addChild(label);
    }

    if (bounds) {
      this.#adjustRulerX(bounds, zoom);
      this.#adjustRulerY(bounds, zoom);
    }
  }

  #adjustRulerX(bounds: Bounds, zoom = 1) {
    const rulerHeight = this.#stages.rulerX.height * zoom;

    const outOfBounds = bounds.y - rulerHeight < 0;
    if (outOfBounds) {
      const backgroundAlreadyExists = this.#stages.rulerX.getChildAt(0) instanceof Graphics;
      if (!backgroundAlreadyExists) {
        const background = new Graphics()
          .rect(0, -this.#stages.rulerX.height, this.#width, this.#stages.rulerX.height)
          .fill({ color: 0x000000, alpha: 0.75 });
        this.#stages.rulerX.addChildAt(background, 0);
      }

      this.#stages.rulerX.position.y = Math.abs(Math.min(0, bounds.y / zoom));
      this.#stages.rulerX.pivot.y = -this.#stages.rulerX.height;
    } else {
      if (this.#stages.rulerX.getChildAt(0) instanceof Graphics) {
        this.#stages.rulerX.removeChildAt(0);
      }

      this.#stages.rulerX.position.y = -0.25;
      this.#stages.rulerX.pivot.y = 0;
    }
  }

  #adjustRulerY(bounds: Bounds, zoom = 1) {
    const rulerWidth = this.#stages.rulerY.width * zoom;

    const outOfBounds = bounds.x - rulerWidth < 0;
    if (outOfBounds) {
      const backgroundAlreadyExists = this.#stages.rulerY.getChildAt(0) instanceof Graphics;
      if (!backgroundAlreadyExists) {
        const background = new Graphics()
          .rect(-this.#stages.rulerY.width, 0, this.#stages.rulerY.width, this.#height)
          .fill({ color: 0x000000, alpha: 0.75 });
        this.#stages.rulerY.addChildAt(background, 0);
      }

      this.#stages.rulerY.position.x = Math.abs(Math.min(0, bounds.x / zoom));
      this.#stages.rulerY.pivot.x = -this.#stages.rulerY.width;
    } else {
      if (this.#stages.rulerY.getChildAt(0) instanceof Graphics) {
        this.#stages.rulerY.removeChildAt(0);
      }

      this.#stages.rulerY.position.x = -0.25;
      this.#stages.rulerY.pivot.x = 0;
    }
  }

  private clear() {
    this.#stages.grid.clear();
    this.#stages.rulerX.removeChildren();
    this.#stages.rulerY.removeChildren();
  }
}
