import { describe, expect, test } from "vitest";

import { getCursorForRotation, checkIfHorizontallyOriented } from "./rotation.ts";

describe("getCursorForRotation", () => {
  describe("ns-resize base cursor", () => {
    test("returns ns-resize for 0° rotation", () => {
      expect(getCursorForRotation("ns-resize", 0)).toBe("ns-resize");
    });

    test("returns nesw-resize for 45° rotation", () => {
      const rotation = Math.PI / 4; // 45°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("nesw-resize");
    });

    test("returns ew-resize for 90° rotation", () => {
      const rotation = Math.PI / 2; // 90°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("ew-resize");
    });

    test("returns nwse-resize for 135° rotation", () => {
      const rotation = (3 * Math.PI) / 4; // 135°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("nwse-resize");
    });

    test("returns ns-resize for 180° rotation", () => {
      const rotation = Math.PI; // 180°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("ns-resize");
    });

    test("returns nesw-resize for 225° rotation", () => {
      const rotation = (5 * Math.PI) / 4; // 225°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("nesw-resize");
    });

    test("returns ew-resize for 270° rotation", () => {
      const rotation = (3 * Math.PI) / 2; // 270°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("ew-resize");
    });

    test("returns nwse-resize for 315° rotation", () => {
      const rotation = (7 * Math.PI) / 4; // 315°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("nwse-resize");
    });
  });

  describe("ew-resize base cursor", () => {
    test("returns ew-resize for 0° rotation", () => {
      expect(getCursorForRotation("ew-resize", 0)).toBe("ew-resize");
    });

    test("returns nwse-resize for 45° rotation", () => {
      const rotation = Math.PI / 4; // 45°
      expect(getCursorForRotation("ew-resize", rotation)).toBe("nwse-resize");
    });

    test("returns ns-resize for 90° rotation", () => {
      const rotation = Math.PI / 2; // 90°
      expect(getCursorForRotation("ew-resize", rotation)).toBe("ns-resize");
    });

    test("returns nesw-resize for 135° rotation", () => {
      const rotation = (3 * Math.PI) / 4; // 135°
      expect(getCursorForRotation("ew-resize", rotation)).toBe("nesw-resize");
    });
  });

  describe("nesw-resize base cursor", () => {
    test("returns nesw-resize for 0° rotation", () => {
      expect(getCursorForRotation("nesw-resize", 0)).toBe("nesw-resize");
    });

    test("returns ew-resize for 45° rotation", () => {
      const rotation = Math.PI / 4; // 45°
      expect(getCursorForRotation("nesw-resize", rotation)).toBe("ew-resize");
    });

    test("returns nwse-resize for 90° rotation", () => {
      const rotation = Math.PI / 2; // 90°
      expect(getCursorForRotation("nesw-resize", rotation)).toBe("nwse-resize");
    });

    test("returns ns-resize for 135° rotation", () => {
      const rotation = (3 * Math.PI) / 4; // 135°
      expect(getCursorForRotation("nesw-resize", rotation)).toBe("ns-resize");
    });
  });

  describe("nwse-resize base cursor", () => {
    test("returns nwse-resize for 0° rotation", () => {
      expect(getCursorForRotation("nwse-resize", 0)).toBe("nwse-resize");
    });

    test("returns ns-resize for 45° rotation", () => {
      const rotation = Math.PI / 4; // 45°
      expect(getCursorForRotation("nwse-resize", rotation)).toBe("ns-resize");
    });

    test("returns nesw-resize for 90° rotation", () => {
      const rotation = Math.PI / 2; // 90°
      expect(getCursorForRotation("nwse-resize", rotation)).toBe("nesw-resize");
    });

    test("returns ew-resize for 135° rotation", () => {
      const rotation = (3 * Math.PI) / 4; // 135°
      expect(getCursorForRotation("nwse-resize", rotation)).toBe("ew-resize");
    });
  });

  describe("negative rotations", () => {
    test("handles negative rotation correctly for ns-resize", () => {
      const negativeRotation = -Math.PI / 4; // -45°
      expect(getCursorForRotation("ns-resize", negativeRotation)).toBe("nwse-resize");
    });

    test("handles -90° rotation", () => {
      const rotation = -Math.PI / 2; // -90°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("ew-resize");
    });

    test("handles -135° rotation", () => {
      const rotation = (-3 * Math.PI) / 4; // -135°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("nesw-resize");
    });

    test("handles -180° rotation", () => {
      const rotation = -Math.PI; // -180°
      expect(getCursorForRotation("ns-resize", rotation)).toBe("ns-resize");
    });

    test("handles large negative rotation", () => {
      const largeNegativeRotation = -3 * Math.PI; // -540°
      expect(getCursorForRotation("ns-resize", largeNegativeRotation)).toBe("ns-resize");
    });

    test("handles negative rotation for ew-resize base cursor", () => {
      const rotation = -Math.PI / 4; // -45°
      expect(getCursorForRotation("ew-resize", rotation)).toBe("nesw-resize");
    });

    test("handles negative rotation for nesw-resize base cursor", () => {
      const rotation = -Math.PI / 4; // -45°
      expect(getCursorForRotation("nesw-resize", rotation)).toBe("ns-resize");
    });

    test("handles negative rotation for nwse-resize base cursor", () => {
      const rotation = -Math.PI / 4; // -45°
      expect(getCursorForRotation("nwse-resize", rotation)).toBe("ew-resize");
    });

    test("handles very small negative rotation", () => {
      const smallNegative = -0.001;
      expect(getCursorForRotation("ns-resize", smallNegative)).toBe("ns-resize");
    });

    test("handles negative rotation at boundaries", () => {
      const boundary = -Math.PI / 8; // -22.5°
      expect(getCursorForRotation("ns-resize", boundary)).toBe("ns-resize");
    });

    test("handles multiple negative full rotations", () => {
      const multipleNegative = -4 * Math.PI - Math.PI / 4; // -720° - 45°
      expect(getCursorForRotation("ns-resize", multipleNegative)).toBe("nwse-resize");
    });
  });

  describe("rotations greater than 2π", () => {
    test("handles rotation greater than 2π", () => {
      const largeRotation = 3 * Math.PI; // 540°
      expect(getCursorForRotation("ns-resize", largeRotation)).toBe("ns-resize");
    });

    test("handles multiple rotations", () => {
      const multipleRotations = 4 * Math.PI + Math.PI / 4; // 720° + 45°
      expect(getCursorForRotation("ns-resize", multipleRotations)).toBe("nesw-resize");
    });
  });

  describe("edge cases and boundary conditions", () => {
    test("handles very small rotations", () => {
      const smallRotation = 0.001; // Very small positive rotation
      expect(getCursorForRotation("ns-resize", smallRotation)).toBe("ns-resize");
    });

    test("handles rotations at exact boundaries", () => {
      const boundary1 = Math.PI / 8; // Boundary between ns-resize and nesw-resize
      expect(getCursorForRotation("ns-resize", boundary1)).toBe("nesw-resize");

      const boundary2 = (3 * Math.PI) / 8; // Boundary between nesw-resize and ew-resize
      expect(getCursorForRotation("ns-resize", boundary2)).toBe("ew-resize");
    });

    test("handles zero rotation", () => {
      expect(getCursorForRotation("ns-resize", 0)).toBe("ns-resize");
      expect(getCursorForRotation("ew-resize", 0)).toBe("ew-resize");
      expect(getCursorForRotation("nesw-resize", 0)).toBe("nesw-resize");
      expect(getCursorForRotation("nwse-resize", 0)).toBe("nwse-resize");
    });
  });
});

