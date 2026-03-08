import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

export class GridLine {
  color: string;
  thickness: number;

  constructor(data: b.infer<typeof GridLine.schema>) {
    this.color = data.color;
    this.thickness = data.thickness;
  }

  static readonly schema = b.struct({
    color: b.string(),
    thickness: b.f32(),
  });
}

export class Grid {
  majorLinesInterval: number;
  minorLines: GridLine;
  majorLines: GridLine;

  constructor(data: b.infer<typeof Grid.schema>) {
    this.majorLinesInterval = data.majorLinesInterval;
    this.minorLines = new GridLine(data.minorLines);
    this.majorLines = new GridLine(data.majorLines);
  }

  static readonly schema = b.struct({
    majorLinesInterval: b.u16(),
    minorLines: GridLine.schema,
    majorLines: GridLine.schema,
  });

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new Grid(Grid.schema.deserialize(buffer));
  }

  static serialize(data: Grid) {
    return Grid.schema.serialize(data);
  }
}

export enum DisplayMode {
  Solid = "Solid",
  Stitches = "Stitches",
  Mixed = "Mixed",
}

export class LayersVisibility {
  referenceImage: boolean;

  fullstitches: boolean;
  petitestitches: boolean;

  halfstitches: boolean;
  quarterstitches: boolean;

  backstitches: boolean;
  straightstitches: boolean;

  frenchknots: boolean;
  beads: boolean;

  specialstitches: boolean;

  constructor(data: b.infer<typeof LayersVisibility.schema>) {
    this.referenceImage = data.referenceImage;

    this.fullstitches = data.fullstitches;
    this.petitestitches = data.petitestitches;

    this.halfstitches = data.halfstitches;
    this.quarterstitches = data.quarterstitches;

    this.backstitches = data.backstitches;
    this.straightstitches = data.straightstitches;

    this.frenchknots = data.frenchknots;
    this.beads = data.beads;

    this.specialstitches = data.specialstitches;
  }

  static readonly schema = b.struct({
    referenceImage: b.bool(),

    fullstitches: b.bool(),
    petitestitches: b.bool(),

    halfstitches: b.bool(),
    quarterstitches: b.bool(),

    backstitches: b.bool(),
    straightstitches: b.bool(),
    frenchknots: b.bool(),
    beads: b.bool(),

    specialstitches: b.bool(),
  });

  static serialize(data: LayersVisibility) {
    return LayersVisibility.schema.serialize(data);
  }

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new LayersVisibility(LayersVisibility.schema.deserialize(buffer));
  }

  /** Creates a new `LayersVisibility` instance with all layers set to the specified value. */
  static default(value = true) {
    return new LayersVisibility({
      referenceImage: value,

      fullstitches: value,
      petitestitches: value,

      halfstitches: value,

      quarterstitches: value,

      backstitches: value,
      straightstitches: value,

      frenchknots: value,
      beads: value,

      specialstitches: value,
    });
  }
}

export class DisplaySettings {
  grid: Grid;
  displayMode: DisplayMode;
  showSymbols: boolean;
  showGrid: boolean;
  showRulers: boolean;
  layersVisibility: LayersVisibility;

  constructor(data: b.infer<typeof DisplaySettings.schema>) {
    this.grid = new Grid(data.grid);
    this.displayMode = data.displayMode;
    this.showSymbols = data.showSymbols;
    this.showGrid = data.showGrid;
    this.showRulers = data.showRulers;
    this.layersVisibility = new LayersVisibility(data.layersVisibility);
  }

  static readonly schema = b.struct({
    grid: Grid.schema,
    displayMode: b.nativeEnum(DisplayMode),
    showSymbols: b.bool(),
    showGrid: b.bool(),
    showRulers: b.bool(),
    layersVisibility: LayersVisibility.schema,
  });

  static serialize(data: DisplaySettings) {
    return DisplaySettings.schema.serialize(data);
  }

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new DisplaySettings(DisplaySettings.schema.deserialize(buffer));
  }
}
