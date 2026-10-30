import { b } from "@zorsh/zorsh";

export class PatternPdf {
  /** The Typst template. */
  template: string;

  constructor(data?: Partial<b.infer<typeof PatternPdf.schema>>) {
    this.template = data?.template ?? "";
  }

  static readonly schema = b.struct({
    template: b.string(),
  });

  static deserialize(data: Uint8Array) {
    return new PatternPdf(PatternPdf.schema.deserialize(data));
  }

  static serialize(data: PatternPdf) {
    return PatternPdf.schema.serialize(data);
  }
}
