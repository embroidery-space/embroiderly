import { Bounds, Container, Point, Rectangle } from "pixi.js";
import type { ContainerChild, DestroyOptions, IRenderLayer, FederatedPointerEvent } from "pixi.js";

import { getMouseButtons, MODIFIERS, type ModifiersState } from "./utils/index.ts";
import { MIN_SCALE, MAX_SCALE, DEFAULT_CONTAINER_OPTIONS } from "./constants.ts";

const WHEEL_ZOOM_FACTOR = 0.1;

/** Options for the pattern viewport. */
export interface ViewportOptions {
  /**
   * The width of the screen in pixels.
   * @default window.innerWidth
   */
  screenWidth?: number;
  /**
   * The height of the screen in pixels.
   * @default window.innerHeight
   */
  screenHeight?: number;

  /**
   * The width of the pattern in stitches (which are actually mapped 1 to 1 to pixels, though).
   * @default options.patternWidth
   */
  patternWidth?: number;
  /**
   * The height of the pattern in stitches (which are actually mapped 1 to 1 to pixels, though).
   * @default options.patternHeight
   */
  patternHeight?: number;

  /**
   * The action to take when the user scrolls the wheel over the viewport.
   * @default "zoom"
   */
  wheelAction?: WheelAction;
}

export type ZoomState = "fit" | "fit-width" | "fit-height" | number;
export type WheelAction = "zoom" | "scroll";

/**
 * The main viewport for the pattern editor.
 *
 * It is responsible for handling user input and managing the view of the pattern.
 */
export class PatternViewport extends Container {
  private domElement!: HTMLElement;

  wheelAction: WheelAction = "zoom";

  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;

  patternWidth = this.screenWidth;
  patternHeight = this.screenHeight;

  private startPoint?: Point;
  private isDragging = false;

  /**
   * The content container for the pattern viewport.
   * It holds all the elements added to the viewport.
   */
  private content = new Container({ label: "Pattern Viewport Content", interactiveChildren: true });

