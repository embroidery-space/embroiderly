<template>
  <Listbox
    :model-value="modelValue"
    :options="options"
    :option-value="optionValue"
    :disabled="disabled"
    :multiple="mulitple"
    :meta-key-selection="metaKeySelection"
    :empty-message="$t('message-palette-empty')"
    scroll-height="100%"
    :list-style="listStyle"
    :pt="listboxPassThrough"
    :dt="{ list: { header: { padding: '0.25rem' } } }"
    @update:model-value="(v) => emit('update:modelValue', v)"
    @option-dblclick="handleOptionDoubleClick"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>

    <template #option="{ option, selected }">
      <slot name="option" v-bind="{ option, selected, displaySettings }">
        <PaletteItem :palette-item="option" :selected="selected" :display-settings="displaySettings" />
      </slot>
    </template>

    <template v-if="$slots.footer" #footer>
      <div class="px-2 py-1">
        <slot name="footer"></slot>
      </div>
    </template>
  </Listbox>
</template>

<script setup lang="ts" generic="T, V">
  import { computed } from "vue";
  import { type PassThrough } from "@primevue/core";
  import { Listbox, type ListboxOptionDblClickEvent, type ListboxPassThroughOptions } from "primevue";
  import type { PaletteSettings } from "#/schemas/index.ts";
  import PaletteItem from "./PaletteItem.vue";

  const props = defineProps<{
    modelValue: V;
    options?: T[];
    optionValue?: (option: T) => unknown;
    disabled?: boolean;
    mulitple?: boolean;
    metaKeySelection?: boolean;
    displaySettings: PaletteSettings;
    fluidOptions?: boolean;
    listStyle?: string;
  }>();

  const emit = defineEmits<{
    (event: "update:modelValue", value: V): void;
    (
      event: "option-dblclick",
      data: {
        /** Original event */
        originalEvent: Event;
        /** Triggered palitem */
        palitem: T;
        /** Index of the palitem in the options array */
        palindex: number;
      },
    ): void;
  }>();

  const listboxPassThrough: PassThrough<ListboxPassThroughOptions> = computed(() => ({
    root: { class: "flex flex-col overflow-y-auto" },
    listContainer: { class: "grow" },
    list: {
      class: "grid gap-1",
      style: {
        gridTemplateColumns: `repeat(${props.options?.length ? props.displaySettings.columnsNumber : 1}, minmax(${props.fluidOptions ? "0px" : "min-content"}, 1fr))`,
      },
    },
    option: { class: "p-0" },
  }));

  function handleOptionDoubleClick({ originalEvent, value: palitem }: ListboxOptionDblClickEvent) {
    const palindex = props.options!.indexOf(palitem) ?? -1;
    if (palindex !== -1) emit("option-dblclick", { originalEvent, palitem, palindex });
  }
</script>
