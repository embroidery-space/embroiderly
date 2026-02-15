import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ShortcutConfig } from "../types.ts";

import { ShortcutsContext } from "./context.ts";
import { createKeydownHandler } from "./key-handler.ts";

/** Creates a mock KeyboardEvent with the given properties. */
function createMockKeyboardEvent(options: {
  code: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  repeat?: boolean;
  target?: { tagName: string };
}): KeyboardEvent {
  const event = {
    code: options.code,
    altKey: options.altKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    shiftKey: options.shiftKey ?? false,
    repeat: options.repeat ?? false,
    target: options.target ?? { tagName: "DIV" },
    preventDefault: vi.fn(),
  };
  return event as unknown as KeyboardEvent;
}

/** Creates a `ShortcutsContext` with the given configuration. */
function createTestContext(options?: {
  combinations?: Map<string, ShortcutConfig>;
  sequences?: Map<string, ShortcutConfig>;
  excludeTags?: string[];
  chainDelay?: number;
}): ShortcutsContext {
  const ctx = new ShortcutsContext({
    chainDelay: options?.chainDelay ?? 500,
    excludeTags: options?.excludeTags ?? ["INPUT", "TEXTAREA", "SELECT"],
  });

  if (options?.combinations) {
    for (const [key, value] of options.combinations) {
      ctx.combinationsRegistry.set(key, value);
    }
  }
  if (options?.sequences) {
    for (const [key, value] of options.sequences) {
      ctx.sequencesRegistry.set(key, value);
    }
  }

  return ctx;
}

