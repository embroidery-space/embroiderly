import { describe, expect, it } from "vitest";

import { FabricSize, MeasurementUnit } from "./size.ts";

describe("FabricSize", () => {
  describe("in", () => {
    it("projects stitches exactly", () => {
      const size = new FabricSize(100, 100, 14);
      expect(size.in(MeasurementUnit.Stitches)).toEqual({ width: 100, height: 100 });
    });

    it("projects inches using count", () => {
      const size = new FabricSize(100, 100, 14);
      const { width, height } = size.in(MeasurementUnit.Inches);
      expect(width).toBeCloseTo(7.142_857, 5);
      expect(height).toBeCloseTo(7.142_857, 5);
    });

    it("projects mm using count", () => {
      const size = new FabricSize(100, 100, 14);
      const { width, height } = size.in(MeasurementUnit.Mm);
      expect(width).toBeCloseTo(181.428_571, 3);
      expect(height).toBeCloseTo(181.428_571, 3);
    });
  });

  describe("from", () => {
    it("rounds stitches to integers", () => {
      const size = FabricSize.from({ width: 99.6, height: 100.4 }, MeasurementUnit.Stitches, 14);
      expect(size.width).toBe(100);
      expect(size.height).toBe(100);
    });

    it("rounds inches to integer stitches", () => {
      const size = FabricSize.from({ width: 7.13, height: 7.13 }, MeasurementUnit.Inches, 14);
      expect(size.width).toBe(100);
      expect(size.height).toBe(100);
    });

    it("rounds mm to integer stitches", () => {
      const size = FabricSize.from({ width: 181.43, height: 181.43 }, MeasurementUnit.Mm, 14);
      expect(size.width).toBe(100);
      expect(size.height).toBe(100);
    });
  });

  describe("drift-fix invariant", () => {
    const count = 14;
    const original = new FabricSize(137, 91, count);

    it.each([MeasurementUnit.Stitches, MeasurementUnit.Inches, MeasurementUnit.Mm])(
      "round-trips through %s without drift",
      (unit) => {
        const roundTripped = FabricSize.from(original.in(unit), unit, count);
        expect(roundTripped.width).toBe(original.width);
        expect(roundTripped.height).toBe(original.height);
      },
    );
  });
});