describe("checkIfHorizontallyOriented", () => {
  describe("horizontal orientations", () => {
    test("returns true for 0° rotation", () => {
      expect(checkIfHorizontallyOriented(0)).toBe(true);
    });

    test("returns true for small positive rotation", () => {
      const smallRotation = Math.PI / 8 - 0.1; // Just under 22.5°
      expect(checkIfHorizontallyOriented(smallRotation)).toBe(true);
    });

    test("returns true for 180° rotation", () => {
      expect(checkIfHorizontallyOriented(Math.PI)).toBe(true);
    });

    test("returns true for rotation around 180°", () => {
      const around180 = Math.PI + Math.PI / 8 - 0.1; // Just under 202.5°
      expect(checkIfHorizontallyOriented(around180)).toBe(true);
    });

    test("returns true for rotation around 360°", () => {
      const around360 = 2 * Math.PI - Math.PI / 8 + 0.1; // Just over 337.5°
      expect(checkIfHorizontallyOriented(around360)).toBe(true);
    });
  });

  describe("vertical orientations", () => {
    test("returns false for 90° rotation", () => {
      expect(checkIfHorizontallyOriented(Math.PI / 2)).toBe(false);
    });

    test("returns false for 270° rotation", () => {
      expect(checkIfHorizontallyOriented((3 * Math.PI) / 2)).toBe(false);
    });

    test("returns false for rotation around 90°", () => {
      const around90 = Math.PI / 2 + Math.PI / 8 - 0.1; // Just under 112.5°
      expect(checkIfHorizontallyOriented(around90)).toBe(false);
    });

    test("returns false for rotation around 270°", () => {
      const around270 = (3 * Math.PI) / 2 - Math.PI / 8 + 0.1; // Just over 247.5°
      expect(checkIfHorizontallyOriented(around270)).toBe(false);
    });
  });

  describe("boundary conditions", () => {
    test("returns true at 45° boundary (horizontal side)", () => {
      const boundary = Math.PI / 4 - 0.1; // Just under 45°
      expect(checkIfHorizontallyOriented(boundary)).toBe(true);
    });

    test("returns false at 45° boundary (vertical side)", () => {
      const boundary = Math.PI / 4 + 0.1; // Just over 45°
      expect(checkIfHorizontallyOriented(boundary)).toBe(false);
    });

    test("returns false at 135° boundary (vertical side)", () => {
      const boundary = (3 * Math.PI) / 4 - 0.1; // Just under 135°
      expect(checkIfHorizontallyOriented(boundary)).toBe(false);
    });

    test("returns true at 135° boundary (horizontal side)", () => {
      const boundary = (3 * Math.PI) / 4 + 0.1; // Just over 135°
      expect(checkIfHorizontallyOriented(boundary)).toBe(true);
    });

    test("returns true at 225° boundary (horizontal side)", () => {
      const boundary = (5 * Math.PI) / 4 - 0.1; // Just under 225°
      expect(checkIfHorizontallyOriented(boundary)).toBe(true);
    });

    test("returns false at 225° boundary (vertical side)", () => {
      const boundary = (5 * Math.PI) / 4 + 0.1; // Just over 225°
      expect(checkIfHorizontallyOriented(boundary)).toBe(false);
    });

    test("returns false at 315° boundary (vertical side)", () => {
      const boundary = (7 * Math.PI) / 4 - 0.1; // Just under 315°
      expect(checkIfHorizontallyOriented(boundary)).toBe(false);
    });

    test("returns true at 315° boundary (horizontal side)", () => {
      const boundary = (7 * Math.PI) / 4 + 0.1; // Just over 315°
      expect(checkIfHorizontallyOriented(boundary)).toBe(true);
    });
  });

  describe("negative rotations", () => {
    test("normalizes negative rotation to positive equivalent", () => {
      expect(checkIfHorizontallyOriented(-Math.PI / 4)).toBe(false); // -45° = 315°, which is vertical
      expect(checkIfHorizontallyOriented(-Math.PI / 2)).toBe(false); // -90° = 270°, which is vertical
      expect(checkIfHorizontallyOriented(-Math.PI)).toBe(true); // -180° = 180°, which is horizontal
    });

    test("handles large negative rotations", () => {
      const largeNegative = -3 * Math.PI; // -540° = 180°
      expect(checkIfHorizontallyOriented(largeNegative)).toBe(true);
    });
  });

  describe("rotations greater than 2π", () => {
    test("normalizes rotations greater than 2π", () => {
      const largeRotation = 3 * Math.PI; // 540° = 180°
      expect(checkIfHorizontallyOriented(largeRotation)).toBe(true);
    });

    test("handles multiple full rotations", () => {
      const multipleRotations = 4 * Math.PI + Math.PI / 2; // 720° + 90° = 90°
      expect(checkIfHorizontallyOriented(multipleRotations)).toBe(false);
    });
  });

  describe("edge cases", () => {
    test("handles very small rotations", () => {
      expect(checkIfHorizontallyOriented(0.001)).toBe(true);
      expect(checkIfHorizontallyOriented(-0.001)).toBe(true);
    });

    test("handles exact quarter rotations", () => {
      expect(checkIfHorizontallyOriented(Math.PI / 4)).toBe(false); // 45° - vertical/diagonal
      expect(checkIfHorizontallyOriented(Math.PI / 2)).toBe(false); // 90° - vertical
      expect(checkIfHorizontallyOriented((3 * Math.PI) / 4)).toBe(false); // 135° - vertical/diagonal
      expect(checkIfHorizontallyOriented(Math.PI)).toBe(true); // 180° - horizontal
      expect(checkIfHorizontallyOriented((5 * Math.PI) / 4)).toBe(false); // 225° - boundary case, not horizontal
      expect(checkIfHorizontallyOriented((3 * Math.PI) / 2)).toBe(false); // 270° - vertical
      expect(checkIfHorizontallyOriented((7 * Math.PI) / 4)).toBe(false); // 315° - vertical/diagonal
    });
  });
});
