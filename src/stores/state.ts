import { ref } from "vue";
import { defineStore } from "pinia";
import { FullStitchKind, type StitchKind, type PatternKey } from "#/schemas/index.ts";

interface OpenedPattern {
  title: string;
  key: PatternKey;
}

export const useAppStateStore = defineStore(
  "embroidery-studio-state",
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
     * @param title The title of the pattern.
     * @param key The key of the pattern. Actually, the key is the file path of the pattern.
     */
    function addOpenedPattern(title: string, key: PatternKey) {
      const openedPattern: OpenedPattern = { title, key };
      if (openedPatterns.value.findIndex((p) => p.key === key) < 0) openedPatterns.value.push(openedPattern);
      selectedPaletteItemIndexes.value = [];
      currentPattern.value = openedPattern;
    }

    function removeCurrentPattern() {
      if (!openedPatterns.value || !currentPattern.value) return;
      selectedPaletteItemIndexes.value = [];
      const index = openedPatterns.value.findIndex((p) => p.key === currentPattern.value!.key);
      if (index >= 0) openedPatterns.value.splice(index, 1);
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
      removeCurrentPattern,
    };
  },
  {
    persist: [
      { storage: sessionStorage, omit: ["lastOpenedFolder", "lastSavedFolder"] },
      { storage: localStorage, pick: ["lastOpenedFolder", "lastSavedFolder"] },
    ],
  },
);
