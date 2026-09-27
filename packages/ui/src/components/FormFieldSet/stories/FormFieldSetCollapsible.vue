<script setup lang="ts">
import Input from "../../Input/Input.vue";
import FormFieldSet from "../FormFieldSet.vue";
import type { FormFieldSetProps } from "../FormFieldSet.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<FormFieldSetProps, "legend">>();
</script>

<template>
  <FormFieldSet v-bind="$attrs" :legend="legend" class="form-field-set-collapsible">
    <Input placeholder="Enter value" />
  </FormFieldSet>
</template>

<style>
.form-field-set-collapsible {
  width: var(--container-sm);

  [data-slot="content"] > [data-slot="root"] {
    width: 100%;
  }
}
</style>
