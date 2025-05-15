import { Container, Point } from "pixi.js";
import type { DestroyOptions, EventSystem, FederatedPointerEvent } from "pixi.js";
import type { Modifiers, ModifiersState, PatternCanvas } from "../pattern-canvas";

const MODIFIERS: Modifiers = {
  mod1: (e) => e.ctrlKey,
  mod2: (e) => e.shiftKey,
  mod3: (e) => e.altKey,
};

interface MouseButtons {
  left: boolean;
  middle: boolean;
  right: boolean;
}

function getMouseButtons(event: FederatedPointerEvent): MouseButtons {
  const { button, buttons } = event;
  if (button !== -1) {
    return { left: button === 0, middle: button === 1, right: button === 2 };
  } else {
    return { left: (buttons & 1) !== 0, middle: (buttons & 4) !== 0, right: (buttons & 2) !== 0 };
  }
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

export class InputManager {
  private canvas: PatternCanvas;
  private viewport: Viewport;

  private startPoint?: Point;

  constructor(canvas: PatternCanvas, viewport: Viewport) {
    this.canvas = canvas;
    this.viewport = viewport;
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
      if (MODIFIERS.mod3(e)) this.emit(e, EventType.ToolAntiAction);
      else this.emit(e, EventType.ToolMainAction);
    }
  }

  private onPointerMove(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (this.startPoint === undefined) return this.canvas.clearHint();
      if (MODIFIERS.mod3(e)) this.emit(e, EventType.ToolAntiAction);
      else this.emit(e, EventType.ToolMainAction);
    } else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this.emit(e, EventType.ToolAntiAction);
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
      if (MODIFIERS.mod1(e)) this.emit(e, EventType.ToolAntiAction);
      else this.emit(e, EventType.ContextMenu);
    }
    this.startPoint = undefined;
    this.canvas.clearHint();
  }

  private emit(event: FederatedPointerEvent, type: EventType) {
    const point = this.viewport.toWorld(event.global);
    if (!this.viewport.containsPoint(point)) return;
    const modifiers: ModifiersState = {
      mod1: MODIFIERS.mod1(event),
      mod2: MODIFIERS.mod2(event),
      mod3: MODIFIERS.mod3(event),
    };
    const detail: EventDetail = { event, modifiers, start: this.startPoint!, end: point };
    this.canvas.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

const MIN_SCALE = 1;
const MAX_SCALE = 100;

const WHEEL_ZOOM_FACTOR = 0.1;

export interface ViewportOptions {
  events: EventSystem;

  screenWidth?: number;
  screenHeight?: number;

  worldWidth?: number;
  worldHeight?: number;

  wheelAction?: WheelAction;
}

export type ZoomState = "fit" | "fit-width" | "fit-height" | number;
export type WheelAction = "zoom" | "scroll";

export class Viewport extends Container {
  private events!: EventSystem;

  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  worldWidth = this.screenWidth;
  worldHeight = this.screenHeight;

  wheelAction: WheelAction = "zoom";
  zoom: ZoomState = 1;

  constructor() {
    super();
    this.label = "Viewport";
    this.eventMode = "static";
  }

  init(options: ViewportOptions) {
    this.events = options.events;

    this.screenWidth = options.screenWidth ?? this.screenWidth;
    this.screenHeight = options.screenHeight ?? this.screenHeight;
    this.worldWidth = options.worldWidth ?? this.worldWidth;
    this.worldHeight = options.worldHeight ?? this.worldHeight;

    this.wheelAction = options.wheelAction ?? "zoom";

    this._onWheel = this._onWheel.bind(this);
    this.events.domElement.addEventListener("wheel", this._onWheel, { passive: false });
  }

  override destroy(options?: DestroyOptions): void {
    this.events.domElement.removeEventListener("wheel", this._onWheel);
    super.destroy(options);
  }

  get worldScreenWidth() {
    return this.screenWidth / this.scale.x;
  }

  get worldScreenHeight() {
    return this.screenHeight / this.scale.y;
  }

  containsPoint({ x, y }: Point) {
    return x >= 0 && y >= 0 && x <= this.worldWidth && y <= this.worldHeight;
  }

  toWorld(point: Point) {
    return this.toLocal(point);
  }

  move(point: Point) {
    this.position.x += point.x;
    this.position.y += point.y;
  }

  moveCenter(point: Point) {
    const x = (this.worldScreenWidth / 2 - point.x) * this.scale.x;
    const y = (this.worldScreenHeight / 2 - point.y) * this.scale.y;
    this.position.set(x, y);
  }

  fit() {
    const scaleX = this.screenWidth / this.worldWidth;
    const scaleY = this.screenHeight / this.worldHeight;
    this._clampZoom(Math.min(scaleX, scaleY), "fit");
  }

  fitWidth() {
    const scale = this.screenWidth / this.worldWidth;
    this._clampZoom(scale, "fit-width");
  }

  fitHeight() {
    const scale = this.screenHeight / this.worldHeight;
    this._clampZoom(scale, "fit-height");
  }

  resizeScreen(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  resizeWorld(width: number, height: number) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  private _onWheel(e: WheelEvent) {
    e.preventDefault();
    // We use the mod3 to switch between scroll and zoom actions.
    const action = MODIFIERS.mod3(e) ? (this.wheelAction === "scroll" ? "zoom" : "scroll") : this.wheelAction;
    if (action === "scroll") this._handleWheelScroll(e);
    else this._handleWheelZoom(e);
  }

  private _handleWheelScroll(e: WheelEvent) {
    const isTouchpad = Math.abs(e.deltaX) !== 0;
    if (isTouchpad) {
      this.position.x -= e.deltaX;
      this.position.y -= e.deltaY;
    } else {
      if (MODIFIERS.mod2(e)) this.position.x -= e.deltaY;
      else this.position.y -= e.deltaY;
    }
  }

  private _handleWheelZoom(e: WheelEvent) {
    const delta = 1 - (e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : -WHEEL_ZOOM_FACTOR);

    const mousePosition = new Point(e.offsetX, e.offsetY);
    const beforeTransform = this.toLocal(mousePosition);
    this._clampZoom(this.scale.x * delta);

    const afterTransform = this.toLocal(mousePosition);
    this.position.x += (afterTransform.x - beforeTransform.x) * this.scale.x;
    this.position.y += (afterTransform.y - beforeTransform.y) * this.scale.y;
  }

  private _clampZoom(value = this.scale.x, zoom?: ZoomState) {
    const scale = Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
    this.scale.set(scale);

    this.zoom = zoom ?? scale;
    this.emit("zoom", this.zoom);
  }
}
