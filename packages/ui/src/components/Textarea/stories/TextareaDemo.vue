<script setup lang="ts">
import FormField from "../../FormField/FormField.vue";
import Textarea from "../Textarea.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormField>
    <Textarea v-bind="$attrs" />
  </FormField>
</template>
