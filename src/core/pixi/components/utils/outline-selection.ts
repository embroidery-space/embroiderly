import { Container, FederatedPointerEvent, Graphics, GraphicsContext, Rectangle } from "pixi.js";
import type { ContainerOptions, DestroyOptions, Size, StrokeStyle } from "pixi.js";

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
  readonly controls = new SelectionControls();

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
      this.controls.render(this.target.getSize());
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
      const prevPos = this.parent.toLocal(e.global.subtract(e.movement));
      const delta = pos.subtract(prevPos);
      this.position = this.position.add(delta);
    }
  }

  private handlePointerUp() {
    this.isResizing = undefined;
    this.isDragging = false;
  }
}

/** Internal class for managing selection control graphics. */
class SelectionControls extends Container {
  // Edge graphics
  private readonly tEdge = new Graphics({ label: "top" });
  private readonly rEdge = new Graphics({ label: "right" });
  private readonly bEdge = new Graphics({ label: "bottom" });
  private readonly lEdge = new Graphics({ label: "left" });

  // Corner graphics
  private readonly tlCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "top-left" });
  private readonly trCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "top-right" });
  private readonly blCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "bottom-left" });
  private readonly brCorner = new Graphics({ context: SELECTION_CORNER_CONTEXT, label: "bottom-right" });

  constructor() {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      label: "Selection Controls",
      interactiveChildren: true,
      visible: false,
      renderable: false,
    });

    this.tEdge.eventMode = this.rEdge.eventMode = this.bEdge.eventMode = this.lEdge.eventMode = "static";
    this.tEdge.cursor = this.bEdge.cursor = "ns-resize";
    this.rEdge.cursor = this.lEdge.cursor = "ew-resize";

    this.tlCorner.eventMode = this.trCorner.eventMode = this.blCorner.eventMode = this.brCorner.eventMode = "static";
    this.tlCorner.cursor = this.brCorner.cursor = "nwse-resize";
    this.trCorner.cursor = this.blCorner.cursor = "nesw-resize";

    this.tlCorner.scale.set(0.1);
    this.trCorner.scale.set(0.1);
    this.blCorner.scale.set(0.1);
    this.brCorner.scale.set(0.1);

    this.addChild(this.tEdge, this.rEdge, this.bEdge, this.lEdge);
    this.addChild(this.tlCorner, this.trCorner, this.blCorner, this.brCorner);
  }

  /**
   * Renders the selection controls with the specified dimensions.
   * @param size - The dimensions of the selection controls.
   */
  render(size: Size) {
    const { width, height } = size;

    this.tEdge.clear();
    this.tEdge.moveTo(0, 0).lineTo(width, 0).fill("white").stroke(SELECTION_STOKE);

    this.rEdge.clear();
    this.rEdge.moveTo(width, 0).lineTo(width, height).fill("white").stroke(SELECTION_STOKE);

    this.bEdge.clear();
    this.bEdge.moveTo(0, height).lineTo(width, height).fill("white").stroke(SELECTION_STOKE);

    this.lEdge.clear();
    this.lEdge.moveTo(0, 0).lineTo(0, height).fill("white").stroke(SELECTION_STOKE);

    this.tlCorner.position.set(0, 0);
    this.trCorner.position.set(width, 0);
    this.blCorner.position.set(0, height);
    this.brCorner.position.set(width, height);
  }
}
