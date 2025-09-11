export const MODIFIERS: Modifiers = {
  mod1: (e) => e.ctrlKey,
  mod2: (e) => e.shiftKey,
  mod3: (e) => e.altKey,
};

interface Modifiers {
  /** Modifier 1. Default is the `Ctrl` key. */
  mod1: ModifierChecker;

  /** Modifier 2. Default is the `Shift` key. */
  mod2: ModifierChecker;

  /** Modifier 3. Default is the `Alt` key. */
  mod3: ModifierChecker;
}

/** A function that checks if a modifier key is pressed based on the given event. */
type ModifierChecker = (event: MouseEvent) => boolean;

export interface ModifiersState {
  mod1: boolean;
  mod2: boolean;
  mod3: boolean;
}
