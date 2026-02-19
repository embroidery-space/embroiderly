<script setup lang="ts">
import { Primitive } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";
import { computed } from "vue";

import { FormFieldSetTheme } from "./FormFieldSet.theme.ts";
import type { FormFieldSetThemeSlots, FormFieldSetThemeVariants } from "./FormFieldSet.theme.ts";

export interface FormFieldSetProps extends PrimitiveProps {
  /** The legend text for the fieldset. */
  legend: string;

  /**
   * The size of the fieldset legend.
   * @default "lg"
   */
  size?: FormFieldSetThemeVariants["size"];

  class?: any;
  ui?: FormFieldSetThemeSlots;
}

const props = withDefaults(defineProps<FormFieldSetProps>(), {
  as: "fieldset",
  size: "lg",
});

const ui = computed(() => {
  return FormFieldSetTheme({
    size: props.size,
  });
});
</script>

<template>
  <Primitive :as="as" :as-child="asChild" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <legend data-slot="legend" :class="ui.legend({ class: props.ui?.legend })">{{ legend }}</legend>
    <slot />
  </Primitive>
</template>
