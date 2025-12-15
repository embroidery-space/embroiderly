import type { ShortcutConfig, ShortcutsContext } from "../types.ts";

import { MODIFIER_ORDER } from "./key-mapping.ts";

interface SequenceState {
  buffer: string[];
  timer: ReturnType<typeof setTimeout> | null;
}

const sequenceState: SequenceState = {
  buffer: [],
  timer: null,
};

function clearSequenceState() {
  if (sequenceState.timer !== null) {
    clearTimeout(sequenceState.timer);
    sequenceState.timer = null;
  }
  sequenceState.buffer = [];
}

export function createKeydownHandler(ctx: ShortcutsContext) {
  return (event: KeyboardEvent) => {
    if (checkCombination(event, ctx)) return;
    checkSequence(event, ctx);
  };
}

function checkCombination(event: KeyboardEvent, ctx: ShortcutsContext) {
  const id = buildCombinationId(event);
  if (!id) return false;

  const entry = ctx.combinationsRegistry.get(id);
  if (!entry) return false;

  if (shouldIgnoreEvent(event, ctx.options.excludeTags, entry)) return false;

  event.preventDefault();
  entry.handler();

  clearSequenceState();

  return true;
}

function checkSequence(event: KeyboardEvent, ctx: ShortcutsContext) {
  if (event.repeat) return;
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    clearSequenceState();
    return;
  }

  if (sequenceState.timer !== null) {
    clearTimeout(sequenceState.timer);
    sequenceState.timer = null;
  }

  sequenceState.buffer.push(event.code);
  const currentSequence = sequenceState.buffer.join("-");

  let hasExactMatch = false;
  let hasPrefixMatch = false;
  let exactEntry: ShortcutConfig | undefined;
  for (const [key, entry] of ctx.sequencesRegistry) {
    if (key === currentSequence) {
      hasExactMatch = true;
      exactEntry = entry;
    } else if (key.startsWith(currentSequence + "-")) {
      hasPrefixMatch = true;
    }
  }

  if (hasPrefixMatch) {
    sequenceState.timer = setTimeout(() => {
      if (hasExactMatch && exactEntry && !shouldIgnoreEvent(event, ctx.options.excludeTags, exactEntry)) {
        exactEntry.handler();
      }
      clearSequenceState();
    }, ctx.options.chainDelay);
  } else {
    if (exactEntry && !shouldIgnoreEvent(event, ctx.options.excludeTags, exactEntry)) {
      event.preventDefault();
      exactEntry.handler();
    }
    clearSequenceState();
  }
}

function buildCombinationId(event: KeyboardEvent): string | null {
  const modifiers: string[] = [];

  if (event.altKey) modifiers.push("Alt");
  if (event.ctrlKey) modifiers.push("Control");
  if (event.metaKey) modifiers.push("Meta");
  if (event.shiftKey) modifiers.push("Shift");

  // If no modifiers are pressed, return `null`.
  // This event should be handled as a _key sequence_ instead.
  if (!modifiers.length) return null;

  // Sort modifiers alphabetically to ensure consistent ID generation.
  modifiers.sort((a, b) => MODIFIER_ORDER.indexOf(a) - MODIFIER_ORDER.indexOf(b));

  return [...modifiers, event.code].join("_");
}

function shouldIgnoreEvent(event: KeyboardEvent, excludeTags: string[], entry?: ShortcutConfig): boolean {
  const target = event.target as HTMLElement | null;
  if (!target) return false;

  const tagName = target.tagName.toUpperCase();
  if (!excludeTags.includes(tagName)) return false;

  if (entry?.usingInput === true) return false;
  if (typeof entry?.usingInput === "string" && entry.usingInput.toUpperCase() === tagName) return false;

  return true;
}
