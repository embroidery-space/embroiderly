<script setup lang="ts">
import { Primitive } from "reka-ui";
import type { SwitchRootProps } from "reka-ui";
import { Switch, Label } from "reka-ui/namespaced";
import { computed } from "vue";

import { useFormField } from "../../composables/useFormField.ts";

import { SwitchTheme } from "./Switch.theme";
import type { SwitchThemeSlots, SwitchThemeVariants } from "./Switch.theme";

export interface SwitchProps extends Pick<SwitchRootProps, "as" | "asChild" | "id" | "disabled"> {
  /** The label of the switch. */
  label?: string;
  /** The description of the switch. */
  description?: string;

  /**
   * The color of the switch.
   * @default "primary"
   */
  color?: SwitchThemeVariants["color"];
  /**
   * The size of the switch.
   * @default "md"
   */
  size?: SwitchThemeVariants["size"];

  class?: any;
  ui?: SwitchThemeSlots;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<boolean>();
const props = withDefaults(defineProps<SwitchProps>(), {
  color: "primary",
  size: "md",
});

const { id, size, ariaAttrs } = useFormField(props);

const ui = computed(() => {
  return SwitchTheme({
    color: props.color,
    size: size.value,

    disabled: props.disabled,
  });
});
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <Switch.Root
        :id="id"
        v-model="modelValue"
        v-bind="{ ...$attrs, ...ariaAttrs }"
        :disabled="disabled"
        :class="ui.base({ class: props.ui?.base })"
      >
        <Switch.Thumb :class="ui.thumb({ class: props.ui?.thumb })" />
      </Switch.Root>
    </div>

    <div v-if="label || description" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label" :for="id" :class="ui.label({ class: props.ui?.label })">{{ label }}</Label>
      <p v-if="description" :class="ui.description({ class: props.ui?.description })">{{ description }}</p>
    </div>
  </Primitive>
</template>
