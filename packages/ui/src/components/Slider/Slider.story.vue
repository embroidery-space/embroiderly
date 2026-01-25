<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import type { SliderProps } from "./Slider.vue";
  import Slider from "./Slider.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<SliderProps>({
    size: "md",

    min: 0,
    max: 100,
    step: 1,

    disabled: false,
    tooltip: false,
  });

  const value = ref(50);

  defineExpose({ state });
</script>

<template>
  <Story id="slider" group="form" title="Slider" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div class="w-64">
        <Slider
          v-model="value"
          v-bind="state"
          @update:model-value="logEvent('update:model-value', $event)"
          @change="logEvent('change', $event)"
        />
      </div>

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstNumber v-model="state.min" title="Min" />
        <HstNumber v-model="state.max" title="Max" />
        <HstNumber v-model="state.step" title="Step" />

        <HstCheckbox v-model="state.tooltip as boolean" title="Tooltip" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4 w-64">
        <template v-for="size in sizes" :key="size">
          <div class="space-y-2">
            <span class="text-xs text-dimmed block">Size: {{ size }}</span>
            <Slider :size="size" />
          </div>
        </template>
      </div>
    </Variant>
  </Story>
</template>
