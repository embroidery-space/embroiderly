<template>
  <div
    class="flex gap-2"
    :class="{
      'relative flex-col pl-8': orientation === 'vertical',
      'flex-row': orientation === 'horizontal',
    }"
  >
    <UFormField v-bind="widthFieldProps">
      <UInputNumber
        v-bind="widthInputProps"
        data-testid="width-input"
        :model-value="width"
        @update:model-value="handleWidthChange($event!)"
      />
    </UFormField>

    <UButton
      :icon="aspectRatioLocked ? 'i-lucide:link' : 'i-lucide:unlink'"
      :color="aspectRatioLocked ? 'primary' : 'neutral'"
      variant="ghost"
      size="xs"
      :class="{
        'absolute top-1/2 left-0 -translate-y-1/2': orientation === 'vertical',
        'mb-2.5 self-end': orientation === 'horizontal',
      }"
      @click="aspectRatioLocked = !aspectRatioLocked"
    />

    <UFormField v-bind="heightFieldProps">
      <UInputNumber
        v-bind="heightInputProps"
        data-testid="height-input"
        :model-value="height"
        @update:model-value="handleHeightChange($event!)"
      />
    </UFormField>
  </div>
</template>

<script lang="ts" setup>
  import type { FormFieldProps, InputNumberProps } from "@nuxt/ui";
  import { ref, watch } from "vue";

  interface DimensionsInputProps {
    /** Props for width `InputNumber` component. */
    widthInputProps?: InputNumberProps;
    /** Props for height `InputNumber` component. */
    heightInputProps?: InputNumberProps;

    /** Props for width `FormField` wrapper. */
    widthFieldProps?: FormFieldProps;
    /** Props for height `FormField` wrapper. */
    heightFieldProps?: FormFieldProps;

    /** Layout orientation. */
    orientation?: "horizontal" | "vertical";

    /**
     * Aspect ratio (`width / height`).
     * If provided, the aspect ratio lock starts enabled.
     */
    aspectRatio?: number;
  }

  const width = defineModel<number>("width", { required: true });
  const height = defineModel<number>("height", { required: true });
  const props = withDefaults(defineProps<DimensionsInputProps>(), {
    widthInputProps: undefined,
    heightInputProps: undefined,

    widthFieldProps: undefined,
    heightFieldProps: undefined,

    orientation: "horizontal",
    aspectRatio: undefined,
  });

  const aspectRatioLocked = ref(props.aspectRatio !== undefined);
  const storedAspectRatio = ref(props.aspectRatio);

  watch(aspectRatioLocked, function (locked: boolean) {
    if (locked && !props.aspectRatio) {
      // If the aspect ratio is not provided, calculate it based on the current width and height.
      const calculated = calculateAspectRatio();
      if (calculated) storedAspectRatio.value = calculated;
    }
  });

  function calculateAspectRatio() {
    if (width.value && height.value) {
      return width.value / height.value;
    }return undefined;
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
