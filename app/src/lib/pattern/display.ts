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

export class DisplaySettings {
  grid: Grid;
  displayMode: DisplayMode;
  showSymbols: boolean;
  showGrid: boolean;
  showRulers: boolean;

  constructor(data: b.infer<typeof DisplaySettings.schema>) {
    this.grid = new Grid(data.grid);
    this.displayMode = data.displayMode;
    this.showSymbols = data.showSymbols;
    this.showGrid = data.showGrid;
    this.showRulers = data.showRulers;
  }

  static readonly schema = b.struct({
    grid: Grid.schema,
    displayMode: b.nativeEnum(DisplayMode),
    showSymbols: b.bool(),
    showGrid: b.bool(),
    showRulers: b.bool(),
  });

  static serialize(data: DisplaySettings) {
    return DisplaySettings.schema.serialize(data);
  }

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new DisplaySettings(DisplaySettings.schema.deserialize(buffer));
  }
}
