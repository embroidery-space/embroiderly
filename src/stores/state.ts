import { ref } from "vue";
import { defineStore } from "pinia";
import { FullStitchKind, type StitchKind } from "#/core/pattern/";

interface OpenedPattern {
  id: string;
  title: string;
}

export const useAppStateStore = defineStore(
  "embroiderly-state",
  () => {
    const lastOpenedFolder = ref<string | null>(null);
    const lastSavedFolder = ref<string | null>(null);

    const selectedStitchTool = ref<StitchKind>(FullStitchKind.Full);
    const selectedPaletteItemIndexes = ref<number[]>([]);
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
      if (openedPatterns.value.findIndex((p) => p.id === id) === -1) openedPatterns.value.push(openedPattern);
      selectedPaletteItemIndexes.value = [];
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
      selectedPaletteItemIndexes.value = [];
      const index = openedPatterns.value.findIndex((p) => p.id === currentPattern.value!.id);
      if (index !== -1) openedPatterns.value.splice(index, 1);
      if (openedPatterns.value.length) currentPattern.value = openedPatterns.value[0];
      else currentPattern.value = undefined;
    }

    return {
      lastOpenedFolder,
      lastSavedFolder,
      selectedStitchTool,
      selectedPaletteItemIndexes,
      openedPatterns,
      currentPattern,
      addOpenedPattern,
      updateOpenedPattern,
      removeCurrentPattern,
    };
  },
  {
    tauri: { save: false, sync: false },
    persist: [
      { storage: sessionStorage, omit: ["lastOpenedFolder", "lastSavedFolder"] },
      { storage: localStorage, pick: ["lastOpenedFolder", "lastSavedFolder"] },
    ],
  },
);
