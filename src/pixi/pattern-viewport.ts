import { Bounds, Container, FederatedPointerEvent, Point } from "pixi.js";
import { type DestroyOptions } from "pixi.js";

const MODIFIERS: Modifiers = {
  mod1: (e) => e.ctrlKey,
  mod2: (e) => e.shiftKey,
  mod3: (e) => e.altKey,
};

export const MIN_SCALE = 1;
export const MAX_SCALE = 100;

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

  private startPoint?: Point;
  private isDragging = false;

  constructor() {
    super({
      label: "Pattern Viewport",
      eventMode: "static",
    });
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

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.domElement.addEventListener("contextmenu", this.handleContextMenu, { capture: true });
  }

  override destroy(options?: DestroyOptions): void {
    this.off("pointerdown", this.handlePointerDown, this);
    this.off("pointermove", this.handlePointerMove, this);
    this.off("pointerup", this.handlePointerUp, this);
    this.off("pointerupoutside", this.handlePointerUp, this);
    this.off("pointercancel", this.handlePointerUp, this);
    this.off("rightclick", this.handlePointerUp, this);

    this.domElement.removeEventListener("wheel", this.handleWheel);
    this.domElement.removeEventListener("contextmenu", this.handleContextMenu, { capture: true });

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

    this.emitTransformEvent();
  }

  moveCenter(point?: Point) {
    if (!point) point = new Point(this.worldWidth / 2, this.worldHeight / 2);

    const x = (this.worldScreenWidth / 2 - point.x) * this.scale.x;
    const y = (this.worldScreenHeight / 2 - point.y) * this.scale.y;
    this.position.set(x, y);

    this.emitTransformEvent();
  }

  setZoom(zoom: ZoomState) {
    if (zoom === "fit") this.fit();
    else if (zoom === "fit-width") this.fitWidth();
    else if (zoom === "fit-height") this.fitHeight();
    else {
      const position = this.position.clone();

      const beforeTransform = this.toLocal(position);
      this.clampZoom(zoom);

      const afterTransform = this.toLocal(position);
      this.position.x += (afterTransform.x - beforeTransform.x) * this.scale.x;
      this.position.y += (afterTransform.y - beforeTransform.y) * this.scale.y;

      this.emitTransformEvent();
    }
  }

  fit() {
    const scaleX = this.screenWidth / this.worldWidth;
    const scaleY = this.screenHeight / this.worldHeight;

    this.clampZoom(Math.min(scaleX, scaleY));
    this.moveCenter();

    this.emitTransformEvent();
  }

  fitWidth() {
    const scale = this.screenWidth / this.worldWidth;

    this.clampZoom(scale);
    this.moveCenter();

    this.emitTransformEvent();
  }

  fitHeight() {
    const scale = this.screenHeight / this.worldHeight;

    this.clampZoom(scale);
    this.moveCenter();

    this.emitTransformEvent();
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
    const buttons = getMouseButtons(e);
    const point = this.toWorld(e.global);

    this.startPoint = this.containsPoint(point) ? point : undefined;
    if (this.startPoint === undefined) return this.emitToolEvent(InternalEventType.CanvasClear, e);

    if (buttons.left) {
      if (MODIFIERS.mod3(e)) this.emitToolEvent(EventType.ToolAntiAction, e);
      else this.emitToolEvent(EventType.ToolMainAction, e);
    }
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (this.startPoint === undefined) return;
      if (MODIFIERS.mod3(e)) this.emitToolEvent(EventType.ToolAntiAction, e);
      else this.emitToolEvent(EventType.ToolMainAction, e);
    } else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this.emitToolEvent(EventType.ToolAntiAction, e);
      else {
        this.startPoint = undefined;
        this.isDragging = true;
        this.move(e.movement);
      }
    }
  }

  private handlePointerUp(e: FederatedPointerEvent) {
    if (this.startPoint === undefined) return this.emitToolEvent(InternalEventType.CanvasClear, e);
    const buttons = getMouseButtons(e);
    if (buttons.left) this.emitToolEvent(EventType.ToolRelease, e);
    else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this.emitToolEvent(EventType.ToolAntiAction, e);
    }
    this.startPoint = undefined;
    this.isDragging = false;
    this.emitToolEvent(InternalEventType.CanvasClear, e);
  }

  private handleContextMenu(e: MouseEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.right && (MODIFIERS.mod1(e) || this.isDragging)) {
      e.preventDefault();
    }
  }

  /**
   * Emits a tool event with the current pointer information.
   *
   * @param type - The type of the event to emit.
   * @param event - The original pointer event.
   */
  private emitToolEvent(type: EventType | InternalEventType, event: FederatedPointerEvent) {
    const point = this.toWorld(event.global);
    if (!this.containsPoint(point) && type !== InternalEventType.CanvasClear) return;
    const modifiers: ModifiersState = {
      mod1: MODIFIERS.mod1(event),
      mod2: MODIFIERS.mod2(event),
      mod3: MODIFIERS.mod3(event),
    };
    const detail: ToolEventDetail = { event, modifiers, start: this.startPoint!, end: point };
    this.emit(type, detail);
  }

  /** Emits a transform event with the current scale and bounds. */
  private emitTransformEvent() {
    const detail: TransformEventDetail = { scale: this.scale.x, bounds: this.getBounds() };
    this.emit(EventType.Transform, detail);
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

    this.emitTransformEvent();
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

    this.emitTransformEvent();
  }

  /** Clamps the zoom level to the defined min and max scale and sets it. */
  private clampZoom(value = this.scale.x) {
    const scale = Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
    this.scale.set(scale);
  }
}

export const enum EventType {
  ToolMainAction = "tool-main-action",
  ToolAntiAction = "tool-anti-action",
  ToolRelease = "tool-release",
  Transform = "transform",
}

export const enum InternalEventType {
  CanvasClear = "canvas-clear",
}

/** The detail of the tool event. */
export interface ToolEventDetail {
  /** The original pointer event. */
  event: FederatedPointerEvent;
  /** The state of the modifier keys. */
  modifiers: ModifiersState;
  /** The starting point of the event. */
  start: Point;
  /** The ending point of the event. */
  end: Point;
}

/** The detail of the transform event (zoom or move). */
export interface TransformEventDetail {
  /** The current scale of the viewport. */
  scale: number;
  /** The current bounds of the viewport. */
  bounds: Bounds;
}

export interface Modifiers {
  /** Modifier 1. Default is the `Ctrl` key. */
  mod1: ModifierChecker;

  /** Modifier 2. Default is the `Shift` key. */
  mod2: ModifierChecker;

  /** Modifier 3. Default is the `Alt` key. */
  mod3: ModifierChecker;
}

/** A function that checks if a modifier key is pressed based on the given event. */
export type ModifierChecker = (event: MouseEvent) => boolean;

export interface ModifiersState {
  mod1: boolean;
  mod2: boolean;
  mod3: boolean;
}

function getMouseButtons(event: PointerEvent | MouseEvent): MouseButtons {
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
