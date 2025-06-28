import { Container, Point } from "pixi.js";
import type { DestroyOptions, FederatedPointerEvent } from "pixi.js";

const MODIFIERS: Modifiers = {
  mod1: (e) => e.ctrlKey,
  mod2: (e) => e.shiftKey,
  mod3: (e) => e.altKey,
};

const MIN_SCALE = 1;
const MAX_SCALE = 100;

const WHEEL_ZOOM_FACTOR = 0.1;

export interface ViewportOptions {
  screenWidth?: number;
  screenHeight?: number;

  worldWidth?: number;
  worldHeight?: number;

  wheelAction?: WheelAction;
}

export type ZoomState = "fit" | "fit-width" | "fit-height" | number;
export type WheelAction = "zoom" | "scroll";

export class PatternViewport extends Container {
  private domElement!: HTMLElement;

  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  worldWidth = this.screenWidth;
  worldHeight = this.screenHeight;

  wheelAction: WheelAction = "zoom";
  zoom: ZoomState = 1;

  private startPoint?: Point;

  constructor() {
    super();
    this.label = "Viewport";
    this.eventMode = "static";
  }

  init(domElement: HTMLElement, options: ViewportOptions) {
    this.domElement = domElement;

    this.screenWidth = options.screenWidth ?? this.screenWidth;
    this.screenHeight = options.screenHeight ?? this.screenHeight;
    this.worldWidth = options.worldWidth ?? this.worldWidth;
    this.worldHeight = options.worldHeight ?? this.worldHeight;

    this.wheelAction = options.wheelAction ?? "zoom";

    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointermove", this.handlePointerMove, this);
    this.on("pointerup", this.handlePointerUp, this);
    this.on("pointerupoutside", this.handlePointerUp, this);
    this.on("pointercancel", this.handlePointerUp, this);

    this.handleWheel = this.handleWheel.bind(this);
    this.domElement.addEventListener("wheel", this.handleWheel, { passive: false });
  }

  override destroy(options?: DestroyOptions): void {
    this.off("pointerdown", this.handlePointerDown, this);
    this.off("pointermove", this.handlePointerMove, this);
    this.off("pointerup", this.handlePointerUp, this);
    this.off("pointerupoutside", this.handlePointerUp, this);
    this.off("pointercancel", this.handlePointerUp, this);

    this.domElement.removeEventListener("wheel", this.handleWheel);

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
    this.clampZoom(Math.min(scaleX, scaleY), "fit");
  }

  fitWidth() {
    const scale = this.screenWidth / this.worldWidth;
    this.clampZoom(scale, "fit-width");
  }

  fitHeight() {
    const scale = this.screenHeight / this.worldHeight;
    this.clampZoom(scale, "fit-height");
  }

  resizeScreen(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
  }

  resizeWorld(width: number, height: number) {
    this.worldWidth = width;
    this.worldHeight = height;
  }

  private handlePointerDown(e: FederatedPointerEvent) {
    const point = this.toWorld(e.global);
    this.startPoint = this.containsPoint(point) ? point : undefined;
    if (this.startPoint === undefined) return this._emit(InternalEventType.CanvasClear, e);

    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (MODIFIERS.mod3(e)) this._emit(EventType.ToolAntiAction, e);
      else this._emit(EventType.ToolMainAction, e);
    }
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (this.startPoint === undefined) return;
      if (MODIFIERS.mod3(e)) this._emit(EventType.ToolAntiAction, e);
      else this._emit(EventType.ToolMainAction, e);
    } else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this._emit(EventType.ToolAntiAction, e);
      else {
        this.startPoint = undefined;
        this.move(e.movement);
      }
    }
  }

  private handlePointerUp(e: FederatedPointerEvent) {
    if (this.startPoint === undefined) return this._emit(InternalEventType.CanvasClear, e);
    const buttons = getMouseButtons(e);
    if (buttons.left) this._emit(EventType.ToolRelease, e);
    else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this._emit(EventType.ToolAntiAction, e);
      else this._emit(EventType.ContextMenu, e);
    }
    this.startPoint = undefined;
    this._emit(InternalEventType.CanvasClear, e);
  }

  private _emit(type: EventType | InternalEventType, event: FederatedPointerEvent) {
    const point = this.toWorld(event.global);
    if (!this.containsPoint(point) && type !== InternalEventType.CanvasClear) return;
    const modifiers: ModifiersState = {
      mod1: MODIFIERS.mod1(event),
      mod2: MODIFIERS.mod2(event),
      mod3: MODIFIERS.mod3(event),
    };
    const detail: EventDetail = { event, modifiers, start: this.startPoint!, end: point };
    this.emit(type, detail);
  }

  private handleWheel(e: WheelEvent) {
    e.preventDefault();
    // We use the mod3 to switch between scroll and zoom actions.
    const action = MODIFIERS.mod3(e) ? (this.wheelAction === "scroll" ? "zoom" : "scroll") : this.wheelAction;
    if (action === "scroll") this.handleWheelScroll(e);
    else this.handleWheelZoom(e);
  }

  private handleWheelScroll(e: WheelEvent) {
    const isTouchpad = Math.abs(e.deltaX) !== 0;
    if (isTouchpad) {
      this.position.x -= e.deltaX;
      this.position.y -= e.deltaY;
    } else {
      if (MODIFIERS.mod2(e)) this.position.x -= e.deltaY;
      else this.position.y -= e.deltaY;
    }
  }

  private handleWheelZoom(e: WheelEvent) {
    if (Math.abs(e.deltaY) < 2) return;
    const delta = 1 - (e.deltaY > 0 ? WHEEL_ZOOM_FACTOR : -WHEEL_ZOOM_FACTOR);

    const mousePosition = new Point(e.offsetX, e.offsetY);
    const beforeTransform = this.toLocal(mousePosition);
    this.clampZoom(this.scale.x * delta);

    const afterTransform = this.toLocal(mousePosition);
    this.position.x += (afterTransform.x - beforeTransform.x) * this.scale.x;
    this.position.y += (afterTransform.y - beforeTransform.y) * this.scale.y;
  }

  private clampZoom(value = this.scale.x, zoom?: ZoomState) {
    const scale = Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
    this.scale.set(scale);

    this.zoom = zoom ?? scale;
  }
}

export const enum EventType {
  ToolMainAction = "tool-main-action",
  ToolAntiAction = "tool-anti-action",
  ToolRelease = "tool-release",
  ContextMenu = "context-menu",
}

export const enum InternalEventType {
  CanvasClear = "canvas-clear",
}

export interface EventDetail {
  event: FederatedPointerEvent;
  modifiers: ModifiersState;
  start: Point;
  end: Point;
}

export interface Modifiers {
  /** Modifier 1. Default is the Ctrl key. */
  mod1: ModifierChecker;

  /** Modifier 2. Default is the Shift key. */
  mod2: ModifierChecker;

  /** Modifier 3. Default is the Alt key. */
  mod3: ModifierChecker;
}

/** A function that checks if a modifier key is pressed based on the given event. */
export type ModifierChecker = (event: MouseEvent) => boolean;

export interface ModifiersState {
  mod1: boolean;
  mod2: boolean;
  mod3: boolean;
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
