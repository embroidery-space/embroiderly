import { useMagicKeys, whenever, type MaybeRefOrGetter } from "@vueuse/core";

/**
 * Vue.js composable to handle keyboard shortcuts.
 * It wraps the `useMagicKeys` from VueUse to provide a more convenient API.
 */
export function useShortcuts(target?: MaybeRefOrGetter<EventTarget>) {
  const keys = useMagicKeys({ target });
  return {
    on: (shortcut: string, callback: () => void) => {
      // Call the callback via an arrow function to prevent passing the `WatchCallback` arguments to it.
      return whenever(keys[shortcut]!, () => callback());
    },
  };
}
