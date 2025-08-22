import { Container, Graphics } from "pixi.js";
import type { ColorSource, ContainerOptions, DestroyOptions } from "pixi.js";

import type { Bead, LineStitch, NodeStitch } from "#/core/pattern/";
import { DEFAULT_CONTAINER_OPTIONS, STITCH_SCALE_FACTOR, TextureManager } from "#/core/pixi/";

export class Hint extends Container {
  constructor(options?: ContainerOptions) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...options,
      label: "Hint",
      alpha: 0.5,
    });
  }

  private clear(options?: DestroyOptions) {
    this.removeChildren().forEach((child) => child.destroy(options));
    return this.addChild(new Graphics());
  }

  drawLine(stitch: LineStitch, color: ColorSource) {
    const { x, y } = stitch;
    const start = { x: x[0], y: y[0] };
    const end = { x: x[1], y: y[1] };
    this.clear({ context: true })
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a larger width to make it look like a border.
      .stroke({ width: 0.225, color: 0x000000, cap: "round" })
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a smaller width to make it look like a fill.
      .stroke({ width: 0.2, color, cap: "round" });
  }

  drawNode(stitch: NodeStitch, color: ColorSource, bead?: Bead) {
    const { x, y, kind, rotated } = stitch;
    const graphics = this.clear({ context: false });
    graphics.context = TextureManager.getNodeTexture(kind, bead);
    graphics.pivot.set(this.width / 2, this.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    graphics.tint = color;
    if (rotated) graphics.angle = 90;
  }
}
