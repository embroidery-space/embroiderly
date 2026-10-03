<script setup lang="ts">
import Splitter from "../Splitter.vue";
import SplitterPanel from "../SplitterPanel.vue";
</script>

<template>
  <div id="splitter-collapsible">
    <Splitter direction="horizontal">
      <SplitterPanel :min-size="15" :collapsed-size="5" collapsible class="splitter-collapsible-panel">
        Panel 1
      </SplitterPanel>
      <SplitterPanel :min-size="30" class="splitter-collapsible-panel">Panel 2</SplitterPanel>
    </Splitter>
  </div>
</template>

<style>
#splitter-collapsible {
  width: calc(var(--spacing) * 96);
  height: calc(var(--spacing) * 96);

  & > [data-slot="base"] {
    border: 1px solid var(--border-color-default);
    border-radius: var(--radius-sm);
  }
}

.splitter-collapsible-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
