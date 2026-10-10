<script setup lang="ts">
import { Compartment, Prec } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { typst_lezer as typst } from "codemirror-lang-typst/lezer";
import { shallowRef, useTemplateRef, onMounted, onBeforeUnmount, watch } from "vue";

import { editorSetup, nordDark, nordLight } from "../lib/codemirror/";

export interface TypstEditorProps {
  /**
   * Whether the dark theme is applied.
   * @default false
   */
  dark?: boolean;
}

const doc = defineModel<string>({ required: true });
const { dark: isDark = false } = defineProps<TypstEditorProps>();

const container = useTemplateRef("container");

const editor = shallowRef<EditorView | null>(null);

const theme = new Compartment();
watch(
  () => isDark,
  (value) => {
    if (!editor.value) return;
    editor.value.dispatch({ effects: theme.reconfigure(Prec.highest(value ? nordDark : nordLight)) });
  },
);

onMounted(() => {
  editor.value = new EditorView({
    doc: doc.value,
    extensions: [
      editorSetup,

      Prec.high(typst()),
      Prec.highest(theme.of(isDark ? nordDark : nordLight)),

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
