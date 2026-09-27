<script setup lang="ts">
import Input from "../../Input/Input.vue";
import FormField from "../FormField.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField v-bind="$attrs" class="form-field-demo">
    <Input placeholder="you@example.com" />
  </FormField>
</template>

<style>
.form-field-demo [data-slot="container"] > [data-slot="root"] {
  width: 100%;
}
</style>
