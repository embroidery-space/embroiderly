<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive, ref } from "vue";

import ToolToggle from "./ToolToggle.vue";
import type { ToolToggleProps } from "./ToolToggle.vue";

const sizes = ["sm", "md", "lg"] as const;

const state = reactive<Omit<ToolToggleProps, "icon">>({
  label: "",
  description: "",

  shortcut: "Ctrl+S",
  tooltip: "Show symbols",

  size: "lg",

  disabled: false,
});
const value = ref(false);

defineExpose({ state, value });
</script>

<template>
  <Story id="tool-toggle" group="toolbar" title="ToolToggle" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <ToolToggle
        v-model="value"
        icon="lucide:eye"
        v-bind="state"
        @update:model-value="logEvent('update:model-value', { value: $event })"
      />

      <template #controls>
        <HstCheckbox v-model="state.disabled" title="Disabled" />
        <HstSelect v-model="state.size" title="Size" :options="sizes" />

        <HstText v-model="state.label" title="Label" />
        <HstText v-model="state.description" title="Description" />

        <HstText v-model="state.shortcut" title="Shortcut" />
        <HstText v-model="state.tooltip" title="Tooltip" />
      </template>
    </Variant>

    <Variant id="compact" title="Compact" auto-props-disabled>
      <ToolToggle v-model="value" icon="lucide:eye" tooltip="Show symbols" shortcut="Ctrl+S" />
    </Variant>

    <Variant id="expanded" title="Expanded" auto-props-disabled>
      <ToolToggle
        v-model="value"
        icon="lucide:eye"
        label="Show symbols"
        description="Toggle symbol visibility on the canvas"
        shortcut="Ctrl+S"
      />
    </Variant>
  </Story>
</template>
