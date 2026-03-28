import { describe, it, expect, vi } from "vitest";

import { extractShortcuts } from "./useShortcuts.ts";

describe("extractShortcuts", () => {
  describe("basic extraction", () => {
    it("extracts shortcut string with combination", () => {
      const handler = vi.fn();
      const items = [{ shortcut: "Control+Z", onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "Control+Z": handler });
    });

    it("extracts shortcut string with sequence", () => {
      const handler = vi.fn();
      const items = [{ shortcut: "G-D", onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "G-D": handler });
    });

    it("lowercases extracted shortcuts", () => {
      const handler = vi.fn();
      const items = [{ shortcut: "Control+S", onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "Control+S": handler });
    });
  });

  describe("handler types", () => {
    it("extracts shortcuts with onSelect handler", () => {
      const handler = vi.fn();
      const items = [{ shortcut: "Control+O", onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result["Control+O"]).toBe(handler);
    });

    it("extracts shortcuts with onClick handler", () => {
      const handler = vi.fn();
      const items = [{ shortcut: "Control+K", onClick: handler }];

      const result = extractShortcuts(items).value;

      expect(result["Control+K"]).toBe(handler);
    });

    it("prefers onSelect over onClick when both specified", () => {
      const onSelectHandler = vi.fn();
      const onClickHandler = vi.fn();
      const items = [{ shortcut: "Control+B", onSelect: onSelectHandler, onClick: onClickHandler }];

      const result = extractShortcuts(items).value;

      expect(result["Control+B"]).toBe(onSelectHandler);
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
              { shortcut: "Control+O", onSelect: handler1 },
              { shortcut: "Control+S", onSelect: handler2 },
            ],
          ],
        },
      ];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "Control+O": handler1, "Control+S": handler2 });
    });

    it("traverses nested items", () => {
      const handler = vi.fn();
      const items = [{ items: [[{ shortcut: "Control+A", onSelect: handler }]] }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "Control+A": handler });
    });

    it("handles deeply nested structures", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const items = [
        {
          children: [
            [
              {
                shortcut: "Control+1",
                onSelect: handler1,
                children: [[{ shortcut: "Control+2", onSelect: handler2 }]],
              },
            ],
          ],
        },
      ];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "Control+1": handler1, "Control+2": handler2 });
    });

    it("handles mixed children and items properties", () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      const items = [
        {
          children: [[{ shortcut: "Control+C", onSelect: handler1 }]],
          items: [[{ shortcut: "Control+I", onSelect: handler2 }]],
        },
      ];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({ "Control+C": handler1, "Control+I": handler2 });
    });
  });

  describe("edge cases", () => {
    it("handles empty arrays", () => {
      const result = extractShortcuts([]).value;

      expect(result).toEqual({});
    });

    it("ignores items without shortcut", () => {
      const handler = vi.fn();
      const items = [{ onSelect: handler }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({});
    });

    it("ignores items without handlers", () => {
      const items = [{ shortcut: "Control+N" }];

      const result = extractShortcuts(items).value;

      expect(result).toEqual({});
    });
  });
});
