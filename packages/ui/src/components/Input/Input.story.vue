<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import Button from "../Button/Button.vue";
import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";
import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";
import Icon from "../Icon/Icon.vue";

import Input from "./Input.vue";
import type { InputProps } from "./Input.vue";

const sizes = ["sm", "md", "lg"] as const;
const variants = ["subtle", "outline", "none"] as const;

const value = ref("Lorem ipsum");
const inputState = reactive<InputProps>({
  variant: "subtle",

  leadingIcon: "",
  trailingIcon: "",
  loading: false,
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
  <Story id="input" group="form" title="Input" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="formFieldState">
        <Input
          v-model="value"
          v-bind="inputState"
          @update:model-value="logEvent('update:model-value', { value: $event })"
        />
      </FormField>

      <template #controls>
        <HstText v-model="inputState.leadingIcon as string" title="Leading Icon" />
        <HstText v-model="inputState.trailingIcon as string" title="Trailing Icon" />
        <HstCheckbox v-model="inputState.loading" title="Loading" />
        <HstCheckbox v-model="inputState.disabled" title="Disabled" />
        <HstSelect v-model="formFieldState.size" title="Size" :options="sizes" />
        <HstSelect v-model="inputState.variant" title="Variant" :options="variants" />
        <HstText v-model="formFieldState.label" title="Label" />
        <HstText v-model="formFieldState.description" title="Description" />
        <HstText v-model="formFieldState.hint" title="Hint" />
        <HstText v-model="formFieldState.help" title="Help" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Input :model-value="`Size: ${size}`" :size="size" />
        </template>
      </div>
    </Variant>

    <Variant id="variants" title="Variants" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="variant in variants" :key="variant">
          <Input :model-value="`Variant: ${variant}`" :variant="variant" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Input model-value="Default" />
        <Input model-value="Disabled" disabled />
      </div>
    </Variant>

    <Variant id="with-slots" title="With Slots" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Input model-value="With leading slot">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input model-value="With trailing slot">
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>

        <Input model-value="With both slots">
          <template #leading>
            <Icon name="lucide:rocket" />
          </template>
          <template #trailing>
            <Icon name="lucide:rocket" />
          </template>
        </Input>
      </div>
    </Variant>

    <Variant id="field-group" title="Field Group" auto-props-disabled>
      <FormFieldGroup>
        <Input />
        <Button label="Submit" />
      </FormFieldGroup>
    </Variant>
  </Story>
</template>
