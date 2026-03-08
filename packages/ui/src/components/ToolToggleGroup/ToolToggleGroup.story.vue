<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import ToolToggleGroup from "./ToolToggleGroup.vue";
import type { ToolToggleGroupProps } from "./ToolToggleGroup.vue";

const orientations = ["horizontal", "vertical"] as const;
const sizes = ["sm", "mg", "lg"] as const;

const compactItems = [
  { icon: "lucide:square", tooltip: "Solid", value: "solid" },
  { icon: "lucide:grid-2x2", tooltip: "Stitches", value: "stitches" },
  { icon: "lucide:blend", tooltip: "Mixed", value: "mixed" },
];

const expandeditems = [
  { icon: "lucide:square", label: "Solid", description: "View as solid squares", value: "solid" },
  { icon: "lucide:grid-2x2", label: "Stitches", description: "View as individual stitches", value: "stitches" },
  { icon: "lucide:blend", label: "Mixed", description: "Mixed display mode", value: "mixed" },
];

const state = reactive<Omit<ToolToggleGroupProps, "items">>({
  orientation: "horizontal",
  size: "lg",
  disabled: false,
});
const value = ref("solid");

defineExpose({ state, value });
</script>

<template>
  <Story id="tool-toggle-group" group="toolbar" title="ToolToggleGroup" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <ToolToggleGroup
        v-model="value"
        :items="compactItems"
        v-bind="state"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.orientation" title="Orientation" :options="orientations" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="compact" title="Compact" auto-props-disabled>
      <ToolToggleGroup v-model="value" v-bind="state" :items="compactItems" />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.orientation" title="Orientation" :options="orientations" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="expanded" title="Expanded" auto-props-disabled>
      <ToolToggleGroup v-model="value" v-bind="state" :items="expandeditems" orientation="vertical" />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>
  </Story>
</template>
