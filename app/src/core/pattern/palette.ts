import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Color, type ColorSource } from "pixi.js";

import { PaletteSettings } from "./display.ts";

export class Blend {
  brand: string;
  number: string;

  constructor(data: b.infer<typeof Blend.schema>) {
    this.brand = data.brand;
    this.number = data.number;
  }

  static readonly schema = b.struct({
    brand: b.string(),
    number: b.string(),
  });

  getTitle(options = PaletteSettings.default()) {
    const components = [];
    if (options.showColorBrands) components.push(this.brand);
    if (options.showColorNumbers) components.push(this.number);
    return components.join(" ").trim();
  }
}

export class Bead {
  length: number;
  diameter: number;

  constructor(data: b.infer<typeof Bead.schema>) {
    this.length = data.length;
    this.diameter = data.diameter;
  }

  static readonly schema = b.struct({
    length: b.f32(),
    diameter: b.f32(),
  });

  static default() {
    return new Bead({ length: 2.5, diameter: 1.5 });
  }
}

/** Represents a base palette item. */
export abstract class BasePaletteItem {
  name: string;
  color: Color;

  constructor(data: { name: string; color: ColorSource }) {
    this.name = data.name;
    this.color = new Color(data.color);
  }

  /** The hex color code in the format `#RRGGBB`. */
  get hex() {
    return this.color.toHex().toUpperCase();
  }

  /** The contrast color (`black` or `white`). */
  get contrastColor() {
    const [r, g, b] = this.color.toUint8RgbArray() as [number, number, number];
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    return brightness > 128 ? "black" : "white";
  }

  /** Return the color title. */
  abstract getTitle(options?: PaletteSettings): string;

  /**
   * Compare this palette item with another.
   *
   * Use this method for comparing following a custom logic.
   * That is, the method's implementation may compare palette items only by a specific fields, but not by all fields or by a refernce.
   */
  abstract compare(other: this): boolean;
}

/**
 * Represents a _brand_ palette item.
 *
 * It contains only essential properties for clearly identifying colors.
 */
export class BrandPaletteItem extends BasePaletteItem {
  brand: string;
  number: string;

  blends?: Blend[];

  constructor(data: b.infer<typeof BrandPaletteItem.schema>) {
    super(data);

    this.brand = data.brand;
    this.number = data.number;

    if (data.blends) this.blends = data.blends.map((blend) => new Blend(blend));
  }

  static readonly schema = b.struct({
    brand: b.string(),
    number: b.string(),
    name: b.string(),
    color: b.string(),
    blends: b.option(b.vec(Blend.schema)),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? Buffer.from(data, "base64") : data;
    return new BrandPaletteItem(BrandPaletteItem.schema.deserialize(buffer));
  }

  static serialize(data: BrandPaletteItem) {
    return BrandPaletteItem.schema.serialize({
      brand: data.brand,
      number: data.number,
      name: data.name,
      color: data.hex.slice(1),
      blends: data.blends ?? null,
    });
  }

  getTitle(options = PaletteSettings.default()) {
    const components = [];
    if (options.showColorBrands && this.brand) components.push(this.brand);
    if (this.blends?.length) {
      components.push(
        this.blends
          .map((blend) => blend.getTitle(options))
          .filter((s) => s.length)
          .join(", "),
      );
      return components.join(": ");
    }
    if (options.showColorNumbers && this.number) components.push(this.number);
    if (options.showColorNames && this.name) {
      if (!components.length) return this.name;
      return [components.join(" "), this.name].join(", ");
    }
    return components.join(" ");
  }

  compare(other: BrandPaletteItem): boolean {
    return this.brand === other.brand && this.number === other.number;
  }
}

/**
 * Represents a _working_ palette item
 *
 * This class extends the `BrandPaletteItem` class and adds additional properties for advanced displaying purposes.
 */
export class PaletteItem extends BrandPaletteItem {
  symbol?: string;
  symbolFont?: string;

  constructor(data: b.infer<typeof PaletteItem.schema>) {
    super(data);

    if (data.symbol) this.symbol = String.fromCodePoint(data.symbol);
    if (data.symbolFont) this.symbolFont = data.symbolFont;
  }

  static override readonly schema = b.struct({
    brand: b.string(),
    number: b.string(),
    name: b.string(),
    color: b.string(),
    blends: b.option(b.vec(Blend.schema)),
    symbol: b.option(b.u32()),
    symbolFont: b.option(b.string()),
  });

  static override deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PaletteItem(PaletteItem.schema.deserialize(buffer));
  }

  static override serialize(data: PaletteItem) {
    return PaletteItem.schema.serialize({
      brand: data.brand,
      number: data.number,
      name: data.name,
      color: data.hex.slice(1),
      blends: data.blends ?? null,
      symbol: data.symbol?.codePointAt(0) ?? null,
      symbolFont: data.symbolFont ?? null,
    });
  }
}

export class AddedPaletteItemData {
  palitem: PaletteItem;
  palindex: number;

  constructor(data: b.infer<typeof AddedPaletteItemData.schema>) {
    this.palitem = new PaletteItem(data.palitem);
    this.palindex = data.palindex;
  }

  static readonly schema = b.struct({
    palitem: PaletteItem.schema,
    palindex: b.u32(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new AddedPaletteItemData(AddedPaletteItemData.schema.deserialize(buffer));
  }
}

export function deserializeBrandPalette(data: Uint8Array | string) {
  const buffer = typeof data === "string" ? toByteArray(data) : data;
  return b
    .vec(BrandPaletteItem.schema)
    .deserialize(buffer)
    .map((palitem) => new BrandPaletteItem(palitem));
}
