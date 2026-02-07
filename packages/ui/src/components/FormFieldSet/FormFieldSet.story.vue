<script setup lang="ts">
  import { reactive } from "vue";

  import Input from "../Input/Input.vue";

  import type { FormFieldSetProps } from "./FormFieldSet.vue";
  import FormFieldSet from "./FormFieldSet.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<FormFieldSetProps>({
    legend: "Legend",
    size: "lg",
  });

  defineExpose({ state });
</script>

<template>
  <Story id="form-field-set" group="form" title="FormFieldSet" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FormFieldSet v-bind="state">
        <div class="grid grid-cols-2 gap-4">
          <Input placeholder="Enter value" class="w-full" />
          <Input placeholder="Enter value" class="w-full" />
          <Input placeholder="Enter value" class="w-full" />
          <Input placeholder="Enter value" class="w-full" />
        </div>
      </FormFieldSet>

      <template #controls>
        <HstText v-model="state.legend" title="Legend" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <FormFieldSet v-for="size in sizes" :key="size" :legend="`Size: ${size}`" :size="size">
          <Input placeholder="Input" class="w-full" />
        </FormFieldSet>
      </div>
    </Variant>
  </Story>
</template>
