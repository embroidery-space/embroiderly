<script setup lang="ts">
  import type { NumberFieldRootProps } from "reka-ui";
  import { NumberField } from "reka-ui/namespaced";
  import { computed } from "vue";

  import { useComponentIcons } from "../../composables/useComponentIcons.ts";
  import { useFormField } from "../../composables/useFormField.ts";
  import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
  import { useLocale } from "../../composables/useLocale.ts";
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
     * @default "icons.chevronUp"
     */
    incrementIcon?: string;
    /**
     * The icon for the decrement button.
     * @default "icons.chevronDown"
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

    increment: true,
    decrement: true,
  });

  const { icons } = useComponentIcons();
  const { t } = useLocale();

  const { fieldGroup, fieldGroupSize } = useFormFieldGroup();
  const { id, size: formFieldSize, ariaAttrs } = useFormField(props);
  const size = computed(() => props.size ?? fieldGroupSize.value ?? formFieldSize.value);

  const hasButtons = computed(() => props.increment || props.decrement);

  const ui = computed(() => {
    return InputNumberTheme({
      color: props.color,
      variant: props.variant,
      size: size.value,

      hasButtons: hasButtons.value,

      fieldGroup: fieldGroup.value,
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
    <NumberField.Input v-bind="{ ...$attrs, ...ariaAttrs }" :class="ui.base({ class: props.ui?.base })" />

    <div v-if="hasButtons" :class="ui.buttons({ class: props.ui?.buttons })">
      <NumberField.Increment v-if="increment" as-child :disabled="disabled">
        <Button
          square
          color="neutral"
          variant="link"
          :icon="incrementIcon ?? icons.chevronUp"
          :size="size"
          :aria-label="t('inputNumber.increment')"
        />
      </NumberField.Increment>

      <NumberField.Decrement v-if="decrement" as-child :disabled="disabled">
        <Button
          square
          color="neutral"
          variant="link"
          :icon="decrementIcon ?? icons.chevronDown"
          :size="size"
          :aria-label="t('inputNumber.decrement')"
        />
      </NumberField.Decrement>
    </div>
  </NumberField.Root>
</template>
