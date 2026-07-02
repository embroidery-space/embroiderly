<script setup lang="ts">
import { logEvent } from "histoire/client";
import { ref, reactive } from "vue";

import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";

import RadioGroup from "./RadioGroup.vue";
import type { RadioGroupItem, RadioGroupProps } from "./RadioGroup.vue";

const sizes = ["sm", "md", "lg"] as const;

const items = ref<RadioGroupItem[]>([
  { value: 1, label: "Option 1", description: "Description 1" },
  { value: 2, label: "Option 2", description: "Description 2" },
  { value: 3, label: "Option 3", description: "Description 3" },
]);

const inputState = reactive<RadioGroupProps>({
  disabled: false,
});
const formFieldState = reactive<FormFieldProps>({
  size: "md",
});

defineExpose({ inputState, formFieldState });
</script>

<template>
  <Story id="radio-group" group="form" title="RadioGroup" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <RadioGroup
          v-bind="inputState"
          :items="items"
          @update:model-value="logEvent('update:model-value', { value: $event })"
        />
      </FormField>

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <RadioGroup :size="size" :items="[`Size: ${size}`]" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <RadioGroup :items="['Default']" />
        <RadioGroup :items="['Disabled']" disabled />
      </div>
    </Variant>
  </Story>
</template>
