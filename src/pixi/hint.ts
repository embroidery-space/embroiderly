import { Container, Graphics, type ColorSource } from "pixi.js";
import type { Bead, LineStitch, NodeStitch } from "#/schemas/pattern";
import { TextureManager } from "./texture-manager";
import { STITCH_SCALE_FACTOR } from "./constants";

export class Hint extends Container {
  private _graphics = new Graphics();
  private _zoom = 1;

  constructor() {
    super();
    this.label = "Hint";
  }

  setZoom(value: number) {
    this._zoom = value;
    this._graphics.scale.set(value);
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
    this._graphics.destroy();
    this._graphics = new Graphics();
    this._graphics.angle = 0;
    this._graphics.alpha = 0.5;
    this._graphics.pivot.set(0, 0);
    this._graphics.scale.set(this._zoom);
    this._graphics.position.set(0, 0);
    return this.addChild(this._graphics);
  }
}
