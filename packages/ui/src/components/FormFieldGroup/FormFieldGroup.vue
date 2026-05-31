<script setup lang="ts">
import { computed, provide } from "vue";

import { formFieldGroupInjectionKey } from "../../composables/useFormFieldGroup.ts";

import { FormFieldGroupTheme } from "./FormFieldGroup.theme.ts";
import type { FormFieldGroupThemeVariants } from "./FormFieldGroup.theme.ts";

export interface FormFieldGroupProps {
  /**
   * The size of the grouped children.
   * @default "md"
   */
  size?: FormFieldGroupThemeVariants["size"];

  class?: any;
  ui?: { base?: string };
}

export interface FormFieldGroupSlots {
  default(): any;
}

const props = withDefaults(defineProps<FormFieldGroupProps>(), {
  as: "div",

  size: "md",
});
defineSlots<FormFieldGroupSlots>();

provide(
  formFieldGroupInjectionKey,
  computed(() => ({ size: props.size })),
);

const theme = computed(() => {
  return FormFieldGroupTheme({
    size: props.size,
    class: [props.ui?.base, props.class],
  });
});
</script>

<template>
  <div :class="theme">
    <slot />
  </div>
</template>
