import { defineStore } from "pinia";
import { ref } from "vue";

import { tools } from "~/lib/tools/";
import type { PatternEditorTool } from "~/lib/tools/";

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
    const palettePanelCollapsed = ref(false);
    const palettePanelSize = ref<number>();

    const canvasPanelCollapsed = ref(false);
    const canvasPanelSize = ref<number>();

    const selectedTool = ref<PatternEditorTool>(tools.FullStitch);
    const selectedPaletteItemIndex = ref<number>();
    const selectedLayerIndex = ref(0);

    const paletteMode = ref(PaletteMode.Regular);

    const canvasZoom = ref(1);

    function $reset() {
      selectedTool.value = tools.FullStitch;
      selectedPaletteItemIndex.value = undefined;
      selectedLayerIndex.value = 0;

      paletteMode.value = PaletteMode.Regular;

      canvasZoom.value = 1;
    }

    return {
      palettePanelCollapsed,
      palettePanelSize,
      canvasPanelCollapsed,
      canvasPanelSize,
      selectedTool,
      selectedPaletteItemIndex,
      selectedLayerIndex,
      paletteMode,
      canvasZoom,
      $reset,
    };
  },
  {
    tauri: {
      autoStart: true,
      filterKeys: ["palettePanelCollapsed", "palettePanelSize", "canvasPanelCollapsed", "canvasPanelSize"],
      filterKeysStrategy: "pick",
    },
  },
);
