import { defineStore } from "pinia";
import { ref } from "vue";

export const enum TypstEditorViewMode {
  Code = "code",
  SplitView = "split-view",
  Preview = "preview",
}

export const useTypstEditorStateStore = defineStore(
  "embroiderly-typst-editor-state",
  () => {
    const viewMode = ref(TypstEditorViewMode.SplitView);

    const wrapLines = ref(false);

    return {
      viewMode,
      wrapLines,
    };
  },
  { persist: true },
);
