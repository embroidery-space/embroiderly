import type { FederatedPointerEvent, Point } from "pixi.js";
import type { Modifiers, ModifiersState, PatternCanvas } from "../pattern-canvas";
import type { Viewport } from "./viewport";

export class InputManager {
  private canvas: PatternCanvas;
  private viewport: Viewport;

  private startPoint?: Point;

  modifiers: Modifiers;

  constructor(canvas: PatternCanvas, viewport: Viewport, options: InputManagerOptions) {
    this.canvas = canvas;
    this.viewport = viewport;

    this.modifiers = options.modifiers;
  }

  init() {
    this.viewport.on("pointerdown", this.onPointerDown, this);
    this.viewport.on("pointermove", this.onPointerMove, this);
    this.viewport.on("pointerup", this.onPointerUp, this);
    this.viewport.on("pointerupoutside", this.onPointerUp, this);
    this.viewport.on("pointercancel", this.onPointerUp, this);
  }

  destroy() {
    this.viewport.off("pointerdown", this.onPointerDown, this);
    this.viewport.off("pointermove", this.onPointerMove, this);
    this.viewport.off("pointerup", this.onPointerUp, this);
    this.viewport.off("pointerupoutside", this.onPointerUp, this);
    this.viewport.off("pointercancel", this.onPointerUp, this);
  }

  private onPointerDown(e: FederatedPointerEvent) {
    const point = this.viewport.toWorld(e.global);
    this.startPoint = this.viewport.containsPoint(point) ? point : undefined;
    if (this.startPoint === undefined) return this.canvas.clearHint();

    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (this.modifiers.mod3(e)) this.emit(e, EventType.ToolAntiAction);
      else this.emit(e, EventType.ToolMainAction);
    }
  }

  private onPointerMove(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (this.startPoint === undefined) return this.canvas.clearHint();
      if (this.modifiers.mod3(e)) this.emit(e, EventType.ToolAntiAction);
      else this.emit(e, EventType.ToolMainAction);
    } else if (buttons.right) {
      if (this.modifiers.mod1(e)) this.emit(e, EventType.ToolAntiAction);
      else {
        this.startPoint = undefined;
        this.viewport.move(e.movement);
      }
    }
  }

  private onPointerUp(e: FederatedPointerEvent) {
    if (this.startPoint === undefined) return this.canvas.clearHint();
    const buttons = getMouseButtons(e);
    if (buttons.left) this.emit(e, EventType.ToolRelease);
    else if (buttons.right) {
      if (this.modifiers.mod1(e)) this.emit(e, EventType.ToolAntiAction);
      else this.emit(e, EventType.ContextMenu);
    }
    this.startPoint = undefined;
    this.canvas.clearHint();
  }

  private emit(event: FederatedPointerEvent, type: EventType) {
    const point = this.viewport.toWorld(event.global);
    if (!this.viewport.containsPoint(point)) return;
    const modifiers: ModifiersState = {
      mod1: this.modifiers.mod1(event),
      mod2: this.modifiers.mod2(event),
      mod3: this.modifiers.mod3(event),
    };
    const detail: EventDetail = { event, modifiers, start: this.startPoint!, end: point };
    this.canvas.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

export interface InputManagerOptions {
  modifiers: Modifiers;
}

export const enum EventType {
  ToolMainAction = "tool-main-action",
  ToolAntiAction = "tool-anti-action",
  ToolRelease = "tool-release",
  ContextMenu = "context-menu",
}

export interface EventDetail {
  event: FederatedPointerEvent;
  modifiers: ModifiersState;
  start: Point;
  end: Point;
}

function getMouseButtons(event: FederatedPointerEvent): MouseButtons {
  const { button, buttons } = event;
  if (button !== -1) {
    return { left: button === 0, middle: button === 1, right: button === 2 };
  } else {
    return { left: (buttons & 1) !== 0, middle: (buttons & 4) !== 0, right: (buttons & 2) !== 0 };
  }
}

interface MouseButtons {
  left: boolean;
  middle: boolean;
  right: boolean;
}
