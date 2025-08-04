import {
  Container,
  FederatedPointerEvent,
  Graphics,
  GraphicsContext,
  type ContainerOptions,
  type StrokeStyle,
} from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/";
import { getMouseButtons } from "#/core/pixi/utils/";

const SELECTION_STOKE: StrokeStyle = { width: 1, color: "#b48ead" };
const SELECTION_CORNER_CONTEXT = new GraphicsContext()
  .circle(0, 0, 2)
  .fill("white")
  .stroke({ pixelLine: true, alignment: 0, color: "#b48ead" });

type ResizeDirection = "top" | "right" | "bottom" | "left" | "top-left" | "top-right" | "bottom-right" | "bottom-left";

export class OutlineSelection extends Container {
  #stages = {
    // lowest
    content: new Container({ ...DEFAULT_CONTAINER_OPTIONS, label: "Selection Content", interactiveChildren: true }),
    controls: new Container({
      ...DEFAULT_CONTAINER_OPTIONS,
      label: "Selection Controls",
      interactiveChildren: true,
      visible: false,
      renderable: false,
    }),
    // highest
  };

  private isFocused = false;

  private isResizing?: ResizeDirection;
  private isDragging = false;

  constructor(options?: ContainerOptions) {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      ...options,
      interactive: true,
      interactiveChildren: true,
    });

    this.addChild(...Object.values(this.#stages));
    this.blur();

    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointermove", this.handlePointerMove, this);
    this.on("pointerup", this.handlePointerUp, this);
    this.on("pointerupoutside", this.handlePointerUp, this);
    this.on("pointercancel", this.handlePointerUp, this);
  }

  /** Returns the target child of the content container. */
  get child() {
    return this.#stages.content.children[0];
  }

  /** Returns the content of the selection container. */
  get content() {
    return this.#stages.content;
  }

  /** Returns the controls of the selection container. */
  get controls() {
    return this.#stages.controls;
  }

  /** Pushes children to the content container. */
  push(...children: Container[]) {
    this.#stages.content.addChild(...children);
    this.renderSelectionControls();
  }

  /** Clears all children from the content container. */
  clear() {
    this.#stages.content.removeChildren();
    if (this.isFocused) this.blur();
  }

  /** Focuses the selection container. */
  focus() {
    if (!this.child || this.isFocused) return;

    this.isFocused = true;

    this.child.cursor = "move";

    this.#stages.controls.visible = true;
    this.#stages.controls.renderable = true;
  }

  /** Blurs the selection container. */
  blur() {
    if (!this.child || !this.isFocused) return;

    this.isFocused = false;

    this.child.cursor = "default";

    this.#stages.controls.visible = false;
    this.#stages.controls.renderable = false;
  }

  private renderSelectionControls() {
    const { width, height } = this.#stages.content.getSize();

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

    this.#stages.controls.removeChildren().forEach((child) => child.destroy());
    this.#stages.controls.addChild(tEdge, rEdge, bEdge, lEdge);
    this.#stages.controls.addChild(tlCorner, trCorner, blCorner, brCorner);
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
    if (!this.child || !this.isFocused) return;

    if (this.isResizing) {
      switch (this.isResizing) {
        case "top": {
          this.child.height -= e.movementY;
          this.y += e.movementY * (this.height / this.child.height);
          break;
        }
        case "bottom": {
          this.child.height += e.movementY;
          break;
        }

        case "left": {
          this.child.width -= e.movementX;
          this.x += e.movementX;
          break;
        }
        case "right": {
          this.child.width += e.movementX;
          break;
        }

        case "top-left": {
          this.child.height -= e.movementY;
          this.y += e.movementY * (this.height / this.child.height);
          this.child.width -= e.movementX;
          this.x += e.movementX * (this.width / this.child.width);
          break;
        }

        case "top-right": {
          this.child.height -= e.movementY;
          this.y += e.movementY * (this.height / this.child.height);
          this.child.width += e.movementX;
          break;
        }

        case "bottom-right": {
          this.child.height += e.movementY;
          this.child.width += e.movementX;
          break;
        }

        case "bottom-left": {
          this.child.height += e.movementY;
          this.child.width -= e.movementX;
          this.x += e.movementX * (this.width / this.child.width);
          break;
        }
      }

      this.renderSelectionControls();
    }

    if (this.isDragging) {
      this.x += e.movementX * (this.width / this.child.width);
      this.y += e.movementY * (this.height / this.child.height);
    }
  }

  private handlePointerUp() {
    if (!this.isFocused) return;

    this.isResizing = undefined;
    this.isDragging = false;
  }
}
