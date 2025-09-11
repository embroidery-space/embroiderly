import { Graphics, ImageSource, Rectangle, Sprite, Texture, type ContainerOptions, type Size } from "pixi.js";

import { ReferenceImage, ReferenceImageSettings } from "~/core/pattern/";
import { DEFAULT_CONTAINER_OPTIONS } from "~/core/pixi/constants.ts";
import { Slider } from "../ui/";
import { OutlineSelection, SELECTION_CONTROL_STROKE, SELECTION_STROKE_COLOR, SelectionControls } from "../utils/";

export class ReferenceImageView extends OutlineSelection<Sprite, ReferenceImageSelectionControls> {
  constructor(options?: ContainerOptions) {
    const target = new Sprite({
      ...DEFAULT_CONTAINER_OPTIONS,
      label: "Reference Image",
      eventMode: "static",
      interactive: true,
    });

    super(target, new ReferenceImageSelectionControls(), { ...DEFAULT_CONTAINER_OPTIONS, ...options });

    this.controls.opacityControl.onUpdate(({ value }) => {
      // The `alpha` value is in range from 0 (transparent) to 1 (opaque).
      // The control has values from 10 (min) to 100 (max).
      // We divide the value by the max value to get the `alpha` value.
      // We don't use a normalized value here since it will always be in range from 0 to 1, while we need the value from 0.1 to 1;
      this.target.alpha = value / this.controls.opacityControl.max;
    });
  }

  /** Sets the reference image. */
  async setImage(image: ReferenceImage) {
    this.removeImage();

    this.target.texture = new Texture({
      source: new ImageSource({
        resource: await createImageBitmap(image),
      }),
    });

    this.settings = image.settings;
  }

  /** Removes the reference image. */
  removeImage() {
    this.blur();

    const texture = this.target.texture;
    this.target.texture = Texture.EMPTY;
    texture.destroy();
  }

  /**
   * Fits the reference image to the given pattern dimensions.
   * @param width The width of the pattern.
   * @param height The height of the pattern.
   */
  fit(width: number, height: number) {
    const scaleX = width / this.target.width;
    const scaleY = height / this.target.height;
    this.target.scale.set(Math.min(scaleX, scaleY));
    this.boundsArea = new Rectangle(0, 0, this.target.width, this.target.height);
  }

  /** Returns the settings for the reference image. */
  get settings() {
    const { x, y } = this.position;
    const { width, height } = this.target.getSize();
    const rotation = this.angle;
    const opacity = this.target.alpha;
    return new ReferenceImageSettings({ x, y, width, height, rotation, opacity });
  }

  /** Sets the settings for the reference image. */
  set settings(settings: ReferenceImageSettings) {
    const { x, y, width, height, rotation, opacity } = settings;

    this.target.setSize(width, height);
    this.target.alpha = opacity;

    this.position.set(x, y);
    this.origin.set(width / 2, height / 2);
    this.angle = rotation;
    this.boundsArea = new Rectangle(0, 0, width, height);

    this.controls.opacityControl.value = opacity * this.controls.opacityControl.max;
  }
}

class ReferenceImageSelectionControls extends SelectionControls {
  readonly opacityControl = new OpacityControl();

  constructor() {
    super();
    this.addChild(this.opacityControl);
  }

  override render(size: Size, rotation: number) {
    super.render(size, rotation);
    const { width: w, height: h } = size;

    this.opacityControl.position.set(w - this.opacityControl.track.width - 1, h + 1);
  }
}

class OpacityControl extends Slider {
  constructor() {
    const track = new Graphics().roundRect(0, 0, 100, 4, 100).fill("lightgrey").stroke(SELECTION_CONTROL_STROKE);
    track.scale.set(0.1);

    super({ track, handle: new Graphics(), min: 10 });
    this.label = "opacity";

    this.renderOpacityHandler(this.value);
    this.onUpdate(({ normalized }) => this.renderOpacityHandler(normalized));
  }

  /** Renders the handler as a sun icon which lights length is adjusted based on the current value. */
  private renderOpacityHandler(value: number) {
    this.handle.clear();

    // Draw the sun body.
    this.handle.circle(0, 0, 3).fill("white").stroke(SELECTION_CONTROL_STROKE);

    // Draw 8 sun lights with even gaps (45 degrees between each).
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      const startRadius = 6;

      const startX = cos * startRadius;
      const startY = sin * startRadius;

      const endX = cos * (startRadius + value + 0.01);
      const endY = sin * (startRadius + value + 0.01);

      this.handle
        // Draw outer stroke (border).
        .moveTo(startX, startY)
        .lineTo(endX, endY)
        .stroke({ width: 2.25, color: SELECTION_STROKE_COLOR, cap: "round" })
        // Draw inner stroke (fill).
        .moveTo(startX, startY)
        .lineTo(endX, endY)
        .stroke({ width: 2, color: "white", cap: "round" });
    }

    this.handle.scale.set(0.1);
  }
}
