import {
  Pattern,
  FullStitchKind,
  PartStitchKind,
  PartStitchDirection,
  LineStitch,
  LineStitchKind,
  NodeStitch,
  NodeStitchKind,
  ReferenceImageSettings,
} from "~/pattern-editor/lib/pattern/";
import type { Stitch } from "~/pattern-editor/lib/pattern/";
import type { ToolEventDetail } from "~/pattern-editor/lib/pixi/";

import { CursorTool } from "./cursor.tool.ts";
import { StitchTool, StitchCorner } from "./stitch.tool.ts";

export const tools = Object.freeze({
  FullStitch: new StitchTool(FullStitchKind.Full),

  PetiteStitch: new StitchTool(FullStitchKind.Petite),
  PetiteStitchTL: new StitchTool(FullStitchKind.Petite, { corner: StitchCorner.TopLeft }),
  PetiteStitchTR: new StitchTool(FullStitchKind.Petite, { corner: StitchCorner.TopRight }),
  PetiteStitchBR: new StitchTool(FullStitchKind.Petite, { corner: StitchCorner.BottomRight }),
  PetiteStitchBL: new StitchTool(FullStitchKind.Petite, { corner: StitchCorner.BottomLeft }),

  HalfStitch: new StitchTool(PartStitchKind.Half),
  HalfStitchForward: new StitchTool(PartStitchKind.Half, { direction: PartStitchDirection.Forward }),
  HalfStitchBackward: new StitchTool(PartStitchKind.Half, { direction: PartStitchDirection.Backward }),

  QuarterStitch: new StitchTool(PartStitchKind.Quarter),
  QuarterStitchTL: new StitchTool(PartStitchKind.Quarter, { corner: StitchCorner.TopLeft }),
  QuarterStitchTR: new StitchTool(PartStitchKind.Quarter, { corner: StitchCorner.TopRight }),
  QuarterStitchBR: new StitchTool(PartStitchKind.Quarter, { corner: StitchCorner.BottomRight }),
  QuarterStitchBL: new StitchTool(PartStitchKind.Quarter, { corner: StitchCorner.BottomLeft }),

  BackStitch: new StitchTool(LineStitchKind.Back),
  StraightStitch: new StitchTool(LineStitchKind.Straight),

  Bead: new StitchTool(NodeStitchKind.Bead),
  FrenchKnot: new StitchTool(NodeStitchKind.FrenchKnot),

  Cursor: new CursorTool(),
});

export interface PatternEditorTool {
  /** Tool's name. */
  readonly name: string;

  /** Tool's main action handler. */
  main(context: PatternEditorToolContext): Promise<void> | void;

  /** Tool's anti action handler. */
  anti?(context: PatternEditorToolContext): Promise<void> | void;

  /** Tool's release action handler. */
  release?(context: PatternEditorToolContext): Promise<void> | void;
}

export interface PatternEditorToolContext extends ToolEventDetail {
  /** The view of the current pattern being edited. */
  readonly pattern: Pattern;

  /**
   * A collection of functions that call the **real** API.
   * The API calls modify the pattern's state on the backend.
   */
  api: {
    /**
     * Adds a stitch to the pattern.
     * @param stitch The stitch to add.
     */
    addStitch(stitch: Stitch): Promise<void>;
    /**
     * Removes a stitch from the pattern.
     * @param stitch The stitch to remove.
     */
    removeStitch(stitch: Stitch): Promise<void>;

    updateReferenceImageSettings(settings: ReferenceImageSettings): Promise<void>;

    /** Starts a transaction. */
    startTransaction(): Promise<void>;
    /** Ends a transaction. */
    endTransaction(): Promise<void>;
  };

  /**
   * A collection of functions that call the **internal** API.
   * These functions modify the pattern's state on the frontend, but not the backend.
   */
  ui: {
    referenceImage: {
      /** Returns the current reference image settings. */
      getSettings(): ReferenceImageSettings | undefined;
      /** Focuses the reference image. */
      focus(): void;
      /** Blurs the reference image. */
      blur(): void;
    };

    hint: {
      /**
       * Draws a hint for the given line stitch.
       * @param stitch The line stitch to draw a hint for.
       */
      drawLine(stitch: LineStitch): void;
      /**
       * Draws a hint for the given node stitch.
       * @param stitch The node stitch to draw a hint for.
       */
      drawNode(stitch: NodeStitch): void;
    };
  };
}

export { StitchTool, CursorTool };
