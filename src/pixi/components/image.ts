import { ImageSource, Sprite, Texture, type ContainerOptions } from "pixi.js";

import type { ReferenceImage } from "#/schemas/image.ts";
import { DEFAULT_CONTAINER_OPTIONS } from "#/pixi/constants.ts";
import { OutlineSelection } from "./utils/";

export class ReferenceImageContainer extends OutlineSelection {
  constructor(options?: ContainerOptions) {
    super({ ...DEFAULT_CONTAINER_OPTIONS, ...options });
  }

  async setImage(image: ReferenceImage) {
    const resource = await createImageBitmap(image);
    const texture = new Texture({ source: new ImageSource({ resource }) });

    this.removeChildren();
    this.addChild(
      new Sprite({
        ...DEFAULT_CONTAINER_OPTIONS,
        texture,
        label: "Reference Image",
      }),
    );
  }

  removeImage() {
    this.removeChildren();
  }
}
