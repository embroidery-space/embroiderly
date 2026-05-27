export type WheelAction = "zoom" | "scroll";

export interface ViewportOptions {
  /**
   * The action to take when the user scrolls the wheel over the viewport.
   * @default "zoom"
   */
  wheelAction?: WheelAction;
}
