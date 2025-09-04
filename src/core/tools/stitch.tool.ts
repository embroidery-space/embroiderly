import { Point } from "pixi.js";

import { StitchGraphics } from "#/core/pixi/";
import {
  FullStitch,
  FullStitchKind,
  PartStitch,
  PartStitchKind,
  PartStitchDirection,
  LineStitch,
  LineStitchKind,
  NodeStitch,
  NodeStitchKind,
  type StitchKind,
  type Stitch,
} from "#/core/pattern/";

import type { PatternEditorTool, PatternEditorToolContext } from "./index.ts";

export class StitchTool implements PatternEditorTool {
  private readonly kind: StitchKind;
  private prevStitchState?: Stitch;

  constructor(kind: StitchKind) {
    this.kind = kind;
  }

  /** Whether this is the first run in a sequence of the tool. */
  private get isFirstRun() {
    return this.prevStitchState === undefined;
  }

  async main({ pattern, start, end, modifiers, api, ui }: PatternEditorToolContext) {
    if (!patternContainsPoint(pattern.fabric, start, end)) return;

    if (this.isFirstRun) await api.startTransaction();

    const { x, y } = adjustStitchCoordinate(end, this.kind);

    switch (this.kind) {
      case FullStitchKind.Full:
      case FullStitchKind.Petite: {
        const stitch = new FullStitch({ x, y, palindex: 0, kind: this.kind });
        this.prevStitchState ??= stitch;

        const lockPosition = modifiers.mod1;
        if (lockPosition && this.prevStitchState instanceof FullStitch) {
          // If the position is locked, adjust the stitch position to match the previous stitch.
          stitch.x = Math.trunc(x) + (this.prevStitchState.x - Math.trunc(this.prevStitchState.x));
          stitch.y = Math.trunc(y) + (this.prevStitchState.y - Math.trunc(this.prevStitchState.y));
        }

        await api.addStitch(stitch);
        break;
      }

      case PartStitchKind.Half:
      case PartStitchKind.Quarter: {
        const [fracX, fracY] = [end.x % 1, end.y % 1];
        const direction =
          (fracX < 0.5 && fracY > 0.5) || (fracX > 0.5 && fracY < 0.5)
            ? PartStitchDirection.Forward
            : PartStitchDirection.Backward;

        const stitch = new PartStitch({ x, y, palindex: 0, kind: this.kind, direction });
        this.prevStitchState ??= stitch;

        const lockPosition = modifiers.mod1;
        if (lockPosition && this.prevStitchState instanceof PartStitch) {
          // If the position is locked, adjust the stitch position to match the previous stitch.
          stitch.direction = this.prevStitchState.direction;
          if (this.kind === PartStitchKind.Quarter) {
            stitch.x = Math.trunc(x) + (this.prevStitchState.x - Math.trunc(this.prevStitchState.x));
            stitch.y = Math.trunc(y) + (this.prevStitchState.y - Math.trunc(this.prevStitchState.y));
          }
        }

        await api.addStitch(stitch);
        break;
      }

      case LineStitchKind.Back: {
        const [_start, _end] = [adjustStitchCoordinate(start, this.kind), adjustStitchCoordinate(end, this.kind)];
        if (_start.equals(new Point()) || _end.equals(new Point())) return;

        const stitch = new LineStitch({ x: [_start.x, _end.x], y: [_start.y, _end.y], palindex: 0, kind: this.kind });
        if (this.prevStitchState instanceof LineStitch) {
          stitch.x[0] = this.prevStitchState.x[1];
          stitch.y[0] = this.prevStitchState.y[1];
        }

        // If the stitch is a point (not a line), return early.
        if (stitch.x[0] === stitch.x[1] && stitch.y[0] === stitch.y[1]) return;

        // If the line is too short (less than 1 (the length of a cell side) or the diagonal), return early.
        const lineLength = Math.sqrt(Math.pow(stitch.x[1] - stitch.x[0], 2) + Math.pow(stitch.y[1] - stitch.y[0], 2));
        if (lineLength > 1 && lineLength !== Math.sqrt(2)) return;

        this.prevStitchState = stitch;

        await api.addStitch(stitch);
        break;
      }

      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, this.kind);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, this.kind);
        const line = new LineStitch({ x: [x1, x2], y: [y1, y2], palindex: 0, kind: this.kind });
        ui.hint.drawLine(line);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node = new NodeStitch({ x, y, palindex: 0, kind: this.kind, rotated: modifiers.mod1 });
        ui.hint.drawNode(node);
        break;
      }
    }
  }

  async anti({ pattern, event, end: point, api }: PatternEditorToolContext) {
    if (!patternContainsPoint(pattern.fabric, point)) return;

    if (event.target instanceof StitchGraphics) {
      await api.removeStitch(event.target.stitch);
    } else {
      for (const kind of [FullStitchKind.Full, FullStitchKind.Petite, PartStitchKind.Half, PartStitchKind.Quarter]) {
        const { x, y } = adjustStitchCoordinate(point, kind);
        if (kind === FullStitchKind.Full || kind === FullStitchKind.Petite) {
          await api.removeStitch(new FullStitch({ x, y, kind, palindex: 0 }));
        } else {
          const [fractX, fractY] = [point.x - Math.trunc(x), point.y - Math.trunc(y)];
          const direction =
            (fractX < 0.5 && fractY > 0.5) || (fractX > 0.5 && fractY < 0.5)
              ? PartStitchDirection.Forward
              : PartStitchDirection.Backward;
          await api.removeStitch(new PartStitch({ x, y, kind, direction, palindex: 0 }));
        }
      }
    }
  }

  async release({ pattern, start, end, api }: PatternEditorToolContext) {
    if (!patternContainsPoint(pattern.fabric, start, end)) return;

    const { x, y } = adjustStitchCoordinate(end, this.kind);

    switch (this.kind) {
      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, this.kind);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, this.kind);
        const line = new LineStitch({ x: [x1, x2], y: [y1, y2], palindex: 0, kind: this.kind });
        await api.addStitch(line);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node = new NodeStitch({ x, y, palindex: 0, kind: this.kind, rotated: false });
        await api.addStitch(node);
        break;
      }
    }

    this.prevStitchState = undefined;
    await api.endTransaction();
  }
}

