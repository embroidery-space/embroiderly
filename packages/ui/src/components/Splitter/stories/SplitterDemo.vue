<script setup lang="ts">
import Splitter from "../Splitter.vue";
import type { SplitterProps } from "../Splitter.vue";
import SplitterPanel from "../SplitterPanel.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<SplitterProps, "direction">>();
</script>

<template>
  <div id="splitter-demo">
    <Splitter v-bind="$attrs" :direction="direction">
      <SplitterPanel :min-size="20" class="splitter-demo-panel">Panel 1</SplitterPanel>
      <SplitterPanel :min-size="20" class="splitter-demo-panel">Panel 2</SplitterPanel>
    </Splitter>
  </div>
</template>

<style>
#splitter-demo {
  width: calc(var(--spacing) * 96);
  height: calc(var(--spacing) * 96);

  & > [data-slot="base"] {
    border: 1px solid var(--border-color-default);
    border-radius: var(--radius-sm);
  }
}

.splitter-demo-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
