import { Container, FederatedPointerEvent, Graphics, GraphicsContext, Rectangle } from "pixi.js";
import type { ContainerChild, ContainerOptions, DestroyOptions, StrokeStyle, IRenderLayer } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/";
import { getMouseButtons } from "#/core/pixi/utils/";

const SELECTION_STOKE: StrokeStyle = { width: 1, color: "#b48ead" };
const SELECTION_CORNER_CONTEXT = new GraphicsContext()
  .circle(0, 0, 2)
  .fill("white")
  .stroke({ pixelLine: true, alignment: 0, color: "#b48ead" });

type ResizeDirection = "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left";

export class OutlineSelection extends Container {
  private content = new Container({
    ...DEFAULT_CONTAINER_OPTIONS,
    label: "Selection Content",
    interactiveChildren: true,
  });
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

  constructor(options?: ContainerOptions) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...options,
      interactive: true,
      interactiveChildren: true,
    });

    this.addChildAt(this.content, 0);
    this.addChildAt(this.controls, 1);

    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointermove", this.handlePointerMove, this);
    this.on("pointerup", this.handlePointerUp, this);
    this.on("pointerupoutside", this.handlePointerUp, this);
    this.on("pointercancel", this.handlePointerUp, this);
  }

  override destroy(options?: DestroyOptions): void {
    this.off("pointerdown", this.handlePointerDown, this);
    this.off("pointermove", this.handlePointerMove, this);
    this.off("pointerup", this.handlePointerUp, this);
    this.off("pointerupoutside", this.handlePointerUp, this);
    this.off("pointercancel", this.handlePointerUp, this);

    super.destroy(options);
  }

  override addChild<U extends (ContainerChild | IRenderLayer)[]>(...children: U): U[0] {
    const first = this.content.addChild(...children);

    if (first instanceof Container) {
      this.boundsArea = new Rectangle(0, 0, first.width, first.height);
    }
    this.renderSelectionControls();

    return first;
  }

  override removeChildren(beginIndex?: number, endIndex?: number): ContainerChild[] {
    this.blur();
    return this.content.removeChildren(beginIndex, endIndex);
  }

  /** Focuses the selection container. */
  focus() {
    if (this.isFocused) return;

    this.isFocused = true;

    this.content.children.forEach((child) => (child.cursor = "move"));
    this.renderSelectionControls();

    this.controls.visible = true;
    this.controls.renderable = true;
  }

  /** Blurs the selection container. */
  blur() {
    if (!this.isFocused) return;

    this.isFocused = false;

    this.content.children.forEach((child) => (child.cursor = "default"));

    this.controls.visible = false;
    this.controls.renderable = false;
  }

  private renderSelectionControls() {
    const { width, height } = this.content.getSize();

    const tEdge = new Graphics({ label: "top" }).moveTo(0, 0).lineTo(width, 0).fill("white").stroke(SELECTION_STOKE); // prettier-ignore
    const rEdge = new Graphics({ label: "right" }).moveTo(width, 0).lineTo(width, height).fill("white").stroke(SELECTION_STOKE); // prettier-ignore
    const bEdge = new Graphics({ label: "bottom" }).moveTo(0, height).lineTo(width, height).fill("white").stroke(SELECTION_STOKE); // prettier-ignore
    const lEdge = new Graphics({ label: "left" }).moveTo(0, 0).lineTo(0, height).fill("white").stroke(SELECTION_STOKE); // prettier-ignore

    tEdge.eventMode = rEdge.eventMode = bEdge.eventMode = lEdge.eventMode = "static";
    tEdge.cursor = bEdge.cursor = "ns-resize";
    rEdge.cursor = lEdge.cursor = "ew-resize";

    const tlCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "top-left" });
    tlCorner.position.set(0, 0);
    const trCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "top-right" });
    trCorner.position.set(width, 0);
    const blCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "bottom-left" });
    blCorner.position.set(0, height);
    const brCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "bottom-right" });
    brCorner.position.set(width, height);

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

    if (this.isResizing) {
      switch (this.isResizing) {
        case "top": {
          this.height -= e.movementY;
          this.y += e.movementY;
          break;
        }
        case "bottom": {
          this.height += e.movementY;
          break;
        }

        case "left": {
          this.width -= e.movementX;
          this.x += e.movementX;
          break;
        }
        case "right": {
          this.width += e.movementX;
          break;
        }

        case "top-left": {
          this.height -= e.movementY;
          this.y += e.movementY;
          this.width -= e.movementX;
          this.x += e.movementX;
          break;
        }

        case "top-right": {
          this.height -= e.movementY;
          this.y += e.movementY;
          this.width += e.movementX;
          break;
        }

        case "bottom-right": {
          this.height += e.movementY;
          this.width += e.movementX;
          break;
        }

        case "bottom-left": {
          this.height += e.movementY;
          this.width -= e.movementX;
          this.x += e.movementX;
          break;
        }
      }

      this.renderSelectionControls();
    }

    if (this.isDragging) {
      this.x += e.movementX;
      this.y += e.movementY;
    }
  }

  private handlePointerUp() {
    if (!this.isFocused) return;

    this.isResizing = undefined;
    this.isDragging = false;
  }
}
