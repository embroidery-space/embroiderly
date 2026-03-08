<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import ToolSelect from "./ToolSelect.vue";
import type { ToolSelectProps } from "./ToolSelect.vue";

const sizes = ["sm", "md", "lg"] as const;

const singleItem = [{ label: "Pencil", icon: "lucide:pencil", value: "pencil" }];
const multipleItems = [
  { label: "Pencil", icon: "lucide:pencil", value: "pencil", shortcut: "P" },
  { label: "Eraser", icon: "lucide:eraser", value: "eraser", shortcut: "E" },
  { label: "Brush", icon: "lucide:brush", value: "brush", shortcut: "B" },
];

const state = reactive<Omit<ToolSelectProps, "items">>({
  size: "lg",
  disabled: false,
});
const value = ref<string>("pencil");

defineExpose({ state, value });
</script>

<template>
  <Story id="tool-select" group="toolbar" title="ToolSelect" :layout="{ type: 'single', iframe: false }">
    <Variant id="single" title="Single Item" auto-props-disabled>
      <ToolSelect
        v-model="value"
        :items="singleItem"
        v-bind="state"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="multiple" title="Multiple Items" auto-props-disabled>
      <ToolSelect
        v-model="value"
        :items="multipleItems"
        v-bind="state"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="custom-color" title="Custom Selection Color" auto-props-disabled>
      <ToolSelect
        v-model="value"
        :items="multipleItems"
        selection-color="var(--color-error)"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex items-start gap-4">
        <template v-for="size in sizes" :key="size">
          <ToolSelect v-model="value" :items="multipleItems" :size="size" />
        </template>
      </div>
    </Variant>
  </Story>
</template>
