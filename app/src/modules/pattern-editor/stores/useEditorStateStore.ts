import { defineStore } from "pinia";
import { ref } from "vue";

import { tools } from "~/pattern-editor/lib/tools/";
import type { PatternEditorTool } from "~/pattern-editor/lib/tools/";

export const enum PaletteMode {
  /** A regular palette mode in which users can select tools and color to draw patterns. */
  Regular = "regular",

  /**
   * A special palette mode which is enabled when users edit the palette.
   * In this mode, users can't select tools and draw patterns.
   * Instead, they can add or remove colors, sort them, assign symbols, etc.
   */
  Editing = "editing",
}

export const useEditorStateStore = defineStore(
  "embroiderly-pattern-editor-state",
  () => {
    const selectedTool = ref<PatternEditorTool>(tools.FullStitch);
    const selectedPaletteItemIndex = ref<number>();

    const paletteMode = ref(PaletteMode.Regular);

    return {
      selectedTool,
      selectedPaletteItemIndex,
      paletteMode,
    };
  },
  { tauri: { save: false, sync: false } },
);
