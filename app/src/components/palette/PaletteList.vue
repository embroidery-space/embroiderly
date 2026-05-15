<script setup lang="ts" generic="T extends BasePaletteItem, V">
import { Listbox } from "@embroiderly/ui";
import type { ListboxItemObject, ListboxProps } from "@embroiderly/ui";

import { insertNodeAt, removeNode, useSortable } from "@vueuse/integrations/useSortable";
import { dequal } from "dequal/lite";
import { computed, nextTick, watchEffect, useTemplateRef } from "vue";

import { BasePaletteItem, PaletteSettings } from "~/lib/pattern/";

import PaletteListItem from "./PaletteListItem.vue";

interface PaletteListProps<T> extends Pick<ListboxProps, "disabled" | "multiple" | "scroll" | "filterInput"> {
  options?: T[];
  optionValue?: (option: T) => V;

  draggable?: boolean;

  displaySettings: PaletteSettings;
}

const value = defineModel<V | V[]>({ required: true });
const filterValue = defineModel<string>("filterValue", { default: "" });

const props = defineProps<PaletteListProps<T>>();
const emits = defineEmits<{
  "option-dblclick": [
    {
      /** Original event */
      originalEvent: Event;
      /** Triggered palitem */
      palitem: T;
      /** Index of the palitem in the options array */
      palindex: number;
    },
  ];
  reorder: [{ oldPosition: number; newPosition: number }];
}>();

type PalitemObject = ListboxItemObject & { palitem: T };

const items = computed<PalitemObject[]>(() => {
  if (!props.options) return [];
  return props.options.map((opt) => ({
    value: props.optionValue?.(opt) ?? (opt as unknown as V),
    palitem: opt,
  }));
});

const container = useTemplateRef<HTMLElement>("container");
const groupEl = computed(() => container.value?.querySelector<HTMLElement>('[data-slot="group"]') ?? null);
const { option: setSortableOption } = useSortable(groupEl, [], {
  animation: 100,
  disabled: true,
  forceFallback: true,
  avoidImplicitDeselect: true,
  watchElement: true,
  onUpdate: ({ from, item, oldIndex, newIndex }) => {
    if (oldIndex === undefined || newIndex === undefined) return;

    // Restore original DOM positions so Vue can properly re-render the palette list.
    removeNode(item);
    insertNodeAt(from, item, oldIndex);

    nextTick(() => emits("reorder", { oldPosition: oldIndex, newPosition: newIndex }));
  },
});
watchEffect(() => {
  setSortableOption("disabled", !props.draggable || props.disabled);
});

function optionIsSelected(option: T) {
  const transformed = props.optionValue?.(option) ?? option;
  if (props.multiple && Array.isArray(value.value)) {
    return value.value.some((v) => dequal(v, transformed));
  }
  return dequal(value.value, transformed);
}

function handleOptionDoubleClick({ originalEvent, item }: { originalEvent: MouseEvent; item: PalitemObject["value"] }) {
  const palitem = items.value.find((i) => dequal(i.value, item))?.palitem;
  if (!palitem) return;

  const palindex = props.options?.indexOf(palitem);
  if (palindex !== undefined && palindex !== -1) emits("option-dblclick", { originalEvent, palitem, palindex });
}
</script>

<template>
  <div ref="container" class="flex min-h-0 grow flex-col">
    <div v-if="$slots.header" class="border-b border-default p-1">
      <slot name="header"></slot>
    </div>

    <!-- @vue-expect-error The `v-model` type is correct. Anyway, we use `dequal` for comparing items. -->
    <Listbox
      v-model="value"
      v-model:filter-value="filterValue"
      avoid-implicit-deselect
      :items="items"
      :multiple="multiple"
      :disabled="disabled"
      :filter-input="filterInput"
      :scroll="scroll"
      :empty-message="$t('palette-empty')"
      class="grow"
      :style="{ '--palette-cols': displaySettings.columnsNumber }"
      :ui="{
        root: 'overflow-hidden rounded-none ring-0',
        filter: 'p-1',
        scroll: 'min-h-0 flex-1',
        content: 'min-h-full',
        group: 'grid grid-cols-[repeat(var(--palette-cols),minmax(0,1fr))] gap-1 p-1',
        item: 'rounded-none p-0 data-highlighted:bg-transparent',
        empty: 'text-xs',
      }"
      @option-dblclick="handleOptionDoubleClick"
    >
      <template #option="{ item }">
        <slot
          name="option"
          v-bind="{
            option: item.palitem,
            selected: optionIsSelected(item.palitem),
            displaySettings,
          }"
        >
          <PaletteListItem
            :palette-item="item.palitem"
            :selected="optionIsSelected(item.palitem)"
            :display-settings="displaySettings"
          />
        </slot>
      </template>
    </Listbox>

    <div v-if="$slots.footer" class="border-t border-default px-2 py-1">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
