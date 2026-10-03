<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Checkbox from "../Checkbox.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <Checkbox v-bind="$attrs" />
  </FormField>
</template>
