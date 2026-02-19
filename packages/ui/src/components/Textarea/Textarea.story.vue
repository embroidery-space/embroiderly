<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";

import Textarea from "./Textarea.vue";
import type { TextareaProps } from "./Textarea.vue";

const sizes = ["sm", "md", "lg"] as const;

const value = ref("");
const inputState = reactive<TextareaProps>({
  color: "primary",
  variant: "subtle",

  rows: 3,
  maxrows: 0,

  autoresize: false,
  disabled: false,
});
const formFieldState = reactive<FormFieldProps>({
  size: "lg",
  label: "",
  description: "",
  hint: "",
  help: "",
});

defineExpose({ inputState, formFieldState });
</script>

<template>
  <Story id="textarea" group="form" title="Textarea" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <Textarea
          v-model="value"
          v-bind="inputState"
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

        <HstNumber v-model="inputState.rows" title="Rows" />
        <HstNumber v-model="inputState.maxrows" title="Max Rows" />

        <HstCheckbox v-model="inputState.autoresize" title="Autoresize" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Textarea :size="size" :model-value="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Textarea model-value="Default" />
        <Textarea model-value="Disabled" disabled />
      </div>
    </Variant>
  </Story>
</template>
