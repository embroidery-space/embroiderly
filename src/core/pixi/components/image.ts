import { ImageSource, Sprite, Texture, type ContainerOptions } from "pixi.js";

import type { ReferenceImage } from "#/core/pattern/";
import { DEFAULT_CONTAINER_OPTIONS } from "#/core/pixi/constants.ts";
import { OutlineSelection } from "./utils/";

export class ReferenceImageContainer extends OutlineSelection {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  /** Sets the reference image. */
  async setImage(image: ReferenceImage) {
    const resource = await createImageBitmap(image);
    const texture = new Texture({ source: new ImageSource({ resource }) });

    this.removeImage();
    this.push(
      new Sprite({
        ...DEFAULT_CONTAINER_OPTIONS,
        texture,
        label: "Reference Image",
      }),
    );
  }

  /** Removes the reference image. */
  removeImage() {
    this.clear();
  }

  /** Resizes the reference image to fit within the specified dimensions. */
  fit(width: number, height: number) {
    const image = this.children[0];
    if (!image) return;

    const scaleX = width / image.width;
    const scaleY = height / image.height;

    this.scale.set(Math.min(scaleX, scaleY));
  }
}
