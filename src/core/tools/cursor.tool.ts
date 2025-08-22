import { ReferenceImageView } from "../pixi/components/pattern/image.ts";
import type { PatternEditorTool, PatternEditorToolContext } from "./index.ts";

export class CursorTool implements PatternEditorTool {
  main({ event, ui }: PatternEditorToolContext) {
    if (event.path.find((el) => el instanceof ReferenceImageView)) {
      ui.referenceImage.focus();
    }
  }

  async release({ event, api, ui }: PatternEditorToolContext) {
    const image = event.path.find((el) => el instanceof ReferenceImageView);
    if (!image) {
      // If the reference image is not found in the event path,
      // we blur the reference image to ensure it's not focused.
      ui.referenceImage.blur();
    }

    const settings = ui.referenceImage.getSettings();
    if (settings) await api.updateReferenceImageSettings(settings);
  }
}
