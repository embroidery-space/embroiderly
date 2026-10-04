<script setup lang="ts">
import { Dialog, Splitter, SplitterPanel } from "@embroiderly/ui";

import { EditorView, basicSetup } from "codemirror";
import { shallowRef, useTemplateRef, onBeforeUnmount, watch } from "vue";

const typstEditorContainer = useTemplateRef("typst-editor-container");
const typstEditor = shallowRef<EditorView | null>(null);

// `onMounted` will not work here, since the container div is rendered conditionally inside the `Splitter`.
// Use a one-time watch to initialize the editor once the container is actually rendered.
watch(
  typstEditorContainer,
  (ref) => {
    if (!ref) throw new Error("PdfExportModal: The typst-editor-container ref must exist if watch is triggered");
    typstEditor.value = new EditorView({
      doc: "Start document",
      extensions: basicSetup,
      parent: ref,
    });
  },
  { once: true },
);

onBeforeUnmount(() => {
  typstEditor.value?.destroy();
  typstEditor.value = null;
});
</script>

<template>
  <Dialog fullscreen :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <Splitter direction="horizontal" :class="$style.splitter">
        <SplitterPanel>
          <div ref="typst-editor-container" :class="$style.typstEditorContainer"></div>
        </SplitterPanel>

        <SplitterPanel :class="$style.splitterPanel">PDF Preview</SplitterPanel>
      </Splitter>
    </template>
  </Dialog>
</template>

<style module>
.dialog[data-slot="content"] > [data-slot="body"] {
  padding: 0;
}

.splitter {
  width: 100%;
  height: 100%;
}

.splitter-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}

.typst-editor-container {
  overflow: hidden;

  width: 100%;
  height: 100%;

  & :global(.cm-editor) {
    height: 100%;
  }

  & :global(.cm-scroller) {
    overflow: auto;
  }
}
</style>
