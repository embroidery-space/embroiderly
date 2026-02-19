<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";

import Slider from "./Slider.vue";
import type { SliderProps } from "./Slider.vue";

const sizes = ["sm", "md", "lg"] as const;

const value = ref(50);
const inputState = reactive<SliderProps>({
  min: 0,
  max: 100,
  step: 1,

  tooltip: false,

  disabled: false,
});
const formFieldState = reactive<FormFieldProps>({
  size: "md",
  label: "",
  description: "",
  hint: "",
  help: "",
});

defineExpose({ inputState, formFieldState });
</script>

<template>
  <Story id="slider" group="form" title="Slider" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <div class="w-64">
          <Slider
            v-model="value"
            v-bind="inputState"
            @update:model-value="logEvent('update:model-value', { value: $event })"
          />
        </div>
      </FormField>

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />

        <HstText v-model="formFieldState.label" title="Label" />
        <HstText v-model="formFieldState.description" title="Description" />
        <HstText v-model="formFieldState.hint" title="Hint" />
        <HstText v-model="formFieldState.help" title="Help" />

        <HstNumber v-model="inputState.min" title="Min" />
        <HstNumber v-model="inputState.max" title="Max" />
        <HstNumber v-model="inputState.step" title="Step" />

        <HstCheckbox v-model="inputState.tooltip as boolean" title="Tooltip" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex w-64 flex-col gap-4">
        <template v-for="size in sizes" :key="size">
          <div class="space-y-2">
            <span class="block text-xs text-dimmed">Size: {{ size }}</span>
            <Slider :size="size" />
          </div>
        </template>
      </div>
    </Variant>
  </Story>
</template>
