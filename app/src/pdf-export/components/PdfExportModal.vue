<script setup lang="ts">
import { Dialog, Splitter, SplitterPanel } from "@embroiderly/ui";
</script>

<template>
  <Dialog fullscreen :title="$t('pdf-export')" :class="$style.dialog">
    <template #body>
      <Splitter direction="horizontal" :class="$style.spltter">
        <SplitterPanel :class="$style.splitterPanel">Typst Editor</SplitterPanel>
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
