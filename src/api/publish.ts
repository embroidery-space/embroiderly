import { invoke } from "./index.ts";
import { PdfExportOptions } from "#/schemas/";

export function updatePdfExportOptions(patternId: string, options: PdfExportOptions) {
  return invoke<void>("update_pdf_export_options", PdfExportOptions.serialize(options), { headers: { patternId } });
}
