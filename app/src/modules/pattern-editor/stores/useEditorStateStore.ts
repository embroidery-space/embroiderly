import { defineStore } from "pinia";
import { ref } from "vue";

import { tools } from "~/modules/pattern-editor/lib/tools/";
import type { PatternEditorTool } from "~/modules/pattern-editor/lib/tools/";

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
