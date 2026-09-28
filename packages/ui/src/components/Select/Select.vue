<script setup lang="ts" generic="T extends SelectItem">
import defu from "defu";
import { useFilter } from "reka-ui";
import { Combobox } from "reka-ui/namespaced";
import { computed, ref, toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";
import Input from "../Input/Input.vue";
import type { InputProps } from "../Input/Input.vue";

export interface SelectItemObject {
  /** The type of the item. */
  type?: "separator" | "label";

  /** The label to display. */
  label?: string;
  /** The value of the item. Not used for `separator` and `label` types. */
  value?: string | number;

  /** An icon to display before the label. */
  icon?: IconValue;

  /** Whether the item is disabled. */
  disabled?: boolean;

  /** Additional CSS class(es) for the item. */
  class?: any;
}

export type SelectItem = string | number | SelectItemObject;

export interface SelectProps<T extends SelectItem = SelectItem> {
  id?: string;

  /** The items to display in the select. */
  items?: T[] | T[][];

  /** The placeholder text when no value is selected. */
  placeholder?: string;

  /**
   * Whether to show a search input in the dropdown.
   * Pass an object with `placeholder` to customize the search input placeholder.
   * @default false
   */
  searchInput?: boolean | InputProps;

  /**
   * The color scheme of the select.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The style variant of the select.
   * @default "subtle"
   */
  variant?: "subtle" | "outline";
  /**
   * The size of the select.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** Whether the select is in a loading state. */
  loading?: boolean;
  /** Whether the select is disabled. */
  disabled?: boolean;

  /**
   * The open state of the select when it is initially rendered.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Render the dropdown in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string | number | undefined>();
const props = withDefaults(defineProps<SelectProps<T>>(), {
  color: "primary",
  variant: "subtle",
  size: "md",

  portal: true,
});

const { icons } = useComponentIcons();
const { contains } = useFilter({ sensitivity: "base" });
const locale = useLocale();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const { id, label, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? fieldGroupSize.value ?? formFieldSize.value);
const portalProps = usePortal(toRef(() => props.portal));
const searchInputProps = toRef(
  () => defu(props.searchInput, { placeholder: locale.value.messages.select.search }) as InputProps,
);

const open = ref(props.defaultOpen ?? false);
const searchValue = ref("");

const normalizedGroups = computed<SelectItemObject[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) {
    return (props.items as SelectItem[][]).map((group) => group.map((item) => normalizeItem(item)));
  }
  return [(props.items as SelectItem[]).map((item) => normalizeItem(item))];
});

const filteredGroups = computed<SelectItemObject[][]>(() => {
  if (!props.searchInput || !searchValue.value) return normalizedGroups.value;
  return normalizedGroups.value
    .map((group) =>
      group.filter((item) => {
        if (item.type === "separator" || item.type === "label") return false;
        return contains(item.label ?? "", searchValue.value);
      }),
    )
    .filter((group) => group.length > 0);
});

const displayValue = computed(() => {
  if (modelValue.value === null) return undefined;
  const found = normalizedGroups.value.flat().find((item) => !item.type && item.value === modelValue.value);
  return found?.label;
});

function normalizeItem(item: SelectItem): SelectItemObject {
  if (typeof item === "string" || typeof item === "number") {
    return { label: String(item), value: item };
  }
  return item;
}
</script>

<template>
  <Combobox.Root
    v-model="modelValue"
    :open="open"
    :disabled="disabled"
    :ignore-filter="!searchInput"
    :reset-search-term-on-blur="false"
    data-slot="root"
    :class="[
      $style.root,
      $style[`color-${color}`],
      $style[`variant-${variant}`],
      $style[`size-${size}`],
      disabled && $style.disabled,
      fieldGroup && $style.fieldGroup,
    ]"
    @update:open="
      (value) => {
        open = value;
        if (!value) searchValue = '';
      }
    "
  >
    <Combobox.Anchor as-child>
      <Combobox.Trigger
        :id="id"
        :aria-label="label"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :disabled="disabled"
        data-slot="base"
        :class="$style.base"
      >
        <span v-if="displayValue" data-slot="value" :class="$style.value">
          {{ displayValue }}
        </span>
        <span v-else data-slot="placeholder" :class="$style.placeholder">
          {{ placeholder }}
        </span>

        <Icon
          v-if="loading"
          :name="icons.loading"
          data-slot="trailing-icon"
          :class="[$style.trailingIcon, $style.loading]"
        />
        <Icon v-else :name="icons.chevronDown" data-slot="trailing-icon" :class="$style.trailingIcon" />
      </Combobox.Trigger>
    </Combobox.Anchor>

    <Combobox.Portal v-bind="portalProps">
      <Combobox.Content
        position="popper"
        :side-offset="4"
        :collision-padding="4"
        data-slot="content"
        :class="[$style.content, $style[`size-${size}`]]"
      >
        <Combobox.Input v-if="!!searchInput" v-model="searchValue" as-child>
          <Input v-bind="searchInputProps" autofocus autocomplete="off" :size="size" data-slot="input" />
        </Combobox.Input>

        <Combobox.Viewport data-slot="viewport" :class="$style.viewport">
          <Combobox.Empty data-slot="empty" :class="$style.empty">
            {{ searchValue ? locale.messages.select.noMatches : locale.messages.select.noData }}
          </Combobox.Empty>

          <Combobox.Group v-for="(group, groupIndex) in filteredGroups" :key="`group-${groupIndex}`" data-slot="group">
            <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
              <Combobox.Separator
                v-if="item.type === 'separator'"
                data-slot="separator"
                :class="[$style.separator, item.class]"
              />

              <Combobox.Label v-else-if="item.type === 'label'" data-slot="label" :class="[$style.label, item.class]">
                {{ item.label }}
              </Combobox.Label>

              <Combobox.Item
                v-else
                :value="item.value!"
                :disabled="item.disabled"
                data-slot="item"
                :class="[$style.item, item.class]"
              >
                <Icon
                  v-if="item.icon"
                  :name="item.icon"
                  data-slot="item-leading-icon"
                  :class="$style.itemLeadingIcon"
                />
                <span data-slot="item-label" :class="$style.itemLabel">
                  {{ item.label }}
                </span>
                <Combobox.ItemIndicator>
                  <Icon :name="icons.check" data-slot="item-indicator" :class="$style.itemIndicator" />
                </Combobox.ItemIndicator>
              </Combobox.Item>
            </template>
          </Combobox.Group>
        </Combobox.Viewport>
      </Combobox.Content>
    </Combobox.Portal>
  </Combobox.Root>
</template>

<style module>
.root {
  position: relative;
  display: inline-flex;
  align-items: center;

  &.field-group:has(*:focus-visible) {
    z-index: 1;
  }
}

.base {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  border-width: 0;
  border-radius: var(--radius-md);

  text-align: start;

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 75%;
  }

  .variant-subtle > & {
    background-color: var(--background-color-elevated);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  .variant-outline > & {
    background-color: var(--background-color-default);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  .size-sm > & {
    gap: calc(var(--spacing) * 1);

    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);

    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md > & {
    gap: calc(var(--spacing) * 1.5);

    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);

    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg > & {
    gap: calc(var(--spacing) * 2);

    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);

    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }

  .disabled > & {
    cursor: not-allowed;
    opacity: 75%;
  }

  .color-primary.variant-subtle > &,
  .color-primary.variant-outline > & {
    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-primary);
    }
  }

  .field-group:not(:last-child):not(:first-child) > & {
    border-radius: 0;
  }

  .field-group:not(:only-child):first-child > & {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  .field-group:not(:only-child):last-child > & {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
}

.value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.placeholder {
  overflow: hidden;
  color: var(--text-color-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.trailing-icon {
  flex-shrink: 0;
  color: var(--text-color-muted);

  .size-sm > * > & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-md > * > & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }

  .size-lg > * > & {
    width: calc(var(--spacing) * 6);
    height: calc(var(--spacing) * 6);
  }

  &.loading {
    animation: var(--animate-spin);
  }
}

.content {
  pointer-events: auto;

  transform-origin: var(--reka-combobox-content-transform-origin);

  overflow: hidden;
  display: flex;
  flex-direction: column;

  min-width: var(--reka-combobox-trigger-width);
  max-height: var(--reka-combobox-content-available-height);
  border-radius: var(--radius-md);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-lg);

  &:focus {
    outline-style: none;
  }

  &[data-state="closed"] {
    animation: global(scale-out) 100ms ease-in;
  }

  &[data-state="open"] {
    animation: global(scale-in) 100ms ease-out;
  }

  & > [data-slot="root"] {
    width: 100%;
    border-bottom: 1px solid var(--border-color-default);
    background-color: var(--background-color-default);
    outline-style: none;
  }

  &.size-sm > [data-slot="root"] {
    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  &.size-md > [data-slot="root"] {
    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  &.size-lg > [data-slot="root"] {
    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }
}

.viewport {
  padding: calc(var(--spacing) * 1);

  & > :not(:last-child) {
    border-bottom: 1px solid var(--border-color-default);
  }
}

.empty {
  color: var(--text-color-muted);
  text-align: center;

  .content.size-sm & {
    padding-block: calc(var(--spacing) * 1);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .content.size-md & {
    padding-block: calc(var(--spacing) * 1.5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .content.size-lg & {
    padding-block: calc(var(--spacing) * 2);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }
}

.separator {
  height: 1px;
  margin-block: calc(var(--spacing) * 1);
  margin-inline: calc(var(--spacing) * -1);
  background-color: var(--border-color-default);
}

.label {
  display: flex;
  align-items: center;
  width: 100%;
  font-weight: var(--font-weight-semibold);

  .content.size-sm & {
    gap: calc(var(--spacing) * 1);
    padding: calc(var(--spacing) * 1);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .content.size-md & {
    gap: calc(var(--spacing) * 1.5);
    padding: calc(var(--spacing) * 1.5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .content.size-lg & {
    gap: calc(var(--spacing) * 2);
    padding: calc(var(--spacing) * 2);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }
}

.item {
  cursor: pointer;
  user-select: none;

  display: flex;
  align-items: center;

  border-radius: var(--radius-sm);

  color: var(--text-color-default);

  outline-style: none;

  &:hover {
    background-color: var(--background-color-elevated);
  }

  &[data-highlighted] {
    background-color: var(--background-color-elevated);
  }

  .content.size-sm & {
    gap: calc(var(--spacing) * 1);
    padding: calc(var(--spacing) * 1);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .content.size-md & {
    gap: calc(var(--spacing) * 1.5);
    padding: calc(var(--spacing) * 1.5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .content.size-lg & {
    gap: calc(var(--spacing) * 2);
    padding: calc(var(--spacing) * 2);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }
}

.item-leading-icon {
  flex-shrink: 0;
  color: var(--text-color-dimmed);

  .content.size-sm & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .content.size-md &,
  .content.size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
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
  margin-inline-start: auto;
  color: var(--color-primary);

  .content.size-sm & {
    width: calc(var(--spacing) * 3);
    height: calc(var(--spacing) * 3);
  }

  .content.size-md & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .content.size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}
</style>
