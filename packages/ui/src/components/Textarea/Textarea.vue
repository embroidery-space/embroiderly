<script setup lang="ts">
import { computed, nextTick, onMounted, useTemplateRef, watch } from "vue";

import { useFormField } from "../../composables/useFormField.ts";

import { TextareaTheme } from "./Textarea.theme.ts";
import type { TextareaThemeSlots, TextareaThemeVariants } from "./Textarea.theme.ts";

export interface TextareaProps {
  id?: string;

  /**
   * The color scheme of the textarea.
   * @default "primary"
   */
  color?: TextareaThemeVariants["color"];
  /**
   * The style variant of the textarea.
   * @default "subtle"
   */
  variant?: TextareaThemeVariants["variant"];
  /**
   * The size of the textarea.
   * @default "lg"
   */
  size?: TextareaThemeVariants["size"];

  /**
   * The number of visible text lines.
   * @default 3
   */
  rows?: number;
  /**
   * The maximum number of rows when autoresizing.
   * Set to 0 for unlimited growth.
   * @default 0
   */
  maxrows?: number;

  /** Whether the textarea should automatically resize based on content. */
  autoresize?: boolean;
  /** Whether the textarea is disabled. */
  disabled?: boolean;

  class?: any;
  ui?: TextareaThemeSlots;
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();
const props = withDefaults(defineProps<TextareaProps>(), {
  color: "primary",
  variant: "subtle",

  rows: 3,
  maxrows: 0,
});

const { id, size, ariaAttrs } = useFormField(props);

watch(modelValue, () => {
  nextTick(autoResize);
});

const textarea = useTemplateRef("textarea");
function autoResize() {
  if (!props.autoresize || !textarea.value) return;

  textarea.value.rows = props.rows;

  const overflow = textarea.value.style.overflow;
  textarea.value.style.overflow = "hidden";

  const styles = globalThis.getComputedStyle(textarea.value);
  const paddingTop = Number.parseInt(styles.paddingTop, 10);
  const paddingBottom = Number.parseInt(styles.paddingBottom, 10);
  const padding = paddingTop + paddingBottom;
  const lineHeight = Number.parseInt(styles.lineHeight, 10);
  const { scrollHeight } = textarea.value;
  const newRows = (scrollHeight - padding) / lineHeight;

  if (newRows > props.rows) {
    textarea.value.rows = props.maxrows ? Math.min(newRows, props.maxrows) : newRows;
  }

  textarea.value.style.overflow = overflow;
}

const ui = computed(() => {
  return TextareaTheme({
    color: props.color,
    variant: props.variant,
    size: size.value,

    autoresize: props.autoresize,
  });
});

onMounted(() => {
  autoResize();
});
</script>

<template>
  <div data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <textarea
      :id="id"
      ref="textarea"
      v-model="modelValue"
      v-bind="{ ...$attrs, ...ariaAttrs }"
      :rows="rows"
      :disabled="disabled"
      data-slot="base"
      :class="ui.base({ class: props.ui?.base })"
    />
  </div>
</template>
