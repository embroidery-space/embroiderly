import { b } from "@zorsh/zorsh";

export const QuantizationOptionsSchema = b.struct({
  samplingFactor: b.f32(),
});
export type QuantizationOptions = b.infer<typeof QuantizationOptionsSchema>;

export const DitheringOptionsSchema = b.struct({
  errorDiffusion: b.f32(),
});
export type DitheringOptions = b.infer<typeof DitheringOptionsSchema>;

export const ImageImportOptionsSchema = b.struct({
  patternSize: b.tuple(b.u16(), b.u16()),
  paletteSize: b.u32(),
  quantization: QuantizationOptionsSchema,
  dithering: b.option(DitheringOptionsSchema),
});
export type ImageImportOptions = b.infer<typeof ImageImportOptionsSchema>;
