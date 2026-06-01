import { useConfirm } from "@embroiderly/ui";

import { toRaw } from "vue";

import { useI18n } from "~/composables/";
import { usePatternFileStore } from "~/stores/";

/**
 * Returns a function that iterates all open patterns, prompting the user to save any dirty ones.
 * @returns `true` when all patterns have been closed, or `false` if the user cancelled.
 */
export function useCloseAllPatterns() {
  const confirm = useConfirm();
  const { fluent } = useI18n();

  const patternFileStore = usePatternFileStore();

  async function closeAllPatterns() {
    const patterns = structuredClone(toRaw(patternFileStore.openedPatterns).map((op) => toRaw(op)));
    for (const pattern of patterns) {
      if (pattern.dirty) {
        const accepted = await confirm.open(fluent.$ta("unsaved-changes", { pattern: pattern.title })).result;
        if (!accepted) return false;

        const saved = await patternFileStore.savePattern(pattern.id);
        if (!saved) return false;
      }
      await patternFileStore.closePattern(pattern.id, { force: true });
    }
    return true;
  }

  return { closeAllPatterns };
}
