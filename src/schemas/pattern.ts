import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";
import { Color } from "pixi.js";

import { PaletteSettings } from "./display.ts";

export class PatternInfo {
  title: string;
  author: string;
  copyright: string;
  description: string;

  constructor(data: b.infer<typeof PatternInfo.schema>) {
    this.title = data.title;
    this.author = data.author;
    this.copyright = data.copyright;
    this.description = data.description;
  }

  static readonly schema = b.struct({
    title: b.string(),
    author: b.string(),
    copyright: b.string(),
    description: b.string(),
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PatternInfo(PatternInfo.schema.deserialize(buffer));
  }

  static serialize(data: PatternInfo) {
    return PatternInfo.schema.serialize(data);
  }
}

export class Fabric {
  width: number;
  height: number;
  spi: [number, number];
  kind: string;
  name: string;
  color: Color;

  constructor(data: b.infer<typeof Fabric.schema>) {
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

export enum FullStitchKind {
  Full = "Full",
  Petite = "Petite",
}
export class FullStitch {
  x: number;
  y: number;
  palindex: number;
  kind: FullStitchKind;

  constructor(data: b.infer<typeof FullStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    palindex: b.u32(),
    kind: b.nativeEnum(FullStitchKind),
  });
}

export enum PartStitchDirection {
  Forward = "Forward",
  Backward = "Backward",
}
export enum PartStitchKind {
  Half = "Half",
  Quarter = "Quarter",
}
export class PartStitch {
  x: number;
  y: number;
  palindex: number;
  direction: PartStitchDirection;
  kind: PartStitchKind;

  constructor(data: b.infer<typeof PartStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.direction = data.direction;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    palindex: b.u32(),
    direction: b.nativeEnum(PartStitchDirection),
    kind: b.nativeEnum(PartStitchKind),
  });
}

export enum LineStitchKind {
  Back = "Back",
  Straight = "Straight",
}
export class LineStitch {
  x: [number, number];
  y: [number, number];
  palindex: number;
  kind: LineStitchKind;

  constructor(data: b.infer<typeof LineStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.tuple(b.f32(), b.f32()),
    y: b.tuple(b.f32(), b.f32()),
    palindex: b.u32(),
    kind: b.nativeEnum(LineStitchKind),
  });
}

export enum NodeStitchKind {
  FrenchKnot = "FrenchKnot",
  Bead = "Bead",
}
export class NodeStitch {
  x: number;
  y: number;
  rotated: boolean;
  palindex: number;
  kind: NodeStitchKind;

  constructor(data: b.infer<typeof NodeStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.rotated = data.rotated;
    this.kind = data.kind;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    rotated: b.bool(),
    palindex: b.u32(),
    kind: b.nativeEnum(NodeStitchKind),
  });
}

export class CurvedStitch {
  points: [number, number][];

  constructor(data: b.infer<typeof CurvedStitch.schema>) {
    this.points = data.points;
  }

  static readonly schema = b.struct({
    points: b.vec(b.tuple(b.f32(), b.f32())),
  });
}

export class SpecialStitch {
  x: number;
  y: number;
  rotation: number;
  flip: [boolean, boolean];
  palindex: number;
  modindex: number;

  constructor(data: b.infer<typeof SpecialStitch.schema>) {
    this.x = data.x;
    this.y = data.y;
    this.palindex = data.palindex;
    this.modindex = data.modindex;
    this.rotation = data.rotation;
    this.flip = data.flip;
  }

  static readonly schema = b.struct({
    x: b.f32(),
    y: b.f32(),
    rotation: b.u16(),
    flip: b.tuple(b.bool(), b.bool()),
    palindex: b.u32(),
    modindex: b.u32(),
  });
}

export class SpecialStitchModel {
  uniqueName: string;
  name: string;
  width: number;
  height: number;
  nodestitches: NodeStitch[];
  linestitches: LineStitch[];
  curvedstitches: CurvedStitch[];

  constructor(data: b.infer<typeof SpecialStitchModel.schema>) {
    this.uniqueName = data.uniqueName;
    this.name = data.name;
    this.width = data.width;
    this.height = data.height;
    this.nodestitches = data.nodestitches.map((stitch) => new NodeStitch(stitch));
    this.linestitches = data.linestitches.map((stitch) => new LineStitch(stitch));
    this.curvedstitches = data.curvedstitches.map((stitch) => new CurvedStitch(stitch));
  }

  static readonly schema = b.struct({
    uniqueName: b.string(),
    name: b.string(),
    width: b.f32(),
    height: b.f32(),
    nodestitches: b.vec(NodeStitch.schema),
    linestitches: b.vec(LineStitch.schema),
    curvedstitches: b.vec(CurvedStitch.schema),
  });
}

export class Pattern {
  info: PatternInfo;
  fabric: Fabric;
  palette: PaletteItem[];
  fullstitches: FullStitch[];
  partstitches: PartStitch[];
  linestitches: LineStitch[];
  nodestitches: NodeStitch[];
  specialstitches: SpecialStitch[];
  specialStitchModels: SpecialStitchModel[];

  constructor(data: b.infer<typeof Pattern.schema>) {
    this.info = new PatternInfo(data.info);
    this.fabric = new Fabric(data.fabric);
    this.palette = data.palette.map((item) => new PaletteItem(item));
    this.fullstitches = data.fullstitches.map((stitch) => new FullStitch(stitch));
    this.partstitches = data.partstitches.map((stitch) => new PartStitch(stitch));
    this.linestitches = data.linestitches.map((stitch) => new LineStitch(stitch));
    this.nodestitches = data.nodestitches.map((stitch) => new NodeStitch(stitch));
    this.specialstitches = data.specialstitches.map((stitch) => new SpecialStitch(stitch));
    this.specialStitchModels = data.specialStitchModels.map((model) => new SpecialStitchModel(model));
  }

  static readonly schema = b.struct({
    info: PatternInfo.schema,
    fabric: Fabric.schema,
    palette: b.vec(PaletteItem.schema),
    fullstitches: b.vec(FullStitch.schema),
    partstitches: b.vec(PartStitch.schema),
    linestitches: b.vec(LineStitch.schema),
    nodestitches: b.vec(NodeStitch.schema),
    specialstitches: b.vec(SpecialStitch.schema),
    specialStitchModels: b.vec(SpecialStitchModel.schema),
  });
}

export type Stitch = FullStitch | PartStitch | NodeStitch | LineStitch;
export type StitchKind = FullStitchKind | PartStitchKind | NodeStitchKind | LineStitchKind;
