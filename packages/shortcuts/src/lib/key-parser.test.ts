import { describe, it, expect } from "vitest";

import { parseShortcutKey } from "./key-parser.ts";

describe("parseShortcutKey", () => {
  describe("key combinations", () => {
    it("parses single modifier + key", () => {
      const result = parseShortcutKey("ctrl+s");
      expect(result).toEqual({ type: "combination", id: "Control+KeyS" });
    });

    it("parses multiple modifiers + key", () => {
      const result = parseShortcutKey("ctrl+shift+s");
      expect(result).toEqual({ type: "combination", id: "Control+Shift+KeyS" });
    });

    it("parses all modifiers + key", () => {
      const result = parseShortcutKey("ctrl+alt+meta+shift+z");
      expect(result).toEqual({ type: "combination", id: "Alt+Control+Meta+Shift+KeyZ" });
    });

    it("normalizes modifier order alphabetically", () => {
      const result = parseShortcutKey("shift+ctrl+s");
      expect(result).toEqual({ type: "combination", id: "Control+Shift+KeyS" });
    });

    it("handles case insensitivity", () => {
      const result = parseShortcutKey("Ctrl+Shift+S");
      expect(result).toEqual({ type: "combination", id: "Control+Shift+KeyS" });
    });

    it("handles mixed case", () => {
      const result = parseShortcutKey("cTrL+sHiFt+s");
      expect(result).toEqual({ type: "combination", id: "Control+Shift+KeyS" });
    });

    describe("modifier aliases", () => {
      it("parses cmd as Meta", () => {
        const result = parseShortcutKey("cmd+z");
        expect(result).toEqual({ type: "combination", id: "Meta+KeyZ" });
      });

      it("parses command as Meta", () => {
        const result = parseShortcutKey("command+z");
        expect(result).toEqual({ type: "combination", id: "Meta+KeyZ" });
      });

      it("parses win as Meta", () => {
        const result = parseShortcutKey("win+z");
        expect(result).toEqual({ type: "combination", id: "Meta+KeyZ" });
      });

      it("parses option as Alt", () => {
        const result = parseShortcutKey("option+a");
        expect(result).toEqual({ type: "combination", id: "Alt+KeyA" });
      });

      it("parses opt as Alt", () => {
        const result = parseShortcutKey("opt+a");
        expect(result).toEqual({ type: "combination", id: "Alt+KeyA" });
      });

      it("parses control as Control", () => {
        const result = parseShortcutKey("control+c");
        expect(result).toEqual({ type: "combination", id: "Control+KeyC" });
      });
    });

    describe("special keys", () => {
      it("parses function keys", () => {
        const result = parseShortcutKey("ctrl+f1");
        expect(result).toEqual({ type: "combination", id: "Control+F1" });
      });

      it("parses navigation keys", () => {
        const result = parseShortcutKey("ctrl+delete");
        expect(result).toEqual({ type: "combination", id: "Control+Delete" });
      });

      it("parses arrow keys", () => {
        const result = parseShortcutKey("shift+arrowup");
        expect(result).toEqual({ type: "combination", id: "Shift+ArrowUp" });
      });

      it("parses digit keys", () => {
        const result = parseShortcutKey("ctrl+1");
        expect(result).toEqual({ type: "combination", id: "Control+Digit1" });
      });

      it("parses key aliases (esc)", () => {
        const result = parseShortcutKey("ctrl+esc");
        expect(result).toEqual({ type: "combination", id: "Control+Escape" });
      });

      it("parses key aliases (del)", () => {
        const result = parseShortcutKey("shift+del");
        expect(result).toEqual({ type: "combination", id: "Shift+Delete" });
      });

      it("parses key aliases (return)", () => {
        const result = parseShortcutKey("ctrl+return");
        expect(result).toEqual({ type: "combination", id: "Control+Enter" });
      });
    });
  });

  describe("key sequences", () => {
    it("parses two-key sequence", () => {
      const result = parseShortcutKey("g-g");
      expect(result).toEqual({ type: "sequence", id: "KeyG-KeyG" });
    });

    it("parses multi-key sequence", () => {
      const result = parseShortcutKey("p-t-l");
      expect(result).toEqual({ type: "sequence", id: "KeyP-KeyT-KeyL" });
    });

    it("handles case insensitivity in sequences", () => {
      const result = parseShortcutKey("G-D");
      expect(result).toEqual({ type: "sequence", id: "KeyG-KeyD" });
    });

    it("parses function key sequences", () => {
      const result = parseShortcutKey("f1-f2");
      expect(result).toEqual({ type: "sequence", id: "F1-F2" });
    });

    it("parses digit sequences", () => {
      const result = parseShortcutKey("1-2-3");
      expect(result).toEqual({ type: "sequence", id: "Digit1-Digit2-Digit3" });
    });

    it("parses mixed key sequences", () => {
      const result = parseShortcutKey("g-d-1-f1");
      expect(result).toEqual({ type: "sequence", id: "KeyG-KeyD-Digit1-F1" });
    });

    it("parses single key as sequence", () => {
      const result = parseShortcutKey("escape");
      expect(result).toEqual({ type: "sequence", id: "Escape" });
    });
  });

  describe("invalid inputs", () => {
    it("returns null for unknown key in combination", () => {
      const result = parseShortcutKey("ctrl+invalidkey");
      expect(result).toBeNull();
    });

    it("returns null for unknown key in sequence", () => {
      const result = parseShortcutKey("x-invalidkey");
      expect(result).toBeNull();
    });

    it("returns null for combination with no main key", () => {
      const result = parseShortcutKey("ctrl+shift");
      expect(result).toBeNull();
    });

    it("returns null for combination with only modifiers", () => {
      const result = parseShortcutKey("ctrl+alt+shift+meta");
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = parseShortcutKey("");
      expect(result).toBeNull();
    });

    it("returns null for unknown modifier in combination", () => {
      const result = parseShortcutKey("invalidmod+s");
      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("handles whitespace in combination", () => {
      const result = parseShortcutKey("ctrl+ s ");
      expect(result).toEqual({ type: "combination", id: "Control+KeyS" });
    });

    it("handles whitespace in sequence", () => {
      const result = parseShortcutKey("g - d ");
      expect(result).toEqual({ type: "sequence", id: "KeyG-KeyD" });
    });

    it("distinguishes between combination and sequence separators", () => {
      const combination = parseShortcutKey("ctrl+s");
      expect(combination?.type).toBe("combination");

      const sequence = parseShortcutKey("g-g");
      expect(sequence?.type).toBe("sequence");
    });

    it("handles complex modifier ordering", () => {
      const result = parseShortcutKey("meta+shift+alt+ctrl+z");
      expect(result).toEqual({ type: "combination", id: "Alt+Control+Meta+Shift+KeyZ" });
    });

    it("parses numpad keys", () => {
      const result = parseShortcutKey("ctrl+numpad0");
      expect(result).toEqual({ type: "combination", id: "Control+Numpad0" });
    });

    it("parses punctuation keys", () => {
      const result = parseShortcutKey("ctrl+comma");
      expect(result).toEqual({ type: "combination", id: "Control+Comma" });
    });

    it("handles arrow key aliases", () => {
      const result = parseShortcutKey("ctrl+up");
      expect(result).toEqual({ type: "combination", id: "Control+ArrowUp" });
    });
  });
});
