import { b } from "@zorsh/zorsh";

export class PatternPdf {
  /** The Typst template. */
  template: string;
  /** Whether the document is black-and-white (monochrome) or color. */
  color: boolean;

  constructor(data?: Partial<b.infer<typeof PatternPdf.schema>>) {
    this.template = data?.template ?? "";
    this.color = data?.color ?? true;
  }

  static readonly schema = b.struct({
    template: b.string(),
    color: b.bool(),
  });

  static deserialize(data: Uint8Array) {
    return new PatternPdf(PatternPdf.schema.deserialize(data));
  }

  static serialize(data: PatternPdf) {
    return PatternPdf.schema.serialize(data);
  }
}
