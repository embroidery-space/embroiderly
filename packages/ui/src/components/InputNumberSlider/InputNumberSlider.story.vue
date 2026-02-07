<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import FormField from "../FormField/FormField.vue";
  import type { FormFieldProps } from "../FormField/FormField.vue";

  import type { InputNumberSliderProps } from "./InputNumberSlider.vue";
  import InputNumberSlider from "./InputNumberSlider.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const value = ref(50);
  const inputState = reactive<InputNumberSliderProps>({
    min: 0,
    max: 100,
    step: 1,

    increment: false,
    decrement: false,

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
  <Story id="input-number-slider" group="form" title="InputNumberSlider" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <InputNumberSlider
          v-model="value"
          v-bind="inputState"
          class="w-96"
          @update:model-value="logEvent('update:modelValue', { value: $event })"
        />
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

        <HstCheckbox v-model="inputState.increment" title="Increment" />
        <HstCheckbox v-model="inputState.decrement" title="Decrement" />

        <HstCheckbox v-model="inputState.tooltip as boolean" title="Tooltip" />
      </template>
    </Variant>
  </Story>
</template>
