<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import Button from "../Button/Button.vue";
  import type { FormFieldProps } from "../FormField/FormField.vue";
  import FormField from "../FormField/FormField.vue";
  import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";

  import type { InputNumberProps } from "./InputNumber.vue";
  import InputNumber from "./InputNumber.vue";

  const sizes = ["sm", "md", "lg"] as const;
  const variants = ["subtle", "outline"] as const;

  const value = ref(5);
  const inputState = reactive<InputNumberProps>({
    variant: "subtle",

    min: 0,
    max: 10,
    step: 1,

    increment: true,
    decrement: true,

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
  <Story id="input-number" group="form" title="InputNumber" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <InputNumber
          v-model="value"
          v-bind="inputState"
          @update:model-value="logEvent('update:model-value', { value: $event })"
        />
      </FormField>

      <template #controls>
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />

        <HstText v-model="formFieldState.label" title="Label" />
        <HstText v-model="formFieldState.description" title="Description" />
        <HstText v-model="formFieldState.hint" title="Hint" />
        <HstText v-model="formFieldState.help" title="Help" />

        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />
        <HstSelect v-model="inputState.variant" title="Variant" :options="variants" />

        <HstNumber v-model="inputState.min" title="Min" />
        <HstNumber v-model="inputState.max" title="Max" />
        <HstNumber v-model="inputState.step" title="Step" />

        <HstCheckbox v-model="inputState.increment" title="Increment" />
        <HstCheckbox v-model="inputState.decrement" title="Decrement" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <InputNumber :size="size" :placeholder="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="variants" title="Variants" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <InputNumber :variant="variant" :placeholder="`Variant: ${variant}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <InputNumber placeholder="Default" />
        <InputNumber placeholder="Disabled" disabled />
      </div>
    </Variant>

    <Variant id="field-group" title="Field Group" auto-props-disabled>
      <FormFieldGroup>
        <InputNumber :increment="false" :decrement="false" />
        <Button label="Apply" />
      </FormFieldGroup>
    </Variant>
  </Story>
</template>
