<script setup lang="ts">
  import type { NumberFieldRootProps } from "reka-ui";
  import { NumberField } from "reka-ui/namespaced";
  import { computed } from "vue";

  import Button from "../Button/Button.vue";

  import { InputNumberTheme } from "./InputNumber.theme.ts";
  import type { InputNumberThemeSlots, InputNumberThemeVariants } from "./InputNumber.theme.ts";

  export interface InputNumberProps extends Pick<
    NumberFieldRootProps,
    "as" | "asChild" | "id" | "disabled" | "min" | "max" | "step" | "formatOptions"
  > {
    /**
     * The color scheme of the input.
     * @default "primary"
     */
    color?: InputNumberThemeVariants["color"];
    /**
     * The style variant of the input.
     * @default "subtle"
     */
    variant?: InputNumberThemeVariants["variant"];
    /**
     * The size of the input.
     * @default "lg"
     */
    size?: InputNumberThemeVariants["size"];

    /**
     * Whether to show the increment button.
     * @default true
     */
    increment?: boolean;
    /**
     * Whether to show the decrement button.
     * @default true
     */
    decrement?: boolean;
    /**
     * The icon for the increment button.
     * @default "lucide:chevron-up"
     */
    incrementIcon?: string;
    /**
     * The icon for the decrement button.
     * @default "lucide:chevron-down"
     */
    decrementIcon?: string;

    class?: any;
    ui?: InputNumberThemeSlots;
  }

  defineOptions({ inheritAttrs: false });

  const modelValue = defineModel<number>();
  const props = withDefaults(defineProps<InputNumberProps>(), {
    as: "div",

    color: "primary",
    variant: "subtle",
    size: "lg",

    increment: true,
    decrement: true,
    incrementIcon: "lucide:chevron-up",
    decrementIcon: "lucide:chevron-down",
  });

  const hasButtons = computed(() => props.increment || props.decrement);

  const ui = computed(() => {
    return InputNumberTheme({
      color: props.color,
      variant: props.variant,
      size: props.size,

      hasButtons: hasButtons.value,
    });
  });
</script>

<template>
  <NumberField.Root
    :id="id"
    v-model="modelValue"
    :as="as"
    :as-child="asChild"
    :min="min"
    :max="max"
    :step="step"
    :format-options="formatOptions"
    :disabled="disabled"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <NumberField.Input v-bind="$attrs" :class="ui.base({ class: props.ui?.base })" />

    <div v-if="hasButtons" :class="ui.buttons({ class: props.ui?.buttons })">
      <NumberField.Increment v-if="increment" as-child :disabled="disabled">
        <Button square color="neutral" variant="link" :icon="incrementIcon" :size="size" aria-label="Increment" />
      </NumberField.Increment>

      <NumberField.Decrement v-if="decrement" as-child :disabled="disabled">
        <Button square color="neutral" variant="link" :icon="decrementIcon" :size="size" aria-label="Decrement" />
      </NumberField.Decrement>
    </div>
  </NumberField.Root>
</template>
