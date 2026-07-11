import { describe, expect, it } from "vitest";

import { FabricSize, MeasurementUnit } from "./size.ts";

describe("FabricSize", () => {
  describe("in", () => {
    it("projects stitches exactly", () => {
      const size = new FabricSize(100, 100, [14, 16]);
      expect(size.in(MeasurementUnit.Stitches)).toEqual({ width: 100, height: 100 });
    });

    it("projects inches using asymmetric spi", () => {
      const size = new FabricSize(100, 100, [14, 16]);
      const { width, height } = size.in(MeasurementUnit.Inches);
      expect(width).toBeCloseTo(7.142_857, 5);
      expect(height).toBeCloseTo(6.25, 5);
    });

    it("projects mm using asymmetric spi", () => {
      const size = new FabricSize(100, 100, [14, 16]);
      const { width, height } = size.in(MeasurementUnit.Mm);
      expect(width).toBeCloseTo(181.428_571, 3);
      expect(height).toBeCloseTo(158.75, 3);
    });
  });

  describe("from", () => {
    it("rounds stitches to integers", () => {
      const size = FabricSize.from({ width: 99.6, height: 100.4 }, MeasurementUnit.Stitches, [14, 14]);
      expect(size.width).toBe(100);
      expect(size.height).toBe(100);
    });

    it("rounds inches to integer stitches", () => {
      const size = FabricSize.from({ width: 7.13, height: 7.13 }, MeasurementUnit.Inches, [14, 14]);
      expect(size.width).toBe(100);
      expect(size.height).toBe(100);
    });

    it("rounds mm to integer stitches", () => {
      const size = FabricSize.from({ width: 181.43, height: 158.75 }, MeasurementUnit.Mm, [14, 16]);
      expect(size.width).toBe(100);
      expect(size.height).toBe(100);
    });
  });

  describe("drift-fix invariant", () => {
    const spi: [number, number] = [14, 16];
    const original = new FabricSize(137, 91, spi);

    it.each([MeasurementUnit.Stitches, MeasurementUnit.Inches, MeasurementUnit.Mm])(
      "round-trips through %s without drift",
      (unit) => {
        const roundTripped = FabricSize.from(original.in(unit), unit, spi);
        expect(roundTripped.width).toBe(original.width);
        expect(roundTripped.height).toBe(original.height);
      },
    );
  });
});
