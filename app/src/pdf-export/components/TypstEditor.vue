<script setup lang="ts">
import { setDiagnostics } from "@codemirror/lint";
import type { Diagnostic } from "@codemirror/lint";
import { Compartment, Prec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { shallowRef, useTemplateRef, onMounted, onBeforeUnmount, watch } from "vue";

import {
  editorSetup,
  typst,
  typstTheme,
  toggleHeading,
  toggleFormatting,
  toggleList,
  insertLink,
} from "../lib/codemirror/";
import type { TypstEditorSettings } from "../lib/codemirror/";

export interface TypstEditorProps {
  dark?: boolean;
  settings?: TypstEditorSettings;
}

const doc = defineModel<string>({ required: true });
const { dark = false, settings = undefined } = defineProps<TypstEditorProps>();
const emit = defineEmits<{
  "selection-change": [text: string];
}>();

const container = useTemplateRef("container");

const editor = shallowRef<EditorView | null>(null);

watch(doc, (newDoc) => {
  if (!editor.value || newDoc === editor.value.state.doc.toString()) return;
  editor.value.dispatch({ changes: { from: 0, to: editor.value.state.doc.length, insert: newDoc } });
});

const theme = new Compartment();
watch(
  [() => dark, () => settings],
  ([dark, settings]) => {
    if (!editor.value) return;
    editor.value.dispatch({ effects: theme.reconfigure(Prec.highest(typstTheme(dark, settings))) });
  },
  { deep: true },
);

onMounted(() => {
  editor.value = new EditorView({
    doc: doc.value,
    extensions: [
      editorSetup,

      Prec.high(typst()),
      Prec.highest(theme.of(typstTheme(dark, settings))),

      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const content = update.state.doc.toString();
          if (content !== doc.value) doc.value = content;
        }

        if (update.selectionSet || update.docChanged) {
          const range = update.state.selection.main;
          emit("selection-change", update.state.doc.sliceString(range.from, range.to));
        }
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

  toggleHeading(level: number) {
    if (!editor.value) return;
    toggleHeading(editor.value, level);
  },

  toggleBoldText() {
    if (!editor.value) return;
    toggleFormatting(editor.value, "*", "*");
  },
  toggleItalicText() {
    if (!editor.value) return;
    toggleFormatting(editor.value, "_", "_");
  },
  toggleUnderlinedText() {
    if (!editor.value) return;
    toggleFormatting(editor.value, "#underline[", "]");
  },

  toggleBulletedList() {
    if (!editor.value) return;
    toggleList(editor.value, "-");
  },
  toggleNumberedList() {
    if (!editor.value) return;
    toggleList(editor.value, "1.");
  },

  insertLink(url: string, displayText?: string) {
    if (!editor.value) return;
    insertLink(editor.value, url, displayText);
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
