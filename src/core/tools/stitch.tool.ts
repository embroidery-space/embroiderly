import { Point } from "pixi.js";
import { StitchGraphics, type ToolEventDetail } from "#/core/pixi/";
import {
  Pattern,
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
import { PatternEventBus } from "#/core/services/";

import type { PatternEditorTool } from "./index.ts";

export class StitchTool implements PatternEditorTool {
  private readonly kind: StitchKind;
  private prevStitchState?: Stitch;

  constructor(kind: StitchKind = FullStitchKind.Full) {
    this.kind = kind;
  }

  /** Whether this is the first run in a sequence of the tool. */
  get isFirstRun() {
    return this.prevStitchState === undefined;
  }

  main(_pattern: Pattern, detail: ToolEventDetail, palindex?: number) {
    if (palindex === undefined) return;

    const { start, end, modifiers } = detail;
    const { x, y } = adjustStitchCoordinate(end, this.kind);

    switch (this.kind) {
      case FullStitchKind.Full:
      case FullStitchKind.Petite: {
        const full = new FullStitch({ x, y, palindex, kind: this.kind });
        this.prevStitchState ??= full;

        // Whether the stitch should have the same position in the cell as the previous stitch.
        const lockPosition = modifiers.mod1;
        if (lockPosition && this.prevStitchState instanceof FullStitch) {
          full.x = Math.trunc(x) + (this.prevStitchState.x - Math.trunc(this.prevStitchState.x));
          full.y = Math.trunc(y) + (this.prevStitchState.y - Math.trunc(this.prevStitchState.y));
        }

        PatternEventBus.emit("add-stitch", full);
        break;
      }

      case PartStitchKind.Half:
      case PartStitchKind.Quarter: {
        const [fracX, fracY] = [end.x % 1, end.y % 1];
        const direction =
          (fracX < 0.5 && fracY > 0.5) || (fracX > 0.5 && fracY < 0.5)
            ? PartStitchDirection.Forward
            : PartStitchDirection.Backward;
        const part = new PartStitch({ x, y, palindex, kind: this.kind, direction });
        this.prevStitchState ??= part;

        // Whether the stitch should have the same position in the cell as the previous stitch.
        const lockPosition = modifiers.mod1;
        if (lockPosition && this.prevStitchState instanceof PartStitch) {
          part.direction = this.prevStitchState.direction;
          if (this.kind === PartStitchKind.Quarter) {
            part.x = Math.trunc(x) + (this.prevStitchState.x - Math.trunc(this.prevStitchState.x));
            part.y = Math.trunc(y) + (this.prevStitchState.y - Math.trunc(this.prevStitchState.y));
          }
        }

        PatternEventBus.emit("add-stitch", part);
        break;
      }

      case LineStitchKind.Back: {
        const [_start, _end] = [adjustStitchCoordinate(start, this.kind), adjustStitchCoordinate(end, this.kind)];
        if (_start.equals(new Point()) || _end.equals(new Point())) return;
        const line = new LineStitch({ x: [_start.x, _end.x], y: [_start.y, _end.y], palindex, kind: this.kind });
        if (this.prevStitchState instanceof LineStitch) {
          line.x[0] = this.prevStitchState.x[1];
          line.y[0] = this.prevStitchState.y[1];
        }
        if (line.x[0] === line.x[1] && line.y[0] === line.y[1]) return;
        const lineLength = Math.sqrt(Math.pow(line.x[1] - line.x[0], 2) + Math.pow(line.y[1] - line.y[0], 2));
        // Check that the line is not longer than 1 horizontally and vertically, or it is diagonal.
        if (lineLength > 1 && lineLength !== Math.sqrt(2)) return;
        this.prevStitchState = line;
        PatternEventBus.emit("add-stitch", line);
        break;
      }

      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, this.kind);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, this.kind);
        const line = new LineStitch({ x: [x1, x2], y: [y1, y2], palindex, kind: this.kind });
        PatternEventBus.emit("draw-line-hint", line);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node = new NodeStitch({ x, y, palindex, kind: this.kind, rotated: modifiers.mod1 });
        PatternEventBus.emit("draw-node-hint", node);
        break;
      }
    }
  }

  anti(_pattern: Pattern, detail: ToolEventDetail, palindex = 0) {
    const { event, end: point } = detail;

    if (event.target instanceof StitchGraphics) {
      PatternEventBus.emit("remove-stitch", event.target.stitch);
    } else {
      for (const kind of [FullStitchKind.Full, FullStitchKind.Petite, PartStitchKind.Half, PartStitchKind.Quarter]) {
        const { x, y } = adjustStitchCoordinate(point, kind);
        if (kind === FullStitchKind.Full || kind === FullStitchKind.Petite) {
          PatternEventBus.emit("remove-stitch", new FullStitch({ x, y, kind, palindex }));
        } else {
          const [fractX, fractY] = [point.x - Math.trunc(x), point.y - Math.trunc(y)];
          const direction =
            (fractX < 0.5 && fractY > 0.5) || (fractX > 0.5 && fractY < 0.5)
              ? PartStitchDirection.Forward
              : PartStitchDirection.Backward;
          PatternEventBus.emit("remove-stitch", new PartStitch({ x, y, kind, direction, palindex }));
        }
      }
    }
  }

  release(_pattern: Pattern, detail: ToolEventDetail, palindex?: number) {
    if (palindex === undefined) return;

    const { start, end } = detail;
    const { x, y } = adjustStitchCoordinate(end, this.kind);

    switch (this.kind) {
      case LineStitchKind.Straight: {
        const [_start, _end] = orderPoints(start, end);
        const { x: x1, y: y1 } = adjustStitchCoordinate(_start, this.kind);
        const { x: x2, y: y2 } = adjustStitchCoordinate(_end, this.kind);
        const line = new LineStitch({ x: [x1, x2], y: [y1, y2], palindex, kind: this.kind });
        PatternEventBus.emit("add-stitch", line);
        break;
      }

      case NodeStitchKind.FrenchKnot:
      case NodeStitchKind.Bead: {
        const node = new NodeStitch({ x, y, palindex, kind: this.kind, rotated: false });
        PatternEventBus.emit("add-stitch", node);
        break;
      }
    }

    this.prevStitchState = undefined;
  }
}

function adjustStitchCoordinate({ x, y }: Point, tool: StitchKind): Point {
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

/** Orders points so that is no way to draw two lines with the same coordinates. */
function orderPoints(start: Point, end: Point): [Point, Point] {
  if (start.y < end.y || (start.y === end.y && start.x < end.x)) return [start, end];
  else return [end, start];
}
