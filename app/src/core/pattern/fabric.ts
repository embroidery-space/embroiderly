import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Color } from "pixi.js";

import { BasePaletteItem } from "./palette";
import { PaletteSettings } from "./display";

export class Fabric {
  width: number;
  height: number;
  spi: [number, number];
  kind: string;
  name: string;
  color: Color;

  constructor(data: Fabric | b.infer<typeof Fabric.schema>) {
    this.width = data.width;
    this.height = data.height;
    this.spi = data.spi;
    this.kind = data.kind;
    this.name = data.name;
    this.color = new Color(data.color);
  }

  static readonly schema = b.struct({
    width: b.u16(),
    height: b.u16(),
    spi: b.tuple(b.u8(), b.u8()),
    kind: b.string(),
    name: b.string(),
    color: b.string(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new Fabric(Fabric.schema.deserialize(buffer));
  }

  static serialize(data: Fabric) {
    return Fabric.schema.serialize({ ...data, color: data.color.toHex().slice(1).toUpperCase() });
  }

  static default() {
    return new Fabric({ width: 100, height: 100, spi: [14, 14], name: "White", color: "FFFFFF", kind: "Aida" });
  }
}

/** Represents a fabric color. */
export class FabricColor extends BasePaletteItem {
  constructor(data: b.infer<typeof FabricColor.schema>) {
    super(data);
  }

  static readonly schema = b.struct({
    name: b.string(),
    color: b.string(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new FabricColor(FabricColor.schema.deserialize(buffer));
  }

  static serialize(data: FabricColor) {
    return FabricColor.schema.serialize({
      name: data.name,
      color: data.hex.slice(1),
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTitle(_options = PaletteSettings.default()) {
    return this.name;
  }

  compare(other: FabricColor) {
    return this.name === other.name;
  }
}

export function deserializeFabricColors(data: Uint8Array | string) {
  const buffer = typeof data === "string" ? toByteArray(data) : data;
  return b
    .vec(FabricColor.schema)
    .deserialize(buffer)
    .map((color) => new FabricColor(color));
}
