import { PdfExportOptions } from "~/core/pattern/";

import { invoke } from "./index.ts";

export function updatePdfExportOptions(patternId: string, options: PdfExportOptions) {
  return invoke<void>("update_pdf_export_options", PdfExportOptions.serialize(options), { headers: { patternId } });
}
