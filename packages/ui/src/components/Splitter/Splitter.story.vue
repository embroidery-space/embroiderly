<script setup lang="ts">
  import { reactive } from "vue";

  import type { SplitterProps } from "./Splitter.vue";
  import Splitter from "./Splitter.vue";
  import SplitterPanel from "./SplitterPanel.vue";

  const directions = ["horizontal", "vertical"] as const;

  const state = reactive<SplitterProps>({
    direction: "horizontal",
  });

  defineExpose({ state });
</script>

<template>
  <Story id="splitter" group="layout" title="Splitter" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div class="size-96">
        <Splitter v-bind="state" class="rounded-sm border border-default">
          <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 1</SplitterPanel>
          <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 2</SplitterPanel>
        </Splitter>
      </div>

      <template #controls>
        <HstSelect v-model="state.direction" title="Direction" :options="directions" />
      </template>
    </Variant>

    <Variant id="nested" title="Nested" auto-props-disabled>
      <div class="size-96">
        <Splitter direction="horizontal" class="rounded-sm border border-default">
          <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 1</SplitterPanel>
          <SplitterPanel :min-size="30">
            <Splitter direction="vertical">
              <SplitterPanel :min-size="20" class="flex items-center justify-center">Panel 2</SplitterPanel>
              <SplitterPanel :min-size="15" class="flex items-center justify-center">Panel 3</SplitterPanel>
            </Splitter>
          </SplitterPanel>
        </Splitter>
      </div>
    </Variant>

    <Variant id="collapsible" title="Collapsible" auto-props-disabled>
      <div class="size-96">
        <Splitter direction="horizontal" class="rounded-sm border border-default">
          <SplitterPanel :min-size="15" :collapsed-size="5" collapsible class="flex items-center justify-center">
            Panel 1
          </SplitterPanel>
          <SplitterPanel :min-size="30" class="flex items-center justify-center">Panel 2</SplitterPanel>
        </Splitter>
      </div>
    </Variant>
  </Story>
</template>
