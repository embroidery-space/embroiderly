<script setup lang="ts" generic="T extends RadioGroupItem">
import type { AcceptableValue } from "reka-ui";
import { Field, RadioGroup } from "reka-ui/namespaced";
import { computed } from "vue";

export type RadioGroupValue = AcceptableValue;

export type RadioGroupItem =
  | RadioGroupValue
  | {
      value?: RadioGroupValue;
      label?: string;
      description?: string;
    };

export interface RadioGroupProps<T extends RadioGroupItem = RadioGroupItem> {
  /** The items to display in the radio group. */
  items?: T[];

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
  orientation: "vertical",
});

const items = computed(() => {
  if (!props.items) return [];
  return (props.items as RadioGroupItem[]).map((item) => {
    if (item === null) {
      return {
        value: undefined,
        label: undefined,
      };
    }

    if (typeof item === "string" || typeof item === "number" || typeof item === "bigint") {
      return {
        value: String(item),
        label: String(item),
      };
    }

    return {
      value: item.value,
      label: item.label,
      description: item.description,
    };
  });
});
</script>

<template>
  <RadioGroup.Root
    v-model="modelValue"
    v-bind="$attrs"
    :disabled="disabled"
    :orientation="orientation"
    data-slot="root"
    :class="[$style.root, $style[`orientation-${orientation}`], { [$style.disabled]: disabled }]"
  >
    <Field.Root v-for="(item, index) in items" :key="index" data-slot="item" :class="$style.item">
      <div data-slot="container" :class="$style.container">
        <RadioGroup.Item :value="item.value" data-slot="base" :class="$style.base">
          <RadioGroup.Indicator data-slot="indicator" :class="$style.indicator" />
        </RadioGroup.Item>
      </div>

      <div v-if="item.label || item.description" data-slot="wrapper" :class="$style.wrapper">
        <Field.Label v-if="item.label" data-slot="label" :class="$style.label">{{ item.label }}</Field.Label>
        <Field.Description v-if="item.description" data-slot="description" :class="$style.description">
          {{ item.description }}
        </Field.Description>
      </div>
    </Field.Root>
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

  font-size: var(--text-sm);

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

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);

  border-radius: calc(infinity * 1px);

  box-shadow: inset 0 0 0 1px var(--border-color-accented);

  .disabled & {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
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

  background-color: var(--color-primary);

  &::after {
    content: "";

    width: calc(var(--spacing) * 1.5);
    height: calc(var(--spacing) * 1.5);

    border-radius: calc(infinity * 1px);

    background-color: var(--background-color-default);
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
