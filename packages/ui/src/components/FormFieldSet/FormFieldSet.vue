<script setup lang="ts">
import { Collapsible } from "reka-ui/namespaced";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import Button from "../Button/Button.vue";

export interface FormFieldSetProps {
  /** The legend text for the fieldset. */
  legend: string;

  /**
   * The size of the fieldset legend.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /** When true, the fieldset content can be collapsed by clicking the legend.*/
  collapsible?: boolean;
}

export interface FormFieldSetSlots {
  default(): any;
}

const open = defineModel<boolean>("open", { default: true });
const props = withDefaults(defineProps<FormFieldSetProps>(), {
  size: "md",
});
defineSlots<FormFieldSetSlots>();

const { icons } = useComponentIcons();
</script>

<template>
  <fieldset v-if="!collapsible" data-slot="root" :class="[$style.root, $style[`size-${size}`]]">
    <legend data-slot="legend" :class="$style.legend">{{ legend }}</legend>
    <slot />
  </fieldset>

  <Collapsible.Root
    v-else
    v-model:open="open"
    as="fieldset"
    data-slot="root"
    :class="[$style.root, $style[`size-${size}`]]"
  >
    <legend data-slot="legend" :class="$style.legend">
      <Collapsible.Trigger as-child>
        <Button
          :label="legend"
          :leading-icon="open ? icons.minus : icons.plus"
          color="neutral"
          variant="ghost"
          :size="props.size"
        />
      </Collapsible.Trigger>
    </legend>

    <Collapsible.Content data-slot="content" :class="$style.content">
      <slot />
    </Collapsible.Content>
  </Collapsible.Root>
</template>

<style module>
.root {
  margin-top: calc(var(--spacing) * 2);
  padding-top: calc(var(--spacing) * 2);
  padding-bottom: calc(var(--spacing) * 4);
  padding-inline: calc(var(--spacing) * 4);
  border: 1px solid var(--border-color-default);
  border-radius: var(--radius-md);
}

.legend {
  font-weight: var(--font-weight-medium);
  color: var(--text-color-default);

  .size-sm > & {
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md > & {
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg > & {
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }
}

.content {
  overflow: hidden;

  &[data-state="closed"] {
    animation: global(collapsible-up) 200ms ease-out;
  }

  &[data-state="open"] {
    animation: global(collapsible-down) 200ms ease-out;
  }
}
</style>
