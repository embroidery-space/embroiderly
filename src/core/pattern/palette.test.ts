import { describe, expect, test } from "vitest";

import { Blend, PaletteItem } from "./palette.ts";
import { PaletteSettings } from "./display.ts";

const BLENDS = [
  { brand: "Anchor", number: "9159" },
  { brand: "Madeira", number: "0705" },
].map((data) => new Blend(data));
const PALETTE = [
  { brand: "", number: "", name: "", color: "000000" },
  { brand: "DMC", number: "310", name: "Black", color: "2C3225" },
  { brand: "DMC", number: "327", name: "Lavender-VY DK", color: "7A5577" },
  { brand: "DMC", number: "816", name: "Garnet", color: "973E3B" },
  { brand: "DMC", number: "938", name: "Coffee Brown-UL DK", color: "50442B" },
  { brand: "", number: "", name: "", color: "FFFFFF" },
  { brand: "DMC", number: "307", name: "Lemon", color: "F6E311" },
  { brand: "DMC", number: "809", name: "Delft Blue", color: "91B1DB" },
  { brand: "DMC", number: "3823", name: "Yellow-UL Pale", color: "ECEDC5" },
  { brand: "DMC", number: "3708", name: "Melon-LT", color: "F5A7B6" },
  { brand: "Anchor", number: "9159", name: "Glacier Blue", color: "B2D8E5" },
  { brand: "Madeira", number: "0705", name: "Plum-DK", color: "901b6b" },
  { brand: "Blends", number: "", name: "", color: "A382AE", blends: BLENDS },
].map((data) => new PaletteItem({ blends: null, symbol: null, symbolFont: null, ...data }));

describe("PaletteItem", () => {
  test("returns contrast color", () => {
    expect(PALETTE[0].contrastColor).toBe("white");
    expect(PALETTE[1].contrastColor).toBe("white");
    expect(PALETTE[2].contrastColor).toBe("white");
    expect(PALETTE[3].contrastColor).toBe("white");
    expect(PALETTE[4].contrastColor).toBe("white");
    expect(PALETTE[5].contrastColor).toBe("black");
    expect(PALETTE[6].contrastColor).toBe("black");
    expect(PALETTE[7].contrastColor).toBe("black");
    expect(PALETTE[8].contrastColor).toBe("black");
    expect(PALETTE[9].contrastColor).toBe("black");
  });

  describe("titles", () => {
    test("empty", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: true,
        showColorBrands: false,
        showColorNumbers: false,
        showColorNames: false,
      });
      for (const palitem of PALETTE) expect(palitem.getTitle(options)).toBe("");
    });

    test("brand only", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: true,
        showColorNumbers: false,
        showColorNames: false,
      });
      expect(PALETTE[9].getTitle(options)).toBe("DMC");
      expect(PALETTE[10].getTitle(options)).toBe("Anchor");
      expect(PALETTE[11].getTitle(options)).toBe("Madeira");
      expect(PALETTE[12].getTitle(options)).toBe("Blends: Anchor, Madeira");
    });

    test("number only", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: false,
        showColorNumbers: true,
        showColorNames: false,
      });
      expect(PALETTE[9].getTitle(options)).toBe("3708");
      expect(PALETTE[10].getTitle(options)).toBe("9159");
      expect(PALETTE[11].getTitle(options)).toBe("0705");
      expect(PALETTE[12].getTitle(options)).toBe("9159, 0705");
    });

    test("name only", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: false,
        showColorNumbers: false,
        showColorNames: true,
      });
      expect(PALETTE[9].getTitle(options)).toBe("Melon-LT");
      expect(PALETTE[10].getTitle(options)).toBe("Glacier Blue");
      expect(PALETTE[11].getTitle(options)).toBe("Plum-DK");
      expect(PALETTE[12].getTitle(options)).toBe("");
    });

    test("brand and number", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: true,
        showColorNumbers: true,
        showColorNames: false,
      });
      expect(PALETTE[9].getTitle(options)).toBe("DMC 3708");
      expect(PALETTE[10].getTitle(options)).toBe("Anchor 9159");
      expect(PALETTE[11].getTitle(options)).toBe("Madeira 0705");
      expect(PALETTE[12].getTitle(options)).toBe("Blends: Anchor 9159, Madeira 0705");
    });

    test("brand and name", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: true,
        showColorNumbers: false,
        showColorNames: true,
      });
      expect(PALETTE[9].getTitle(options)).toBe("DMC, Melon-LT");
      expect(PALETTE[10].getTitle(options)).toBe("Anchor, Glacier Blue");
      expect(PALETTE[11].getTitle(options)).toBe("Madeira, Plum-DK");
      expect(PALETTE[12].getTitle(options)).toBe("Blends: Anchor, Madeira");
    });

    test("number and name", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: false,
        showColorNumbers: true,
        showColorNames: true,
      });
      expect(PALETTE[9].getTitle(options)).toBe("3708, Melon-LT");
      expect(PALETTE[10].getTitle(options)).toBe("9159, Glacier Blue");
      expect(PALETTE[11].getTitle(options)).toBe("0705, Plum-DK");
      expect(PALETTE[12].getTitle(options)).toBe("9159, 0705");
    });
  });
});

describe("Blend", () => {
  describe("titles", () => {
    test("empty", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: false,
        showColorNumbers: false,
        showColorNames: false,
      });
      for (const blend of BLENDS) expect(blend.getTitle(options)).toBe("");
    });

    test("brand only", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: true,
        showColorNumbers: false,
        showColorNames: false,
      });
      expect(BLENDS[0].getTitle(options)).toBe("Anchor");
      expect(BLENDS[1].getTitle(options)).toBe("Madeira");
    });

    test("number only", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: false,
        showColorNumbers: true,
        showColorNames: false,
      });
      expect(BLENDS[0].getTitle(options)).toBe("9159");
      expect(BLENDS[1].getTitle(options)).toBe("0705");
    });

    test("brand and number", () => {
      const options = new PaletteSettings({
        columnsNumber: 1,
        colorOnly: false,
        showColorBrands: true,
        showColorNumbers: true,
        showColorNames: false,
      });
      expect(BLENDS[0].getTitle(options)).toBe("Anchor 9159");
      expect(BLENDS[1].getTitle(options)).toBe("Madeira 0705");
    });
  });
});
