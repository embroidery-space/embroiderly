import type { ToolEventDetail } from "#/core/pixi/pattern-viewport.ts";
import { Pattern, FullStitchKind, LineStitchKind, NodeStitchKind, PartStitchKind } from "#/core/pattern/";

import { StitchTool } from "./stitch.tool.ts";
import { CursorTool } from "./cursor.tool.ts";

export const tools = Object.freeze({
  FullStitch: new StitchTool(FullStitchKind.Full),
  PetiteStitch: new StitchTool(FullStitchKind.Petite),
  HalfStitch: new StitchTool(PartStitchKind.Half),
  QuarterStitch: new StitchTool(PartStitchKind.Quarter),
  BackStitch: new StitchTool(LineStitchKind.Back),
  StraightStitch: new StitchTool(LineStitchKind.Straight),
  Bead: new StitchTool(NodeStitchKind.Bead),
  FrenchKnot: new StitchTool(NodeStitchKind.FrenchKnot),

  Cursor: new CursorTool(),
});

export interface PatternEditorTool {
  /**
   * Tool's main action handler.
   * @param pattern The pattern being edited.
   * @param detail The event details.
   * @param palindex The index of the selected palette item.
   */
  main(pattern: Pattern, detail: ToolEventDetail, palindex?: number): Promise<void> | void;

  /**
   * Tool's anti action handler.
   * @param pattern The pattern being edited.
   * @param detail The event details.
   * @param palindex The index of the selected palette item.
   */
  anti?(pattern: Pattern, detail: ToolEventDetail, palindex?: number): Promise<void> | void;

  /**
   * Tool's release action handler.
   * @param pattern The pattern being edited.
   * @param detail The event details.
   * @param palindex The index of the selected palette item.
   */
  release?(pattern: Pattern, detail: ToolEventDetail, palindex?: number): Promise<void> | void;
}

export { StitchTool };
