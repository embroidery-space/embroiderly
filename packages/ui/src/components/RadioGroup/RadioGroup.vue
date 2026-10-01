<script setup lang="ts" generic="T extends RadioGroupItem">
import type { AcceptableValue } from "reka-ui";
import { RadioGroup, Label } from "reka-ui/namespaced";
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";

export type RadioGroupValue = AcceptableValue;

export type RadioGroupItem =
  | RadioGroupValue
  | {
      value?: RadioGroupValue;
      label?: string;
      description?: string;
    };

export interface RadioGroupProps<T extends RadioGroupItem = RadioGroupItem> {
  id?: string;

  /** The items to display in the radio group. */
  items?: T[];

  /**
   * The color of the radio buttons.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The size of the radio buttons.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * The orientation of the radio group.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";

  /** Whether the radio group is disabled. */
  disabled?: boolean;
}

const modelValue = defineModel<RadioGroupValue>();
const props = withDefaults(defineProps<RadioGroupProps<T>>(), {
  color: "primary",
  size: "md",

  orientation: "vertical",
});

const { id, size, ariaAttrs } = useFormField(props);

const items = computed(() => {
  if (!props.items) return [];
  return (props.items as RadioGroupItem[]).map((item) => {
    if (item === null) {
      return {
        id: `${id.value}:null`,
        value: undefined,
        label: undefined,
      };
    }

    if (typeof item === "string" || typeof item === "number" || typeof item === "bigint") {
      return {
        id: `${id.value}:${item}`,
        value: String(item),
        label: String(item),
      };
    }

    return {
      id: `${id.value}:${item.value}`,
      value: item.value,
      label: item.label,
      description: item.description,
    };
  });
});
</script>

<template>
  <RadioGroup.Root
    :id="id"
    v-model="modelValue"
    v-bind="ariaAttrs"
    :disabled="disabled"
    :orientation="orientation"
    data-slot="root"
    :class="[
      $style.root,
      $style[`color-${color}`],
      $style[`size-${size}`],
      $style[`orientation-${orientation}`],
      { [$style.disabled]: disabled },
    ]"
  >
    <div v-for="item in items" :key="item.id" data-slot="item" :class="$style.item">
      <div data-slot="container" :class="$style.container">
        <RadioGroup.Item :id="item.id" :value="item.value" data-slot="base" :class="$style.base">
          <RadioGroup.Indicator data-slot="indicator" :class="$style.indicator" />
        </RadioGroup.Item>
      </div>

      <div v-if="item.label || item.description" data-slot="wrapper" :class="$style.wrapper">
        <Label v-if="item.label" :for="item.id" data-slot="label" :class="$style.label">{{ item.label }}</Label>
        <p v-if="item.description" data-slot="description" :class="$style.description">
          {{ item.description }}
        </p>
      </div>
    </div>
  </RadioGroup.Root>
</template>

<style module>
.root {
  position: relative;

  display: flex;
  align-items: flex-start;

  &.orientation-vertical {
    flex-direction: column;
  }

  &.orientation-horizontal {
    flex-direction: row;
    column-gap: calc(var(--spacing) * 2);
  }
}

.item {
  display: flex;
  align-items: center;

  .size-sm & {
    font-size: var(--text-xs);
  }

  .size-md & {
    font-size: var(--text-sm);
  }

  .size-lg & {
    font-size: var(--text-base);
  }

  .disabled & {
    opacity: 75%;
  }
}

.container {
  display: flex;
  align-items: center;
}

.base {
  overflow: hidden;

  border-radius: calc(infinity * 1px);

  box-shadow: inset 0 0 0 1px var(--border-color-accented);

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

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid;
    outline-offset: 2px;
  }

  .color-primary &:focus-visible {
    outline-color: var(--color-primary);
  }

  &:not(:disabled):hover {
    cursor: pointer;
  }
}

.indicator {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  &::after {
    content: "";

    border-radius: calc(infinity * 1px);

    background-color: var(--background-color-default);
  }

  .color-primary & {
    background-color: var(--color-primary);
  }

  .size-sm &::after {
    width: calc(var(--spacing) * 1);
    height: calc(var(--spacing) * 1);
  }

  .size-md &::after {
    width: calc(var(--spacing) * 1.5);
    height: calc(var(--spacing) * 1.5);
  }

  .size-lg &::after {
    width: calc(var(--spacing) * 2);
    height: calc(var(--spacing) * 2);
  }
}

.wrapper {
  width: 100%;
  margin-inline-start: calc(var(--spacing) * 2);
}

.label {
  display: block;

  font-weight: 500;
  color: var(--text-color-default);

  &:hover {
    cursor: pointer;
  }

  .disabled & {
    cursor: not-allowed;
  }
}

.description {
  color: var(--text-color-muted);

  .disabled & {
    cursor: not-allowed;
  }
}
</style>
