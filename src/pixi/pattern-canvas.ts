import { Application, Graphics } from "pixi.js";
import type { ApplicationOptions, ColorSource, FederatedPointerEvent, Point } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { PatternView } from "./pattern-view";
import { TextureManager, StitchGraphics, STITCH_SCALE_FACTOR, StitchParticleContainer } from "#/pixi";
import type { Bead, LineStitch, NodeStitch, Stitch, StitchKind } from "#/schemas/pattern";

const DEFAULT_INIT_OPTIONS: Partial<ApplicationOptions> = {
  eventFeatures: { globalMove: false },
  antialias: true,
  backgroundAlpha: 0,
};

export class PatternCanvas extends EventTarget {
  #pixi = new Application();
  #viewport!: Viewport;

  #startPoint: Point | undefined = undefined;
  #hint = new Graphics();

  constructor() {
    super();
  }

  async init({ width, height }: CanvasSize, options?: Partial<Omit<ApplicationOptions, "width" | "height">>) {
    await this.#pixi.init(Object.assign({ width, height }, DEFAULT_INIT_OPTIONS, options));
    this.#viewport = this.#pixi.stage.addChild(
      new Viewport({ screenWidth: width, screenHeight: height, events: this.#pixi.renderer.events }),
    );

    TextureManager.shared.init(this.#pixi.renderer);

    // Configure the viewport.
    this.#viewport
      .drag({ keyToPress: ["ShiftLeft", "ShiftRight"], mouseButtons: "right", factor: 2 })
      .pinch({ factor: 2 })
      .wheel({ smooth: 2, trackpadPinch: true, wheelZoom: false })
      .clampZoom({ minScale: 1, maxScale: 100 });

    // Set up event listeners.
    this.#viewport.on("pointerdown", this.#onPointerDown, this);
    this.#viewport.on("pointermove", this.#onPointerMove, this);
    this.#viewport.on("pointerup", this.#onPointerUp, this);
  }

  setPatternView(pattern: PatternView) {
    this.clear();

    pattern.render();
    this.#viewport.addChild(...pattern.stages);

    const { width, height } = pattern.fabric;
    this.#viewport.worldWidth = width;
    this.#viewport.worldHeight = height;

    this.#viewport.fitHeight();
    this.#viewport.moveCenter(width / 2, height / 2);
  }

  clear() {
    this.#viewport.removeChildren();
  }

  resize({ width, height }: CanvasSize) {
    this.#pixi.renderer.resize(width, height);
    this.#viewport.resize(width, height);
  }

  drawLineHint(line: LineStitch, color: ColorSource) {
    const { x, y } = line;
    const start = { x: x[0], y: y[0] };
    const end = { x: x[1], y: y[1] };
    this.#clearHint()
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
    const graphics = this.#clearHint();
    graphics.context = TextureManager.shared.getNodeTexture(kind, bead);
    graphics.pivot.set(graphics.width / 2, graphics.height / 2);
    graphics.scale.set(STITCH_SCALE_FACTOR);
    graphics.position.set(x, y);
    graphics.tint = color;
    if (rotated) graphics.angle = 90;
  }

  #clearHint() {
    this.#hint.destroy();
    this.#hint = new Graphics();
    this.#hint.angle = 0;
    this.#hint.alpha = 0.5;
    this.#hint.pivot.set(0, 0);
    this.#hint.scale.set(1, 1);
    this.#hint.position.set(0, 0);
    return this.#viewport.addChild(this.#hint);
  }

  #fireAddStitchEvent(e: FederatedPointerEvent, stage: AddStitchEventStage) {
    const point = this.#viewport.toWorld(e.global);
    if (this.#pointIsOutside(point)) return;
    const detail: AddStitchData = { stage, start: this.#startPoint!, end: point, alt: e.ctrlKey, fixed: e.ctrlKey };
    this.dispatchEvent(new CustomEvent(EventType.AddStitch, { detail }));
  }

  #onPointerDown(e: FederatedPointerEvent) {
    const point = this.#viewport.toWorld(e.global);
    this.#startPoint = this.#pointIsOutside(point) ? undefined : point;
    if (this.#startPoint === undefined) {
      this.#clearHint();
      return;
    }
    if (e.button === 0) this.#fireAddStitchEvent(e, AddStitchEventStage.Start);
    else if (e.button === 2) this.#onRightClick(e);
  }

  #onPointerUp(e: FederatedPointerEvent) {
    // If the start point is not set or the shift key is pressed, do nothing.
    // Shift key is used to pan the viewport.
    if (this.#startPoint === undefined) {
      this.#clearHint();
      return;
    }
    if (e.button === 0) this.#fireAddStitchEvent(e, AddStitchEventStage.End);
    else if (e.button === 2) this.#onRightClick(e);
    this.#startPoint = undefined;
    this.#clearHint();
  }

  #onPointerMove(e: FederatedPointerEvent) {
    if (this.#startPoint === undefined) {
      this.#clearHint();
      return;
    }
    if (e.buttons === 1) this.#fireAddStitchEvent(e, AddStitchEventStage.Continue);
    else if (e.buttons === 2) this.#onRightClick(e);
  }

  #onRightClick(e: FederatedPointerEvent) {
    if (e.shiftKey) return; // Shift key is used to pan the viewport.
    if (e.target instanceof StitchGraphics) {
      const detail: RemoveStitchData = { stitch: e.target.stitch };
      this.dispatchEvent(new CustomEvent(EventType.RemoveStitch, { detail }));
    } else {
      const point = this.#viewport.toWorld(e.global);
      if (this.#pointIsOutside(point)) return;
      this.#viewport.children.forEach((child) => {
        if (child instanceof StitchParticleContainer) {
          const detail: RemoveStitchData = { point, kind: child.kind };
          this.dispatchEvent(new CustomEvent(EventType.RemoveStitch, { detail }));
        }
      });
    }
  }

  #pointIsOutside({ x, y }: Point) {
    return x <= 0 || y <= 0 || x >= this.#viewport.worldWidth || y >= this.#viewport.worldHeight;
  }
}

export interface CanvasSize {
  width: number;
  height: number;
}

export const enum EventType {
  AddStitch = "add_stitch",
  RemoveStitch = "remove_stitch",
}

export const enum AddStitchEventStage {
  Start = "start",
  Continue = "continue",
  End = "end",
}

/**
 * Represents the data for the `AddStitch` event.
 *
 * It has the `start` and `end` points of the stitch.
 * If the stitch is "single-point" (i.e. cross stitch, petite, bead, etc.) then these points will be the same.
 * If the stitch is "double-point" (i.e. back and straight stitch) then these points will be different.
 */
export interface AddStitchData {
  /** The stage of the event. */
  stage: AddStitchEventStage;

  /** The point where the event started. */
  start: Point;

  /** The point where the event ended. */
  end: Point;

  /** Whether the stitch should be drawn in its "alternative" view (e.g. rotated). */
  alt: boolean;

  /** Whether the stitch should be drawn in its previous view (i.e. in the same direction). */
  fixed: boolean;
}

export type RemoveStitchData = { stitch: Stitch } | { point: Point; kind: StitchKind };
