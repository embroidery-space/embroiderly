<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive } from "vue";

  import type { FormFieldProps } from "../FormField/FormField.vue";
  import FormField from "../FormField/FormField.vue";

  import type { SwitchProps } from "./Switch.vue";
  import Switch from "./Switch.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const inputState = reactive<SwitchProps>({
    label: "Switch",
    description: "Description",

    disabled: false,
  });
  const formFieldState = reactive<FormFieldProps>({
    size: "md",
  });

  defineExpose({ inputState, formFieldState });
</script>

<template>
  <Story id="switch" group="form" title="Switch" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <Switch v-bind="inputState" @update:model-value="logEvent('update:model-value', { value: $event })" />
      </FormField>

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />

        <HstText v-model="inputState.label" title="Label" />
        <HstText v-model="inputState.description" title="Description" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Switch :size="size" :label="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Switch label="Default" />
        <Switch label="Disabled" disabled />
      </div>
    </Variant>
  </Story>
</template>
