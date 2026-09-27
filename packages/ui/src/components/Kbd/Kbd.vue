<script setup lang="ts">
export interface KbdProps {
  /** The value to display. */
  value?: string;

  /**
   * The size of the kbd.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
}

withDefaults(defineProps<KbdProps>(), {
  size: "md",
});
</script>

<template>
  <kbd data-slot="base" :class="[$style.base, $style[`size-${size}`]]">
    {{ value }}
  </kbd>
</template>

<style module>
.base {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding-inline: calc(var(--spacing) * 1);
  border-radius: var(--radius-sm);

  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  color: var(--text-color-default);

  background-color: var(--background-color-default);
  box-shadow: inset 0 0 0 1px var(--border-color-accented);

  &.size-sm {
    min-width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
    font-size: 0.625rem; /* 10px */
  }

  &.size-md {
    min-width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
    font-size: 0.6875rem; /* 11px */
  }

  &.size-lg {
    min-width: calc(var(--spacing) * 6);
    height: calc(var(--spacing) * 6);
    font-size: 0.75rem; /* 12px */
  }
}
</style>
