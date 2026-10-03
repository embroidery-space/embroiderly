<script setup lang="ts">
import Input from "../../Input/Input.vue";
import FormFieldSet from "../FormFieldSet.vue";
import type { FormFieldSetProps } from "../FormFieldSet.vue";

const sizes: NonNullable<FormFieldSetProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="form-field-set-sizes">
    <FormFieldSet v-for="size in sizes" :key="size" :legend="`Size: ${size}`" :size="size">
      <Input placeholder="Input" />
    </FormFieldSet>
  </div>
</template>

<style>
#form-field-set-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);

  fieldset > [data-slot="root"] {
    width: 100%;
  }
}
</style>
