<script setup lang="ts">
import Button from "../../Button/Button.vue";
import InputNumber from "../../InputNumber/InputNumber.vue";
import FormFieldGroup from "../FormFieldGroup.vue";
</script>

<template>
  <FormFieldGroup>
    <InputNumber :model-value="42" :increment="false" :decrement="false" />
    <Button label="Apply" />
  </FormFieldGroup>
</template>
