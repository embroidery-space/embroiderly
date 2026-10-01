<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Switch from "../Switch.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <Switch v-bind="$attrs" />
  </FormField>
</template>
