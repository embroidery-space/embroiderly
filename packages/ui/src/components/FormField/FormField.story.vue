<script setup lang="ts">
  import { reactive, ref } from "vue";

  import Input from "../Input/Input.vue";

  import type { FormFieldProps } from "./FormField.vue";
  import FormField from "./FormField.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const value = ref("");
  const state = reactive<FormFieldProps>({
    size: "lg",
    label: "Email address",
    description: "",
    hint: "",
    help: "",
  });

  defineExpose({ state });
</script>

<template>
  <Story id="form-field" group="form" title="FormField" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormField v-bind="state">
        <Input v-model="value" placeholder="you@example.com" class="w-full" />
      </FormField>

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.description" title="Description" />
        <HstText v-model="state.hint" title="Hint" />
        <HstText v-model="state.help" title="Help" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <FormField v-for="size in sizes" :key="size" :label="`Size: ${size}`" :size="size">
          <Input placeholder="Input" class="w-full" />
        </FormField>
      </div>
    </Variant>
  </Story>
</template>
