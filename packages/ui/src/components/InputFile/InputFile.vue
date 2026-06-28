<script setup lang="ts" generic="M extends boolean = false">
import { computed, ref } from "vue";

import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";
import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";
import Input from "../Input/Input.vue";

import { InputFileTheme } from "./InputFile.theme.ts";
import type { InputFileThemeVariants } from "./InputFile.theme.ts";

export interface InputFileProps<M extends boolean = false> {
  /**
   * A custom label for the file input.
   * @default The select file name.
   */
  label?: string;

  /**
   * The size of the file input.
   * @default "md"
   */
  size?: InputFileThemeVariants["size"];

  /** Specifies the allowed file types for the input. */
  accept?: string;

  /** Allow multiple files selection. */
  multiple?: M;

  /** Whether the file input is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: { base?: string };
}

const modelValue = defineModel<M extends true ? File[] : File>();
const props = withDefaults(defineProps<InputFileProps>(), {
  size: "md",
});

const locale = useLocale();

const { fieldGroupSize } = useFormFieldGroup();
const size = computed(() => props.size ?? fieldGroupSize.value);

const input = ref<HTMLInputElement | null>(null);

function openPicker() {
  input.value?.click();
}

function onChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    modelValue.value = undefined;
    return;
  }

  if (props.multiple) modelValue.value = Array.from(files) as any;
  else modelValue.value = files[0] as any;
}

const displayValue = computed(() => {
  if (!modelValue.value) return undefined;
  if (Array.isArray(modelValue.value)) return modelValue.value.map((f) => f.name).join(", ");
  if (modelValue.value instanceof File) return modelValue.value.name;
  return undefined;
});
</script>

<template>
  <FormFieldGroup :size="size" :class="InputFileTheme({ size, class: [props.ui?.base, props.class] })">
    <Button :label="locale.messages.filePicker.chooseFile" :size="size" :disabled="disabled" @click="openPicker" />

    <!-- Keep this hidden input between other elements, so that they receive correct border radius. -->
    <input
      ref="input"
      type="file"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      class="hidden"
      @change="onChange"
    />

    <Input readonly :model-value="label ?? displayValue" :size="size" :disabled="disabled" class="w-full" />
  </FormFieldGroup>
</template>
