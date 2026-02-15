<script setup lang="ts">
  import { computed, reactive, ref } from "vue";

  import Button from "../Button/Button.vue";

  import DropdownMenu from "./DropdownMenu.vue";
  import type { DropdownMenuItem, DropdownMenuProps } from "./DropdownMenu.vue";

  const sizes = ["sm", "md", "lg"] as const;

  const state = reactive<DropdownMenuProps>({
    size: "md",

    disabled: false,
  });

  const showGrid = ref(true);
  const showRulers = ref(false);

  const items = computed<DropdownMenuItem[][]>(() => [
    [
      { icon: "lucide:scissors", label: "Cut" },
      { icon: "lucide:copy", label: "Copy" },
      { icon: "lucide:clipboard", label: "Paste", disabled: true },
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
        children: [[{ label: "Undo" }, { label: "Redo" }], [{ label: "Select All" }]],
      },
    ],
  ]);

  defineExpose({ state });
</script>

<template>
  <Story id="dropdown-menu" group="overlay" title="DropdownMenu" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <DropdownMenu v-bind="state" :items="items">
        <Button icon="lucide:menu" label="Open menu" />
      </DropdownMenu>

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>
  </Story>
</template>
