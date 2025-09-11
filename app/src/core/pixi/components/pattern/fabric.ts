import { Graphics } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "~/core/pixi/constants.ts";
import type { Fabric } from "~/core/pattern/";

export class FabricView extends Graphics {
  #fabric: Fabric;

  constructor() {
    super({ ...DEFAULT_CONTAINER_OPTIONS, label: "Fabric" });
  }

  /** The original fabric. */
  get original() {
    return this.#fabric;
  }

  /**
   * Sets the fabric for the pattern.
   *
   * @param fabric - The fabric settings for the pattern.
   */
  setFabric(fabric: Fabric) {
    this.#fabric = fabric;
    this.renderFabric();
  }

  /** Renders the fabric. */
  renderFabric() {
    this.clear();

    const { width, height, color } = this.#fabric;
    this.rect(0, 0, width, height).fill(color);
  }
}
