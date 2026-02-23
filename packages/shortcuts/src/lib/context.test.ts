import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { SequenceState, ShortcutsContext } from "./context.ts";

describe("ShortcutsContext", () => {
  it("initializes with default options", () => {
    const ctx = new ShortcutsContext();

    expect(ctx.options.chainDelay).toBe(500);
    expect(ctx.options.excludeTags).toEqual(["INPUT", "TEXTAREA", "SELECT"]);

    expect(ctx.combinationsRegistry.size).toBe(0);
    expect(ctx.sequencesRegistry.size).toBe(0);

    expect(ctx.sequenceState.getCurrentSequence()).toBe("");
  });

  it("initializes with custom options", () => {
    const ctx = new ShortcutsContext({
      chainDelay: 250,
      excludeTags: ["BUTTON"],
    });

    expect(ctx.options.chainDelay).toBe(250);
    expect(ctx.options.excludeTags).toEqual(["BUTTON"]);
  });
});

describe("SequenceState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("pushKey", () => {
    it("adds a key to the buffer", () => {
      const state = new SequenceState();

      state.pushKey("KeyA");

      expect(state.getCurrentSequence()).toBe("KeyA");
    });

    it("adds multiple keys to the buffer", () => {
      const state = new SequenceState();

      state.pushKey("KeyA");
      state.pushKey("KeyB");
      state.pushKey("KeyC");

      expect(state.getCurrentSequence()).toBe("KeyA-KeyB-KeyC");
    });
  });

  describe("getCurrentSequence", () => {
    it("returns empty string for empty buffer", () => {
      const state = new SequenceState();

      expect(state.getCurrentSequence()).toBe("");
    });

    it("returns single key without hyphen", () => {
      const state = new SequenceState();

      state.pushKey("Escape");

      expect(state.getCurrentSequence()).toBe("Escape");
    });

    it("returns hyphen-separated keys", () => {
      const state = new SequenceState();

      state.pushKey("KeyG");
      state.pushKey("KeyD");

      expect(state.getCurrentSequence()).toBe("KeyG-KeyD");
    });
  });

  describe("hasActiveTimer", () => {
    it("returns false when no timer is set", () => {
      const state = new SequenceState();

      expect(state.hasActiveTimer()).toBe(false);
    });

    it("returns true when timer is set", () => {
      const state = new SequenceState();

      state.setTimer(setTimeout(() => {}, 100));

      expect(state.hasActiveTimer()).toBe(true);
    });

    it("returns false after timer is cleared", () => {
      const state = new SequenceState();

      state.setTimer(setTimeout(() => {}, 100));
      state.clearTimer();

      expect(state.hasActiveTimer()).toBe(false);
    });
  });

  describe("setTimer", () => {
    it("sets a new timer", () => {
      const state = new SequenceState();
      const callback = vi.fn();

      state.setTimer(setTimeout(callback, 100));
      expect(state.hasActiveTimer()).toBe(true);
      expect(callback).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("clears existing timer before setting new one", () => {
      const state = new SequenceState();
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      state.setTimer(setTimeout(firstCallback, 100));
      state.setTimer(setTimeout(secondCallback, 100));

      vi.advanceTimersByTime(100);

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledTimes(1);
    });
  });

  describe("clearTimer", () => {
    it("clears the active timer", () => {
      const state = new SequenceState();
      const callback = vi.fn();

      state.setTimer(setTimeout(callback, 100));
      state.clearTimer();

      vi.advanceTimersByTime(100);

      expect(callback).not.toHaveBeenCalled();
      expect(state.hasActiveTimer()).toBe(false);
    });

    it("does nothing when no timer is set", () => {
      const state = new SequenceState();

      expect(() => state.clearTimer()).not.toThrow();
      expect(state.hasActiveTimer()).toBe(false);
    });

    it("does not affect the buffer", () => {
      const state = new SequenceState();

      state.pushKey("KeyA");
      state.pushKey("KeyB");
      state.setTimer(setTimeout(() => {}, 100));
      state.clearTimer();

      expect(state.getCurrentSequence()).toBe("KeyA-KeyB");
    });
  });

  describe("clear", () => {
    it("clears both timer and buffer", () => {
      const state = new SequenceState();
      const callback = vi.fn();

      state.pushKey("KeyA");
      state.pushKey("KeyB");
      state.setTimer(setTimeout(callback, 100));
      state.clear();

      expect(state.getCurrentSequence()).toBe("");
      expect(state.hasActiveTimer()).toBe(false);

      vi.advanceTimersByTime(100);
      expect(callback).not.toHaveBeenCalled();
    });

    it("works when buffer is empty", () => {
      const state = new SequenceState();

      expect(() => state.clear()).not.toThrow();
      expect(state.getCurrentSequence()).toBe("");
    });

    it("works when timer is not set", () => {
      const state = new SequenceState();

      state.pushKey("KeyA");

      expect(() => state.clear()).not.toThrow();
      expect(state.getCurrentSequence()).toBe("");
    });

    it("can be called multiple times", () => {
      const state = new SequenceState();

      state.pushKey("KeyA");
      state.setTimer(setTimeout(() => {}, 100));
      state.clear();
      state.clear();

      expect(state.getCurrentSequence()).toBe("");
      expect(state.hasActiveTimer()).toBe(false);
    });
  });
});
