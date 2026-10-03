<script setup lang="ts">
import Input from "../../Input/Input.vue";
import FormField from "../FormField.vue";
import type { FormFieldProps } from "../FormField.vue";

const sizes: NonNullable<FormFieldProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="form-field-sizes">
    <FormField v-for="size in sizes" :key="size" :label="`Size: ${size}`" :size="size">
      <Input placeholder="Input" />
    </FormField>
  </div>
</template>

<style>
#form-field-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);

  [data-slot="container"] > [data-slot="root"] {
    width: 100%;
  }
}
</style>
