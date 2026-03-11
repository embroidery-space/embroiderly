<script setup lang="ts" generic="T extends TreeItem">
import type { TreeItemSelectEvent, TreeItemToggleEvent } from "reka-ui";
import { Tree } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";

import { TreeTheme } from "./Tree.theme.ts";
import type { TreeThemeSlots, TreeThemeVariants } from "./Tree.theme.ts";

export interface TreeItem {
  /** Display text. */
  label: string;
  /** Unique identifier; falls back to `label` if not provided. */
  value?: string;
  /** Leading icon. */
  icon?: IconValue;

  /** Nested items. */
  children?: TreeItem[];

  /** Whether the item is disabled. */
  disabled?: boolean;
  /** Whether the item is initially expanded. */
  defaultExpanded?: boolean;

  /** Named slot for custom rendering. */
  slot?: string;

  /** Called when the item is selected. */
  onSelect?: (e: TreeItemSelectEvent<TreeItem>) => void;
}

export interface TreeItemSlotProps<T extends TreeItem> {
  item: T;
  index: number;
  level: number;
  expanded: boolean;
  selected: boolean;
  handleSelect: () => void;
  handleToggle: () => void;
}

export interface TreeProps<T extends TreeItem = TreeItem> {
  /** The items to display. */
  items?: T[];

  /**
   * Uncontrolled initial expanded keys.
   * Merged with per-item `defaultExpanded: true`.
   */
  defaultExpanded?: string[];

  /** Whether the entire tree is disabled. */
  disabled?: boolean;

  /**
   * The size of the tree.
   * @default "md"
   */
  size?: TreeThemeVariants["size"];

  /** Called when any item is selected (tree-level). */
  onSelect?: (e: TreeItemSelectEvent<T>) => void;

  class?: any;
  ui?: TreeThemeSlots;
}

export interface TreeSlots<T extends TreeItem = TreeItem> {
  "item"(props: TreeItemSlotProps<T>): any;
  "item-leading"(props: TreeItemSlotProps<T>): any;
  "item-label"(props: TreeItemSlotProps<T>): any;
  "item-trailing"(props: TreeItemSlotProps<T>): any;
  [key: string]: (props: TreeItemSlotProps<T>) => any;
}

const modelValue = defineModel<T>();
const expanded = defineModel<string[]>("expanded");

const props = withDefaults(defineProps<TreeProps<T>>(), {
  size: "md",
});
defineSlots<TreeSlots<T>>();

const { icons } = useComponentIcons();

const ui = computed(() => TreeTheme({ size: props.size }));

const defaultExpanded = computed<string[]>(() => {
  const keys = new Set<string>(props.defaultExpanded ?? []);

  function collect(items: T[]) {
    for (const item of items) {
      if (item.defaultExpanded) keys.add(item.value ?? item.label);
      if (item.children?.length) collect(item.children as T[]);
    }
  }

  if (props.items) collect(props.items);
  return [...keys];
});

/** Keys of all ancestors of the currently selected item. */
const selectedAncestors = computed<Set<string>>(() => {
  const ancestors = new Set<string>();
  if (!modelValue.value || !props.items) return ancestors;

  const selectedKey = modelValue.value.value ?? modelValue.value.label;

  function findAncestors(items: T[], path: string[]): boolean {
    for (const item of items) {
      const key = item.value ?? item.label;
      if (key === selectedKey) {
        for (const k of path) ancestors.add(k);
        return true;
      }
      if (item.children?.length && findAncestors(item.children as T[], [...path, key])) {
        return true;
      }
    }
    return false;
  }

  findAncestors(props.items, []);
  return ancestors;
});

function getAncestorItems(target: T, items: T[], path: T[] = []): T[] | null {
  for (const item of items) {
    if ((item.value ?? item.label) === (target.value ?? target.label)) return path;
    if (item.children?.length) {
      const result = getAncestorItems(target, item.children as T[], [...path, item]);
      if (result !== null) return result;
    }
  }
  return null;
}

function handleItemSelect(e: TreeItemSelectEvent<T>, item: T) {
  item.onSelect?.(e as any);
  if (e.defaultPrevented) return;

  const ancestors = getAncestorItems(item, props.items ?? []) ?? [];
  for (const ancestor of ancestors) {
    ancestor.onSelect?.(e as any);
    if (e.defaultPrevented) return;
  }

  props.onSelect?.(e);
}

function handleItemToggle(e: TreeItemToggleEvent<T>) {
  // Prevent item collapsing/expanding by clicking on the item itself.
  // Items are toggled by clicking on a chevron button or via keyboard arrows.
  if (e.detail.originalEvent.type === "click") e.preventDefault();
}
</script>

<template>
  <Tree.Root
    v-model="modelValue"
    v-model:expanded="expanded"
    :items="items"
    :default-expanded="defaultExpanded"
    :get-key="(item) => item.value ?? item.label"
    :disabled="disabled"
    :multiple="false"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <template #default="{ flattenItems }">
      <Tree.Item
        v-for="(flatItem, index) in flattenItems"
        :key="flatItem._id"
        v-bind="flatItem.bind"
        v-slot="{ isExpanded, isSelected, handleSelect, handleToggle }"
        data-slot="item"
        :class="ui.item({ class: props.ui?.item })"
        :style="{
          '--tree-level': flatItem.level,
          marginInlineStart: `calc(${flatItem.level - 1} * var(--tree-indent))`,
          width: `calc(100% - ${flatItem.level - 1} * var(--tree-indent))`,
        }"
        :data-ancestor-selected="selectedAncestors.has(flatItem.value.value ?? flatItem.value.label) || undefined"
        @select="(e) => handleItemSelect(e, flatItem.value)"
        @toggle="(e) => handleItemToggle(e)"
      >
        <slot
          :name="(flatItem.value.slot || 'item') as keyof TreeSlots"
          :item="flatItem.value"
          :index="index"
          :level="flatItem.level"
          :expanded="isExpanded"
          :selected="isSelected"
          :handle-select="handleSelect"
          :handle-toggle="handleToggle"
        >
          <slot
            name="item-leading"
            :item="flatItem.value"
            :index="index"
            :level="flatItem.level"
            :expanded="isExpanded"
            :selected="isSelected"
            :handle-select="handleSelect"
            :handle-toggle="handleToggle"
          >
            <Icon
              v-if="flatItem.value.icon"
              :name="flatItem.value.icon"
              data-slot="itemLeadingIcon"
              :class="ui.itemLeadingIcon({ class: props.ui?.itemLeadingIcon })"
            />
          </slot>

          <span data-slot="itemLabel" :class="ui.itemLabel({ class: props.ui?.itemLabel })">
            <slot
              name="item-label"
              :item="flatItem.value"
              :index="index"
              :level="flatItem.level"
              :expanded="isExpanded"
              :selected="isSelected"
              :handle-select="handleSelect"
              :handle-toggle="handleToggle"
            >
              {{ flatItem.value.label }}
            </slot>
          </span>

          <button
            v-if="flatItem.hasChildren"
            type="button"
            tabindex="-1"
            data-slot="itemChevron"
            :class="ui.itemChevron({ class: [props.ui?.itemChevron, isExpanded && 'rotate-180'] })"
            @click.stop="handleToggle()"
          >
            <Icon :name="icons.chevronDown" />
          </button>

          <slot
            name="item-trailing"
            :item="flatItem.value"
            :index="index"
            :level="flatItem.level"
            :expanded="isExpanded"
            :selected="isSelected"
            :handle-select="handleSelect"
            :handle-toggle="handleToggle"
          />
        </slot>
      </Tree.Item>
    </template>
  </Tree.Root>
</template>
