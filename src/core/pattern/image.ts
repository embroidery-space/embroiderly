import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

export class ReferenceImageSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  constructor(data: b.infer<typeof ReferenceImageSettings.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.rotation = data.rotation;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    width: b.f32(),
    height: b.f32(),
    rotation: b.f32(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new ReferenceImageSettings(ReferenceImageSettings.schema.deserialize(buffer));
  }

  static serialize(data: ReferenceImageSettings) {
    return ReferenceImageSettings.schema.serialize(data);
  }
}

export class ReferenceImage extends Blob {
  settings: ReferenceImageSettings;

  constructor(data: b.infer<typeof ReferenceImage.schema>) {
    // Specify the content type to `Uint8Array<ArrayBuffer>` to fix the type mismatch.
    super([data.content as Uint8Array<ArrayBuffer>]);

    this.settings = new ReferenceImageSettings(data.settings);
  }

  static readonly schema = b.struct({
    content: b.vec(b.u8()),
    settings: ReferenceImageSettings.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    const result = b.option(ReferenceImage.schema).deserialize(buffer);
    return result ? new ReferenceImage(result) : undefined;
  }
}
