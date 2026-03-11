<script setup lang="ts">
import { reactive } from "vue";

import Progress from "./Progress.vue";
import type { ProgressProps } from "./Progress.vue";

const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
const orientations = ["horizontal", "vertical"] as const;
const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"] as const;

const state = reactive<ProgressProps>({
  orientation: "horizontal",
  color: "primary",
});

defineExpose({ state });
</script>

<template>
  <Story id="progress" group="element" title="Progress" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div
        class="flex gap-4"
        :class="
          state.orientation === 'horizontal'
            ? `w-96 flex-col`
            : `
  h-48 flex-row
`
        "
      >
        <Progress v-for="size in sizes" :key="size" :size="size" v-bind="state" />
      </div>

      <template #controls>
        <HstSelect v-model="state.orientation" title="Orientation" :options="orientations" />
        <HstSelect v-model="state.color" title="Color" :options="colors" />
      </template>
    </Variant>

    <Variant id="colors" title="Colors" auto-props-disabled>
      <div class="flex w-96 flex-col gap-4">
        <Progress v-for="color in colors" :key="color" :color="color" />
      </div>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex w-96 flex-col gap-4">
        <Progress v-for="size in sizes" :key="size" :size="size" />
      </div>
    </Variant>
  </Story>
</template>
