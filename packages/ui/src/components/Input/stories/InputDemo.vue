<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Input from "../Input.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <Input v-bind="$attrs" />
  </FormField>
</template>
