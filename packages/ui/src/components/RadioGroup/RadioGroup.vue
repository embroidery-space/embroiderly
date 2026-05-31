<script setup lang="ts" generic="T extends RadioGroupItem">
import type { AcceptableValue } from "reka-ui";
import { RadioGroup, Label } from "reka-ui/namespaced";
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";

import { RadioGroupTheme } from "./RagioGroup.theme.ts";
import type { RadioGroupThemeSlots, RadioGroupThemeVariants } from "./RagioGroup.theme.ts";

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
  color?: RadioGroupThemeVariants["color"];
  /**
   * The size of the radio buttons.
   * @default "lg"
   */
  size?: RadioGroupThemeVariants["size"];

  /** Whether the radio group is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: RadioGroupThemeSlots;
}

const modelValue = defineModel<RadioGroupValue>();
const props = withDefaults(defineProps<RadioGroupProps<T>>(), {
  color: "primary",
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

const ui = computed(() => {
  return RadioGroupTheme({
    color: props.color,
    size: size.value,

    disabled: props.disabled,
  });
});
</script>

<template>
  <RadioGroup.Root
    :id="id"
    v-model="modelValue"
    v-bind="ariaAttrs"
    :disabled="disabled"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <div v-for="item in items" :key="item.id" data-slot="item" :class="ui.item({ class: props.ui?.item })">
      <div data-slot="container" :class="ui.container({ class: props.ui?.container })">
        <RadioGroup.Item :id="item.id" :value="item.value" data-slot="base" :class="ui.base({ class: props.ui?.base })">
          <RadioGroup.Indicator data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" />
        </RadioGroup.Item>
      </div>

      <div v-if="item.label || item.description" data-slot="wrapper" :class="ui.wrapper({ class: props.ui?.wrapper })">
        <Label v-if="item.label" :for="item.id" data-slot="label" :class="ui.label({ class: props.ui?.label })">{{
          item.label
        }}</Label>
        <p v-if="item.description" data-slot="description" :class="ui.description({ class: props.ui?.description })">
          {{ item.description }}
        </p>
      </div>
    </div>
  </RadioGroup.Root>
</template>
