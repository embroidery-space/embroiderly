<script setup lang="ts">
import { Dialog, Splitter, SplitterPanel } from "@embroiderly/ui";

import { ref, computed, toRaw } from "vue";

import { PatternPdf } from "~/lib/pattern/";
import { useSettingsStore } from "~/settings/";

import TypstEditor from "./TypstEditor.vue";

const props = defineProps<{ pdf: PatternPdf }>();

const settingsStore = useSettingsStore();

const pdf = ref<PatternPdf>(new PatternPdf(toRaw(props.pdf)));

const isDark = computed(() => {
  return settingsStore.ui.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : settingsStore.ui.theme === "dark";
});
</script>

<template>
  <Dialog fullscreen :dismissible="false" :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <Splitter direction="horizontal" :class="$style.splitter">
        <SplitterPanel>
          <TypstEditor v-model="pdf.template" :dark="isDark" />
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
</style>
