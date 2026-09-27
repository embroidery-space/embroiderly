<script setup lang="ts">
import { computed, provide } from "vue";

import { formFieldGroupInjectionKey } from "../../composables/useFormFieldGroup.ts";

export interface FormFieldGroupProps {
  /**
   * The size of the grouped children.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

export interface FormFieldGroupSlots {
  default(): any;
}

const props = withDefaults(defineProps<FormFieldGroupProps>(), {
  size: "md",
});
defineSlots<FormFieldGroupSlots>();

provide(
  formFieldGroupInjectionKey,
  computed(() => ({ size: props.size })),
);
</script>

<template>
  <div data-slot="base" :class="$style.base">
    <slot />
  </div>
</template>

<style module>
.base {
  position: relative;
  display: inline-flex;
}

:where(.base > :not(:last-child)) {
  margin-inline-end: -1px;
}
</style>
