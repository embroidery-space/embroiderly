<script setup lang="ts">
import { ref, watch } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import ButtonIcon from "../ButtonIcon/ButtonIcon.vue";
import FormField from "../FormField/FormField.vue";
import type { FormFieldProps } from "../FormField/FormField.vue";
import InputNumber from "../InputNumber/InputNumber.vue";
import type { InputNumberProps } from "../InputNumber/InputNumber.vue";

export interface InputDimensionsProps {
  /**
   * The size of the component.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

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
}

const width = defineModel<number>("width");
const height = defineModel<number>("height");
const props = withDefaults(defineProps<InputDimensionsProps>(), {
  size: "md",
  orientation: "horizontal",
});

const { icons } = useComponentIcons();
const locale = useLocale();

const aspectRatioLocked = ref(props.aspectRatio !== undefined);
const storedAspectRatio = ref(props.aspectRatio);

watch(
  () => props.aspectRatio,
  (newRatio) => {
    if (newRatio !== undefined) {
      aspectRatioLocked.value = true;
      storedAspectRatio.value = newRatio;
    }
  },
);

function calculateAspectRatio() {
  if (width.value && height.value) {
    return width.value / height.value;
  }
  return undefined;
}

function toggleAspectRatioLock() {
  aspectRatioLocked.value = !aspectRatioLocked.value;
  if (aspectRatioLocked.value) {
    const calculated = calculateAspectRatio();
    if (calculated) storedAspectRatio.value = calculated;
  }
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
</script>

<template>
  <div data-slot="root" :class="[$style.root, $style[`orientation-${orientation}`]]">
    <FormField v-bind="widthFieldOptions" :size="size">
      <InputNumber
        v-bind="widthInputOptions"
        :size="size"
        :disabled="disabled"
        :model-value="width"
        @update:model-value="handleWidthChange($event!)"
      />
    </FormField>

    <ButtonIcon
      :icon="aspectRatioLocked ? icons.link : icons.unlink"
      :tooltip="
        aspectRatioLocked
          ? locale.messages.inputDimensions.unlockAspectRatio
          : locale.messages.inputDimensions.lockAspectRatio
      "
      :color="aspectRatioLocked ? 'primary' : 'neutral'"
      variant="ghost"
      :size="size"
      :disabled="disabled"
      data-slot="lock-button"
      :class="$style.lockButton"
      :aria-pressed="aspectRatioLocked"
      @click="toggleAspectRatioLock"
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

<style module>
.root {
  display: flex;
  gap: calc(var(--spacing) * 2);

  &.orientation-vertical {
    position: relative;

    flex-direction: column;

    padding-left: calc(var(--spacing) * 8);
  }
}

.lock-button {
  .orientation-horizontal > & {
    align-self: flex-end;

    margin-bottom: calc(var(--spacing) * 0.5);
  }

  .orientation-vertical > & {
    position: absolute;
    top: 50%;
    left: 0;
    translate: 0 -50%;
  }
}
</style>
