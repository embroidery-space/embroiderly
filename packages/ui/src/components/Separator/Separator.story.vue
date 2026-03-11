<script setup lang="ts">
import { reactive } from "vue";

import Separator from "./Separator.vue";
import type { SeparatorProps } from "./Separator.vue";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const orientations = ["horizontal", "vertical"] as const;

const state = reactive<SeparatorProps>({
  orientation: "vertical",
});

defineExpose({ state });
</script>

<template>
  <Story id="separator" group="element" title="Separator" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <!-- eslint-disable-next-line better-tailwindcss/enforce-consistent-line-wrapping -->
      <div class="flex size-96 justify-between" :class="state.orientation === 'horizontal' ? 'flex-col' : 'flex-row'">
        <Separator v-for="size in sizes" :key="size" :size="size" v-bind="state" />
      </div>

      <template #controls>
        <HstSelect v-model="state.orientation" title="Orientation" :options="orientations" />
      </template>
    </Variant>
  </Story>
</template>