/**
 * Adjusts the stitch coordinates based on the tool being used.
 * @param point The point to adjust.
 * @param tool The tool being used.
 * @returns The adjusted point.
 */
function adjustStitchCoordinate(point: Point, tool: StitchKind): Point {
  const { x, y } = point;
  const [intX, intY] = [Math.trunc(x), Math.trunc(y)];
  const [fracX, fracY] = [x - intX, y - intY];
  switch (tool) {
    case FullStitchKind.Full:
    case PartStitchKind.Half: {
      return new Point(intX, intY);
    }
    case FullStitchKind.Petite:
    case PartStitchKind.Quarter: {
      return new Point(fracX > 0.5 ? intX + 0.5 : intX, fracY > 0.5 ? intY + 0.5 : intY);
    }
    case LineStitchKind.Back: {
      if (fracX <= 0.4 && fracY <= 0.4) return new Point(intX, intY); // top-left
      if (fracX >= 0.6 && fracY <= 0.4) return new Point(intX + 1, intY); // top-right
      if (fracX <= 0.4 && fracY >= 0.6) return new Point(intX, intY + 1); // bottom-left
      if (fracX >= 0.6 && fracY >= 0.6) return new Point(intX + 1, intY + 1); // bottom-right
      return new Point(); // to not handle it
    }
    case LineStitchKind.Straight:
    case NodeStitchKind.FrenchKnot:
    case NodeStitchKind.Bead: {
      return new Point(
        fracX > 0.5 ? intX + 1 : fracX > 0.25 ? intX + 0.5 : intX,
        fracY > 0.5 ? intY + 1 : fracY > 0.25 ? intY + 0.5 : intY,
      );
    }
  }
}

/**
 * Orders points so that is no way to draw two lines with the same coordinates.
 * @param start The start point.
 * @param end The end point.
 * @returns The ordered points.
 */
function orderPoints(start: Point, end: Point): [Point, Point] {
  if (start.y < end.y || (start.y === end.y && start.x < end.x)) return [start, end];
  else return [end, start];
}

/**
 * Checks if a point is within the bounds of a pattern.
 * @param patternSize The size of the pattern.
 * @param points The points to check.
 * @returns True if the point is within the pattern bounds, false otherwise.
 */
function patternContainsPoint(patternSize: { width: number; height: number }, ...points: Point[]) {
  return points.every((point) => {
    const { x, y } = point;
    return x >= 0 && y >= 0 && x < patternSize.width && y < patternSize.height;
  });
}
