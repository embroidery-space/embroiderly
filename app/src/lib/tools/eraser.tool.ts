import { FullStitch, FullStitchKind, PartStitch, PartStitchKind, PartStitchDirection } from "~/lib/pattern/";
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

    if (event.target instanceof StitchGraphics) {
      await api.removeStitch(event.target.stitch.clone());
      return;
    }

    const intX = Math.trunc(point.x);
    const intY = Math.trunc(point.y);
    const fracX = point.x - intX;
    const fracY = point.y - intY;
    const direction =
      (fracX < 0.5 && fracY > 0.5) || (fracX > 0.5 && fracY < 0.5)
        ? PartStitchDirection.Forward
        : PartStitchDirection.Backward;
    const snapX = fracX > 0.5 ? intX + 0.5 : intX;
    const snapY = fracY > 0.5 ? intY + 0.5 : intY;

    await Promise.all([
      api.removeStitch(new FullStitch({ x: intX, y: intY, kind: FullStitchKind.Full, palindex: 0 })),
      api.removeStitch(new FullStitch({ x: snapX, y: snapY, kind: FullStitchKind.Petite, palindex: 0 })),
      api.removeStitch(new PartStitch({ x: intX, y: intY, kind: PartStitchKind.Half, direction, palindex: 0 })),
      api.removeStitch(new PartStitch({ x: snapX, y: snapY, kind: PartStitchKind.Quarter, direction, palindex: 0 })),
    ]);
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
