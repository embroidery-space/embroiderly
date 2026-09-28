<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Select from "../Select.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="select-open">
    <FormField>
      <Select v-bind="$attrs" />
    </FormField>
  </div>
</template>

<style>
#select-open {
  min-width: calc(var(--spacing) * 64);
  min-height: calc(var(--spacing) * 96);

  [data-slot="container"] > [data-slot="root"] {
    width: calc(var(--spacing) * 48);
  }
}
</style>
