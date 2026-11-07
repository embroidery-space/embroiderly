import { b } from "@zorsh/zorsh";

export class PdfAsset {
  fileName: string;
  content: Uint8Array;

  constructor(data?: Partial<b.infer<typeof PdfAsset.schema>>) {
    this.fileName = data?.fileName ?? "";
    this.content = data?.content ?? new Uint8Array();
  }

  static readonly schema = b.struct({
    fileName: b.string(),
    content: b.bytes(),
  });

  static deserialize(data: Uint8Array) {
    return new PdfAsset(PdfAsset.schema.deserialize(data));
  }

  static serialize(data: PdfAsset | PdfAsset[]) {
    return Array.isArray(data) ? b.vec(PdfAsset.schema).serialize(data) : PdfAsset.schema.serialize(data);
  }
}

export class PatternPdf {
  template: string;
  customFonts: PdfAsset[];

  constructor(data?: Partial<b.infer<typeof PatternPdf.schema>>) {
    this.template = data?.template ?? "";
    this.customFonts = data?.customFonts ?? [];
  }

  static readonly schema = b.struct({
    template: b.string(),
    customFonts: b.vec(PdfAsset.schema),
  });

  static deserialize(data: Uint8Array) {
    return new PatternPdf(PatternPdf.schema.deserialize(data));
  }

  static serialize(data: PatternPdf) {
    return PatternPdf.schema.serialize(data);
  }
}
