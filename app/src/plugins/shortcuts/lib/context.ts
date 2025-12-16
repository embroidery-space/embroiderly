import type { ShortcutConfig, ShortcutsPluginOptions } from "../types.ts";

const DEFAULT_OPTIONS: Required<ShortcutsPluginOptions> = {
  chainDelay: 500,
  excludeTags: ["INPUT", "TEXTAREA", "SELECT"],
};

/** Provides the shared configuration and state for the shortcuts plugin. */
export class ShortcutsContext {
  readonly options: Required<ShortcutsPluginOptions>;

  readonly combinationsRegistry = new Map<string, ShortcutConfig>();
  readonly sequencesRegistry = new Map<string, ShortcutConfig>();

  readonly sequenceState = new SequenceState();

  constructor(options?: ShortcutsPluginOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
}

/** Manages the state for key sequence detection. */
export class SequenceState {
  #buffer: string[] = [];
  #timer: ReturnType<typeof setTimeout> | null = null;

  /** Appends a key code to the sequence buffer. */
  pushKey(code: string) {
    this.#buffer.push(code);
  }

  /** Returns the current sequence as a hyphen-separated string. */
  getCurrentSequence() {
    return this.#buffer.join("-");
  }

  /** Returns whether a sequence timer is currently active. */
  hasActiveTimer() {
    return this.#timer !== null;
  }

  /** Sets the sequence timer. Clears any existing timer first. */
  setTimer(timer: ReturnType<typeof setTimeout>) {
    this.clearTimer();
    this.#timer = timer;
  }

  /** Clears the sequence timer without affecting the buffer. */
  clearTimer() {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }

  /** Clears both the sequence buffer and timer. */
  clear() {
    this.clearTimer();
    this.#buffer = [];
  }
}
