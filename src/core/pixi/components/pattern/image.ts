import { ImageSource, Rectangle, Sprite, Texture, type ContainerOptions } from "pixi.js";

import { ReferenceImage, ReferenceImageSettings } from "#/core/pattern/";
import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/constants.ts";
import { OutlineSelection } from "../utils";

export class ReferenceImageView extends OutlineSelection<Sprite> {
  constructor(options?: ContainerOptions) {
    const target = new Sprite({
      ...DEFAULT_CONTAINER_OPTIONS,
      label: "Reference Image",
      eventMode: "static",
      interactive: true,
    });

    super(target, { ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  /** Sets the reference image. */
  async setImage(image: ReferenceImage) {
    this.removeImage();

    this.target.texture = new Texture({
      source: new ImageSource({
        resource: await createImageBitmap(image),
      }),
    });

    // this.boundsArea = new Rectangle(0, 0, this.target.width, this.target.height);
    this.settings = image.settings;
  }

  /** Removes the reference image. */
  removeImage() {
    this.blur();
    this.target.texture = Texture.EMPTY;
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
    return new ReferenceImageSettings(this);
  }

  /** Sets the settings for the reference image. */
  set settings(settings: ReferenceImageSettings) {
    const { x, y, width, height } = settings;
    this.target.setSize(width, height);
    this.position.set(x, y);
    this.boundsArea = new Rectangle(0, 0, width, height);
  }
}
