import { describe, it, expect } from "vitest";

import { parseShortcutKey } from "./key-parser.ts";

describe("parseShortcutKey", () => {
  describe("key combinations", () => {
    it("parses single modifier + key", () => {
      const result = parseShortcutKey("ctrl_s");
      expect(result).toEqual({ type: "combination", id: "Control_KeyS" });
    });

    it("parses multiple modifiers + key", () => {
      const result = parseShortcutKey("ctrl_shift_s");
      expect(result).toEqual({ type: "combination", id: "Control_Shift_KeyS" });
    });

    it("parses all modifiers + key", () => {
      const result = parseShortcutKey("ctrl_alt_meta_shift_z");
      expect(result).toEqual({ type: "combination", id: "Alt_Control_Meta_Shift_KeyZ" });
    });

    it("normalizes modifier order alphabetically", () => {
      const result = parseShortcutKey("shift_ctrl_s");
      expect(result).toEqual({ type: "combination", id: "Control_Shift_KeyS" });
    });

    it("handles case insensitivity", () => {
      const result = parseShortcutKey("Ctrl_Shift_S");
      expect(result).toEqual({ type: "combination", id: "Control_Shift_KeyS" });
    });

    it("handles mixed case", () => {
      const result = parseShortcutKey("cTrL_sHiFt_s");
      expect(result).toEqual({ type: "combination", id: "Control_Shift_KeyS" });
    });

    describe("modifier aliases", () => {
      it("parses cmd as Meta", () => {
        const result = parseShortcutKey("cmd_z");
        expect(result).toEqual({ type: "combination", id: "Meta_KeyZ" });
      });

      it("parses command as Meta", () => {
        const result = parseShortcutKey("command_z");
        expect(result).toEqual({ type: "combination", id: "Meta_KeyZ" });
      });

      it("parses win as Meta", () => {
        const result = parseShortcutKey("win_z");
        expect(result).toEqual({ type: "combination", id: "Meta_KeyZ" });
      });

      it("parses option as Alt", () => {
        const result = parseShortcutKey("option_a");
        expect(result).toEqual({ type: "combination", id: "Alt_KeyA" });
      });

      it("parses opt as Alt", () => {
        const result = parseShortcutKey("opt_a");
        expect(result).toEqual({ type: "combination", id: "Alt_KeyA" });
      });

      it("parses control as Control", () => {
        const result = parseShortcutKey("control_c");
        expect(result).toEqual({ type: "combination", id: "Control_KeyC" });
      });
    });

    describe("special keys", () => {
      it("parses function keys", () => {
        const result = parseShortcutKey("ctrl_f1");
        expect(result).toEqual({ type: "combination", id: "Control_F1" });
      });

      it("parses navigation keys", () => {
        const result = parseShortcutKey("ctrl_delete");
        expect(result).toEqual({ type: "combination", id: "Control_Delete" });
      });

      it("parses arrow keys", () => {
        const result = parseShortcutKey("shift_arrowup");
        expect(result).toEqual({ type: "combination", id: "Shift_ArrowUp" });
      });

      it("parses digit keys", () => {
        const result = parseShortcutKey("ctrl_1");
        expect(result).toEqual({ type: "combination", id: "Control_Digit1" });
      });

      it("parses key aliases (esc)", () => {
        const result = parseShortcutKey("ctrl_esc");
        expect(result).toEqual({ type: "combination", id: "Control_Escape" });
      });

      it("parses key aliases (del)", () => {
        const result = parseShortcutKey("shift_del");
        expect(result).toEqual({ type: "combination", id: "Shift_Delete" });
      });

      it("parses key aliases (return)", () => {
        const result = parseShortcutKey("ctrl_return");
        expect(result).toEqual({ type: "combination", id: "Control_Enter" });
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
      const result = parseShortcutKey("ctrl_invalidkey");
      expect(result).toBeNull();
    });

    it("returns null for unknown key in sequence", () => {
      const result = parseShortcutKey("x-invalidkey");
      expect(result).toBeNull();
    });

    it("returns null for combination with no main key", () => {
      const result = parseShortcutKey("ctrl_shift");
      expect(result).toBeNull();
    });

    it("returns null for combination with only modifiers", () => {
      const result = parseShortcutKey("ctrl_alt_shift_meta");
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = parseShortcutKey("");
      expect(result).toBeNull();
    });

    it("returns null for unknown modifier in combination", () => {
      const result = parseShortcutKey("invalidmod_s");
      expect(result).toBeNull();
    });
  });

  describe("edge cases", () => {
    it("handles whitespace in combination", () => {
      const result = parseShortcutKey("ctrl_ s ");
      expect(result).toEqual({ type: "combination", id: "Control_KeyS" });
    });

    it("handles whitespace in sequence", () => {
      const result = parseShortcutKey("g - d ");
      expect(result).toEqual({ type: "sequence", id: "KeyG-KeyD" });
    });

    it("distinguishes between combination and sequence separators", () => {
      const combination = parseShortcutKey("ctrl_s");
      expect(combination?.type).toBe("combination");

      const sequence = parseShortcutKey("g-g");
      expect(sequence?.type).toBe("sequence");
    });

    it("handles complex modifier ordering", () => {
      const result = parseShortcutKey("meta_shift_alt_ctrl_z");
      expect(result).toEqual({ type: "combination", id: "Alt_Control_Meta_Shift_KeyZ" });
    });

    it("parses numpad keys", () => {
      const result = parseShortcutKey("ctrl_numpad0");
      expect(result).toEqual({ type: "combination", id: "Control_Numpad0" });
    });

    it("parses punctuation keys", () => {
      const result = parseShortcutKey("ctrl_comma");
      expect(result).toEqual({ type: "combination", id: "Control_Comma" });
    });

    it("handles arrow key aliases", () => {
      const result = parseShortcutKey("ctrl_up");
      expect(result).toEqual({ type: "combination", id: "Control_ArrowUp" });
    });
  });
});
