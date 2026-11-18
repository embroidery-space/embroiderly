<script setup lang="ts">
import Input from "../../Input/Input.vue";
import FormField from "../FormField.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField v-bind="$attrs">
    <Input placeholder="you@example.com" />
  </FormField>
</template>
