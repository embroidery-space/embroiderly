<script setup lang="ts">
import Input from "../../Input/Input.vue";
import FormFieldSet from "../FormFieldSet.vue";
import type { FormFieldSetProps } from "../FormFieldSet.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<FormFieldSetProps, "legend">>();
</script>

<template>
  <FormFieldSet v-bind="$attrs" :legend="legend" class="form-field-set-demo">
    <div class="form-field-set-demo-grid">
      <Input placeholder="Enter value" />
      <Input placeholder="Enter value" />
      <Input placeholder="Enter value" />
      <Input placeholder="Enter value" />
    </div>
  </FormFieldSet>
</template>

<style>
.form-field-set-demo {
  width: var(--container-sm);
}

.form-field-set-demo-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 4);

  > [data-slot="root"] {
    width: 100%;
  }
}
</style>
