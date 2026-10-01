<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Input from "../../Input/Input.vue";
import FormFieldGroup from "../FormFieldGroup.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <FormFieldGroup v-bind="$attrs">
    <Input />
    <Button label="Submit" />
  </FormFieldGroup>
</template>
