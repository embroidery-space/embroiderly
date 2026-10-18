import { round } from "es-toolkit";

const MM_PER_INCH = 25.4;

/** A unit in which a fabric size can be displayed or entered. */
export const enum MeasurementUnit {
  Stitches = "stitches",
  Inches = "inches",
  Mm = "mm",
}

/**
 * The fabric size. Canonical representation is integer stitch counts plus the fabric's count.
 * Physical units (inches, mm) are derived projections and are never stored.
 * Unit switching is lossless — the stitch grid changes only when the user enters a new physical size.
 */
export class FabricSize {
  readonly width: number;
  readonly height: number;

  readonly count: number;

  constructor(width: number, height: number, count: number) {
    this.width = width;
    this.height = height;

    this.count = count;
  }

  /** Projects canonical stitch counts into the given unit. Returns exact floats — no rounding. */
  in(unit: MeasurementUnit): { width: number; height: number } {
    switch (unit) {
      case MeasurementUnit.Stitches:
        return {
          width: this.width,
          height: this.height,
        };
      case MeasurementUnit.Inches:
        return {
          width: this.width / this.count,
          height: this.height / this.count,
        };
      case MeasurementUnit.Mm:
        return {
          width: (this.width / this.count) * MM_PER_INCH,
          height: (this.height / this.count) * MM_PER_INCH,
        };
    }
  }

  /**
   * Builds a new `FabricSize` instance from a size in the given unit.
   * Rounds to integer stitches (discrete grid).
   */
  static from(size: { width: number; height: number }, unit: MeasurementUnit, count: number): FabricSize {
    switch (unit) {
      case MeasurementUnit.Stitches:
        return new FabricSize(round(size.width), round(size.height), count);
      case MeasurementUnit.Inches:
        return new FabricSize(round(size.width * count), round(size.height * count), count);
      case MeasurementUnit.Mm:
        return new FabricSize(
          round((size.width / MM_PER_INCH) * count),
          round((size.height / MM_PER_INCH) * count),
          count,
        );
    }
  }
}
