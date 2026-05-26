import { StitchGraphics } from "~/lib/pixi/";

import type { PatternEditorTool, PatternEditorToolContext } from "./index.ts";

export class EraserTool implements PatternEditorTool {
  readonly name = "eraser";

  private inTransaction = false;

  async main({ pattern, event, end: point, api }: PatternEditorToolContext) {
    if (!patternContainsPoint(pattern.fabric, point)) return;

    if (!this.inTransaction) {
      await api.startTransaction();
      this.inTransaction = true;
    }

    if (event.target instanceof StitchGraphics) await api.removeStitch(event.target.stitch.clone());
    else await api.removeStitchAt(point.x, point.y);
  }

  async release({ api }: PatternEditorToolContext) {
    if (!this.inTransaction) return;
    this.inTransaction = false;
    await api.endTransaction();
  }
}

function patternContainsPoint(patternSize: { width: number; height: number }, point: { x: number; y: number }) {
  return point.x >= 0 && point.y >= 0 && point.x < patternSize.width && point.y < patternSize.height;
}
