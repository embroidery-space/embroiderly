<script setup lang="ts">
import type { AcceptableValue, RadioGroupRootProps } from "reka-ui";
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

export interface RadioGroupProps extends Pick<RadioGroupRootProps, "as" | "asChild" | "disabled"> {
  id?: string;

  /** The items to display in the radio group. */
  items?: RadioGroupItem[];

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

  class?: any;
  ui?: RadioGroupThemeSlots;
}

const modelValue = defineModel<RadioGroupValue>();
const props = withDefaults(defineProps<RadioGroupProps>(), {
  color: "primary",
  size: "lg",
});

const { id, size, ariaAttrs } = useFormField(props);

const items = computed(() => {
  if (!props.items) return [];
  return props.items.map((item) => {
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

    return { ...item, id: `${id.value}:${item.value}` };
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
    :as="as"
    :as-child="asChild"
    :disabled="disabled"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <div v-for="item in items" :key="item.id" :class="ui.item({ class: props.ui?.item })">
      <div :class="ui.container({ class: props.ui?.container })">
        <RadioGroup.Item :id="item.id" :value="item.value" :class="ui.base({ class: props.ui?.base })">
          <RadioGroup.Indicator :class="ui.indicator({ class: props.ui?.indicator })" />
        </RadioGroup.Item>
      </div>

      <div v-if="item.label || item.description" :class="ui.wrapper({ class: props.ui?.wrapper })">
        <Label v-if="item.label" :for="item.id" :class="ui.label({ class: props.ui?.label })">{{ item.label }}</Label>
        <p v-if="item.description" :class="ui.description({ class: props.ui?.description })">{{ item.description }}</p>
      </div>
    </div>
  </RadioGroup.Root>
</template>
