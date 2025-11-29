import { defineStore } from "pinia";
import { ref } from "vue";

import { tools } from "~/pattern-editor/lib/tools/";
import type { PatternEditorTool } from "~/pattern-editor/lib/tools/";

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
