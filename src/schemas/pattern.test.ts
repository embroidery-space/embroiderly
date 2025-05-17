import { describe, expect, test } from "vitest";

import { PaletteItem } from "./pattern.ts";

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
});
