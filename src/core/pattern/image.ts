import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

export class ReferenceImage extends Blob {
  constructor(data: b.infer<typeof ReferenceImage.schema>) {
    super([data]);
  }

  static readonly schema = b.vec(b.u8());

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new ReferenceImage(ReferenceImage.schema.deserialize(buffer));
  }
}
