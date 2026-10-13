<script setup lang="ts">
export interface FormFieldGroupSlots {
  default(): any;
}

defineSlots<FormFieldGroupSlots>();
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

  > :not(:last-child) {
    margin-inline-end: -1px;
  }

  > :focus-visible,
  > :has(*:focus-visible) {
    z-index: 1;
  }

  /* First child */
  > :not(:only-child):first-child,
  > :not(:only-child):first-child [data-slot="base"] {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  /* Intermediate children */
  > :not(:last-child, :first-child),
  /* stylelint-disable-next-line no-descending-specificity */
  > :not(:last-child, :first-child) [data-slot="base"] {
    border-radius: 0;
  }

  /* Last child */
  > :not(:only-child):last-child,
  > :not(:only-child):last-child [data-slot="base"] {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
}
</style>
