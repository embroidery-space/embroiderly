import { Bounds, Container, Point, Rectangle } from "pixi.js";
import type { ContainerChild, DestroyOptions, FederatedPointerEvent } from "pixi.js";

import type { ZoomState } from "~/lib/types/";

import { MIN_SCALE, MAX_SCALE, DEFAULT_CONTAINER_OPTIONS } from "./constants.ts";
import { getMouseButtons, MODIFIERS } from "./utils/index.ts";
import type { ModifiersState } from "./utils/index.ts";

const WHEEL_ZOOM_FACTOR = 0.1;
const LONG_PRESS_MS = 500;

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

export type WheelAction = "zoom" | "scroll";

type GestureMode = "draw" | "pinch";

interface PinchState {
  lastDistance: number;
  lastMidpoint: Point;
}

interface TouchState {
  readonly activeTouches: Map<number, Point>;

  gestureMode?: GestureMode;
  pinchState?: PinchState;

  drawPending: boolean;
  longPressTimer?: ReturnType<typeof setTimeout>;
}

/**
 * The main viewport for the pattern editor.
 *
 * It is responsible for handling user input and managing the view of the pattern.
 *
 * ## Interaction Mmodel
 *
 * ### Mouse
 *
 * - Left drag -> main action (e.g., draw).
 * - Alt + left drag -> anti-action (e.g., erase).
 * - Right drag -> pan.
 * - Ctrl + right click -> anti-action.
 * - Wheel -> zoom (or scroll, depending on the `wheelAction`); `Alt` key swaps the two.
 *
 * ### Touch
 *
 * - One finger tap -> main action + release (single stitch).
 * - One finger drag -> main action (draw in a row).
 * - One finger long-press (≥ 500 ms without movement) -> prevented (no stitch placed).
 * - Two fingers -> pan + pinch-zoom; any in-progress single-finger draw is canceled first.
 *
 * Touch always uses the main action.
 * The anti-action (e.g., erase) is not reachable via touch because there is no keyboard on mobile---users must switch to the eraser tool through the UI.
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

  private touch: TouchState = {
    activeTouches: new Map(),
    drawPending: false,
  };

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

    clearTimeout(this.touch.longPressTimer);

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
  override addChild<U extends ContainerChild[]>(...children: U): U[0] {
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
    this.content.position.x = (this.patternScreenWidth / 2 - this.patternWidth / 2) * this.content.scale.x;
    this.content.position.y = (this.patternScreenHeight / 2 - this.patternHeight / 2) * this.content.scale.y;
    this.emitTransformEvent();
  }

  /** Sets the zoom level of the viewport. */
  setZoom(zoom: ZoomState) {
    switch (zoom) {
      case "fit": {
        this.fit();
        break;
      }
      case "fit-width": {
        this.fitWidth();
        break;
      }
      case "fit-height": {
        this.fitHeight();
        break;
      }
      default: {
        const position = this.content.position.clone();

        const beforeTransform = this.content.toLocal(position);
        this.clampZoom(zoom);
        const afterTransform = this.content.toLocal(position);

        this.position.x += (afterTransform.x - beforeTransform.x) * this.content.scale.x;
        this.position.y += (afterTransform.y - beforeTransform.y) * this.content.scale.y;

        this.emitTransformEvent();
      }
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
    if (e.pointerType === "touch") this.handleTouchDown(e);
    else this.handleMouseDown(e);
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    if (e.pointerType === "touch") this.handleTouchMove(e);
    else this.handleMouseMove(e);
  }

  private handlePointerUp(e: FederatedPointerEvent) {
    if (e.pointerType === "touch") this.handleTouchUp(e);
    else this.handleMouseUp(e);
  }

  private handleMouseDown(e: FederatedPointerEvent) {
    this.startPoint = this.content.toLocal(e.global);

    const buttons = getMouseButtons(e);
    if (buttons.left) {
      if (MODIFIERS.mod3(e)) this.emitToolEvent(ToolEvent.ToolAntiAction, e);
      else this.emitToolEvent(ToolEvent.ToolMainAction, e);
    }
  }

  private handleMouseMove(e: FederatedPointerEvent) {
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

  private handleMouseUp(e: FederatedPointerEvent) {
    const buttons = getMouseButtons(e);
    if (buttons.left) this.emitToolEvent(ToolEvent.ToolRelease, e);
    else if (buttons.right && MODIFIERS.mod1(e)) this.emitToolEvent(ToolEvent.ToolAntiAction, e);

    // Clear the start point and dragging state on the next tick.
    // It is necessary to do this on the next tick to allow the `handleContextMenu` method to access the correct state,
    // since the `contextmenu` event is fired at the same time.
    setTimeout(() => {
      this.startPoint = undefined;
      this.isDragging = false;
    }, 0);
  }

  private handleTouchDown(e: FederatedPointerEvent) {
    this.touch.activeTouches.set(e.pointerId, e.global.clone());
    switch (this.touch.activeTouches.size) {
      case 1: {
        this.touch.gestureMode = "draw";
        this.startPoint = this.content.toLocal(e.global);

        this.touch.drawPending = true;
        this.touch.longPressTimer = setTimeout(() => {
          // Long press: cancel draw without placing a stitch.
          this.touch.drawPending = false;
          this.startPoint = undefined;
        }, LONG_PRESS_MS);

        break;
      }

      case 2: {
        clearTimeout(this.touch.longPressTimer);
        this.touch.longPressTimer = undefined;

        if (this.touch.gestureMode === "draw") {
          // Draw was committed via movement before the second finger arrived; close it.
          if (!this.touch.drawPending) this.emitToolEvent(ToolEvent.ToolRelease, e);

          this.touch.drawPending = false;
          this.startPoint = undefined;
        }

        this.touch.gestureMode = "pinch";
        this.touch.pinchState = this.computePinchState();

        break;
      }
    }
  }

  private handleTouchMove(e: FederatedPointerEvent) {
    if (!this.touch.activeTouches.has(e.pointerId)) return;
    this.touch.activeTouches.set(e.pointerId, e.global.clone());
    switch (this.touch.gestureMode) {
      case "draw": {
        // First movement: commit to drawing and cancel the long-press guard.
        if (this.touch.drawPending) {
          clearTimeout(this.touch.longPressTimer);
          this.touch.longPressTimer = undefined;
          this.touch.drawPending = false;
        }

        this.emitToolEvent(ToolEvent.ToolMainAction, e);

        break;
      }

      case "pinch": {
        if (this.touch.activeTouches.size !== 2 || this.touch.pinchState === undefined) return;

        const { lastDistance, lastMidpoint } = this.touch.pinchState;
        this.touch.pinchState = this.computePinchState();

        this.moveBy(
          new Point(
            this.touch.pinchState.lastMidpoint.x - lastMidpoint.x,
            this.touch.pinchState.lastMidpoint.y - lastMidpoint.y,
          ),
        );

        if (lastDistance > 0) {
          this.zoomAt(
            this.content.scale.x * (this.touch.pinchState.lastDistance / lastDistance),
            this.touch.pinchState.lastMidpoint,
          );
        }

        break;
      }
    }
  }

  private handleTouchUp(e: FederatedPointerEvent) {
    if (this.touch.gestureMode === "draw") {
      clearTimeout(this.touch.longPressTimer);
      this.touch.longPressTimer = undefined;

      // Skip when cancelled before any draw event was emitted (no transaction to close).
      if (e.type !== "pointercancel" || !this.touch.drawPending) {
        // Quick tap without movement: place a single stitch.
        if (this.touch.drawPending) this.emitToolEvent(ToolEvent.ToolMainAction, e);
        this.emitToolEvent(ToolEvent.ToolRelease, e);
      }

      this.touch.drawPending = false;
      this.startPoint = undefined;
      this.touch.gestureMode = undefined;
    }

    this.touch.activeTouches.delete(e.pointerId);

    if (this.touch.gestureMode === "pinch") {
      if (this.touch.activeTouches.size <= 1) this.touch.pinchState = undefined;
      if (this.touch.activeTouches.size === 0) this.touch.gestureMode = undefined;
    }
  }

  private computePinchState(): PinchState {
    const [p1, p2] = this.touch.activeTouches.values();
    if (!p1 || !p2) return { lastDistance: 0, lastMidpoint: new Point() };

    return {
      lastDistance: Math.hypot(p2.x - p1.x, p2.y - p1.y),
      lastMidpoint: new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2),
    };
  }

  /**
   * Emits a tool event with the current pointer information.
   *
   * @param type - The type of the event to emit.
   * @param event - The original pointer event.
   */
  private emitToolEvent(type: ToolEvent, event: FederatedPointerEvent) {
    if (this.startPoint === undefined) return;
    const point = this.content.toLocal(event.global);
    const modifiers: ModifiersState = {
      mod1: MODIFIERS.mod1(event),
      mod2: MODIFIERS.mod2(event),
      mod3: MODIFIERS.mod3(event),
    };
    const detail: ToolEventDetail = { event, modifiers, start: this.startPoint, end: point };
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
    const [wheelAction, altWheelAction] = [this.wheelAction, this.wheelAction === "scroll" ? "zoom" : "scroll"];
    const actualWheelAction = MODIFIERS.mod3(e) ? altWheelAction : wheelAction;

    if (actualWheelAction === "scroll") this.handleWheelScroll(e);
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
    this.zoomAt(this.content.scale.x * delta, new Point(e.offsetX, e.offsetY));
  }

  private zoomAt(scale: number, anchor: Point) {
    const before = this.content.toLocal(anchor);
    this.clampZoom(scale);
    const after = this.content.toLocal(anchor);

    this.content.position.x += (after.x - before.x) * this.content.scale.x;
    this.content.position.y += (after.y - before.y) * this.content.scale.y;

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
