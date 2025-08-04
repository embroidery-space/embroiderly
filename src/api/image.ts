import { invoke } from "./index.ts";
import { ReferenceImageSettings } from "#/core/pattern/";

export function setReferenceImage(patternId: string, filePath: string) {
  return invoke<void>("set_reference_image", { filePath }, { headers: { patternId } });
}

export function updateReferenceImageSettings(patternId: string, settings: ReferenceImageSettings) {
  return invoke<void>("update_reference_image_settings", ReferenceImageSettings.serialize(settings), {
    headers: { patternId },
  });
}
