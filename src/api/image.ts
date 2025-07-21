import { invoke } from "./index.ts";

export function setReferenceImage(patternId: string, filePath: string) {
  return invoke<void>("set_reference_image", { filePath }, { headers: { patternId } });
}
