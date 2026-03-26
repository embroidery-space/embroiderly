import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Color } from "pixi.js";
import type { ColorSource } from "pixi.js";

export class PaletteSettings {
  columnsNumber: number;
  colorOnly: boolean;
  showStitchSymbols: boolean;
  stitchSymbolsOnContrastBackground: boolean;
  showColorBrands: boolean;
  showColorNumbers: boolean;
  showColorNames: boolean;

  constructor(data: b.infer<typeof PaletteSettings.schema>) {
    this.columnsNumber = data.columnsNumber;
    this.colorOnly = data.colorOnly;
    this.showStitchSymbols = data.showStitchSymbols;
    this.stitchSymbolsOnContrastBackground = data.stitchSymbolsOnContrastBackground;
    this.showColorBrands = data.showColorBrands;
    this.showColorNumbers = data.showColorNumbers;
    this.showColorNames = data.showColorNames;
  }

  static readonly schema = b.struct({
    columnsNumber: b.u8(),
    colorOnly: b.bool(),
    showStitchSymbols: b.bool(),
    stitchSymbolsOnContrastBackground: b.bool(),
    showColorBrands: b.bool(),
    showColorNumbers: b.bool(),
    showColorNames: b.bool(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PaletteSettings(PaletteSettings.schema.deserialize(buffer));
  }

  static serialize(data: PaletteSettings) {
    return PaletteSettings.schema.serialize(data);
  }

  static default(): PaletteSettings {
    return new PaletteSettings({
      columnsNumber: 1,
      colorOnly: true,
      showStitchSymbols: true,
      stitchSymbolsOnContrastBackground: true,
      showColorBrands: true,
      showColorNumbers: true,
      showColorNames: true,
    });
  }
}

export enum SortPaletteBy {
  BrandAndNumber = "BrandAndNumber",
}

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
  readonly code: number;
  readonly char: string;
  readonly font: string;

  constructor(data: b.infer<typeof Symbol.schema>) {
    this.code = data.code;
    this.char = String.fromCodePoint(data.code);
    this.font = data.font;
  }

  static readonly schema = b.struct({
    code: b.u32(),
    font: b.string(),
  });
}

/** Represents a base palette item. */
export abstract class BasePaletteItem {
  /**
   * An index of this palette item in the palette.
   * It is used to correctly identify an element when rendering a palette item using `v-for`.
   *
   * The reason to use a dedicated property instead of an actual index when iterating,
   * is that in some cases, palette items may be intentionally rendered in a different order,
   * which causes rendering issues due to the way Vue.js handles list rendering.
   */
  readonly index: number;

  name: string;
  color: Color;

