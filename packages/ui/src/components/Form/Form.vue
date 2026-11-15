<script setup lang="ts" generic="S extends StandardSchemaV1">
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { getDotPath as getIssueDotPath } from "@standard-schema/utils";
import { Form } from "reka-ui/namespaced";
import { ref } from "vue";

export interface FormProps<S extends StandardSchemaV1> {
  schema: S;
}

export interface FormEmits<S extends StandardSchemaV1> {
  submit: [data: StandardSchemaV1.InferOutput<S>, event: SubmitEvent];
}

export interface FormSlots {
  default(): any;
}

const { schema } = defineProps<FormProps<S>>();
const emit = defineEmits<FormEmits<S>>();
defineSlots<FormSlots>();

const errors = ref<Record<string, string[]>>({});
async function handleFormSubmit(values: Record<string, unknown>, event: SubmitEvent) {
  errors.value = {};

  const result = await schema["~standard"].validate(values);
  if (result.issues) {
    for (const issue of result.issues) {
      const path = getIssueDotPath(issue);
      if (path) {
        if (errors.value[path]) errors.value[path].push(issue.message);
        else errors.value[path] = [issue.message];
      }
    }
    return;
  }

  emit("submit", values, event);
}
</script>

<template>
  <Form.Root :errors="errors" @form-submit="handleFormSubmit">
    <slot />
  </Form.Root>
</template>
