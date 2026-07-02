<script setup lang="ts" generic="T extends ListboxItem">
import { createReusableTemplate } from "@vueuse/core";
import defu from "defu";
import type { AcceptableValue, ListboxRootProps } from "reka-ui";
import { Listbox } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Icon from "../Icon/Icon.vue";
import Input from "../Input/Input.vue";
import type { InputProps } from "../Input/Input.vue";
import ScrollArea from "../ScrollArea/ScrollArea.vue";
import type { ScrollAreaProps } from "../ScrollArea/ScrollArea.vue";

import { ListboxTheme } from "./Listbox.theme.ts";
import type { ListboxThemeSlots, ListboxThemeVariants } from "./Listbox.theme.ts";

export interface ListboxItemObject {
  /** The type of the item. */
  type?: "separator" | "label";

  /** The label to display. */
  label?: string;
  /** The value of the item. Not used for `separator` and `label` types. */
  value?: any;

  /** Whether the item is disabled. */
  disabled?: boolean;

  /** Additional CSS class(es) for the item. */
  class?: any;

  [key: string]: any;
}

export type ListboxItem = string | number | ListboxItemObject;

export interface ListboxProps<T extends ListboxItem = ListboxItem> extends Pick<
  ListboxRootProps<T>,
  "multiple" | "selectionBehavior" | "highlightOnHover" | "orientation" | "by" | "disabled"
> {
  id?: string;

  /** The items to display in the listbox. */
  items?: T[] | T[][];

  /**
   * Show a filter input above the content.
   * Actual filtering must be done externally (e.g., via Fuse.js).
   * Pass an object to forward props to the underlying `Input`.
   * @default false
   */
  filterInput?: boolean | InputProps;

  /**
   * Wrap the content in a `ScrollArea`.
   * Pass an object to configure it.
   * @default true
   */
  scroll?: boolean | Pick<ScrollAreaProps, "type" | "size" | "ui">;

  /**
   * The color scheme of the listbox.
   * @default "primary"
   */
  color?: ListboxThemeVariants["color"];
  /**
   * The size of the listbox.
   * @default "md"
   */
  size?: ListboxThemeVariants["size"];

  /** The message to display when the listbox is empty. */
  emptyMessage?: string;

  class?: any;
  ui?: ListboxThemeSlots;
}

export interface ListboxEmits<T extends ListboxItem = ListboxItem> {
  "option-select": [{ originalEvent: Event; item: T; index: number }];
  "option-dblclick": [{ originalEvent: MouseEvent; item: T; index: number }];
  "option-contextmenu": [{ originalEvent: MouseEvent; item: T; index: number }];
  highlight: [payload: { ref: HTMLElement; value: T } | undefined];
}

export interface ListboxSlots {
  option(props: { item: ListboxItemObject; selected: boolean; index: number }): any;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<T | T[]>();
const filterValue = defineModel<string>("filterValue", { default: "" });

const props = withDefaults(defineProps<ListboxProps<T>>(), {
  color: "primary",
  size: "md",
  scroll: true,
});
const emit = defineEmits<ListboxEmits<T>>();
defineSlots<ListboxSlots>();

const locale = useLocale();
const { icons } = useComponentIcons();

const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? formFieldSize.value);

const filterInputProps = computed<InputProps>(() =>
  defu(typeof props.filterInput === "object" ? props.filterInput : {}, {
    placeholder: locale.value.messages.listbox.search,
    variant: "none",
  } as InputProps),
);

const scrollProps = computed<Pick<ScrollAreaProps, "type" | "size" | "ui"> | null>(() => {
  if (props.scroll === false) return null;
  return defu(typeof props.scroll === "object" ? props.scroll : {}, { type: "hover" as const });
});

const [DefineContentTemplate, ContentTemplate] = createReusableTemplate();

const normalizedGroups = computed<ListboxItemObject[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) {
    return (props.items as T[][]).map((group) => group.map((item) => normalizeItem(item)));
  }
  return [(props.items as T[]).map((item) => normalizeItem(item))];
});
const hasItems = computed(() => normalizedGroups.value.some((group) => group.some((item) => !item.type)));

