import { Container, FederatedPointerEvent, Graphics, GraphicsContext, Point, Rectangle } from "pixi.js";
import type { ContainerOptions, DestroyOptions, Size, StrokeStyle } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/";
import { checkIfHorizontallyOriented, getCursorForRotation, getMouseButtons } from "#/core/pixi/utils/";

const SELECTION_STOKE: StrokeStyle = { width: 0.1, color: "#b48ead" };
const SELECTION_CORNER_CONTROL_CONTEXT = new GraphicsContext()
  .roundRect(0, 0, 6, 6, 2)
  .fill("white")
  .stroke({ pixelLine: true, alignment: 0, color: "#b48ead" });
const SELECTION_ROTATION_CONTROL_CONTEXT = new GraphicsContext()
  .circle(0, 0, 2)
  .fill("white")
  .stroke({ pixelLine: true, alignment: 0, color: "#b48ead" });

export class OutlineSelection<T extends Container = Container> extends Container {
  /** The target element that is being selected. */
  readonly target: T;
  /** The container that holds the selection controls. */
  readonly controls = new SelectionControls();

  private isFocused = false;

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

      // Update the bounds area and origin after possible transformations.
      this.boundsArea = new Rectangle(0, 0, this.target.width, this.target.height);
      this.origin.set(this.width / 2, this.height / 2);

      // Render the controls after updating the bounds and origin.
      this.controls.render(this.target.getSize(), this.rotation);
    };

    this.on("pointerdown", this.handlePointerDown, this);
    this.on("pointerup", this.handlePointerUp, this);
    this.on("pointerupoutside", this.handlePointerUp, this);
    this.on("pointercancel", this.handlePointerUp, this);
  }

  override destroy(options?: DestroyOptions): void {
    // @ts-expect-error ...
    this.onRender = null;

    this.removeAllListeners();

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

    // Bind appropriate handler based on the target.
    if (e.target instanceof Graphics) {
      if (e.target.label === "rotation") this.on("pointermove", this.handleRotating, this);
      else {
        const direction = e.target.label;
        this.on("pointermove", (e) => this.handleResizing(e, direction), this);
      }
    } else this.on("pointermove", this.handleDragging, this);
  }

  private handlePointerUp() {
    this.removeAllListeners("pointermove");
  }

  private handleDragging(e: FederatedPointerEvent) {
    const currPos = this.parent!.toLocal(e.global);
    const prevPos = this.parent!.toLocal(e.global.subtract(e.movement));

    const delta = currPos.subtract(prevPos);
    this.position = this.position.add(delta);
  }

  private handleResizing(e: FederatedPointerEvent, direction: string) {
    const currPos = this.parent!.toLocal(e.global);
    const prevPos = this.parent!.toLocal(e.global.subtract(e.movement));
    const globalDelta = currPos.subtract(prevPos);

    const cos = Math.cos(this.rotation);
    const sin = Math.sin(this.rotation);

    const localDelta = new Point(globalDelta.x * cos + globalDelta.y * sin, -globalDelta.x * sin + globalDelta.y * cos);

    let dw = 0;
    let dh = 0;
    let dx = 0;
    let dy = 0;

    if (direction.includes("left")) {
      dw = -localDelta.x;
      dx = localDelta.x;
    } else if (direction.includes("right")) {
      dw = localDelta.x;
    }

    if (direction.includes("top")) {
      dh = -localDelta.y;
      dy = localDelta.y;
    } else if (direction.includes("bottom")) {
      dh = localDelta.y;
    }

    this.target.width += dw;
    this.target.height += dh;

    if (dx !== 0 || dy !== 0) {
      this.x += dx * cos - dy * sin;
      this.y += dx * sin + dy * cos;
    }
  }

  private handleRotating(e: FederatedPointerEvent) {
    // Calculate the current and previous positions relative to the parent container.
    const currPos = this.parent!.toLocal(e.global);
    const prevPos = this.parent!.toLocal(e.global.subtract(e.movement));
    const delta = currPos.subtract(prevPos);

    // Multiply the delta by a factor to increase the rotation speed.
    // (The movement delta is too low for convenient rotation)
    this.angle += (checkIfHorizontallyOriented(this.rotation) ? delta.x : delta.y) * 5;
  }
}

/** Internal class for managing selection control graphics. */
class SelectionControls extends Container {
  private readonly tEdge = new Graphics({ label: "top" });
  private readonly rEdge = new Graphics({ label: "right" });
  private readonly bEdge = new Graphics({ label: "bottom" });
  private readonly lEdge = new Graphics({ label: "left" });

  private readonly tlCorner = new Graphics({ context: SELECTION_CORNER_CONTROL_CONTEXT, label: "top-left" });
  private readonly trCorner = new Graphics({ context: SELECTION_CORNER_CONTROL_CONTEXT, label: "top-right" });
  private readonly blCorner = new Graphics({ context: SELECTION_CORNER_CONTROL_CONTEXT, label: "bottom-left" });
  private readonly brCorner = new Graphics({ context: SELECTION_CORNER_CONTROL_CONTEXT, label: "bottom-right" });

  private readonly rotationControl = new Graphics({ context: SELECTION_ROTATION_CONTROL_CONTEXT, label: "rotation" });

  constructor() {
    super({
      ...DEFAULT_CONTAINER_OPTIONS,
      label: "Selection Controls",
      interactiveChildren: true,
      visible: false,
      renderable: false,
    });

    this.tEdge.eventMode = this.rEdge.eventMode = this.bEdge.eventMode = this.lEdge.eventMode = "static";
    this.tlCorner.eventMode = this.trCorner.eventMode = this.blCorner.eventMode = this.brCorner.eventMode = "static";

    for (const control of [this.tlCorner, this.trCorner, this.blCorner, this.brCorner]) {
      control.pivot.set(3, 3);
      control.scale.set(0.05);
    }

    this.rotationControl.eventMode = "static";
    this.rotationControl.cursor = "grab";
    this.rotationControl.scale.set(0.1);

    this.addChild(this.tEdge, this.rEdge, this.bEdge, this.lEdge);
    this.addChild(this.tlCorner, this.trCorner, this.blCorner, this.brCorner);
    this.addChild(this.rotationControl);
  }

  /**
   * Renders the selection controls with the specified dimensions.
   * @param size - The dimensions of the selection controls.
   * @param rotation - The rotation (in radians) of the selection container.
   */
  render(size: Size, rotation: number) {
    const { width: w, height: h } = size;

    this.tEdge.clear().moveTo(0, 0).lineTo(w, 0).fill("white").stroke(SELECTION_STOKE);
    this.rEdge.clear().moveTo(w, 0).lineTo(w, h).fill("white").stroke(SELECTION_STOKE);
    this.bEdge.clear().moveTo(0, h).lineTo(w, h).fill("white").stroke(SELECTION_STOKE);
    this.lEdge.clear().moveTo(0, 0).lineTo(0, h).fill("white").stroke(SELECTION_STOKE);

    this.tEdge.cursor = this.bEdge.cursor = getCursorForRotation("ns-resize", rotation);
    this.lEdge.cursor = this.rEdge.cursor = getCursorForRotation("ew-resize", rotation);

    this.tlCorner.position.set(0, 0);
    this.trCorner.position.set(w, 0);
    this.blCorner.position.set(0, h);
    this.brCorner.position.set(w, h);

    this.tlCorner.cursor = this.brCorner.cursor = getCursorForRotation("nwse-resize", rotation);
    this.trCorner.cursor = this.blCorner.cursor = getCursorForRotation("nesw-resize", rotation);

    this.rotationControl.position.set(w / 2, -1);
  }
}
