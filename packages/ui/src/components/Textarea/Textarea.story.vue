<script setup lang="ts">
  import { logEvent } from "histoire/client";
  import { reactive, ref } from "vue";

  import type { TextareaProps } from "./Textarea.vue";
  import Textarea from "./Textarea.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const value = ref("");
  const state = reactive<TextareaProps>({
    color: "primary",
    variant: "subtle",
    size: "lg",

    rows: 3,
    maxrows: 0,

    autoresize: false,
    disabled: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="textarea" group="form" title="Textarea" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Textarea v-model="value" v-bind="state" @update:model-value="logEvent('update:modelValue', { value: $event })" />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstNumber v-model="state.rows" title="Rows" />
        <HstNumber v-model="state.maxrows" title="Max Rows" />

        <HstCheckbox v-model="state.autoresize" title="Autoresize" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <template v-for="size in sizes" :key="size">
          <Textarea :size="size" :model-value="`Size: ${size}`" />
        </template>
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex flex-col gap-2">
        <Textarea model-value="Default" />
        <Textarea model-value="Disabled" disabled />
      </div>
    </Variant>
  </Story>
</template>
