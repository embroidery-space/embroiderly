<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import InputDimensions from "./InputDimensions.vue";
import type { InputDimensionsProps } from "./InputDimensions.vue";

const sizes = ["sm", "md", "lg"] as const;
const orientations = ["horizontal", "vertical"] as const;

const width = ref(800);
const height = ref(600);
const inputState = reactive<Omit<InputDimensionsProps, "class" | "ui">>({
  size: "md",
  orientation: "horizontal",
  aspectRatio: undefined,

  disabled: false,

  widthFieldOptions: { label: "Width" },
  heightFieldOptions: { label: "Height" },
});

defineExpose({ inputState });
</script>

<template>
  <Story id="input-dimensions" group="form" title="InputDimensions" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <InputDimensions
        v-model:width="width"
        v-model:height="height"
        v-bind="inputState"
        @update:width="logEvent('update:width', { value: $event })"
        @update:height="logEvent('update:height', { value: $event })"
      />

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstSelect v-model="inputState.size" title="Size" :options="sizes" />
        <HstSelect v-model="inputState.orientation" title="Orientation" :options="orientations" />
        <HstNumber v-model="inputState.aspectRatio" title="Aspect Ratio" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <InputDimensions
          v-for="size in sizes"
          :key="size"
          v-model:width="width"
          v-model:height="height"
          :size="size"
          :width-field-options="{ label: 'Width' }"
          :height-field-options="{ label: 'Height' }"
        />
      </div>
    </Variant>
  </Story>
</template>
