import { describe, expect, test } from "vitest";
import { blendTitle, paletteItemTitle } from "./paletteItem";
import { Blend, PaletteItem, PaletteSettings } from "#/schemas/index.ts";

const BLENDS = [new Blend({ brand: "Anchor", number: "9159" }), new Blend({ brand: "Madeira", number: "0705" })];
const PALETTE = [
  // @ts-expect-error ...
  new PaletteItem({ brand: "DMC", number: "310", name: "Black", color: "2C3225" }),
  // @ts-expect-error ...
  new PaletteItem({ brand: "Anchor", number: "9159", name: "Glacier Blue", color: "B2D8E5" }),
  // @ts-expect-error ...
  new PaletteItem({ brand: "Madeira", number: "0705", name: "Plum-DK", color: "901b6b" }),
  // @ts-expect-error ...
  new PaletteItem({ brand: "Blends", number: "", name: "", color: "A382AE", blends: BLENDS }),
];

describe("paletteItemTitle", () => {
  test("empty", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: true,
      showColorBrands: false,
      showColorNumbers: false,
      showColorNames: false,
    });
    for (const pi of PALETTE) expect(paletteItemTitle(pi, options)).toBe("");
  });

  test("brand only", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: true,
      showColorNumbers: false,
      showColorNames: false,
    });
    expect(paletteItemTitle(PALETTE[0], options)).toBe("DMC");
    expect(paletteItemTitle(PALETTE[1], options)).toBe("Anchor");
    expect(paletteItemTitle(PALETTE[2], options)).toBe("Madeira");
    expect(paletteItemTitle(PALETTE[3], options)).toBe("Blends: Anchor, Madeira");
  });

  test("number only", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: false,
      showColorNumbers: true,
      showColorNames: false,
    });
    expect(paletteItemTitle(PALETTE[0], options)).toBe("310");
    expect(paletteItemTitle(PALETTE[1], options)).toBe("9159");
    expect(paletteItemTitle(PALETTE[2], options)).toBe("0705");
    expect(paletteItemTitle(PALETTE[3], options)).toBe("9159, 0705");
  });

  test("name only", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: false,
      showColorNumbers: false,
      showColorNames: true,
    });
    expect(paletteItemTitle(PALETTE[0], options)).toBe("Black");
    expect(paletteItemTitle(PALETTE[1], options)).toBe("Glacier Blue");
    expect(paletteItemTitle(PALETTE[2], options)).toBe("Plum-DK");
    expect(paletteItemTitle(PALETTE[3], options)).toBe("");
  });

  test("brand and number", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: true,
      showColorNumbers: true,
      showColorNames: false,
    });
    expect(paletteItemTitle(PALETTE[0], options)).toBe("DMC 310");
    expect(paletteItemTitle(PALETTE[1], options)).toBe("Anchor 9159");
    expect(paletteItemTitle(PALETTE[2], options)).toBe("Madeira 0705");
    expect(paletteItemTitle(PALETTE[3], options)).toBe("Blends: Anchor 9159, Madeira 0705");
  });

  test("brand and name", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: true,
      showColorNumbers: false,
      showColorNames: true,
    });
    expect(paletteItemTitle(PALETTE[0], options)).toBe("DMC, Black");
    expect(paletteItemTitle(PALETTE[1], options)).toBe("Anchor, Glacier Blue");
    expect(paletteItemTitle(PALETTE[2], options)).toBe("Madeira, Plum-DK");
    expect(paletteItemTitle(PALETTE[3], options)).toBe("Blends: Anchor, Madeira");
  });

  test("number and name", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: false,
      showColorNumbers: true,
      showColorNames: true,
    });
    expect(paletteItemTitle(PALETTE[0], options)).toBe("310, Black");
    expect(paletteItemTitle(PALETTE[1], options)).toBe("9159, Glacier Blue");
    expect(paletteItemTitle(PALETTE[2], options)).toBe("0705, Plum-DK");
    expect(paletteItemTitle(PALETTE[3], options)).toBe("9159, 0705");
  });
});

describe("blendTitle", () => {
  test("empty", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: false,
      showColorNumbers: false,
      showColorNames: false,
    });
    for (const blend of BLENDS) expect(blendTitle(blend, options)).toBe("");
  });

  test("brand only", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: true,
      showColorNumbers: false,
      showColorNames: false,
    });
    expect(blendTitle(BLENDS[0], options)).toBe("Anchor");
    expect(blendTitle(BLENDS[1], options)).toBe("Madeira");
  });

  test("number only", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: false,
      showColorNumbers: true,
      showColorNames: false,
    });
    expect(blendTitle(BLENDS[0], options)).toBe("9159");
    expect(blendTitle(BLENDS[1], options)).toBe("0705");
  });

  test("brand and number", () => {
    const options = new PaletteSettings({
      columnsNumber: 1,
      colorOnly: false,
      showColorBrands: true,
      showColorNumbers: true,
      showColorNames: false,
    });
    expect(blendTitle(BLENDS[0], options)).toBe("Anchor 9159");
    expect(blendTitle(BLENDS[1], options)).toBe("Madeira 0705");
  });
});
