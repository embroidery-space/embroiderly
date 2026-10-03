<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Input from "../../Input/Input.vue";
import FormFieldGroup from "../FormFieldGroup.vue";
</script>

<template>
  <FormFieldGroup>
    <Input model-value="john.doe@example.com" />
    <Button label="Submit" />
  </FormFieldGroup>
</template>
