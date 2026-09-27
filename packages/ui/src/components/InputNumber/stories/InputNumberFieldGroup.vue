<script setup lang="ts">
import Button from "../../Button/Button.vue";
import FormFieldGroup from "../../FormFieldGroup/FormFieldGroup.vue";
import InputNumber from "../InputNumber.vue";
</script>

<template>
  <FormFieldGroup>
    <InputNumber :increment="false" :decrement="false" />
    <Button label="Apply" />
  </FormFieldGroup>
</template>
