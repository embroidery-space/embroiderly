<script setup lang="ts" generic="T extends SelectItem">
import { Select } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";

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
  /** The items to display in the select. */
  items?: T[] | T[][];

  /** The placeholder text when no value is selected. */
  placeholder?: string;

  /**
   * The style variant of the select.
   * @default "subtle"
   */
  variant?: "subtle" | "outline";

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
  variant: "subtle",
  portal: true,
});

const { icons } = useComponentIcons();
const locale = useLocale();

const portalProps = usePortal(toRef(() => props.portal));

const normalizedGroups = computed<SelectItemObject[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) {
    return (props.items as SelectItem[][]).map((group) => group.map((item) => normalizeItem(item)));
  }
  return [(props.items as SelectItem[]).map((item) => normalizeItem(item))];
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
  <Select.Root v-model="modelValue" :default-open="defaultOpen" :disabled="disabled">
    <Select.Trigger
      v-bind="$attrs"
      :disabled="disabled"
      data-slot="base"
      :class="[$style.base, $style[`variant-${variant}`], disabled && $style.disabled]"
    >
      <Select.Value
        :data-slot="displayValue ? 'value' : 'placeholder'"
        :class="displayValue ? $style.value : $style.placeholder"
      >
        {{ displayValue ?? placeholder }}
      </Select.Value>

      <Select.Icon as-child>
        <Icon
          v-if="loading"
          :name="icons.loading"
          data-slot="trailing-icon"
          :class="[$style.trailingIcon, $style.loading]"
        />
        <Icon v-else :name="icons.chevronDown" data-slot="trailing-icon" :class="$style.trailingIcon" />
      </Select.Icon>
    </Select.Trigger>

    <Select.Portal v-bind="portalProps">
      <Select.Content
        position="popper"
        :side-offset="4"
        :collision-padding="4"
        data-slot="content"
        :class="$style.content"
      >
        <Select.Viewport data-slot="viewport" :class="$style.viewport">
          <template v-if="normalizedGroups.length">
            <Select.Group
              v-for="(group, groupIndex) in normalizedGroups"
              :key="`group-${groupIndex}`"
              data-slot="group"
            >
              <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
                <Select.Separator
                  v-if="item.type === 'separator'"
                  data-slot="separator"
                  :class="[$style.separator, item.class]"
                />

                <Select.Label v-else-if="item.type === 'label'" data-slot="label" :class="[$style.label, item.class]">
                  {{ item.label }}
                </Select.Label>

                <Select.Item
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
                  <Select.ItemText data-slot="item-label" :class="$style.itemLabel">
                    {{ item.label }}
                  </Select.ItemText>
                  <Select.ItemIndicator as-child>
                    <Icon :name="icons.check" data-slot="item-indicator" :class="$style.itemIndicator" />
                  </Select.ItemIndicator>
                </Select.Item>
              </template>
            </Select.Group>
          </template>
          <p v-else data-slot="empty" :class="$style.empty">
            {{ locale.messages.select.empty }}
          </p>
        </Select.Viewport>
      </Select.Content>
    </Select.Portal>
  </Select.Root>
</template>

<style module>
.base {
  position: relative;

  display: inline-flex;

  gap: calc(var(--spacing) * 1.5);
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding-block: calc(var(--spacing) * 1.5);
  padding-inline: calc(var(--spacing) * 2.5);
  border-width: 0;
  border-radius: var(--radius-md);

  font-size: var(--text-sm);
  text-align: start;

  appearance: none;

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--color-primary);
  }

  &:disabled {
    cursor: not-allowed;

    opacity: 75%;
  }

  &.variant-subtle {
    background-color: var(--background-color-elevated);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  &.variant-outline {
    background-color: var(--background-color-default);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  &.disabled {
    cursor: not-allowed;

    opacity: 75%;
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

  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);

  color: var(--text-color-muted);

  &.loading {
    animation: var(--animate-spin);
  }
}

.content {
  pointer-events: auto;

  transform-origin: var(--reka-select-content-transform-origin);

  overflow: hidden;
  display: flex;
  flex-direction: column;

  min-width: var(--reka-select-trigger-width);
  max-height: var(--reka-select-content-available-height);
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
}

.viewport {
  padding: calc(var(--spacing) * 1);

  & > :not(:last-child) {
    border-bottom: 1px solid var(--border-color-default);
  }
}

.empty {
  padding-block: calc(var(--spacing) * 1.5);

  font-size: var(--text-sm);
  color: var(--text-color-muted);
  text-align: center;
}

.separator {
  height: 1px;
  margin-block: calc(var(--spacing) * 1);
  margin-inline: calc(var(--spacing) * -1);

  background-color: var(--border-color-default);
}

.label {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  width: 100%;
  padding: calc(var(--spacing) * 1.5);

  font-size: var(--text-sm);

  font-weight: 600;
}

.item {
  cursor: pointer;
  user-select: none;

  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  padding: calc(var(--spacing) * 1.5);

  border-radius: var(--radius-sm);

  font-size: var(--text-sm);

  color: var(--text-color-default);

  outline-style: none;

  &:hover {
    background-color: var(--background-color-elevated);
  }

  &[data-highlighted] {
    background-color: var(--background-color-elevated);
  }
}

.item-leading-icon {
  flex-shrink: 0;

  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);

  color: var(--text-color-dimmed);
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
}
</style>
