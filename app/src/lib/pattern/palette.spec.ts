import { describe, expect, test } from "vitest";

import { Blend, Palette, PaletteItem, PaletteSettings } from "./palette.ts";

describe("Palette", () => {
  const PALETTE_ITEMS = {
    BLACK: { brand: "DMC", number: "310", name: "Black", color: "2C3225", blends: null, symbol: null }, // prettier-ignore
    GARNET: { brand: "DMC", number: "816", name: "Garnet", color: "973E3B", blends: null, symbol: null }, // prettier-ignore
    LAVENDER: { brand: "DMC", number: "327", name: "Lavender-VY DK", color: "7A5577", blends: null, symbol: null }, // prettier-ignore
    WHITE: { brand: "DMC", number: "blanc", name: "White", color: "FFFFFF", blends: null, symbol: null }, // prettier-ignore
  };

  test("returns items in visual order", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET, PALETTE_ITEMS.LAVENDER],
      positions: [1, 2, 0],
    });

    const visualOrder = palette.itemsInVisualOrder;
    expect(visualOrder.length).toBe(3);
    expect(visualOrder[0]!.number).toBe("816");
    expect(visualOrder[1]!.number).toBe("327");
    expect(visualOrder[2]!.number).toBe("310");
  });

  test("pushes item to the end", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET],
      positions: [0, 1],
    });

    const newItem = new PaletteItem(palette.length, PALETTE_ITEMS.LAVENDER);
    const index = palette.push(newItem);

    expect(index).toBe(2);
    expect(palette.length).toBe(3);
    expect(palette.items[2]).toBe(newItem);
    expect(palette.positions).toEqual([0, 1, 2]);
  });

  test("inserts item at specific index and updates positions", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET, PALETTE_ITEMS.LAVENDER],
      positions: [0, 1, 2],
    });

    const newItem = new PaletteItem(1, PALETTE_ITEMS.WHITE);
    palette.insert(1, newItem);

    expect(palette.length).toBe(4);
    expect(palette.items[1]).toBe(newItem);
    expect(palette.positions).toEqual([0, 1, 2, 3]);

    const visualOrder = palette.itemsInVisualOrder;
    expect(visualOrder[0]!.number).toBe("310");
    expect(visualOrder[1]!.number).toBe("blanc");
    expect(visualOrder[2]!.number).toBe("816");
    expect(visualOrder[3]!.number).toBe("327");
  });

  test("insert item at beginning updates all positions", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET],
      positions: [0, 1],
    });

    const newItem = new PaletteItem(0, PALETTE_ITEMS.WHITE);
    palette.insert(0, newItem);

    expect(palette.length).toBe(3);
    expect(palette.items[0]).toBe(newItem);
    expect(palette.positions).toEqual([0, 1, 2]);
  });

  test("removes item and updates positions", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET, PALETTE_ITEMS.LAVENDER],
      positions: [0, 1, 2],
    });

    const removed = palette.remove(1);
    expect(removed?.number).toBe("816");

    expect(palette.length).toBe(2);

    expect(palette.positions).toEqual([0, 1]);
    expect(palette.items[0]!.number).toBe("310");
    expect(palette.items[1]!.number).toBe("327");
  });

  test("removes with reordered positions", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET, PALETTE_ITEMS.LAVENDER, PALETTE_ITEMS.WHITE],
      positions: [2, 0, 3, 1],
    });

    const removed = palette.remove(1);
    expect(removed?.number).toBe("816");

    expect(palette.length).toBe(3);
    expect(palette.positions).toEqual([1, 0, 2]);

    const visualOrder = palette.itemsInVisualOrder;
    expect(visualOrder[0]!.number).toBe("327");
    expect(visualOrder[1]!.number).toBe("310");
    expect(visualOrder[2]!.number).toBe("blanc");
  });

  test("returns undefined when removing item at invalid index", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK],
      positions: [0],
    });

    expect(palette.remove(-1)).toBeUndefined();
    expect(palette.remove(5)).toBeUndefined();
    expect(palette.length).toBe(1);
  });

  test("positions setter updates visual order", () => {
    const palette = new Palette({
      items: [PALETTE_ITEMS.BLACK, PALETTE_ITEMS.GARNET, PALETTE_ITEMS.LAVENDER],
      positions: [0, 1, 2],
    });

    palette.positions = [2, 1, 0];
    expect(palette.positions).toEqual([2, 1, 0]);

    const visualOrder = palette.itemsInVisualOrder;
    expect(visualOrder[0]!.number).toBe("327");
    expect(visualOrder[1]!.number).toBe("816");
    expect(visualOrder[2]!.number).toBe("310");
  });
});

describe("PaletteItem", () => {
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
    {
      brand: "Blends",
      number: "",
      name: "",
      color: "A382AE",
      blends: [
        { brand: "Anchor", number: "9159" },
        { brand: "Madeira", number: "0705" },
      ].map((data) => new Blend(data)),
    },
  ].map((data, index) => new PaletteItem(index, { blends: null, symbol: null, ...data }));

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
        colorOnly: true,
        showColorBrands: false,
        showColorNumbers: false,
        showColorNames: false,
      });
      for (const palitem of PALETTE) expect(palitem.getTitle(options)).toBe("");
    });

    test("brand only", () => {
      const options = new PaletteSettings({
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
  const BLENDS = [
    { brand: "Anchor", number: "9159" },
    { brand: "Madeira", number: "0705" },
  ].map((data) => new Blend(data));

  describe("titles", () => {
    test("empty", () => {
      const options = new PaletteSettings({
        colorOnly: false,
        showColorBrands: false,
        showColorNumbers: false,
        showColorNames: false,
      });
      for (const blend of BLENDS) expect(blend.getTitle(options)).toBe("");
    });

    test("brand only", () => {
      const options = new PaletteSettings({
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
