export const enum WheelAction {
  Zoom = "zoom",
  Scroll = "scroll",
}

export interface ViewportOptions {
  /**
   * The action to take when the user scrolls the wheel over the viewport.
   * @default WheelAction.Zoom
   */
  wheelAction?: WheelAction;
}
