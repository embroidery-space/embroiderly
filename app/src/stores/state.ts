import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { tools, type PatternEditorTool } from "~/core/tools/";
import { AppEvent, posthog } from "~/vendor";

interface OpenedPattern {
  id: string;
  title: string;
}

export const useAppStateStore = defineStore(
  "embroiderly-state",
  () => {
    const selectedTool = ref<PatternEditorTool>(tools.FullStitch);
    const selectedPaletteItemIndexes = ref<number[]>([]);

    watch(selectedTool, (tool, prevTool) => {
      posthog.capture(new AppEvent.ToolChanged(tool.name, prevTool.name));
    });

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
      selectedTool,
      selectedPaletteItemIndexes,
      openedPatterns,
      currentPattern,
      addOpenedPattern,
      updateOpenedPattern,
      removeCurrentPattern,
    };
  },
  { tauri: { save: false } },
);
