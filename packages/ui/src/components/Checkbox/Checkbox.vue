<script setup lang="ts">
  import { CheckboxRoot, CheckboxIndicator, Primitive, Label } from "reka-ui";
  import type { CheckboxRootProps } from "reka-ui";
  import { computed, useId } from "vue";

  import Icon from "../Icon/Icon.vue";

  import { CheckboxTheme } from "./Checkbox.theme";
  import type { CheckboxThemeSlots, CheckboxThemeVariants } from "./Checkbox.theme";

  export interface CheckboxProps extends Pick<CheckboxRootProps, "as" | "asChild" | "id" | "disabled"> {
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
     * @default "lg"
     */
    size?: CheckboxThemeVariants["size"];

    /**
     * The icon displayed when checked.
     * @default "lucide:check"
     */
    icon?: string;

    class?: any;
    ui?: CheckboxThemeSlots;
  }

  defineOptions({ inheritAttrs: false });

  const modelValue = defineModel<boolean>();
  const props = withDefaults(defineProps<CheckboxProps>(), {
    color: "primary",
    size: "lg",

    icon: "lucide:check",
  });

  const id = computed(() => props.id ?? useId());

  const ui = computed(() => {
    return CheckboxTheme({
      color: props.color,
      size: props.size,

      disabled: props.disabled,
    });
  });
</script>

<template>
  <Primitive :as="as" :as-child="asChild" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <div :class="ui.container({ class: props.ui?.container })">
      <CheckboxRoot
        :id="id"
        v-model="modelValue"
        v-bind="$attrs"
        :disabled="disabled"
        :class="ui.base({ class: props.ui?.base })"
      >
        <CheckboxIndicator :class="ui.indicator({ class: props.ui?.indicator })">
          <Icon :name="icon" :class="ui.icon({ class: props.ui?.icon })" />
        </CheckboxIndicator>
      </CheckboxRoot>
    </div>

    <div v-if="label || description" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Label v-if="label" :for="id" :class="ui.label({ class: props.ui?.label })">{{ label }}</Label>
      <p v-if="description" :class="ui.description({ class: props.ui?.description })">{{ description }}</p>
    </div>
  </Primitive>
</template>
