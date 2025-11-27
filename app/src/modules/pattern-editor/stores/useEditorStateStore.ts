import { defineStore } from "pinia";
import { ref } from "vue";

import { tools } from "~/core/tools/";
import type { PatternEditorTool } from "~/core/tools/";

export const useEditorStateStore = defineStore(
  "embroiderly-pattern-editor-state",
  () => {
    const selectedTool = ref<PatternEditorTool>(tools.FullStitch);
    const selectedPaletteItemIndex = ref<number>();

    return {
      selectedTool,
      selectedPaletteItemIndex,
    };
  },
  { tauri: { save: false, sync: false } },
);
