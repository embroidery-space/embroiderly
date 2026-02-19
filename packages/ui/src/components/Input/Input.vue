<script setup lang="ts">
import { Primitive } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";
import { computed, useSlots } from "vue";

import { useFormField } from "../../composables/useFormField.ts";
import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";

import { InputTheme } from "./Input.theme.ts";
import type { InputThemeSlots, InputThemeVariants } from "./Input.theme.ts";

export interface InputProps extends PrimitiveProps {
  id?: string;

  /**
   * The color scheme of the input.
   * @default "primary"
   */
  color?: InputThemeVariants["color"];
  /**
   * The style variant of the input.
   * @default "subtle"
   */
  variant?: InputThemeVariants["variant"];
  /**
   * The size of the input.
   * @default "lg"
   */
  size?: InputThemeVariants["size"];

  /** Whether the input is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: InputThemeSlots;
}

export interface InputSlots {
  leading(): any;
  trailing(): any;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();
const props = withDefaults(defineProps<InputProps>(), {
  as: "div",

  color: "primary",
  variant: "subtle",
});
const slots = useSlots();

const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
const size = computed(() => props.size ?? fieldGroupSize.value ?? formFieldSize.value);

const ui = computed(() => {
  return InputTheme({
    color: props.color,
    variant: props.variant,
    size: size.value,

    leading: !!slots.leading,
    trailing: !!slots.trailing,

    fieldGroup: fieldGroup.value,
  });
});
</script>

<template>
  <Primitive :as="as" :as-child="asChild" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <span v-if="!!slots.leading" data-slot="leading" :class="ui.leading({ class: props.ui?.leading })">
      <slot name="leading" />
    </span>

    <input
      :id="id"
      v-model="modelValue"
      v-bind="{ ...$attrs, ...ariaAttrs }"
      type="text"
      :disabled="disabled"
      data-slot="base"
      :class="ui.base({ class: props.ui?.base })"
    />

    <span v-if="!!slots.trailing" data-slot="trailing" :class="ui.trailing({ class: props.ui?.trailing })">
      <slot name="trailing" />
    </span>
  </Primitive>
</template>
