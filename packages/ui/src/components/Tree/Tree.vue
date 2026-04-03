<script setup lang="ts" generic="T extends TreeItem">
import { createReusableTemplate } from "@vueuse/core";
import type { TreeItemSelectEvent, TreeItemToggleEvent, TreeRootProps } from "reka-ui";
import { Tree } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { IconValue } from "../../types/icons.ts";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";
import ScrollArea from "../ScrollArea/ScrollArea.vue";
import type { ScrollAreaProps } from "../ScrollArea/ScrollArea.vue";

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

export interface TreeProps<T extends TreeItem = TreeItem> extends Pick<
  TreeRootProps,
  "disabled" | "defaultValue" | "defaultExpanded" | "selectionBehavior"
> {
  /** The items to display. */
  items?: T[];

  /**
   * The size of the tree.
   * @default "md"
   */
  size?: TreeThemeVariants["size"];

  /**
   * When provided, wraps the tree in a scroll area.
   * Pass `true` to use defaults, or an object to configure the scroll area.
   */
  scroll?: boolean | Pick<ScrollAreaProps, "type" | "size" | "ui">;

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

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<T>();
const expanded = defineModel<string[]>("expanded");

const props = withDefaults(defineProps<TreeProps<T>>(), {
  size: "md",
});
defineSlots<TreeSlots<T>>();

const scrollProps = computed<Pick<ScrollAreaProps, "type" | "size" | "ui"> | null>(() => {
  if (!props.scroll) return null;
  return typeof props.scroll === "boolean" ? {} : props.scroll;
});

const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate<{ item: T; index: number; level: number }>();
const [DefineTreeTemplate, ReuseTreeTemplate] = createReusableTemplate<{ items: T[]; level: number }>();

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
  <DefineItemTemplate v-slot="{ item, index, level }">
    <Tree.Item
      v-slot="{ isExpanded, isSelected, handleSelect, handleToggle }"
      :level="level"
      :value="item"
      @select="(e) => handleItemSelect(e as TreeItemSelectEvent<T>, item)"
      @toggle="(e) => handleItemToggle(e as TreeItemToggleEvent<T>)"
    >
      <div
        data-slot="item"
        :data-selected="isSelected || undefined"
        :data-ancestor-selected="selectedAncestors.has(item.value ?? item.label) || undefined"
        :class="ui.item({ class: props.ui?.item })"
      >
        <slot
          :name="(item.slot || 'item') as keyof TreeSlots"
          :item="item"
          :index="index"
          :level="level"
          :expanded="isExpanded"
          :selected="isSelected"
          :handle-select="handleSelect"
          :handle-toggle="handleToggle"
        >
          <slot
            name="item-leading"
            :item="item"
            :index="index"
            :level="level"
            :expanded="isExpanded"
            :selected="isSelected"
            :handle-select="handleSelect"
            :handle-toggle="handleToggle"
          >
            <Icon
              v-if="item.icon"
              :name="item.icon"
              data-slot="itemLeadingIcon"
              :class="ui.itemLeadingIcon({ class: props.ui?.itemLeadingIcon })"
            />
          </slot>

          <span data-slot="itemLabel" :class="ui.itemLabel({ class: props.ui?.itemLabel })">
            <slot
              name="item-label"
              :item="item"
              :index="index"
              :level="level"
              :expanded="isExpanded"
              :selected="isSelected"
              :handle-select="handleSelect"
              :handle-toggle="handleToggle"
            >
              {{ item.label }}
            </slot>
          </span>

          <Button
            v-if="item.children?.length"
            square
            color="neutral"
            variant="ghost"
            size="sm"
            :icon="icons.chevronDown"
            tabindex="-1"
            data-slot="itemChevron"
            :class="ui.itemChevron({ class: [props.ui?.itemChevron, isExpanded && 'rotate-180'] })"
            @click.stop="handleToggle()"
          />

          <slot
            name="item-trailing"
            :item="item"
            :index="index"
            :level="level"
            :expanded="isExpanded"
            :selected="isSelected"
            :handle-select="handleSelect"
            :handle-toggle="handleToggle"
          />
        </slot>
      </div>

      <ul v-if="isExpanded && item.children?.length" data-slot="list" :class="ui.list({ class: props.ui?.list })">
        <ReuseTreeTemplate :items="item.children as T[]" :level="level + 1" />
      </ul>
    </Tree.Item>
  </DefineItemTemplate>

  <!-- eslint-disable-next-line vue/no-template-shadow -->
  <DefineTreeTemplate v-slot="{ items, level }">
    <!-- @vue-expect-error `vue-tsc` fails to resolve the item template as a component when a generic type parameter is used in the props definition. -->
    <ReuseItemTemplate
      v-for="(item, index) in items"
      :key="item.value ?? item.label"
      :item="item"
      :index="index"
      :level="level"
    />
  </DefineTreeTemplate>

  <ScrollArea v-if="scrollProps" v-bind="scrollProps" orientation="vertical">
    <Tree.Root
      v-bind="$attrs"
      v-model="modelValue"
      v-model:expanded="expanded"
      :items="items"
      :default-value="defaultValue"
      :default-expanded="defaultExpanded"
      :get-key="(item) => item.value ?? item.label"
      :disabled="disabled"
      :multiple="false"
      :selection-behavior="props.selectionBehavior"
      data-slot="root"
      :class="ui.root({ class: [props.ui?.root, props.class] })"
    >
      <ReuseTreeTemplate :items="items ?? []" :level="1" />
    </Tree.Root>
  </ScrollArea>

  <Tree.Root
    v-else
    v-bind="$attrs"
    v-model="modelValue"
    v-model:expanded="expanded"
    :items="items"
    :default-value="defaultValue"
    :default-expanded="defaultExpanded"
    :get-key="(item) => item.value ?? item.label"
    :disabled="disabled"
    :multiple="false"
    :selection-behavior="props.selectionBehavior"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <ReuseTreeTemplate :items="items ?? []" :level="1" />
  </Tree.Root>
</template>
