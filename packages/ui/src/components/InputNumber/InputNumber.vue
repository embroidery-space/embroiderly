<script setup lang="ts">
  import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot } from "reka-ui";
  import type { NumberFieldRootProps, PrimitiveProps } from "reka-ui";
  import { computed } from "vue";

  import type { InputHTMLAttributes } from "../../types/html.ts";
  import Button from "../Button/Button.vue";

  import { InputNumberTheme } from "./InputNumber.theme.ts";
  import type { InputNumberThemeSlots, InputNumberThemeVariants } from "./InputNumber.theme.ts";

  export interface InputNumberProps
    extends
      Pick<PrimitiveProps, "as" | "asChild">,
      Pick<NumberFieldRootProps, "id" | "name" | "readonly" | "disabled" | "min" | "max" | "step" | "formatOptions">,
      /* @vue-ignore */ Pick<InputHTMLAttributes, "placeholder" | "autofocus"> {
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

  export interface InputNumberEmits {
    "update:modelValue": [value: number | null];
    blur: [event: FocusEvent];
    change: [event: Event];
  }

  defineOptions({ inheritAttrs: false });

  const modelValue = defineModel<number | null>();
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
  const emits = defineEmits<InputNumberEmits>();

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
  <NumberFieldRoot
    :id="id"
    v-model="modelValue"
    :as="as"
    :as-child="asChild"
    :min="min"
    :max="max"
    :step="step"
    :format-options="formatOptions"
    :disabled="disabled"
    :readonly="readonly"
    :name="name"
    :class="ui.root({ class: props.ui?.root })"
  >
    <NumberFieldInput
      :placeholder="placeholder"
      :autofocus="autofocus"
      :class="ui.base({ class: [props.ui?.base, props.class] })"
      v-bind="$attrs"
      @blur="emits('blur', $event)"
      @change="emits('change', $event)"
    />

    <div v-if="hasButtons" :class="ui.buttons({ class: props.ui?.buttons })">
      <NumberFieldIncrement v-if="increment" as-child :disabled="disabled">
        <Button square color="neutral" variant="link" :icon="incrementIcon" :size="size" aria-label="Increment" />
      </NumberFieldIncrement>

      <NumberFieldDecrement v-if="decrement" as-child :disabled="disabled">
        <Button square color="neutral" variant="link" :icon="decrementIcon" :size="size" aria-label="Decrement" />
      </NumberFieldDecrement>
    </div>
  </NumberFieldRoot>
</template>
