import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

export class ImageExportOptions {
  frameSize: [number, number] | null;
  cellSize: number;
  preservedOverlap: number | null;
  showGridLineNumbers: boolean;
  showCenteringMarks: boolean;

  constructor(data: b.infer<typeof ImageExportOptions.schema>) {
    this.frameSize = data.frameSize;
    this.cellSize = data.cellSize;
    this.preservedOverlap = data.preservedOverlap;
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

  static deserialize(data: Uint8Array | string) {
    const buffer = typeof data === "string" ? toByteArray(data) : data;
    return new PdfExportOptions(PdfExportOptions.schema.deserialize(buffer));
  }

  static serialize(data: PdfExportOptions) {
    return PdfExportOptions.schema.serialize(data);
  }

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
