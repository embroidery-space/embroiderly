<script setup lang="ts">
import { Collapsible } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import Button from "../Button/Button.vue";

import { FormFieldSetTheme } from "./FormFieldSet.theme.ts";
import type { FormFieldSetThemeSlots, FormFieldSetThemeVariants } from "./FormFieldSet.theme.ts";

export interface FormFieldSetProps {
  /** The legend text for the fieldset. */
  legend: string;

  /**
   * The size of the fieldset legend.
   * @default "md"
   */
  size?: FormFieldSetThemeVariants["size"];

  /** When true, the fieldset content can be collapsed by clicking the legend.*/
  collapsible?: boolean;

  class?: any;
  ui?: FormFieldSetThemeSlots;
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

const ui = computed(() => {
  return FormFieldSetTheme({
    size: props.size,
  });
});
</script>

<template>
  <fieldset v-if="!collapsible" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <legend data-slot="legend" :class="ui.legend({ class: props.ui?.legend })">{{ legend }}</legend>
    <slot />
  </fieldset>

  <Collapsible.Root
    v-else
    v-model:open="open"
    as="fieldset"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <legend data-slot="legend" :class="ui.legend({ class: props.ui?.legend })">
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

    <Collapsible.Content data-slot="content" :class="ui.content({ class: props.ui?.content })">
      <slot />
    </Collapsible.Content>
  </Collapsible.Root>
</template>