  constructor() {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      label: "Pattern Viewport",
      eventMode: "static",
      interactiveChildren: true,
    });
    this.addChildAt(this.content, 0);
  }

  /**
   * Initializes the pattern viewport.
   * @param domElement The Canvas DOM element.
   * It is used for handling some user input events.
   * @param options The options to use for the viewport.
   */
  init(domElement: HTMLElement, options?: ViewportOptions) {
    this.domElement = domElement;

    this.screenWidth = options?.screenWidth ?? this.screenWidth;
    this.screenHeight = options?.screenHeight ?? this.screenHeight;
    this.patternWidth = options?.patternWidth ?? this.patternWidth;
    this.patternHeight = options?.patternHeight ?? this.patternHeight;

    this.wheelAction = options?.wheelAction ?? "zoom";

    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointermove", this.handlePointerMove, this);
    this.on("pointerup", this.handlePointerUp, this);
    this.on("pointerupoutside", this.handlePointerUp, this);
    this.on("pointercancel", this.handlePointerUp, this);

    this.handleWheel = this.handleWheel.bind(this);
    this.domElement.addEventListener("wheel", this.handleWheel, { passive: false, capture: true });

    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.domElement.addEventListener("contextmenu", this.handleContextMenu, { capture: true });
  }

  override destroy(options?: DestroyOptions): void {
    this.off("pointerdown", this.handlePointerDown, this);
    this.off("pointermove", this.handlePointerMove, this);
    this.off("pointerup", this.handlePointerUp, this);
    this.off("pointerupoutside", this.handlePointerUp, this);
    this.off("pointercancel", this.handlePointerUp, this);

    this.domElement.removeEventListener("wheel", this.handleWheel, { capture: true });
    this.domElement.removeEventListener("contextmenu", this.handleContextMenu, { capture: true });

    super.destroy(options);
  }

  /**
   * Resizes the screen area.
   * @param width The new width of the screen.
   * @param height The new height of the screen.
   */
  resizeScreen(width: number, height: number) {
    this.screenWidth = width;
    this.screenHeight = height;
    this.hitArea = this.boundsArea = new Rectangle(0, 0, width, height);
  }

  /**
   * Resizes the pattern area.
   * @param width The new width of the pattern.
   * @param height The new height of the pattern.
   */
  resizePattern(width: number, height: number) {
    this.patternWidth = width;
    this.patternHeight = height;
  }

  // Override the `addChild` method to add children to the content container, but not the viewport itself.
  override addChild<U extends (ContainerChild | IRenderLayer)[]>(...children: U): U[0] {
    return this.content.addChild(...children);
  }

  // Override the `removeChildren` method to remove children from the content container, but not the viewport itself.
  override removeChildren(beginIndex?: number, endIndex?: number): ContainerChild[] {
    return this.content.removeChildren(beginIndex, endIndex);
  }

  /** The width of the pattern in screen coordinates. */
  get patternScreenWidth() {
    return this.screenWidth / this.content.scale.x;
  }

  /** The height of the pattern in screen coordinates. */
  get patternScreenHeight() {
    return this.screenHeight / this.content.scale.y;
  }

  /** Checks if the given point is within the pattern bounds. */
  containsPoint({ x, y }: Point) {
    return x >= 0 && y >= 0 && x <= this.patternWidth && y <= this.patternHeight;
  }

  /**
   * Moves the content by the given point.
   * @param point The point to move by.
   */
  moveBy(point: Point) {
    this.content.position.x += point.x;
    this.content.position.y += point.y;
    this.emitTransformEvent();
  }

  /** Moves the content to the center of the viewport. */
  moveToCenter() {
    this.content.position.x = (this.patternScreenWidth / 2 - this.patternWidth / 2) * this.scale.x;
    this.content.position.y = (this.patternScreenHeight / 2 - this.patternHeight / 2) * this.scale.y;
    this.emitTransformEvent();
  }

  /** Sets the zoom level of the viewport. */
  setZoom(zoom: ZoomState) {
    if (zoom === "fit") this.fit();
    else if (zoom === "fit-width") this.fitWidth();
    else if (zoom === "fit-height") this.fitHeight();
    else {
      const position = this.content.position.clone();

      const beforeTransform = this.content.toLocal(position);
      this.clampZoom(zoom);
      const afterTransform = this.content.toLocal(position);

      this.position.x += (afterTransform.x - beforeTransform.x) * this.content.scale.x;
      this.position.y += (afterTransform.y - beforeTransform.y) * this.content.scale.y;

      this.emitTransformEvent();
    }
  }

  /** Fits the content to the viewport. */
  fit() {
    const scaleX = this.screenWidth / this.patternWidth;
    const scaleY = this.screenHeight / this.patternHeight;

    this.clampZoom(Math.min(scaleX, scaleY));
    this.moveToCenter();

    this.emitTransformEvent();
  }

  /** Fits the content to the width of the viewport. */
  fitWidth() {
    const scale = this.screenWidth / this.patternWidth;

    this.clampZoom(scale);
    this.moveToCenter();

    this.emitTransformEvent();
  }

  /** Fits the content to the height of the viewport. */
  fitHeight() {
    const scale = this.screenHeight / this.patternHeight;

    this.clampZoom(scale);
    this.moveToCenter();

    this.emitTransformEvent();
  }

  private handlePointerDown(e: FederatedPointerEvent) {
    this.startPoint = this.content.toLocal(e.global);

    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (MODIFIERS.mod3(e)) this.emitToolEvent(ToolEvent.ToolAntiAction, e);
      else this.emitToolEvent(ToolEvent.ToolMainAction, e);
    }
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (this.startPoint === undefined) return;
      if (MODIFIERS.mod3(e)) this.emitToolEvent(ToolEvent.ToolAntiAction, e);
      else this.emitToolEvent(ToolEvent.ToolMainAction, e);
    } else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this.emitToolEvent(ToolEvent.ToolAntiAction, e);
      else {
        this.isDragging = true;
        this.moveBy(e.movement);
      }
    }
  }

  private handlePointerUp(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) this.emitToolEvent(ToolEvent.ToolRelease, e);
    else if (buttons.right) {
      if (MODIFIERS.mod1(e)) this.emitToolEvent(ToolEvent.ToolAntiAction, e);
    }

    // Clear the start point and dragging state on the next tick.
    // It is necessary to do this on the next tick to allow the `handleContextMenu` method to access the correct state,
    // since the `contextmenu` event is fired at the same time.
    setTimeout(() => {
      this.startPoint = undefined;
      this.isDragging = false;
    }, 0);
  }

  /**
   * Emits a tool event with the current pointer information.
   *
   * @param type - The type of the event to emit.
   * @param event - The original pointer event.
   */
  private emitToolEvent(type: ToolEvent, event: FederatedPointerEvent) {
    const point = this.content.toLocal(event.global);
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
    const detail: TransformEventDetail = {
      scale: this.content.scale.x,
      bounds: this.content.getBounds(),
    };
    this.emit(ToolEvent.Transform, detail);
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
      this.content.position.x -= e.deltaX;
      this.content.position.y -= e.deltaY;
    } else {
      if (MODIFIERS.mod2(e)) this.content.position.x -= e.deltaY;
      else this.content.position.y -= e.deltaY;
    }

    this.emitTransformEvent();
  }

  private handleWheelZoom(e: WheelEvent) {
    // Prevent zoom on a little scroll.
    if (Math.abs(e.deltaY) < 2) return;

    const delta = 1 - (e.deltaY > 0 ? WHEEL_ZOOM_FACTOR : -WHEEL_ZOOM_FACTOR);
    const mousePosition = new Point(e.offsetX, e.offsetY);

    const beforeTransform = this.content.toLocal(mousePosition);
    this.clampZoom(this.content.scale.x * delta);
    const afterTransform = this.content.toLocal(mousePosition);

    this.content.position.x += (afterTransform.x - beforeTransform.x) * this.content.scale.x;
    this.content.position.y += (afterTransform.y - beforeTransform.y) * this.content.scale.y;

    this.emitTransformEvent();
  }

  private handleContextMenu(e: MouseEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.right && (MODIFIERS.mod1(e) || this.isDragging)) {
      e.preventDefault();
    }
  }

  /**
   * Clamps the zoom level to the defined min and max scale and sets it.
   * @param value The zoom level to set. Defaults to the current content scale.
   */
  private clampZoom(value = this.content.scale.x) {
    const scale = Math.min(Math.max(value, MIN_SCALE), MAX_SCALE);
    this.content.scale.set(scale);
  }
}

export const enum ToolEvent {
  ToolMainAction = "tool-main-action",
  ToolAntiAction = "tool-anti-action",
  ToolRelease = "tool-release",
  Transform = "transform",
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
