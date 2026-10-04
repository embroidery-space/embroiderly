<script setup lang="ts">
import { Dialog, Splitter, SplitterPanel } from "@embroiderly/ui";

import { computed } from "vue";

import { useSettingsStore } from "~/settings/";

import TypstEditor from "./TypstEditor.vue";

const settingsStore = useSettingsStore();

const isDark = computed(() => {
  return settingsStore.ui.theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : settingsStore.ui.theme === "dark";
});
</script>

<template>
  <Dialog fullscreen :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <Splitter direction="horizontal" :class="$style.splitter">
        <SplitterPanel>
          <TypstEditor :dark="isDark" />
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
