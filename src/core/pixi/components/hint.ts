import { Container, Graphics, type ColorSource } from "pixi.js";
import type { Bead, LineStitch, NodeStitch } from "#/core/pattern/";
import { TextureManager } from "../texture-manager";
import { STITCH_SCALE_FACTOR } from "../constants";

export class Hint extends Container {
  private graphics = new Graphics();
  private zoom = 1;

  constructor() {
    super();
    this.label = "Hint";
  }

  setZoom(value: number) {
    this.zoom = value;
    this.graphics.scale.set(value);
  }

  drawLineHint(line: LineStitch, color: ColorSource) {
    const { x, y } = line;
    const start = { x: x[0], y: y[0] };
    const end = { x: x[1], y: y[1] };
    this.clearHint()
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a larger width to make it look like a border.
      .stroke({ width: 0.225, color: 0x000000, cap: "round" })
      .moveTo(start.x, start.y)
      .lineTo(end.x, end.y)
      // Draw a line with a smaller width to make it look like a fill.
      .stroke({ width: 0.2, color, cap: "round" });
  }

  drawNodeHint(node: NodeStitch, color: ColorSource, bead?: Bead) {
    const { x, y, kind, rotated } = node;
    const graphics = this.clearHint();
    graphics.context = TextureManager.shared.getNodeTexture(kind, bead);
    graphics.pivot.set(this.width / 2, this.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    graphics.tint = color;
    if (rotated) graphics.angle = 90;
  }

  clearHint() {
    this.graphics.destroy();
    this.graphics = new Graphics();
    this.graphics.angle = 0;
    this.graphics.alpha = 0.5;
    this.graphics.pivot.set(0, 0);
    this.graphics.scale.set(this.zoom);
    this.graphics.position.set(0, 0);
    return this.addChild(this.graphics);
  }
}
