import { type ToolEventDetail } from "#/core/pixi/";
import { Pattern } from "#/core/pattern/";

import type { PatternEditorTool } from "./index.ts";

export class CursorTool implements PatternEditorTool {
  main(pattern: Pattern, detail: ToolEventDetail) {
    const { event } = detail;

    // If the reference image is not found in the event path.
    if (!event.path.find((el) => el === pattern.referenceImage)) {
      pattern.referenceImage.blur();
      return;
    }

    pattern.referenceImage.focus();
  }
}
