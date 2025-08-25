import { Container, FederatedPointerEvent, Graphics, GraphicsContext, Rectangle } from "pixi.js";
import type { ContainerOptions, DestroyOptions, StrokeStyle } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/";
import { getMouseButtons } from "#/core/pixi/utils/";

const SELECTION_STOKE: StrokeStyle = { width: 0.1, color: "#b48ead" };
const SELECTION_CORNER_CONTEXT = new GraphicsContext()
  .circle(0, 0, 2)
  .fill("white")
  .stroke({ pixelLine: true, alignment: 0, color: "#b48ead" });

type ResizeDirection = "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left";

export class OutlineSelection<T extends Container = Container> extends Container {
  /** The target element that is being selected. */
  readonly target: T;
  /** The container that holds the selection controls. */
  readonly controls = new Container({
    ...DEFAULT_CONTAINER_OPTIONS,
    label: "Selection Controls",
    interactiveChildren: true,
    visible: false,
    renderable: false,
  });

  private isFocused = false;
  private isDragging = false;
  private isResizing?: ResizeDirection;

  constructor(target: T, options?: ContainerOptions) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...options,
      interactive: true,
      interactiveChildren: true,
    });

    this.target = this.addChild(target, this.controls);

    this.onRender = () => {
      if (!this.isFocused) return;
      this.renderSelectionControls();
    };

    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointermove", this.handlePointerMove, this);
    this.on("pointerup", this.handlePointerUp, this);
    this.on("pointerupoutside", this.handlePointerUp, this);
    this.on("pointercancel", this.handlePointerUp, this);
  }

  override destroy(options?: DestroyOptions): void {
    // @ts-expect-error ...
    this.onRender = null;

    this.off("pointerdown", this.handlePointerDown, this);
    this.off("pointermove", this.handlePointerMove, this);
    this.off("pointerup", this.handlePointerUp, this);
    this.off("pointerupoutside", this.handlePointerUp, this);
    this.off("pointercancel", this.handlePointerUp, this);

    super.destroy(options);
  }

  /** Focuses the selection container. */
  focus() {
    if (this.isFocused) return;

    this.isFocused = true;

    this.target.cursor = "move";
    this.renderSelectionControls();

    this.controls.visible = true;
    this.controls.renderable = true;
  }

  /** Blurs the selection container. */
  blur() {
    if (!this.isFocused) return;

    this.isFocused = false;

    this.target.cursor = "default";

    this.controls.visible = false;
    this.controls.renderable = false;
  }

  private renderSelectionControls() {
    const { width, height } = this.target.getSize();

    const tEdge = new Graphics({ label: "top" }).moveTo(0, 0).lineTo(width, 0).fill("white").stroke(SELECTION_STOKE); // prettier-ignore
    const rEdge = new Graphics({ label: "right" }).moveTo(width, 0).lineTo(width, height).fill("white").stroke(SELECTION_STOKE); // prettier-ignore
    const bEdge = new Graphics({ label: "bottom" }).moveTo(0, height).lineTo(width, height).fill("white").stroke(SELECTION_STOKE); // prettier-ignore
    const lEdge = new Graphics({ label: "left" }).moveTo(0, 0).lineTo(0, height).fill("white").stroke(SELECTION_STOKE); // prettier-ignore

    tEdge.eventMode = rEdge.eventMode = bEdge.eventMode = lEdge.eventMode = "static";
    tEdge.cursor = bEdge.cursor = "ns-resize";
    rEdge.cursor = lEdge.cursor = "ew-resize";

    const tlCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "top-left" });
    tlCorner.position.set(0, 0);
    tlCorner.scale.set(0.1);
    const trCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "top-right" });
    trCorner.position.set(width, 0);
    trCorner.scale.set(0.1);
    const blCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "bottom-left" });
    blCorner.position.set(0, height);
    blCorner.scale.set(0.1);
    const brCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "bottom-right" });
    brCorner.position.set(width, height);
    brCorner.scale.set(0.1);

    tlCorner.eventMode = trCorner.eventMode = blCorner.eventMode = brCorner.eventMode = "static";
    tlCorner.cursor = brCorner.cursor = "nwse-resize";
    trCorner.cursor = blCorner.cursor = "nesw-resize";

    this.controls.removeChildren().forEach((child) => child.destroy());
    this.controls.addChild(tEdge, rEdge, bEdge, lEdge);
    this.controls.addChild(tlCorner, trCorner, blCorner, brCorner);
  }

  private handlePointerDown(e: FederatedPointerEvent) {
    if (!this.isFocused) return;

    const buttons = getMouseButtons(e);
    if (!buttons.left) return;

    if (e.target instanceof Graphics) {
      this.isResizing = e.target.label as ResizeDirection;
    } else {
      this.isResizing = undefined;
      this.isDragging = true;
    }
  }

  private handlePointerMove(e: FederatedPointerEvent) {
    if (!this.isFocused) return;

    const pos = this.parent.toLocal(e.global);

    if (this.isResizing) {
      switch (this.isResizing) {
        case "top": {
          this.target.height -= pos.y - this.y;
          this.y = pos.y;
          break;
        }
        case "bottom": {
          this.target.height = pos.y - this.y;
          break;
        }

        case "left": {
          this.target.width -= pos.x - this.x;
          this.x = pos.x;
          break;
        }
        case "right": {
          this.target.width = pos.x - this.x;
          break;
        }

        case "top-left": {
          this.target.width -= pos.x - this.x;
          this.target.height -= pos.y - this.y;
          this.y = pos.y;
          this.x = pos.x;
          break;
        }

        case "top-right": {
          this.target.width = pos.x - this.x;
          this.target.height -= pos.y - this.y;
          this.y = pos.y;
          break;
        }

        case "bottom-right": {
          this.target.width = pos.x - this.x;
          this.target.height = pos.y - this.y;
          break;
        }

        case "bottom-left": {
          this.target.width -= pos.x - this.x;
          this.target.height = pos.y - this.y;
          this.x += pos.x - this.x;
          break;
        }
      }
      this.boundsArea = new Rectangle(0, 0, this.target.width, this.target.height);
    }

    if (this.isDragging) {
      this.x += e.movementX;
      this.y += e.movementY;
    }
  }

  private handlePointerUp() {
    this.isResizing = undefined;
    this.isDragging = false;
  }
}
