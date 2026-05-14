<script setup lang="ts">
import { logEvent } from "histoire/client";
import { computed, reactive, ref } from "vue";

import Listbox from "./Listbox.vue";
import type { ListboxItem, ListboxProps } from "./Listbox.vue";

const sizes = ["sm", "md", "lg"] as const;

const flatItems = ref<ListboxItem[]>(["Backlog", "Todo", "In Progress", "Done", "Cancelled"]);

const groupedItems = ref<ListboxItem[][]>([
  [{ type: "label", label: "Active" }, { label: "Backlog" }, { label: "Todo" }, { label: "In Progress" }],
  [{ type: "separator" }, { label: "Done" }, { label: "Cancelled", disabled: true }],
]);

const demoState = reactive<ListboxProps>({
  multiple: false,
  disabled: false,
  highlightOnHover: true,
  filterInput: false,
  size: "md",
  color: "primary",
});

const demoValue = ref<ListboxItem | undefined>(undefined);

const filterValue = ref("");
const filteredItems = computed(() =>
  flatItems.value.filter((item) =>
    typeof item === "object" && item.label
      ? item.label.toLowerCase().includes(filterValue.value.toLowerCase())
      : String(item).toLowerCase().includes(filterValue.value.toLowerCase()),
  ),
);

defineExpose({ demoState });
</script>

<template>
  <Story id="listbox" group="form" title="Listbox" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Listbox
        v-bind="demoState"
        v-model="demoValue"
        :items="flatItems"
        class="w-56"
        @update:model-value="logEvent('update:model-value', { value: $event })"
        @option-dblclick="logEvent('option-dblclick', $event)"
      />

      <template #controls>
        <HstCheckbox v-model="demoState.multiple" title="Multiple" />
        <HstCheckbox v-model="demoState.disabled" title="Disabled" />
        <HstCheckbox v-model="demoState.highlightOnHover" title="Highlight On Hover" />
        <HstCheckbox v-model="demoState.filterInput as boolean" title="Filter Input" />
        <HstSelect v-model="demoState.size" title="Size" :options="sizes" />
      </template>
    </Variant>

    <Variant id="grouped" title="Grouped" auto-props-disabled>
      <Listbox :items="groupedItems" class="w-56" />
    </Variant>

    <Variant id="filtering" title="Filtering" auto-props-disabled>
      <Listbox v-model:filter-value="filterValue" :items="filteredItems" filter-input class="w-56" />
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex gap-4">
        <Listbox v-for="size in sizes" :key="size" :items="flatItems" :size="size" class="w-40" />
      </div>
    </Variant>

    <Variant id="states" title="States" auto-props-disabled>
      <div class="flex gap-4">
        <Listbox :items="flatItems" class="w-40" />
        <Listbox :items="flatItems" disabled class="w-40" />
        <Listbox :items="[]" class="w-40" />
      </div>
    </Variant>
  </Story>
</template>
