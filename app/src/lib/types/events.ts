import type { Bounds, FederatedPointerEvent, Point } from "pixi.js";

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
  modifiers: Modifiers;
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
  /** Modifier 1: the `Ctrl` key. */
  mod1: boolean;

  /** Modifier 2: the `Shift` key. */
  mod2: boolean;

  /** Modifier 3: the `Alt` key. */
  mod3: boolean;
}
