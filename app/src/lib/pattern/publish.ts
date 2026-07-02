import { b } from "@zorsh/zorsh";

export class PdfExportOptions {
  frameSize: [number, number];
  preservedOverlap: number;
  showGridLineNumbers: boolean;
  showCenteringMarks: boolean;

  constructor(data?: Partial<b.infer<typeof PdfExportOptions.schema>>) {
    this.frameSize = data?.frameSize ?? [30, 40];
    this.preservedOverlap = data?.preservedOverlap ?? 3;
    this.showGridLineNumbers = data?.showGridLineNumbers ?? true;
    this.showCenteringMarks = data?.showCenteringMarks ?? true;
  }

  static readonly schema = b.struct({
    frameSize: b.tuple(b.u16(), b.u16()),
    preservedOverlap: b.u16(),
    showGridLineNumbers: b.bool(),
    showCenteringMarks: b.bool(),
  });

  static deserialize(data: Uint8Array) {
    return new PdfExportOptions(PdfExportOptions.schema.deserialize(data));
  }

  static serialize(data: PdfExportOptions) {
    return PdfExportOptions.schema.serialize(data);
  }
}

export class PublishSettings {
  pdf: PdfExportOptions;

  constructor(data?: Partial<b.infer<typeof PublishSettings.schema>>) {
    this.pdf = new PdfExportOptions(data?.pdf);
  }

  static readonly schema = b.struct({
    pdf: PdfExportOptions.schema,
  });
}
