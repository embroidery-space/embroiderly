<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";

import InputColor from "./InputColor.vue";
import type { InputColorProps } from "./InputColor.vue";

const sizes = ["sm", "md", "lg"] as const;

const color = ref("FF0000");
const inputState = reactive<InputColorProps>({
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
  <Story id="input-color" group="form" title="InputColor" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <InputColor
          v-model="color"
          v-bind="inputState"
          @update:model-value="logEvent('update:model-value', { value: $event })"
        />
      </FormField>

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />

        <HstText v-model="formFieldState.label" title="Label" />
        <HstText v-model="formFieldState.description" title="Description" />
        <HstText v-model="formFieldState.hint" title="Hint" />
        <HstText v-model="formFieldState.help" title="Help" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <InputColor :size="size" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <InputColor />
        <InputColor disabled />
      </div>
    </Variant>
  </Story>
</template>
