<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive } from "vue";

  import type { TabsItem, TabsProps } from "./Tabs.vue";
  import Tabs from "./Tabs.vue";

  const sizes = ["sm", "md", "lg"] as const;
  const orientations = ["horizontal", "vertical"] as const;

  const items: TabsItem[] = [
    { label: "Tab 1", content: "Lorem ipsum" },
    { label: "Tab 2", content: "dolor sit amet" },
    { label: "Tab 3", content: "consectetur adipiscing elit" },
  ];

  const state = reactive<TabsProps>({
    items,
    orientation: "horizontal",
    size: "md",
  });

  defineExpose({ state });
</script>

<template>
  <Story id="tabs" group="navigation" title="Tabs" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Tabs v-bind="state" @update:model-value="logEvent('update:model-value', { value: $event })" />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstSelect v-model="state.orientation" title="Orientation" :options="orientations" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <Tabs v-for="size in sizes" :key="size" :items="items" :size="size" />
      </div>
    </Variant>
  </Story>
</template>
