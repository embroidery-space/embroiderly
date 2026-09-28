<script setup lang="ts">
import Splitter from "../Splitter.vue";
import SplitterPanel from "../SplitterPanel.vue";
</script>

<template>
  <div id="splitter-nested">
    <Splitter direction="horizontal">
      <SplitterPanel :min-size="20" class="splitter-nested-panel">Panel 1</SplitterPanel>
      <SplitterPanel :min-size="30">
        <Splitter direction="vertical">
          <SplitterPanel :min-size="20" class="splitter-nested-panel">Panel 2</SplitterPanel>
          <SplitterPanel :min-size="15" class="splitter-nested-panel">Panel 3</SplitterPanel>
        </Splitter>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<style>
#splitter-nested {
  width: calc(var(--spacing) * 96);
  height: calc(var(--spacing) * 96);

  & > [data-slot="base"] {
    border: 1px solid var(--border-color-default);
    border-radius: var(--radius-sm);
  }
}

.splitter-nested-panel {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
