<script setup lang="ts" generic="T extends ListboxItem">
import defu from "defu";
import type { AcceptableValue, ListboxRootProps } from "reka-ui";
import { Listbox } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Icon from "../Icon/Icon.vue";
import Input from "../Input/Input.vue";
import type { InputProps } from "../Input/Input.vue";

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
  /** The items to display in the listbox. */
  items?: T[] | T[][];

  /**
   * Show a filter input above the content.
   * Actual filtering must be done externally (e.g., via Fuse.js).
   * Pass an object to forward props to the underlying `Input`.
   * @default false
   */
  filterInput?: boolean | InputProps;

  /** The message to display when the listbox is empty. */
  emptyMessage?: string;
}

export interface ListboxEmits<T extends ListboxItem = ListboxItem> {
  "option-select": [{ originalEvent: Event; item: T; index: number }];
  "option-dblclick": [{ originalEvent: MouseEvent; item: T; index: number }];
  "option-contextmenu": [{ originalEvent: MouseEvent; item: T; index: number }];
  highlight: [payload: { ref: HTMLElement; value: T } | undefined];
}

export interface ListboxSlots {
  option?(props: { item: ListboxItemObject; selected: boolean; index: number }): any;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<T | T[]>();
const filterValue = defineModel<string>("filterValue", { default: "" });

const props = withDefaults(defineProps<ListboxProps<T>>(), {});
const emit = defineEmits<ListboxEmits<T>>();
defineSlots<ListboxSlots>();

const locale = useLocale();
const { icons } = useComponentIcons();

const filterInputProps = computed<InputProps>(() =>
  defu(typeof props.filterInput === "object" ? props.filterInput : {}, {
    placeholder: locale.value.messages.listbox.search,
    variant: "none",
  } as InputProps),
);

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
</script>

<template>
  <Listbox.Root
    v-model="modelValue as AcceptableValue | undefined"
    v-bind="$attrs"
    :multiple="multiple"
    :selection-behavior="selectionBehavior"
    :highlight-on-hover="highlightOnHover"
    :orientation="orientation"
    :by="by as any"
    :disabled="disabled"
    data-slot="root"
    :class="[$style.root, { [$style.disabled]: disabled }]"
    @highlight="emit('highlight', $event as any)"
  >
    <Listbox.Filter v-if="filterInput" v-model="filterValue" as-child>
      <Input v-model="filterValue" v-bind="filterInputProps" />
    </Listbox.Filter>

    <Listbox.Content data-slot="content" :class="$style.content">
      <template v-if="hasItems">
        <Listbox.Group v-for="(group, gi) in normalizedGroups" :key="gi" data-slot="group" :class="$style.group">
          <template v-for="(item, i) in group" :key="`${gi}-${i}`">
            <Listbox.GroupLabel v-if="item.type === 'label'" data-slot="label" :class="[$style.label, item.class]">
              {{ item.label }}
            </Listbox.GroupLabel>

            <div
              v-else-if="item.type === 'separator'"
              role="separator"
              data-slot="separator"
              :class="[$style.separator, item.class]"
            />

            <Listbox.Item
              v-else
              :value="item.value as AcceptableValue"
              :disabled="!!item.disabled"
              data-slot="item"
              :class="[$style.item, item.class]"
              @select="emit('option-select', { originalEvent: $event, item: item.value as T, index: i })"
              @dblclick="
                emit('option-dblclick', { originalEvent: $event as MouseEvent, item: item.value as T, index: i })
              "
              @contextmenu="
                emit('option-contextmenu', { originalEvent: $event as MouseEvent, item: item.value as T, index: i })
              "
            >
              <slot name="option" :item="item" :selected="isSelected(item)" :index="i">
                <span data-slot="item-label" :class="$style.itemLabel">
                  {{ item.label ?? String(item.value) }}
                </span>
                <Listbox.ItemIndicator>
                  <Icon :name="icons.check" data-slot="item-indicator" :class="$style.itemIndicator" />
                </Listbox.ItemIndicator>
              </slot>
            </Listbox.Item>
          </template>
        </Listbox.Group>
      </template>

      <p v-else data-slot="empty" :class="$style.empty">
        {{ props.emptyMessage ?? locale.messages.listbox.empty }}
      </p>
    </Listbox.Content>
  </Listbox.Root>
</template>

<style module>
.root {
  overflow: hidden;
  display: flex;
  flex-direction: column;

  min-height: 0;
  border-radius: var(--radius-md);

  box-shadow: inset 0 0 0 1px var(--border-color-default);

  &.disabled {
    cursor: not-allowed;

    opacity: 75%;
  }

  & > [data-slot="root"] {
    border-bottom: 1px solid var(--border-color-default);
  }
}

.content {
  overflow-y: auto;
  flex: 1;

  min-height: 0;

  outline-style: none;
}

.group {
  padding: calc(var(--spacing) * 1);
}

.label {
  display: flex;

  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  width: 100%;

  padding: calc(var(--spacing) * 1.5);

  font-size: var(--text-sm);

  font-weight: 600;
  color: var(--text-color-muted);
}

.separator {
  height: 1px;
  margin-block: calc(var(--spacing) * 1);
  margin-inline: calc(var(--spacing) * -1);

  background-color: var(--border-color-default);
}

.item {
  cursor: pointer;
  user-select: none;

  display: flex;

  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  width: 100%;

  padding: calc(var(--spacing) * 1.5);
  border-radius: var(--radius-sm);

  font-size: var(--text-sm);

  color: var(--text-color-default);

  outline-style: none;

  &[data-disabled] {
    cursor: not-allowed;

    opacity: 75%;
  }

  &[data-highlighted] {
    background-color: var(--background-color-elevated);
  }

  &[data-disabled][data-highlighted] {
    background-color: transparent;
  }
}

.item-label {
  overflow: hidden;
  flex: 1;

  min-width: 0;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-indicator {
  flex-shrink: 0;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);

  margin-inline-start: auto;

  color: var(--color-primary);

  .color-neutral & {
    color: var(--text-color-default);
  }
}

.empty {
  padding-block: calc(var(--spacing) * 1.5);

  font-size: var(--text-sm);
  color: var(--text-color-muted);
  text-align: center;
}
</style>
