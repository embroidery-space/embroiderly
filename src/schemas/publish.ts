import { b } from "@zorsh/zorsh";

export class ImageExportOptions {
  frameSize?: [number, number];
  cellSize: number;
  preservedOverlap?: number;
  showGridLineNumbers: boolean;
  showCenteringMarks: boolean;

  constructor(data: b.infer<typeof ImageExportOptions.schema>) {
    if (data.frameSize) this.frameSize = data.frameSize;
    this.cellSize = data.cellSize;
    if (data.preservedOverlap) this.preservedOverlap = data.preservedOverlap;
    this.showGridLineNumbers = data.showGridLineNumbers;
    this.showCenteringMarks = data.showCenteringMarks;
  }

  static readonly schema = b.struct({
    frameSize: b.option(b.tuple(b.u16(), b.u16())),
    cellSize: b.f32(),
    preservedOverlap: b.option(b.u16()),
    showGridLineNumbers: b.bool(),
    showCenteringMarks: b.bool(),
  });

  static default(): ImageExportOptions {
    return new ImageExportOptions({
      frameSize: null,
      cellSize: 14.0,
      preservedOverlap: 3,
      showGridLineNumbers: false,
      showCenteringMarks: false,
    });
  }
}

export class PdfExportOptions {
  monochrome: boolean;
  color: boolean;
  centerFrames: boolean;
  enumerateFrames: boolean;
  frameOptions: ImageExportOptions;

  constructor(data: b.infer<typeof PdfExportOptions.schema>) {
    this.monochrome = data.monochrome;
    this.color = data.color;
    this.centerFrames = data.centerFrames;
    this.enumerateFrames = data.enumerateFrames;
    this.frameOptions = new ImageExportOptions(data.frameOptions);
  }

  static readonly schema = b.struct({
    monochrome: b.bool(),
    color: b.bool(),
    centerFrames: b.bool(),
    enumerateFrames: b.bool(),
    frameOptions: ImageExportOptions.schema,
  });

  static default(): PdfExportOptions {
    return new PdfExportOptions({
      monochrome: true,
      color: false,
      centerFrames: false,
      enumerateFrames: true,
      frameOptions: {
        frameSize: [30, 40],
        cellSize: 14.0,
        preservedOverlap: 3,
        showGridLineNumbers: true,
        showCenteringMarks: true,
      },
    });
  }
}

export class PublishSettings {
  pdf: PdfExportOptions;

  constructor(data: b.infer<typeof PublishSettings.schema>) {
    this.pdf = new PdfExportOptions(data.pdf);
  }

  static readonly schema = b.struct({
    pdf: PdfExportOptions.schema,
  });
}
