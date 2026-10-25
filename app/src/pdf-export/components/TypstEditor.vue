<script setup lang="ts">
import { setDiagnostics } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import { Compartment, Prec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { shallowRef, useTemplateRef, onMounted, onBeforeUnmount, watch } from "vue";

import { editorSetup, nordDark, nordLight, typst } from "../lib/codemirror/";

export interface TypstEditorProps {
  /**
   * Whether the dark theme is applied.
   * @default false
   */
  dark?: boolean;

  /**
   * Whether lines are wrapped.
   * @default false
   */
  wrapLines?: boolean;
}

const doc = defineModel<string>({ required: true });
const { dark = false, wrapLines = false } = defineProps<TypstEditorProps>();

const container = useTemplateRef("container");

const editor = shallowRef<EditorView | null>(null);

const theme = new Compartment();
watch(
  () => dark,
  (value) => {
    if (!editor.value) return;
    editor.value.dispatch({ effects: theme.reconfigure(Prec.highest(value ? nordDark : nordLight)) });
  },
);

const lineWrapping = new Compartment();
watch(
  () => wrapLines,
  (value) => {
    if (!editor.value) return;
    editor.value.dispatch({ effects: lineWrapping.reconfigure(value ? EditorView.lineWrapping : []) });
  },
);

watch(doc, (newDoc) => {
  if (!editor.value || newDoc === editor.value.state.doc.toString()) return;
  editor.value.dispatch({ changes: { from: 0, to: editor.value.state.doc.length, insert: newDoc } });
});

onMounted(() => {
  editor.value = new EditorView({
    doc: doc.value,
    extensions: [
      editorSetup,
      lineWrapping.of(wrapLines ? EditorView.lineWrapping : []),

      Prec.high(typst()),
      Prec.highest(theme.of(dark ? nordDark : nordLight)),

      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;

        const content = update.state.doc.toString();
        if (content !== doc.value) doc.value = content;
      }),
    ],
    parent: container.value!,
  });
});

onBeforeUnmount(() => {
  editor.value?.destroy();
  editor.value = null;
});

defineExpose({
  setDiagnostics(diagnostics: readonly Diagnostic[]) {
    if (!editor.value) return;
    editor.value.dispatch(setDiagnostics(editor.value.state, diagnostics));
  },
});
</script>

<template>
  <div ref="container" :class="$style.container"></div>
</template>

<style module>
.container {
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
