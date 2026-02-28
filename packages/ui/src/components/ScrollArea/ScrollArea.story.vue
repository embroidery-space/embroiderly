<script setup lang="ts">
import { reactive } from "vue";

import ScrollArea from "./ScrollArea.vue";
import type { ScrollAreaProps } from "./ScrollArea.vue";

const orientations = ["vertical", "horizontal"] as const;
const types = ["auto", "always", "scroll", "hover", "glimpse"] as const;

const state = reactive<ScrollAreaProps>({
  orientation: "vertical",
  type: "hover",
});

defineExpose({ state });
</script>

<template>
  <Story id="scroll-area" group="layout" title="ScrollArea" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <ScrollArea v-bind="state" class="size-64 rounded-sm border border-default">
        <div v-if="state.orientation === 'vertical'" class="space-y-4 p-4">
          <div v-for="i in 20" :key="i" class="rounded-sm bg-accented p-3">Item {{ i }}</div>
        </div>
        <div v-else class="flex gap-4 p-4">
          <div v-for="i in 20" :key="i" class="shrink-0 rounded-sm bg-accented p-3">Item {{ i }}</div>
        </div>
      </ScrollArea>

      <template #controls>
        <HstSelect v-model="state.orientation" title="Orientation" :options="orientations" />
        <HstSelect v-model="state.type" title="Type" :options="types" />
      </template>
    </Variant>
  </Story>
</template>
