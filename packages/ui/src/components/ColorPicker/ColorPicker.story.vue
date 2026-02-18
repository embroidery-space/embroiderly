<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import type { ColorPickerProps } from "./ColorPicker.vue";
  import ColorPicker from "./ColorPicker.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const color = ref("#FF0000");
  const state = reactive<ColorPickerProps>({
    size: "md",

    throttle: 50,

    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="color-picker" group="form" title="ColorPicker" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <div class="w-64">
        <ColorPicker
          v-model="color"
          v-bind="state"
          @update:model-value="logEvent('update:model-value', { value: $event })"
        />
        <div class="mt-4 flex items-center gap-2">
          <div class="size-8 rounded-sm border border-default" :style="{ backgroundColor: color }" />
          <span class="font-mono text-sm">{{ color }}</span>
        </div>
      </div>

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstNumber v-model="state.throttle" title="Throttle (ms)" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex w-64 flex-col gap-6">
        <template v-for="size in sizes" :key="size">
          <div class="space-y-2">
            <span class="block text-xs text-dimmed">Size: {{ size }}</span>
            <ColorPicker :size="size" />
          </div>
        </template>
      </div>
    </Variant>

    <Variant id="disabled" title="Disabled" auto-props-disabled>
      <div class="w-64">
        <ColorPicker disabled />
      </div>
    </Variant>
  </Story>
</template>
