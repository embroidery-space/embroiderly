import { type ToolEventDetail } from "#/core/pixi/";
import { Pattern } from "#/core/pattern/";

import type { PatternEditorTool } from "./index.ts";

export class CursorTool implements PatternEditorTool {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  main(pattern: Pattern, _detail: ToolEventDetail) {
    pattern.referenceImage.focus();
  }

  release(pattern: Pattern, detail: ToolEventDetail): Promise<void> | void {
    const { event } = detail;

    // If the reference image is not found in the event path.
    if (!event.path.find((el) => el === pattern.referenceImage)) {
      pattern.referenceImage.blur();
      return;
    }
  }
}
