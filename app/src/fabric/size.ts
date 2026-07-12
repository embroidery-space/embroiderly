import { round } from "es-toolkit";

const MM_PER_INCH = 25.4;

/** A unit in which a fabric size can be displayed or entered. */
export const enum MeasurementUnit {
  Stitches = "stitches",
  Inches = "inches",
  Mm = "mm",
}

/**
 * The fabric size. Canonical representation is integer stitch counts plus the fabric's stitches-per-inch.
 * Physical units (inches, mm) are derived projections and are never stored.
 * Unit switching is lossless — the stitch grid changes only when the user enters a new physical size.
 */
export class FabricSize {
  readonly width: number;
  readonly height: number;

  readonly spi: [number, number];

  constructor(width: number, height: number, spi: [number, number]) {
    this.width = width;
    this.height = height;

    this.spi = spi;
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
          width: this.width / this.spi[0],
          height: this.height / this.spi[1],
        };
      case MeasurementUnit.Mm:
        return {
          width: (this.width / this.spi[0]) * MM_PER_INCH,
          height: (this.height / this.spi[1]) * MM_PER_INCH,
        };
    }
  }

  /**
   * Builds a new `FabricSize` instance from a size in the given unit.
   * Rounds to integer stitches (discrete grid).
   */
  static from(size: { width: number; height: number }, unit: MeasurementUnit, spi: [number, number]): FabricSize {
    switch (unit) {
      case MeasurementUnit.Stitches:
        return new FabricSize(round(size.width), round(size.height), spi);
      case MeasurementUnit.Inches:
        return new FabricSize(round(size.width * spi[0]), round(size.height * spi[1]), spi);
      case MeasurementUnit.Mm:
        return new FabricSize(
          round((size.width / MM_PER_INCH) * spi[0]),
          round((size.height / MM_PER_INCH) * spi[1]),
          spi,
        );
    }
  }
}
