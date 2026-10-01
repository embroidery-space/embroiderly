<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import InputColor from "../InputColor.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <InputColor v-bind="$attrs" />
  </FormField>
</template>
