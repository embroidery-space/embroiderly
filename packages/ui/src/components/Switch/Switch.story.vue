<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive } from "vue";

  import type { SwitchProps } from "./Switch.vue";
  import Switch from "./Switch.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<SwitchProps>({
    label: "Switch",
    description: "Description",

    size: "md",

    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="switch" group="form" title="Switch" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Switch v-bind="state" @update:model-value="logEvent('update:model-value', { value: $event })" />

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
          <Switch :size="size" :label="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Switch label="Default" />
        <Switch label="Disabled" disabled />
      </div>
    </Variant>
  </Story>
</template>
