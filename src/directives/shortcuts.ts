import type { DirectiveBinding } from "vue";
import { useShortcuts } from "#/composables";

/** Vue.js directive to handle keyboard shortcuts on a specific element. */
export function ShortcutsDirective<Value extends () => void>(el: HTMLElement, binding: DirectiveBinding<Value>) {
  const { value, modifiers } = binding;
  const shortcuts = useShortcuts(el);

  const key = Object.keys(modifiers)
    .map((mod) => {
      // Transform modifiers to key codes.
      // See https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values

      if (/^[0-9]$/.test(mod)) return `Digit${mod}`;
      if (/^[a-z]$/.test(mod)) return `Key${mod.toUpperCase()}`;

      // If the modifier is not a digit or a character, then it is a multi word modifier.
      // In such a case, we need to transform it to PascalCase.
      // For example: "shift_right" -> "ShiftRight"
      return mod
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
    })
    .join("+");

  shortcuts.on(key, value);
}
