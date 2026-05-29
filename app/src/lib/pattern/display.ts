import { b } from "@zorsh/zorsh";

export class GridLine {
  color: string;
  thickness: number;
  pixelLine: boolean;

  constructor(data?: b.infer<typeof GridLine.schema>) {
    this.color = data?.color ?? "808080";
    this.thickness = data?.thickness ?? 1;
    this.pixelLine = data?.pixelLine ?? false;
  }

  static readonly schema = b.struct({
    color: b.string(),
    thickness: b.f32(),
    pixelLine: b.bool(),
  });
}

export class Grid {
  majorLinesInterval: number;
  minorLines: GridLine;
  majorLines: GridLine;

  constructor(data?: b.infer<typeof Grid.schema>) {
    this.majorLinesInterval = data?.majorLinesInterval ?? 10;
    this.minorLines = new GridLine(data?.minorLines);
    this.majorLines = new GridLine(data?.majorLines);
  }

  static readonly schema = b.struct({
    majorLinesInterval: b.u16(),
    minorLines: GridLine.schema,
    majorLines: GridLine.schema,
  });

  static deserialize(data: Uint8Array) {
    return new Grid(Grid.schema.deserialize(data));
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

  constructor(data?: Partial<b.infer<typeof DisplaySettings.schema>>) {
    this.grid = new Grid(data?.grid);
    this.displayMode = data?.displayMode ?? DisplayMode.Solid;
    this.showSymbols = data?.showSymbols ?? false;
    this.showGrid = data?.showGrid ?? true;
    this.showRulers = data?.showRulers ?? true;
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

  static deserialize(data: Uint8Array) {
    return new DisplaySettings(DisplaySettings.schema.deserialize(data));
  }
}
