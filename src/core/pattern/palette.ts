import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Color } from "pixi.js";

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

export class Symbol {
  value: b.infer<typeof Symbol.schema> | null;

  constructor(data: b.infer<typeof Symbol.schema> | null) {
    this.value = data;
  }

  static readonly schema = b.enum({
    code: b.u16(),
    char: b.string(),
  });
}

export class PaletteItem {
  brand: string;
  number: string;
  name: string;
  blends?: Blend[];
  symbolFont?: string;

  private _color: Color;
  private _symbolCode?: number;

  constructor(data: b.infer<typeof PaletteItem.schema>) {
    this.brand = data.brand;
    this.number = data.number;
    this.name = data.name;
    this._color = new Color(data.color);

    if (data.blends) this.blends = data.blends.map((blend) => new Blend(blend));

    if (data.symbolFont) this.symbolFont = data.symbolFont;
    if (data.symbol) {
      if ("code" in data.symbol) this._symbolCode = data.symbol.code;
      else this._symbolCode = data.symbol.char.codePointAt(0);
    }
  }

  static readonly schema = b.struct({
    brand: b.string(),
    number: b.string(),
    name: b.string(),
    color: b.string(),
    blends: b.option(b.vec(Blend.schema)),
    symbolFont: b.option(b.string()),
    symbol: b.option(b.enum({ code: b.u16(), char: b.string() })),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PaletteItem(PaletteItem.schema.deserialize(buffer));
  }

  static serialize(data: PaletteItem) {
    return PaletteItem.schema.serialize({
      brand: data.brand,
      number: data.number,
      name: data.name,
      color: data.color,
      blends: data.blends ?? null,
      symbolFont: data.symbolFont ?? null,
      symbol: data._symbolCode ? { code: data._symbolCode } : null,
    });
  }

  get hex() {
    return this._color.toHex().toUpperCase();
  }

  get color() {
    return this.hex.slice(1);
  }

  get contrastColor() {
    const [r, g, b] = this._color.toUint8RgbArray() as [number, number, number];
    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    return brightness > 128 ? "black" : "white";
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

  get symbol() {
    return this._symbolCode ? String.fromCodePoint(this._symbolCode) : "";
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
