<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import InputNumber from "../InputNumber.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <InputNumber v-bind="$attrs" />
  </FormField>
</template>
