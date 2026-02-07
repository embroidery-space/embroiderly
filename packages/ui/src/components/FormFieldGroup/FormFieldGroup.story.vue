<script setup lang="ts">
  import { reactive } from "vue";

  import Button from "../Button/Button.vue";
  import Input from "../Input/Input.vue";
  import InputNumber from "../InputNumber/InputNumber.vue";

  import type { FormFieldGroupProps } from "./FormFieldGroup.vue";
  import FormFieldGroup from "./FormFieldGroup.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<FormFieldGroupProps>({
    size: "md",
  });

  defineExpose({ state });
</script>

<template>
  <Story id="form-field-group" group="form" title="FormFieldGroup" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormFieldGroup :size="state.size">
        <Input />
        <Button label="Submit" />
      </FormFieldGroup>

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <template v-for="size in sizes" :key="size">
          <FormFieldGroup :size="size">
            <Input :model-value="`Size: ${size}`" />
            <Button label="Submit" />
          </FormFieldGroup>
        </template>
      </div>
    </Variant>

    <Variant id="with-buttons" title="With Buttons" auto-props-disabled>
      <FormFieldGroup>
        <Button label="First" variant="outline" color="neutral" />
        <Button label="Second" variant="outline" color="neutral" />
        <Button label="Third" variant="outline" color="neutral" />
      </FormFieldGroup>
    </Variant>

    <Variant id="with-input" title="With Input" auto-props-disabled>
      <FormFieldGroup>
        <Input />
        <Button label="Submit" />
      </FormFieldGroup>
    </Variant>

    <Variant id="with-input-number" title="With InputNumber" auto-props-disabled>
      <FormFieldGroup>
        <InputNumber :increment="false" :decrement="false" />
        <Button label="Apply" />
      </FormFieldGroup>
    </Variant>
  </Story>
</template>
