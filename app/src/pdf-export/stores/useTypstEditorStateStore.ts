import { defineStore } from "pinia";
import { ref } from "vue";

export const enum TypstEditorAsideBlock {
  Assets = "assets",
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

    const wrapLines = ref(false);

    return {
      activeAsideBlock,
      toggleAsideBlock,

      viewMode,
      wrapLines,
    };
  },
  { persist: { pick: ["viewMode", "wrapLines"] } },
);
