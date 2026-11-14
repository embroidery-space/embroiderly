import { defineStore } from "pinia";
import { ref } from "vue";

import type { TypstEditorSettings } from "../lib/codemirror/";

export const enum TypstEditorAsideBlock {
  Assets = "assets",
  Settings = "settings",
}

export const enum TypstEditorViewMode {
  Code = "code",
  SplitView = "split-view",
  Preview = "preview",
}

export const useTypstEditorStateStore = defineStore(
  "embroiderly-typst-editor-state",
  () => {
    const activeAsideBlock = ref<TypstEditorAsideBlock | null>(null);
    function toggleAsideBlock(block: TypstEditorAsideBlock) {
      activeAsideBlock.value = activeAsideBlock.value === block ? null : block;
    }

    const viewMode = ref(TypstEditorViewMode.SplitView);
    const settings = ref<Required<TypstEditorSettings>>({
      fontSize: 14,
      fontLigatures: true,
      wrapLines: false,
    });

    return {
      activeAsideBlock,
      toggleAsideBlock,

      viewMode,
      settings,
    };
  },
  { persist: { pick: ["viewMode", "wrapLines"] } },
);