function normalizeItem(item: T): ListboxItemObject {
  if (typeof item === "string" || typeof item === "number") {
    return { label: String(item), value: item };
  }
  const obj = item as ListboxItemObject;
  return obj.value === undefined ? { ...obj, value: item } : obj;
}

function isSelected(item: ListboxItemObject): boolean {
  const val = modelValue.value;
  if (val === undefined || val === null) return false;
  if (Array.isArray(val)) return val.some((v) => compareValues(v, item.value));
  return compareValues(val, item.value);
}

function compareValues(a: any, b: any): boolean {
  if (typeof props.by === "function") return props.by(a as T, b as T);
  if (typeof props.by === "string") return a?.[props.by] === b?.[props.by];
  return a === b;
}

const ui = computed(() => {
  return ListboxTheme({
    color: props.color,
    size: size.value,
    disabled: props.disabled,
  });
});
</script>

<template>
  <DefineContentTemplate>
    <Listbox.Content data-slot="content" :class="ui.content({ class: props.ui?.content })">
      <template v-if="hasItems">
        <Listbox.Group
          v-for="(group, gi) in normalizedGroups"
          :key="gi"
          data-slot="group"
          :class="ui.group({ class: props.ui?.group })"
        >
          <template v-for="(item, i) in group" :key="`${gi}-${i}`">
            <Listbox.GroupLabel
              v-if="item.type === 'label'"
              data-slot="label"
              :class="ui.label({ class: [props.ui?.label, item.class] })"
            >
              {{ item.label }}
            </Listbox.GroupLabel>

            <div
              v-else-if="item.type === 'separator'"
              role="separator"
              data-slot="separator"
              :class="ui.separator({ class: [props.ui?.separator, item.class] })"
            />

            <Listbox.Item
              v-else
              :value="item.value as AcceptableValue"
              :disabled="!!item.disabled"
              data-slot="item"
              :class="ui.item({ class: [props.ui?.item, item.class] })"
              @select="emit('option-select', { originalEvent: $event, item: item.value as T, index: i })"
              @dblclick="
                emit('option-dblclick', { originalEvent: $event as MouseEvent, item: item.value as T, index: i })
              "
              @contextmenu="
                emit('option-contextmenu', { originalEvent: $event as MouseEvent, item: item.value as T, index: i })
              "
            >
              <slot name="option" :item="item" :selected="isSelected(item)" :index="i">
                <span data-slot="itemLabel" :class="ui.itemLabel({ class: props.ui?.itemLabel })">
                  {{ item.label ?? String(item.value) }}
                </span>
                <Listbox.ItemIndicator>
                  <Icon
                    :name="icons.check"
                    data-slot="itemIndicator"
                    :class="ui.itemIndicator({ class: props.ui?.itemIndicator })"
                  />
                </Listbox.ItemIndicator>
              </slot>
            </Listbox.Item>
          </template>
        </Listbox.Group>
      </template>

      <p v-else data-slot="empty" :class="ui.empty({ class: props.ui?.empty })">
        {{ props.emptyMessage ?? locale.messages.listbox.empty }}
      </p>
    </Listbox.Content>
  </DefineContentTemplate>

  <Listbox.Root
    :id="id"
    v-model="modelValue as AcceptableValue | undefined"
    v-bind="{ ...$attrs, ...ariaAttrs }"
    :multiple="multiple"
    :selection-behavior="selectionBehavior"
    :highlight-on-hover="highlightOnHover"
    :orientation="orientation"
    :by="by as any"
    :disabled="disabled"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
    @highlight="emit('highlight', $event as any)"
  >
    <Listbox.Filter v-if="filterInput" v-model="filterValue" as-child>
      <Input
        v-model="filterValue"
        :size="size"
        v-bind="filterInputProps"
        :class="ui.filter({ class: props.ui?.filter })"
      />
    </Listbox.Filter>

    <ScrollArea
      v-if="scrollProps !== null"
      v-bind="scrollProps"
      :size="scrollProps.size ?? size"
      data-slot="scroll"
      :class="ui.scroll({ class: [scrollProps.ui?.root, props.ui?.scroll] })"
    >
      <ContentTemplate />
    </ScrollArea>
    <ContentTemplate v-else />
  </Listbox.Root>
</template>
