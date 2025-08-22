import { ImageSource, Sprite, Texture, type ContainerOptions } from "pixi.js";

import { ReferenceImage, ReferenceImageSettings } from "#/core/pattern/";
import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/constants.ts";
import { OutlineSelection } from "../utils";

export class ReferenceImageView extends OutlineSelection {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  /** Sets the reference image. */
  async setImage(image: ReferenceImage) {
    const resource = await createImageBitmap(image);
    const texture = new Texture({ source: new ImageSource({ resource }) });

    this.removeImage();
    this.addChild(
      new Sprite({
        ...DEFAULT_CONTAINER_OPTIONS,
        texture,
        label: "Reference Image",
        eventMode: "static",
        interactive: true,
      }),
    );
  }

  /** Removes the reference image. */
  removeImage() {
    this.removeChildren().forEach((child) => child.destroy(true));
  }

  /** Returns the settings for the reference image. */
  get settings() {
    return new ReferenceImageSettings(this);
  }

  /** Sets the settings for the reference image. */
  set settings(settings: ReferenceImageSettings) {
    const { x, y, width, height } = settings;
    this.position.set(x, y);
    this.setSize(width, height);
  }
}
