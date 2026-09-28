<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Select from "../Select.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField class="select-demo">
    <Select v-bind="$attrs" />
  </FormField>
</template>

<style>
.select-demo [data-slot="container"] > [data-slot="root"] {
  width: calc(var(--spacing) * 48);
}
</style>
