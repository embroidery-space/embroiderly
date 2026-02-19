<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import FilePicker from "./FilePicker.vue";
import type { FilePickerProps } from "./FilePicker.vue";

const sizes = ["sm", "md", "lg"] as const;

const value = ref("/path/to/file.txt");
const state = reactive<FilePickerProps>({
  size: "md",
  disabled: false,
});

defineExpose({ state });
</script>

<template>
  <Story id="file-picker" group="form" title="FilePicker" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <FilePicker v-model="value" v-bind="state" @pick="logEvent('pick', {})" />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex flex-col gap-4">
        <FilePicker v-for="size in sizes" :key="size" v-model="value" :size="size" />
      </div>
    </Variant>
  </Story>
</template>
