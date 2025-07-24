import { Graphics } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "../constants.ts";
import type { Grid } from "#/core/pattern/";

export class PatternGrid extends Graphics {
  #width!: number;
  #height!: number;
  #grid!: Grid;

  constructor() {
    super({ ...DEFAULT_CONTAINER_OPTIONS, label: "Grid" });
  }

  /**
   * Sets the grid for the pattern.
   *
   * @param width - The width of the pattern in stitches.
   * @param height - The height of the pattern in stitches.
   * @param grid - The grid settings for the pattern.
   */
  setGrid(width: number, height: number, grid: Grid) {
    this.#width = width;
    this.#height = height;
    this.#grid = grid;

    this.renderGrid();
  }

  /** Renders the pattern grid. */
  renderGrid() {
    this.clear();

    this.#renderMinorLines();
    this.#renderMajorLines();
  }

  #renderMinorLines() {
    // Draw horizontal minor lines.
    for (let i = 1; i < this.#width; i++) {
      this.moveTo(i, 0);
      this.lineTo(i, this.#height);
    }

    // Draw vertical minor lines.
    for (let i = 1; i < this.#height; i++) {
      this.moveTo(0, i);
      this.lineTo(this.#width, i);
    }

    const { thickness, color } = this.#grid.minorLines;
    this.stroke({ width: thickness, color });
  }

  #renderMajorLines() {
    const interval = this.#grid.majorLinesInterval;

    // Draw horizontal major lines.
    for (let i = 0; i <= Math.ceil(this.#height / interval); i++) {
      const point = Math.min(i * interval, this.#height);
      this.moveTo(0, point);
      this.lineTo(this.#width, point);
    }

    // Draw vertical major lines.
    for (let i = 0; i <= Math.ceil(this.#width / interval); i++) {
      const point = Math.min(i * interval, this.#width);
      this.moveTo(point, 0);
      this.lineTo(point, this.#height);
    }

    const { thickness, color } = this.#grid.majorLines;
    this.stroke({ width: thickness, color });
  }
}
