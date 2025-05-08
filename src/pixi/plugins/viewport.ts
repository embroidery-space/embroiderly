import { Container, Point } from "pixi.js";
import type { DestroyOptions, EventSystem } from "pixi.js";
import type { Modifiers } from "../pattern-canvas";

const MIN_SCALE = 1;
const MAX_SCALE = 100;

const WHEEL_ZOOM_FACTOR = 0.1;

export class Viewport extends Container {
  private events: EventSystem;

  screenWidth: number;
  screenHeight: number;

  worldWidth: number;
  worldHeight: number;

  wheelAction: "zoom" | "scroll";
  modifiers: Modifiers;

  zoom: ZoomState = 1;

  constructor() {
    super();
    this.label = "Viewport";
    this.eventMode = "static";
  }

  init(options: ViewportOptions) {
    this.events = options.events;

    this.screenWidth = options.screenWidth ?? window.innerWidth;
    this.screenHeight = options.screenHeight ?? window.innerHeight;
    this.worldWidth = options.worldWidth ?? this.screenWidth;
    this.worldHeight = options.worldHeight ?? this.screenHeight;

    this.wheelAction = options.wheelAction ?? "zoom";
    this.modifiers = options.modifiers;

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
    const action = this.modifiers.mod3(e) ? (this.wheelAction === "scroll" ? "zoom" : "scroll") : this.wheelAction;
    if (action === "scroll") this._handleWheelScroll(e);
    else this._handleWheelZoom(e);
  }

  private _handleWheelScroll(e: WheelEvent) {
    const isTouchpad = Math.abs(e.deltaX) !== 0;
    if (isTouchpad) {
      this.position.x -= e.deltaX;
      this.position.y -= e.deltaY;
    } else {
      if (this.modifiers.mod2(e)) this.position.x -= e.deltaY;
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

export interface ViewportOptions {
  events: EventSystem;

  screenWidth?: number;
  screenHeight?: number;

  worldWidth?: number;
  worldHeight?: number;

  wheelAction?: "zoom" | "scroll";
  modifiers: Modifiers;
}

export type ZoomState = "fit" | "fit-width" | "fit-height" | number;
