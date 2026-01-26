<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive } from "vue";

  import type { CheckboxProps } from "./Checkbox.vue";
  import Checkbox from "./Checkbox.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<CheckboxProps>({
    label: "Checkbox",
    description: "Description",

    size: "md",

    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="checkbox" group="form" title="Checkbox" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Checkbox v-bind="state" @update:model-value="logEvent('update:model-value', { value: $event })" />

      <template #controls>
        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.description" title="Description" />

        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Checkbox :size="size" :label="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Checkbox label="Default" />
        <Checkbox label="Disabled" disabled />
      </div>
    </Variant>
  </Story>
</template>
