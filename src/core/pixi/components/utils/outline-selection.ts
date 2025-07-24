import { Container, type ContainerOptions } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/";

export class OutlineSelection extends Container {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }
}
