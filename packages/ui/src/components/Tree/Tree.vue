<script setup lang="ts" generic="T extends TreeItem">
import { createReusableTemplate } from "@vueuse/core";
import type { TreeItemSelectEvent, TreeItemToggleEvent, TreeRootProps } from "reka-ui";
import { Tree } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { IconValue } from "../../types/icons.ts";
import Button from "../Button/Button.vue";
import Icon from "../Icon/Icon.vue";

export interface TreeItem {
  /** Display text. */
  label: string;
  /** Unique identifier; falls back to `label` if not provided. */
  value?: string;
  /** Leading icon. */
  icon?: IconValue;

  /** Whether the item is disabled. */
  disabled?: boolean;

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
  disabled: boolean;
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
  size?: "sm" | "md" | "lg";

  /**
   * Whether the tree scrolls vertically when it overflows its container.
   * @default false
   */
  scroll?: boolean;

  /** Called when any item is selected (tree-level). */
  onSelect?: (e: TreeItemSelectEvent<T>) => void;
}

export interface TreeSlots<T extends TreeItem = TreeItem> {
  item?(props: TreeItemSlotProps<T>): any;
  "item-leading"?(props: TreeItemSlotProps<T>): any;
  "item-label"?(props: TreeItemSlotProps<T>): any;
  "item-trailing"?(props: TreeItemSlotProps<T>): any;
  [key: string]: ((props: TreeItemSlotProps<T>) => any) | undefined;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<T>();
const expanded = defineModel<string[]>("expanded");

const props = withDefaults(defineProps<TreeProps<T>>(), {
  size: "md",
});
defineSlots<TreeSlots<T>>();

const [DefineItemTemplate, ReuseItemTemplate] = createReusableTemplate<{ item: T; index: number; level: number }>();
const [DefineTreeTemplate, ReuseTreeTemplate] = createReusableTemplate<{ items: T[]; level: number }>();

const { icons } = useComponentIcons();

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
      v-slot="{ isExpanded, isSelected, isDisabled, handleSelect, handleToggle }"
      :level="level"
      :value="item"
      :disabled="item.disabled"
      @select="(e) => handleItemSelect(e as TreeItemSelectEvent<T>, item)"
      @toggle="(e) => handleItemToggle(e as TreeItemToggleEvent<T>)"
    >
      <div
        data-slot="item"
        :aria-selected="isSelected || undefined"
        :aria-disabled="isDisabled || undefined"
        :data-ancestor-selected="selectedAncestors.has(item.value ?? item.label) || undefined"
        :class="$style.item"
      >
        <slot
          :name="(item.slot || 'item') as keyof TreeSlots"
          :item="item"
          :index="index"
          :level="level"
          :expanded="isExpanded"
          :selected="isSelected"
          :disabled="isDisabled"
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
            :disabled="isDisabled"
            :handle-select="handleSelect"
            :handle-toggle="handleToggle"
          >
            <Icon v-if="item.icon" :name="item.icon" data-slot="item-leading-icon" :class="$style.itemLeadingIcon" />
          </slot>

          <span data-slot="item-label" :class="$style.itemLabel">
            <slot
              name="item-label"
              :item="item"
              :index="index"
              :level="level"
              :expanded="isExpanded"
              :selected="isSelected"
              :disabled="isDisabled"
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
            :disabled="isDisabled"
            tabindex="-1"
            data-slot="item-chevron"
            :class="[$style.itemChevron, { [$style.expanded]: isExpanded }]"
            @click.stop="handleToggle()"
          />

          <slot
            name="item-trailing"
            :item="item"
            :index="index"
            :level="level"
            :expanded="isExpanded"
            :selected="isSelected"
            :disabled="isDisabled"
            :handle-select="handleSelect"
            :handle-toggle="handleToggle"
          />
        </slot>
      </div>

      <ul v-if="isExpanded && item.children?.length" data-slot="list" :class="$style.list">
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
    :class="[$style.root, $style[`size-${size}`], { [$style.scroll]: scroll }]"
  >
    <ReuseTreeTemplate :items="items ?? []" :level="1" />
  </Tree.Root>
</template>

<style module>
.item {
  cursor: pointer;

  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  border-radius: var(--radius-md);

  color: var(--text-color-default);

  .size-sm & {
    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md & {
    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg & {
    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }

  &:focus-visible {
    outline: 2px solid var(--border-color-inverted);
  }

  &[aria-disabled="true"] {
    cursor: not-allowed;
    opacity: 75%;
  }

  &[aria-selected="true"] {
    background-color: var(--background-color-elevated);
  }

  &[data-ancestor-selected] {
    background-color: var(--background-color-elevated);
  }

  &:not([aria-disabled="true"]):hover {
    background-color: var(--background-color-elevated);
  }
}

.item-leading-icon {
  flex-shrink: 0;
  color: var(--text-color-muted);

  .size-sm & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}

.item-label {
  overflow: hidden;
  flex: 1;

  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-chevron[data-slot="item-chevron"] {
  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: 200ms;
  transition-property: transform, translate, scale, rotate;

  &.expanded {
    rotate: 180deg;
  }

  .size-sm & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .size-md & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}

.list {
  position: relative;
  margin-top: calc(var(--spacing) * 0.5);
  padding-inline-start: var(--tree-indent);
  list-style-type: none;

  &::before {
    pointer-events: none;
    content: "";

    position: absolute;
    inset-block: 0;
    left: calc(var(--tree-indent) * 0.75);

    width: 1px;

    background-color: var(--border-color-default);
  }

  & > :not(:last-child) {
    margin-block-end: calc(var(--spacing) * 0.5);
  }
}

.root {
  user-select: none;
  width: 100%;
  list-style-type: none;

  &.size-sm {
    --tree-indent: 1rem;
  }

  &.size-md {
    --tree-indent: 1.25rem;
  }

  &.size-lg {
    --tree-indent: 1.5rem;
  }

  &.scroll {
    overflow-y: auto;
  }

  & > :not(:last-child) {
    margin-block-end: calc(var(--spacing) * 0.5);
  }
}
</style>
