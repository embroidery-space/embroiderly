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

export class PaletteSettings {
  columnsNumber: number;
  colorOnly: boolean;
  showColorBrands: boolean;
  showColorNumbers: boolean;
  showColorNames: boolean;

  constructor(data: b.infer<typeof PaletteSettings.schema>) {
    this.columnsNumber = data.columnsNumber;
    this.colorOnly = data.colorOnly;
    this.showColorBrands = data.showColorBrands;
    this.showColorNumbers = data.showColorNumbers;
    this.showColorNames = data.showColorNames;
  }

  static readonly schema = b.struct({
    columnsNumber: b.u8(),
    colorOnly: b.bool(),
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
      showColorBrands: true,
      showColorNumbers: true,
      showColorNames: true,
    });
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

  grid: boolean;
  rulers: boolean;

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

    this.grid = data.grid;
    this.rulers = data.rulers;
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

    grid: b.bool(),
    rulers: b.bool(),
  });

  static serialize(data: LayersVisibility) {
    return LayersVisibility.schema.serialize(data);
  }

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new LayersVisibility(LayersVisibility.schema.deserialize(buffer));
  }

  static default() {
    return new LayersVisibility({
      referenceImage: true,

      fullstitches: true,
      petitestitches: true,

      halfstitches: true,

      quarterstitches: true,

      backstitches: true,
      straightstitches: true,

      frenchknots: true,
      beads: true,

      specialstitches: true,

      grid: true,
      rulers: true,
    });
  }
}

export class DisplaySettings {
  defaultSymbolFont: string;
  grid: Grid;
  displayMode: DisplayMode;
  showSymbols: boolean;
  paletteSettings: PaletteSettings;
  layersVisibility: LayersVisibility;

  constructor(data: b.infer<typeof DisplaySettings.schema>) {
    this.defaultSymbolFont = data.defaultSymbolFont;
    this.grid = new Grid(data.grid);
    this.displayMode = data.displayMode;
    this.showSymbols = data.showSymbols;
    this.paletteSettings = new PaletteSettings(data.paletteSettings);
    this.layersVisibility = new LayersVisibility(data.layersVisibility);
  }

  static readonly schema = b.struct({
    defaultSymbolFont: b.string(),
    grid: Grid.schema,
    displayMode: b.nativeEnum(DisplayMode),
    showSymbols: b.bool(),
    paletteSettings: PaletteSettings.schema,
    layersVisibility: LayersVisibility.schema,
  });
}