  constructor(index: number, data: { name: string; color: ColorSource }) {
    this.index = index;

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

  abstract equals(other: this): boolean;
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

  constructor(index: number, data: b.infer<typeof BrandPaletteItem.schema>) {
    super(index, data);

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

  equals(other: BrandPaletteItem) {
    return this.brand === other.brand && this.number === other.number;
  }
}

/**
 * Represents a _working_ palette item
 *
 * This class extends the `BrandPaletteItem` class and adds additional properties for advanced displaying purposes.
 */
export class PaletteItem extends BrandPaletteItem {
  symbol?: Symbol;

  constructor(index: number, data: b.infer<typeof PaletteItem.schema>) {
    super(index, data);

    if (data.symbol) this.symbol = new Symbol(data.symbol);
  }

  static override readonly schema = b.struct({
    brand: b.string(),
    number: b.string(),
    name: b.string(),
    color: b.string(),
    blends: b.option(b.vec(Blend.schema)),
    symbol: b.option(Symbol.schema),
  });

  static override serialize(data: PaletteItem) {
    return PaletteItem.schema.serialize({
      brand: data.brand,
      number: data.number,
      name: data.name,
      color: data.hex.slice(1),
      blends: data.blends ?? null,
      symbol: data.symbol ? { code: data.symbol.code, font: data.symbol.font } : null,
    });
  }
}

export class AddedPaletteItemData {
  palitem: PaletteItem;
  palindex: number;

  constructor(data: b.infer<typeof AddedPaletteItemData.schema>) {
    this.palitem = new PaletteItem(data.palindex, data.palitem);
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

/** Manages palette items and their visual ordering. */
export class Palette {
  /** The actual palette items. */
  #items: PaletteItem[];
  /** Visual ordering of palette items. */
  #positions: number[];
  /** Display settings for the palette panel. */
  #settings: PaletteSettings;

  constructor(
    data: b.infer<typeof Palette.schema> | { items: b.infer<typeof PaletteItem.schema>[]; positions: number[] },
  ) {
    this.#items = data.items.map((item, index) => new PaletteItem(index, item));
    this.#positions = Array.from(data.positions);
    this.#settings =
      "settings" in data && data.settings ? new PaletteSettings(data.settings) : PaletteSettings.default();
  }

  static readonly schema = b.struct({
    items: b.vec(PaletteItem.schema),
    positions: b.vec(b.u32()),
    settings: PaletteSettings.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new Palette(Palette.schema.deserialize(buffer));
  }

  // === Access Methods ===

  /** The number of palette items. */
  get length(): number {
    return this.#items.length;
  }

  /** Read-only reference to items in actual order. */
  get items(): readonly PaletteItem[] {
    return this.#items;
  }

  /** Read-only reference to visual positions. */
  get positions(): readonly number[] {
    return this.#positions;
  }
  set positions(positions: number[]) {
    if (import.meta.env.DEV && positions.length !== this.#items.length) {
      throw new Error("Positions array length must match items length");
    }
    this.#positions = [...positions];
  }

  /** Palette display settings. */
  get settings(): PaletteSettings {
    return this.#settings;
  }
  set settings(settings: PaletteSettings) {
    this.#settings = settings;
  }

  /** Palette items in visual order. */
  get itemsInVisualOrder(): PaletteItem[] {
    return this.#positions.map((index) => this.#items[index]!);
  }

  /** Return an item by its actual index. */
  get(index: number): PaletteItem | undefined {
    return this.#items[index];
  }

  // === Mutation Methods ===

  /** Adds a new palette item, returning its actual index. */
  push(item: PaletteItem): number {
    const index = this.#items.length;
    this.#items.push(item);
    this.#positions.push(index);
    return index;
  }

  /** Inserts a palette item at a specific actual index. */
  insert(index: number, item: PaletteItem): void {
    // Insert the item at the actual index
    this.#items.splice(index, 0, item);

    // Update all positions that reference indexes >= index
    for (let i = 0; i < this.#positions.length; i++) {
      if (this.#positions[i]! >= index) this.#positions[i]! += 1;
    }

    // Find where the new index should be inserted in visual order
    // It goes right before the first position that is greater than index
    const position = this.#positions.findIndex((idx) => idx > index);
    const insertAt = position === -1 ? this.#positions.length : position;
    this.#positions.splice(insertAt, 0, index);
  }

  /** Removes a palette item by its actual index. */
  remove(index: number): PaletteItem | undefined {
    if (index < 0 || index >= this.#items.length) return undefined;

    const removed = this.#items.splice(index, 1)[0];

    // Remove from positions
    this.#positions = this.#positions.filter((idx) => idx !== index);

    // Update all positions that reference indexes > index
    for (let i = 0; i < this.#positions.length; i++) {
      if (this.#positions[i]! > index) this.#positions[i]! -= 1;
    }

    return removed;
  }
}

export class SetSymbolData {
  palindex: number;
  symbol?: Symbol;

  constructor(data: b.infer<typeof SetSymbolData.schema>) {
    this.palindex = data.palindex;
    if (data.symbol) this.symbol = new Symbol(data.symbol);
  }

  static readonly schema = b.struct({
    palindex: b.u32(),
    symbol: b.option(Symbol.schema),
  });

  static serialize(data: SetSymbolData) {
    return SetSymbolData.schema.serialize({
      palindex: data.palindex,
      symbol: data.symbol ?? null,
    });
  }

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new SetSymbolData(SetSymbolData.schema.deserialize(buffer));
  }
}

export function deserializeBrandPalette(data: Uint8Array | string) {
  const buffer = typeof data === "string" ? toByteArray(data) : data;
  return b
    .vec(BrandPaletteItem.schema)
    .deserialize(buffer)
    .map((palitem, index) => new BrandPaletteItem(index, palitem));
}
