import { describe, it, expect } from "vitest";

import { parseShortcutDisplay, splitShortcutKey } from "./shortcut.ts";

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

describe("splitShortcutKey", () => {
  it.each([
    ["F", ["F"]],
    ["G-D", ["G", "D"]],
    ["P-T-L", ["P", "T", "L"]],
  ])("splits plain sequence %s", (key, expected) => {
    expect(splitShortcutKey(key)).toEqual(expected);
  });

  it.each([
    ["Control+Z", ["Control+Z"]],
    ["Ctrl+-", ["Ctrl+-"]],
    ["Ctrl+Shift+S", ["Ctrl+Shift+S"]],
  ])("keeps plain combination %s intact", (key, expected) => {
    expect(splitShortcutKey(key)).toEqual(expected);
  });

  it.each([
    ["Shift+V-M", ["Shift+V", "M"]],
    ["Shift+A-Shift+B", ["Shift+A", "Shift+B"]],
  ])("splits mixed sequence %s into steps", (key, expected) => {
    expect(splitShortcutKey(key)).toEqual(expected);
  });
});
