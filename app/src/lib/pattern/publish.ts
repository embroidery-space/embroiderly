import { b } from "@zorsh/zorsh";
import { toByteArray } from "base64-js";

export class ImageExportOptions {
  frameSize: [number, number] | null;
  cellSize: number;
  preservedOverlap: number | null;
  showGridLineNumbers: boolean;
  showCenteringMarks: boolean;

  constructor(data?: b.infer<typeof ImageExportOptions.schema>) {
    this.frameSize = data?.frameSize ?? [30, 40];
    this.cellSize = data?.cellSize ?? 14;
    this.preservedOverlap = data?.preservedOverlap ?? 3;
    this.showGridLineNumbers = data?.showGridLineNumbers ?? true;
    this.showCenteringMarks = data?.showCenteringMarks ?? true;
  }

  static readonly schema = b.struct({
    frameSize: b.option(b.tuple(b.u16(), b.u16())),
    cellSize: b.f32(),
    preservedOverlap: b.option(b.u16()),
    showGridLineNumbers: b.bool(),
    showCenteringMarks: b.bool(),
  });
}

export class PdfExportOptions {
  monochrome: boolean;
  color: boolean;
  centerFrames: boolean;
  enumerateFrames: boolean;
  frameOptions: ImageExportOptions;

  constructor(data?: b.infer<typeof PdfExportOptions.schema>) {
    this.monochrome = data?.monochrome ?? true;
    this.color = data?.color ?? false;
    this.centerFrames = data?.centerFrames ?? false;
    this.enumerateFrames = data?.enumerateFrames ?? true;
    this.frameOptions = new ImageExportOptions(data?.frameOptions);
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
}

export class PublishSettings {
  pdf: PdfExportOptions;

  constructor(data?: b.infer<typeof PublishSettings.schema>) {
    this.pdf = new PdfExportOptions(data?.pdf);
  }

  static readonly schema = b.struct({
    pdf: PdfExportOptions.schema,
  });
}
