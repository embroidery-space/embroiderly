<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive } from "vue";

import InputFile from "./InputFile.vue";
import type { InputFileProps } from "./InputFile.vue";

const sizes = ["sm", "md", "lg"] as const;

const state = reactive<InputFileProps>({
  size: "md",
  disabled: false,
});

defineExpose({ state });
</script>

<template>
  <Story id="input-file" group="form" title="InputFile" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <InputFile v-bind="state" @change="logEvent('change', $event)" />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <InputFile v-for="size in sizes" :key="size" :size="size" />
      </div>
    </Variant>
  </Story>
</template>
