import { ImageSource, Sprite, Texture, type ContainerOptions } from "pixi.js";

import { ReferenceImage, ReferenceImageSettings } from "#/core/pattern/";
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
        interactive: true,
      }),
    );
  }

  /** Removes the reference image. */
  removeImage() {
    this.clear();
  }

  /** Resizes the reference image to fit within the specified dimensions. */
  fit(width: number, height: number) {
    if (!this.child) return;

    const scaleX = width / this.child.width;
    const scaleY = height / this.child.height;

    this.scale.set(Math.min(scaleX, scaleY));
  }

  get transformations(): ReferenceImageSettings | undefined {
    if (!this.child) return undefined;

    const { x, y } = this.position;
    const { width, height } = this.child.getSize();

    return new ReferenceImageSettings({ x, y, width, height });
  }

  set transformations(settings: ReferenceImageSettings) {
    if (!this.child) return;
    const { x, y, width, height } = settings;

    this.position.set(x, y);

    this.child.width = width;
    this.child.height = height;
  }
}