describe("createKeydownHandler", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("key combinations", () => {
    it("executes handler when combination matches", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyS", ctrlKey: true });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(event.preventDefault).toHaveBeenCalledTimes(1);
    });

    it("handles multiple modifiers", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_Shift_KeyS", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyS", ctrlKey: true, shiftKey: true });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("handles all four modifiers", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Alt_Control_Meta_Shift_KeyZ", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyZ",
        altKey: true,
        ctrlKey: true,
        metaKey: true,
        shiftKey: true,
      });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does not execute when combination is not registered", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyZ", ctrlKey: true });
      keydownHandler(event);

      expect(handler).not.toHaveBeenCalled();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("does not match when modifiers are different", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_Shift_KeyS", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyS", ctrlKey: true });
      keydownHandler(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("sorts modifiers alphabetically for consistent ID generation", () => {
      const handler = vi.fn();
      // Alt comes before Control in alphabetical order.
      const ctx = createTestContext({
        combinations: new Map([["Alt_Control_KeyA", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      // Press Ctrl first, then Alt - should still match.
      const event = createMockKeyboardEvent({ code: "KeyA", ctrlKey: true, altKey: true });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("ignores events from excluded tags", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyS",
        ctrlKey: true,
        target: { tagName: "INPUT" },
      });
      keydownHandler(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("allows shortcut in input when usingInput is true", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler, usingInput: true }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyS",
        ctrlKey: true,
        target: { tagName: "INPUT" },
      });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("allows shortcut in specific input when usingInput matches tag", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler, usingInput: "input" }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyS",
        ctrlKey: true,
        target: { tagName: "INPUT" },
      });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("ignores shortcut when usingInput does not match specific tag", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler, usingInput: "textarea" }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyS",
        ctrlKey: true,
        target: { tagName: "INPUT" },
      });
      keydownHandler(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("clears sequence state when combination fires", () => {
      const combinationHandler = vi.fn();
      const sequenceHandler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler: combinationHandler }]]),
        sequences: new Map([["KeyG-KeyG", { handler: sequenceHandler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      // Start a sequence.
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      // Fire a combination (should clear the sequence buffer).
      keydownHandler(createMockKeyboardEvent({ code: "KeyS", ctrlKey: true }));

      // Try to complete the sequence.
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(combinationHandler).toHaveBeenCalledTimes(1);
      expect(sequenceHandler).not.toHaveBeenCalled();
    });
  });

  describe("key sequences", () => {
    it("executes handler when sequence matches exactly", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("executes handler for multi-key sequence", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyD-KeyT", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyD" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyT" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("prevents default when sequence matches immediately", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyD", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      const lastEvent = createMockKeyboardEvent({ code: "KeyD" });
      keydownHandler(lastEvent);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(lastEvent.preventDefault).toHaveBeenCalled();
    });

    it("waits for timeout when there is a prefix match", () => {
      const shortHandler = vi.fn();
      const longHandler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([
          ["KeyG", { handler: shortHandler }],
          ["KeyG-KeyD", { handler: longHandler }],
        ]),
        chainDelay: 500,
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(shortHandler).not.toHaveBeenCalled();
      expect(longHandler).not.toHaveBeenCalled();

      vi.advanceTimersByTime(500);

      expect(shortHandler).toHaveBeenCalledTimes(1);
      expect(longHandler).not.toHaveBeenCalled();
    });

    it("does not wait when there is no prefix match", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyD", { handler }]]),
        chainDelay: 500,
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).not.toHaveBeenCalled();

      keydownHandler(createMockKeyboardEvent({ code: "KeyD" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("clears sequence buffer on modifier key press", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyA", ctrlKey: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).not.toHaveBeenCalled();
    });

    it("clears sequence buffer on Alt key press", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyX", altKey: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).not.toHaveBeenCalled();
    });

    it("clears sequence buffer on Meta key press", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyX", metaKey: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).not.toHaveBeenCalled();
    });

    it("clears sequence buffer on Shift key press", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyX", shiftKey: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).not.toHaveBeenCalled();
    });

    it("ignores repeated key events", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      // Repeated key (held down).
      keydownHandler(createMockKeyboardEvent({ code: "KeyG", repeat: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG", repeat: true }));
      // Actual second press.
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does not execute sequence in excluded tags", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event1 = createMockKeyboardEvent({ code: "KeyG", target: { tagName: "INPUT" } });
      const event2 = createMockKeyboardEvent({ code: "KeyG", target: { tagName: "INPUT" } });
      keydownHandler(event1);
      keydownHandler(event2);

      expect(handler).not.toHaveBeenCalled();
    });

    it("allows sequence in input when usingInput is true", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG", { handler, usingInput: true }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event1 = createMockKeyboardEvent({ code: "KeyG", target: { tagName: "INPUT" } });
      const event2 = createMockKeyboardEvent({ code: "KeyG", target: { tagName: "INPUT" } });
      keydownHandler(event1);
      keydownHandler(event2);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("resets buffer after mismatch", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyD", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyX" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyD" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("handles single key as sequence", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["Escape", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "Escape" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("cancels pending timer when new key is pressed", () => {
      const shortHandler = vi.fn();
      const longHandler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([
          ["KeyG", { handler: shortHandler }],
          ["KeyG-KeyD", { handler: longHandler }],
        ]),
        chainDelay: 500,
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      // Advance time partially.
      vi.advanceTimersByTime(200);

      // Press the next key in the sequence.
      keydownHandler(createMockKeyboardEvent({ code: "KeyD" }));

      expect(shortHandler).not.toHaveBeenCalled();
      expect(longHandler).toHaveBeenCalledTimes(1);

      // Even after waiting, the short handler should not fire.
      vi.advanceTimersByTime(500);

      expect(shortHandler).not.toHaveBeenCalled();
    });
  });

  describe("event target handling", () => {
    it("does not ignore events from non-excluded tags", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler }]]),
        excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyS",
        ctrlKey: true,
        target: { tagName: "DIV" },
      });
      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("handles null target gracefully", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = {
        code: "KeyS",
        ctrlKey: true,
        altKey: false,
        metaKey: false,
        shiftKey: false,
        repeat: false,
        target: null,
        preventDefault: vi.fn(),
      } as unknown as KeyboardEvent;

      keydownHandler(event);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("compares tags case-insensitively", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler }]]),
        excludeTags: ["INPUT"],
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({
        code: "KeyS",
        ctrlKey: true,
        target: { tagName: "input" },
      });

      keydownHandler(event);

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("interaction between combinations and sequences", () => {
    it("checks combination first, then sequence", () => {
      const combinationHandler = vi.fn();
      const sequenceHandler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyG", { handler: combinationHandler }]]),
        sequences: new Map([["KeyG", { handler: sequenceHandler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyG", ctrlKey: true });
      keydownHandler(event);

      expect(combinationHandler).toHaveBeenCalledTimes(1);
      expect(sequenceHandler).not.toHaveBeenCalled();
    });

    it("falls through to sequence when no combination matches", () => {
      const sequenceHandler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyS", { handler: vi.fn() }]]),
        sequences: new Map([["KeyG", { handler: sequenceHandler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyG" });
      keydownHandler(event);

      expect(sequenceHandler).toHaveBeenCalledTimes(1);
    });

    it("does not check sequence when combination matches", () => {
      const combinationHandler = vi.fn();
      const sequenceHandler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyG", { handler: combinationHandler }]]),
        sequences: new Map([["KeyG-KeyG", { handler: sequenceHandler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG", ctrlKey: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(combinationHandler).toHaveBeenCalledTimes(1);
      expect(sequenceHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe("edge cases", () => {
    it("handles empty registries", () => {
      const ctx = createTestContext();
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyA", ctrlKey: true });

      expect(() => keydownHandler(event)).not.toThrow();
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("handles key without modifiers when only combinations are registered", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([["Control_KeyA", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      const event = createMockKeyboardEvent({ code: "KeyA" });
      keydownHandler(event);

      expect(handler).not.toHaveBeenCalled();
    });

    it("handles multiple handlers for different combinations", () => {
      const handlerA = vi.fn();
      const handlerB = vi.fn();
      const ctx = createTestContext({
        combinations: new Map([
          ["Control_KeyA", { handler: handlerA }],
          ["Control_KeyB", { handler: handlerB }],
        ]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyA", ctrlKey: true }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyB", ctrlKey: true }));

      expect(handlerA).toHaveBeenCalledTimes(1);
      expect(handlerB).toHaveBeenCalledTimes(1);
    });

    it("handles chainDelay of 0", () => {
      const shortHandler = vi.fn();
      const longHandler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([
          ["KeyG", { handler: shortHandler }],
          ["KeyG-KeyD", { handler: longHandler }],
        ]),
        chainDelay: 0,
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      vi.advanceTimersByTime(0);

      expect(shortHandler).toHaveBeenCalledTimes(1);
    });

    it("handles sequence with same key repeated multiple times", () => {
      const handler = vi.fn();
      const ctx = createTestContext({
        sequences: new Map([["KeyG-KeyG-KeyG", { handler }]]),
      });
      const keydownHandler = createKeydownHandler(ctx);

      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));
      keydownHandler(createMockKeyboardEvent({ code: "KeyG" }));

      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
