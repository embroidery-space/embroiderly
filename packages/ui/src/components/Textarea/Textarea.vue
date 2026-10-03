<script setup lang="ts">
import { nextTick, onMounted, useTemplateRef, watch } from "vue";

import { useFormField } from "../../composables/useFormField.ts";

export interface TextareaProps {
  id?: string;

  /**
   * The color scheme of the textarea.
   * @default "primary"
   */
  color?: "primary";
  /**
   * The style variant of the textarea.
   * @default "subtle"
   */
  variant?: "subtle" | "outline";
  /**
   * The size of the textarea.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

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
}

defineOptions({ inheritAttrs: false });

const modelValue = defineModel<string>();
const props = withDefaults(defineProps<TextareaProps>(), {
  color: "primary",
  variant: "subtle",
  size: "md",

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
  const paddingTop = Math.trunc(Number(styles.paddingTop));
  const paddingBottom = Math.trunc(Number(styles.paddingBottom));
  const padding = paddingTop + paddingBottom;
  const lineHeight = Math.trunc(Number(styles.lineHeight));
  const { scrollHeight } = textarea.value;
  const newRows = (scrollHeight - padding) / lineHeight;

  if (newRows > props.rows) {
    textarea.value.rows = props.maxrows ? Math.min(newRows, props.maxrows) : newRows;
  }

  textarea.value.style.overflow = overflow;
}

onMounted(() => {
  autoResize();
});
</script>

<template>
  <div
    data-slot="root"
    :class="[
      $style.root,
      $style[`color-${color}`],
      $style[`variant-${variant}`],
      $style[`size-${size}`],
      autoresize && $style.autoresize,
    ]"
  >
    <textarea
      :id="id"
      ref="textarea"
      v-model="modelValue"
      v-bind="{ ...$attrs, ...ariaAttrs }"
      :rows="rows"
      :disabled="disabled"
      data-slot="base"
      :class="$style.base"
    />
  </div>
</template>

<style module>
.root {
  position: relative;

  display: inline-flex;
  align-items: center;
}

.base {
  width: 100%;
  border-width: 0;
  border-radius: var(--radius-md);

  appearance: none;

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:disabled {
    cursor: not-allowed;

    opacity: 75%;
  }

  .variant-subtle > & {
    background-color: var(--background-color-elevated);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  .variant-outline > & {
    background-color: var(--background-color-default);
    box-shadow: inset 0 0 0 1px var(--border-color-accented);
  }

  .size-sm > & {
    gap: calc(var(--spacing) * 1);

    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);

    font-size: var(--text-xs);
  }

  .size-md > & {
    gap: calc(var(--spacing) * 1.5);

    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);

    font-size: var(--text-sm);
  }

  .size-lg > & {
    gap: calc(var(--spacing) * 2);

    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);

    font-size: var(--text-base);
  }

  .autoresize > & {
    resize: none;
  }

  .color-primary.variant-subtle > &,
  .color-primary.variant-outline > & {
    &:focus-visible {
      box-shadow: inset 0 0 0 2px var(--color-primary);
    }
  }
}
</style>
