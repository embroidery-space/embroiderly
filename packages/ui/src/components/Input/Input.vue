<script setup lang="ts">
import { injectFieldRootContext } from "reka-ui";
import { Field } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import type { UseComponentIconsProps } from "../../composables/useComponentIcons.ts";
import Icon from "../Icon/Icon.vue";

export interface InputProps extends UseComponentIconsProps {
  /** Whether the input is disabled. */
  disabled?: boolean;
}

export interface InputSlots {
  leading(): any;
  trailing(): any;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();
const props = defineProps<InputProps>();
const slots = defineSlots<InputSlots>();
const fieldContext = injectFieldRootContext(null);

const { isLeading, isTrailing, leadingIconName, trailingIconName } = useComponentIcons(
  computed(() => ({ ...props, loading: props.loading })),
);

const hasLeading = computed(() => isLeading.value || !!slots.leading);
const hasTrailing = computed(() => isTrailing.value || !!slots.trailing);

const isLeadingSpinning = computed(() => props.loading && hasLeading.value);
const isTrailingSpinning = computed(() => props.loading && !hasLeading.value && hasTrailing.value);
</script>

<template>
  <div data-slot="root" :class="[$style.root, hasLeading && $style.hasLeading, hasTrailing && $style.hasTrailing]">
    <span v-if="hasLeading" data-slot="leading" :class="$style.leading">
      <slot name="leading">
        <Icon
          v-if="isLeading && leadingIconName"
          aria-hidden="true"
          :name="leadingIconName"
          data-slot="leading-icon"
          :class="[$style.leadingIcon, { [$style.loading]: isLeadingSpinning }]"
        />
      </slot>
    </span>

    <Field.Control
      v-if="fieldContext"
      v-model="modelValue"
      v-bind="$attrs"
      as="input"
      type="text"
      :disabled="disabled"
      data-slot="base"
      :class="$style.base"
    />
    <input
      v-else
      v-model="modelValue"
      v-bind="$attrs"
      type="text"
      :disabled="disabled"
      data-slot="base"
      :class="$style.base"
    />

    <span v-if="hasTrailing" data-slot="trailing" :class="$style.trailing">
      <slot name="trailing">
        <Icon
          v-if="isTrailing && trailingIconName"
          aria-hidden="true"
          :name="trailingIconName"
          data-slot="trailing-icon"
          :class="[$style.trailingIcon, { [$style.loading]: isTrailingSpinning }]"
        />
      </slot>
    </span>
  </div>
</template>

<style module>
.root {
  position: relative;

  display: inline-flex;
  align-items: center;
}

.leading {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;

  display: flex;
  align-items: center;

  padding-inline-start: calc(var(--spacing) * 2.5);
}

.leading-icon {
  flex-shrink: 0;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);

  color: var(--text-color-dimmed);

  &.loading {
    animation: var(--animate-spin);
  }
}

.base {
  gap: calc(var(--spacing) * 1.5);

  width: 100%;

  padding-block: calc(var(--spacing) * 1.5);
  padding-inline: calc(var(--spacing) * 2.5);

  border-width: 0;
  border-radius: var(--radius-md);

  font-size: var(--text-sm);

  appearance: none;

  background-color: var(--background-color-elevated);
  box-shadow: inset 0 0 0 1px var(--border-color-accented);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--color-primary);
  }

  &:disabled {
    cursor: not-allowed;

    opacity: 75%;
  }

  .has-leading > & {
    padding-inline-start: calc(var(--spacing) * 9);
  }

  .has-trailing > & {
    padding-inline-end: calc(var(--spacing) * 9);
  }
}

.trailing {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;

  display: flex;
  align-items: center;

  padding-inline-end: calc(var(--spacing) * 2.5);
}

.trailing-icon {
  flex-shrink: 0;

  width: calc(var(--spacing) * 4);
  height: calc(var(--spacing) * 4);

  color: var(--text-color-dimmed);

  &.loading {
    animation: var(--animate-spin);
  }
}
</style>
