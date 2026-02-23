<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import ContextMenu from "./ContextMenu.vue";
import type { ContextMenuItem, ContextMenuProps } from "./ContextMenu.vue";

const sizes = ["sm", "md", "lg"] as const;

const state = reactive<ContextMenuProps>({
  size: "md",

  disabled: false,
});

const showGrid = ref(true);
const showRulers = ref(false);

const items = computed<ContextMenuItem[][]>(() => [
  [
    { icon: "lucide:scissors", label: "Cut", shortcut: "Ctrl+X" },
    { icon: "lucide:copy", label: "Copy", shortcut: "Ctrl+C" },
    { icon: "lucide:clipboard", label: "Paste", shortcut: "Ctrl+V", disabled: true },
  ],
  [
    { type: "label", label: "View" },
    { type: "separator" },
    {
      type: "checkbox",
      label: "Show Grid",
      checked: showGrid.value,
      onUpdateChecked(checked: boolean) {
        showGrid.value = checked;
      },
      onSelect(e: Event) {
        e.preventDefault();
      },
    },
    {
      type: "checkbox",
      label: "Show Rulers",
      checked: showRulers.value,
      onUpdateChecked(checked: boolean) {
        showRulers.value = checked;
      },
      onSelect(e: Event) {
        e.preventDefault();
      },
    },
  ],
  [
    {
      label: "More Tools",
      children: [
        [
          { label: "Undo", shortcut: "Ctrl+Z" },
          { label: "Redo", shortcut: "Ctrl+Shift+Z" },
        ],
        [{ label: "Select All", shortcut: "Ctrl+A" }],
      ],
    },
  ],
]);

defineExpose({ state });
</script>

<template>
  <Story id="context-menu" group="overlay" title="ContextMenu" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <ContextMenu v-bind="state" :items="items">
        <Placeholder class="inline-flex size-48 items-center justify-center">Right-click here</Placeholder>
      </ContextMenu>

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>
  </Story>
</template>
