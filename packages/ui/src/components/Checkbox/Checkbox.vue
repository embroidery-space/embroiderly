<script setup lang="ts">
import { Checkbox, Label } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useFormField } from "../../composables/useFormField.ts";
import type { IconValue } from "../../types/icons.ts";
import Icon from "../Icon/Icon.vue";

import { CheckboxTheme } from "./Checkbox.theme";
import type { CheckboxThemeSlots, CheckboxThemeVariants } from "./Checkbox.theme";

export interface CheckboxProps {
  id?: string;

  /** The label of the checkbox. */
  label?: string;
  /** The description of the checkbox. */
  description?: string;

  /**
   * The color of the checkbox.
   * @default "primary"
   */
  color?: CheckboxThemeVariants["color"];
  /**
   * The size of the checkbox.
   * @default "md"
   */
  size?: CheckboxThemeVariants["size"];

  /**
   * The icon displayed when checked.
   * @default "icons.check"
   */
  icon?: IconValue;

  /** Whether the checkbox is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: CheckboxThemeSlots;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<boolean>();
const props = withDefaults(defineProps<CheckboxProps>(), {
  color: "primary",
  size: "md",
});

const { icons } = useComponentIcons();

const { id, size, ariaAttrs } = useFormField(props);

const ui = computed(() => {
  return CheckboxTheme({
    color: props.color,
    size: size.value,

    disabled: props.disabled,
  });
});
</script>

<template>
  <div data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div data-slot="container" :class="ui.container({ class: props.ui?.container })">
      <Checkbox.Root
        :id="id"
        v-model="modelValue"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :disabled="disabled"
        data-slot="base"
        :class="ui.base({ class: props.ui?.base })"
      >
        <Checkbox.Indicator data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })">
          <Icon :name="icon ?? icons.check" data-slot="icon" :class="ui.icon({ class: props.ui?.icon })" />
        </Checkbox.Indicator>
      </Checkbox.Root>
    </div>

    <div v-if="label || description" data-slot="wrapper" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label" :for="id" data-slot="label" :class="ui.label({ class: props.ui?.label })">{{ label }}</Label>
      <p v-if="description" data-slot="description" :class="ui.description({ class: props.ui?.description })">
        {{ description }}
      </p>
    </div>
  </div>
</template>
