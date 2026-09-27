<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Input from "../../Input/Input.vue";
import FormFieldGroup from "../FormFieldGroup.vue";
import type { FormFieldGroupProps } from "../FormFieldGroup.vue";

const sizes: NonNullable<FormFieldGroupProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="form-field-group-sizes">
    <template v-for="size in sizes" :key="size">
      <FormFieldGroup :size="size">
        <Input :model-value="`Size: ${size}`" />
        <Button label="Submit" />
      </FormFieldGroup>
    </template>
  </div>
</template>

<style>
#form-field-group-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
}
</style>
