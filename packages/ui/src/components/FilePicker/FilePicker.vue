<script setup lang="ts">
import { computed } from "vue";

import { useFormFieldGroup } from "../../composables/useFormFieldGroup.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";
import FormFieldGroup from "../FormFieldGroup/FormFieldGroup.vue";
import Input from "../Input/Input.vue";

import { FilePickerTheme } from "./FilePicker.theme.ts";
import type { FilePickerThemeVariants } from "./FilePicker.theme.ts";

export interface FilePickerProps {
  /**
   * The size of the component.
   * @default "md"
   */
  size?: FilePickerThemeVariants["size"];

  /** Whether the component is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: { base?: string };
}

export interface FilePickerEmits {
  pick: [];
}

const modelValue = defineModel<string>();
const props = defineProps<FilePickerProps>();
const emit = defineEmits<FilePickerEmits>();

const locale = useLocale();

const { fieldGroupSize } = useFormFieldGroup();
const size = computed(() => props.size ?? fieldGroupSize.value ?? "lg");

const theme = computed(() => FilePickerTheme({ size: size.value, class: [props.ui?.base, props.class] }));
</script>

<template>
  <FormFieldGroup :size="size" :class="theme">
    <Button :label="locale.messages.filePicker.chooseFile" :disabled="disabled" @click="emit('pick')" />
    <Input v-model="modelValue" readonly :disabled="disabled" class="w-full" />
  </FormFieldGroup>
</template>
