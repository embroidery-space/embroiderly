import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Color } from "pixi.js";

import { PaletteSettings } from "./palette";
import { BasePaletteItem } from "./palette";

export class Fabric {
  width: number;
  height: number;
  spi: [number, number];
  kind: string;
  name: string;
  color: Color;

  constructor(data?: Fabric | b.infer<typeof Fabric.schema>) {
    this.width = data?.width ?? 100;
    this.height = data?.height ?? 100;
    this.spi = data?.spi ?? [14, 14];
    this.kind = data?.kind ?? "Aida";
    this.name = data?.name ?? "White";
    this.color = new Color(data?.color ?? "FFFFFF");
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
}

/** Represents a fabric color. */
export class FabricColor extends BasePaletteItem {
  // oxlint-disable-next-line no-useless-constructor
  constructor(index: number, data: b.infer<typeof FabricColor.schema>) {
    super(index, data);
  }

  static readonly schema = b.struct({
    name: b.string(),
    color: b.string(),
  });

  getTitle(_options?: PaletteSettings) {
    return this.name;
  }

  equals(other: FabricColor) {
    return this.name === other.name;
  }
}

export function deserializeFabricColors(data: Uint8Array | string) {
  const buffer = typeof data === "string" ? toByteArray(data) : data;
  return b
    .vec(FabricColor.schema)
    .deserialize(buffer)
    .map((color, index) => new FabricColor(index, color));
}
