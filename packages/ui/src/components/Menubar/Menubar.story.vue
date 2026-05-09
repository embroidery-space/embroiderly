<script setup lang="ts">
import { computed, reactive, ref } from "vue";

import Menubar from "./Menubar.vue";
import type { MenubarMenu, MenubarProps } from "./Menubar.vue";

const sizes = ["sm", "md", "lg"] as const;

const state = reactive<MenubarProps>({
  size: "md",
});

const showGrid = ref(true);
const showRulers = ref(false);

const menus = computed<MenubarMenu[]>(() => [
  {
    label: "File",
    items: [
      [
        { label: "New", shortcut: "Ctrl+N" },
        { label: "Open", shortcut: "Ctrl+O" },
      ],
      [
        { label: "Save", shortcut: "Ctrl+S" },
        { label: "Save As", shortcut: "Ctrl+Shift+S" },
      ],
      [{ label: "Exit" }],
    ],
  },
  {
    label: "Edit",
    items: [
      [
        { label: "Undo", shortcut: "Ctrl+Z" },
        { label: "Redo", shortcut: "Ctrl+Shift+Z" },
      ],
      [
        { icon: "lucide:scissors", label: "Cut", shortcut: "Ctrl+X" },
        { icon: "lucide:copy", label: "Copy", shortcut: "Ctrl+C" },
        { icon: "lucide:clipboard", label: "Paste", shortcut: "Ctrl+V" },
      ],
    ],
  },
  {
    label: "View",
    items: [
      { type: "label", label: "Display" },
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
  },
  {
    label: "Help",
    items: [
      {
        label: "Documentation",
        children: [{ label: "Getting Started" }, { label: "API Reference" }],
      },
      { type: "separator" },
      { label: "About" },
      { type: "separator" },
      { type: "link", label: "Internal Page", href: "/about" },
      { type: "link", label: "External Site", href: "https://example.com", target: "_blank" },
      { type: "link", label: "Disabled Link", href: "https://example.com", disabled: true },
    ],
  },
]);

defineExpose({ state });
</script>

<template>
  <Story id="menubar" group="navigation" title="Menubar" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Menubar v-bind="state" :menus="menus" />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
      </template>
    </Variant>
  </Story>
</template>
