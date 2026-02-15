import { describe, it, expect, vi } from "vitest";

import { extractShortcuts, ShortcutsSeparator } from "./extractShortcuts.ts";

describe("extractShortcuts", () => {
  describe("basic extraction", () => {
    it("extracts key combinations", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["ctrl", "s"], onSelect: handler }];

      const result = extractShortcuts(items, ShortcutsSeparator.KeyCombination).value;

      expect(result).toEqual({ "ctrl+s": handler });
    });

    it("extracts key sequences", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["g", "d"], onSelect: handler }];

      const result = extractShortcuts(items, ShortcutsSeparator.KeySequence).value;

      expect(result).toEqual({ "g-d": handler });
    });

    it("lowercases extracted shortcuts", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["Ctrl", "S"], onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+s": handler });
    });
  });

  describe("handler types", () => {
    it("extracts shortcuts with onSelect handler", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["ctrl", "o"], onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result["ctrl+o"]).toBe(handler);
    });

    it("extracts shortcuts with onClick handler", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["ctrl", "k"], onClick: handler }];

      const result = extractShortcuts(items).value;

      expect(result["ctrl+k"]).toBe(handler);
    });

    it("prefers onSelect over onClick when both specified", () => {
      const onSelectHandler = vi.fn();
      const onClickHandler = vi.fn();
      const items = [{ kbds: ["ctrl", "b"], onSelect: onSelectHandler, onClick: onClickHandler }];

      const result = extractShortcuts(items).value;

      expect(result["ctrl+b"]).toBe(onSelectHandler);
    });
  });

  describe("nested structures", () => {
    it("traverses nested children", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const items = [
        {
          children: [
            [
              { kbds: ["ctrl", "o"], onSelect: handler1 },
              { kbds: ["ctrl", "s"], onSelect: handler2 },
            ],
          ],
        },
      ];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+o": handler1, "ctrl+s": handler2 });
    });

    it("traverses nested items", () => {
      const handler = vi.fn();
      const items = [{ items: [[{ kbds: ["ctrl", "a"], onSelect: handler }]] }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+a": handler });
    });

    it("handles deeply nested structures", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const items = [
        {
          children: [
            [
              {
                kbds: ["ctrl", "1"],
                onSelect: handler1,
                children: [[{ kbds: ["ctrl", "2"], onSelect: handler2 }]],
              },
            ],
          ],
        },
      ];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+1": handler1, "ctrl+2": handler2 });
    });

    it("handles mixed children and items properties", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const items = [
        {
          children: [[{ kbds: ["ctrl", "c"], onSelect: handler1 }]],
          items: [[{ kbds: ["ctrl", "i"], onSelect: handler2 }]],
        },
      ];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+c": handler1, "ctrl+i": handler2 });
    });
  });

  describe("edge cases", () => {
    it("handles empty arrays", () => {
      const result = extractShortcuts([]).value;

      expect(result).toEqual({});
    });

    it("ignores items without kbds", () => {
      const handler = vi.fn();
      const items = [{ onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({});
    });

    it("ignores items with empty kbds array", () => {
      const handler = vi.fn();
      const items = [{ kbds: [], onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({});
    });

    it("ignores items without handlers", () => {
      const items = [{ kbds: ["ctrl", "n"] }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({});
    });

    it("handles nested arrays", () => {
      const handler = vi.fn();
      const items = [[{ kbds: ["ctrl", "n"], onSelect: handler }]];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+n": handler });
    });
  });

  describe("complex key combinations", () => {
    it("handles multi-key combinations with underscores", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["ctrl", "shift", "s"], onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "ctrl+shift+s": handler });
    });

    it("handles key sequences with dashes", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["g", "g"], onSelect: handler }];

      const result = extractShortcuts(items, ShortcutsSeparator.KeySequence).value;

      expect(result).toEqual({ "g-g": handler });
    });

    it("handles single key shortcuts", () => {
      const handler = vi.fn();
      const items = [{ kbds: ["escape"], onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ escape: handler });
    });
  });
});
