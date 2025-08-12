import { type ToolEventDetail } from "#/core/pixi/";
import { Pattern } from "#/core/pattern/";
import { PatternEventBus } from "#/core/services/";

import type { PatternEditorTool } from "./index.ts";

export class CursorTool implements PatternEditorTool {
  main(pattern: Pattern, detail: ToolEventDetail) {
    const { event } = detail;

    if (event.path.find((el) => el === pattern.referenceImage)) {
      pattern.referenceImage.focus();
    }
  }

  release(pattern: Pattern, detail: ToolEventDetail): Promise<void> | void {
    const { event } = detail;

    PatternEventBus.emit("update-reference-image-settings", pattern.referenceImage.transformations);

    if (!event.path.find((el) => el === pattern.referenceImage)) {
      // If the reference image is not found in the event path,
      // we blur the reference image to indicate it's not focused.
      pattern.referenceImage.blur();
      return;
    }
  }
}
