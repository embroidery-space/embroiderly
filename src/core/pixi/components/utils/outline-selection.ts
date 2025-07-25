import { Container, Graphics, GraphicsContext, type ContainerOptions, type StrokeStyle } from "pixi.js";

import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/";

const SELECTION_STOKE: StrokeStyle = { width: 1, color: "#b48ead" };
const SELECTION_CORNER_CONTEXT = new GraphicsContext()
  .circle(0, 0, 2)
  .fill("white")
  .stroke({ pixelLine: true, alignment: 0, color: "#b48ead" });

export class OutlineSelection extends Container {
  #stages = {
    // lowest
    content: new Container({ ...DEFAULT_CONTAINER_OPTIONS, label: "Selection Content" }),
    controls: new Container({ ...DEFAULT_CONTAINER_OPTIONS, label: "Selection Controls", interactiveChildren: true }),
    // highest
  };

  private isFocused = false;

  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options, interactiveChildren: true });
    this.addChild(...Object.values(this.#stages));
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
    if (this.isFocused) this.focus();
    this.renderSelectionControls();
  }

  /** Clears all children from the content container. */
  clear() {
    this.#stages.content.removeChildren();
    if (this.isFocused && this.#stages.content.children.length === 0) this.blur();
  }

  /** Focuses the selection container. */
  focus() {
    this.isFocused = true;

    this.#stages.controls.visible = true;
    this.#stages.controls.renderable = true;
  }

  /** Blurs the selection container. */
  blur() {
    this.isFocused = false;

    this.#stages.controls.visible = false;
    this.#stages.controls.renderable = false;
  }

  private renderSelectionControls() {
    const { width, height } = this.#stages.content.getSize();

    const tEdge = new Graphics().moveTo(0, 0).lineTo(width, 0).fill("white").stroke(SELECTION_STOKE);
    const rEdge = new Graphics().moveTo(width, 0).lineTo(width, height).fill("white").stroke(SELECTION_STOKE);
    const bEdge = new Graphics().moveTo(0, height).lineTo(width, height).fill("white").stroke(SELECTION_STOKE);
    const lEdge = new Graphics().moveTo(0, 0).lineTo(0, height).fill("white").stroke(SELECTION_STOKE);

    tEdge.eventMode = rEdge.eventMode = bEdge.eventMode = lEdge.eventMode = "static";
    tEdge.cursor = bEdge.cursor = "ns-resize";
    rEdge.cursor = lEdge.cursor = "ew-resize";

    const tlCorner = new Graphics(SELECTION_CORNER_CONTEXT);
    tlCorner.position.set(0, 0);
    const trCorner = new Graphics(SELECTION_CORNER_CONTEXT);
    trCorner.position.set(width, 0);
    const blCorner = new Graphics(SELECTION_CORNER_CONTEXT);
    blCorner.position.set(0, height);
    const brCorner = new Graphics(SELECTION_CORNER_CONTEXT);
    brCorner.position.set(width, height);

    tlCorner.eventMode = trCorner.eventMode = blCorner.eventMode = brCorner.eventMode = "static";
    tlCorner.cursor = brCorner.cursor = "nwse-resize";
    trCorner.cursor = blCorner.cursor = "nesw-resize";

    this.#stages.controls.removeChildren().forEach((child) => child.destroy());
    this.#stages.controls.addChild(tEdge, rEdge, bEdge, lEdge);
    this.#stages.controls.addChild(tlCorner, trCorner, blCorner, brCorner);
  }
}
