import { ReferenceImageSettings } from "~/core/pattern/";

import { invoke } from "./index.ts";

export function setReferenceImage(patternId: string, filePath: string) {
  return invoke<void>("set_reference_image", { filePath }, { headers: { patternId } });
}

export function removeReferenceImage(patternId: string) {
  return invoke<void>("remove_reference_image", undefined, { headers: { patternId } });
}

export function updateReferenceImageSettings(patternId: string, settings: ReferenceImageSettings) {
  return invoke<void>("update_reference_image_settings", ReferenceImageSettings.serialize(settings), {
    headers: { patternId },
  });
}

export function getImageDimensions(imagePath: string) {
  return invoke<[width: number, height: number]>("get_image_dimensions", { imagePath });
}

export function getPatternPreviewFromImage(imagePath: string, palettePath: string, options: object) {
  return invoke<ArrayBuffer>("get_pattern_preview_from_image", { imagePath, palettePath, options });
}
