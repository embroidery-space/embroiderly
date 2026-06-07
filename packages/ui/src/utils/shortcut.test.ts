import { describe, it, expect } from "vitest";

import { parseShortcutDisplay } from "./shortcut.ts";

describe("parseShortcutDisplay", () => {
  it.each([
    ["Control+Z", ["Ctrl+Z"]],
    ["Ctrl+Shift+S", ["Ctrl+Shift+S"]],
    ["Shift+Ctrl+Z", ["Ctrl+Shift+Z"]],
  ])("parses key combination %s", (shortcut, expected) => {
    expect(parseShortcutDisplay(shortcut)).toEqual(expected);
  });

  it.each([
    ["P", ["P"]],
    ["P-T", ["P", "T"]],
    ["P-T-L", ["P", "T", "L"]],
  ])("parses key sequence %s", (shortcut, expected) => {
    expect(parseShortcutDisplay(shortcut)).toEqual(expected);
  });
});
