import { defineStore } from "pinia";
import { ref } from "vue";

import { tools } from "~/core/tools/";
import type { PatternEditorTool } from "~/core/tools/";

interface OpenedPattern {
  id: string;
  title: string;
}

export const useAppStateStore = defineStore(
  "embroiderly-state",
  () => {
    const selectedTool = ref<PatternEditorTool>(tools.FullStitch);
    const selectedPaletteItemIndex = ref<number | undefined>(undefined);

    const openedPatterns = ref<OpenedPattern[]>([]);
    const currentPattern = ref<OpenedPattern | undefined>(undefined);

    /**
     * Adds the opened pattern to the app
     * If the pattern is already opened, it will not be added again.
     *
     * @param id - The unique identifier of the pattern.
     * @param title - The title of the pattern.
     */
    function addOpenedPattern(id: string, title: string) {
      const openedPattern: OpenedPattern = { id, title };
      if (!openedPatterns.value.some((p) => p.id === id)) openedPatterns.value.push(openedPattern);
      selectedPaletteItemIndex.value = undefined;
      currentPattern.value = openedPattern;
    }

    /**
     * Updates the currently opened pattern.
     * @param id - The unique identifier of the pattern.
     * @param title - The new title of the pattern.
     */
    function updateOpenedPattern(id: string, title: string) {
      const pattern = openedPatterns.value.find((p) => p.id === id);
      if (pattern) pattern.title = title;
    }

    /** Removes the currently opened pattern. */
    function removeCurrentPattern() {
      if (!openedPatterns.value || !currentPattern.value) return;
      selectedPaletteItemIndex.value = undefined;
      const index = openedPatterns.value.findIndex((p) => p.id === currentPattern.value!.id);
      if (index !== -1) openedPatterns.value.splice(index, 1);
      if (openedPatterns.value.length) currentPattern.value = openedPatterns.value[0];
      else currentPattern.value = undefined;
    }

    return {
      selectedTool,
      selectedPaletteItemIndex,
      openedPatterns,
      currentPattern,
      addOpenedPattern,
      updateOpenedPattern,
      removeCurrentPattern,
    };
  },
  { tauri: { save: false } },
);
