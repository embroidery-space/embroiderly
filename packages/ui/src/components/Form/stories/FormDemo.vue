<script setup lang="ts">
import type { StandardSchemaV1 } from "@standard-schema/spec";

import { Button } from "../..";
import FormField from "../../FormField/FormField.vue";
import Input from "../../Input/Input.vue";
import Form from "../Form.vue";

const props = defineProps<{ schema: StandardSchemaV1 }>();
</script>

<template>
  <Form v-bind="props" :class="$style.form">
    <FormField name="email" label="Email">
      <Input />
    </FormField>

    <FormField name="password" label="Password">
      <Input />
    </FormField>

    <Button label="Submit" />
  </Form>
</template>

<style module>
.form {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
  align-items: start;
}
</style>
