<script setup lang="ts">
import { computed, ref, watch } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import Button from "../Button/Button.vue";
import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";
import InputNumber from "../InputNumber/InputNumber.vue";
import type { InputNumberProps } from "../InputNumber/InputNumber.vue";

import { InputDimensionsTheme } from "./InputDimensions.theme.ts";
import type { InputDimensionsThemeSlots, InputDimensionsThemeVariants } from "./InputDimensions.theme.ts";

export interface InputDimensionsProps {
  /**
   * The size of the component.
   * @default "lg"
   */
  size?: InputDimensionsThemeVariants["size"];

  /**
   * The layout orientation of the two inputs.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The initial aspect ratio (`width / height`) to use for proportional locking.
   * When provided, the aspect ratio lock is initially active.
   */
  aspectRatio?: number;

  /** Whether the component is disabled. */
  disabled?: boolean;

  /** Additional options for the width `FormField` wrapper. */
  widthFieldOptions?: Omit<FormFieldProps, "size">;
  /** Additional options for the height `FormField` wrapper. */
  heightFieldOptions?: Omit<FormFieldProps, "size">;

  /** Additional options for the width `InputNumber` component. */
  widthInputOptions?: Omit<InputNumberProps, "modelValue" | "disabled" | "size">;
  /** Additional options for the height `InputNumber` component. */
  heightInputOptions?: Omit<InputNumberProps, "modelValue" | "disabled" | "size">;

  class?: any;
  ui?: InputDimensionsThemeSlots;
}

const width = defineModel<number>("width");
const height = defineModel<number>("height");
const props = withDefaults(defineProps<InputDimensionsProps>(), {
  size: "lg",
  orientation: "horizontal",
});

const { icons } = useComponentIcons();

const aspectRatioLocked = ref(props.aspectRatio !== undefined);
const storedAspectRatio = ref(props.aspectRatio);

watch(aspectRatioLocked, function (locked: boolean) {
  if (locked && !props.aspectRatio) {
    const calculated = calculateAspectRatio();
    if (calculated) storedAspectRatio.value = calculated;
  }
});

function calculateAspectRatio() {
  if (width.value && height.value) {
    return width.value / height.value;
  }
  return undefined;
}

function handleWidthChange(newWidth: number) {
  width.value = newWidth;
  if (aspectRatioLocked.value && storedAspectRatio.value) {
    height.value = Math.round(newWidth / storedAspectRatio.value);
  }
}

function handleHeightChange(newHeight: number) {
  height.value = newHeight;
  if (aspectRatioLocked.value && storedAspectRatio.value) {
    width.value = Math.round(newHeight * storedAspectRatio.value);
  }
}

const ui = computed(() =>
  InputDimensionsTheme({
    size: props.size,
    orientation: props.orientation,
  }),
);
</script>

<template>
  <div data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <FormField v-bind="widthFieldOptions" :size="size">
      <InputNumber
        v-bind="widthInputOptions"
        :size="size"
        :disabled="disabled"
        :model-value="width"
        @update:model-value="handleWidthChange($event!)"
      />
    </FormField>

    <Button
      square
      :icon="aspectRatioLocked ? icons.link : icons.unlink"
      :color="aspectRatioLocked ? 'primary' : 'neutral'"
      variant="ghost"
      :size="size"
      :disabled="disabled"
      data-slot="lockButton"
      :class="ui.lockButton({ class: props.ui?.lockButton })"
      :aria-label="aspectRatioLocked ? 'Unlock aspect ratio' : 'Lock aspect ratio'"
      :aria-pressed="aspectRatioLocked"
      @click="aspectRatioLocked = !aspectRatioLocked"
    />

    <FormField v-bind="heightFieldOptions" :size="size">
      <InputNumber
        v-bind="heightInputOptions"
        :size="size"
        :disabled="disabled"
        :model-value="height"
        @update:model-value="handleHeightChange($event!)"
      />
    </FormField>
  </div>
</template>
