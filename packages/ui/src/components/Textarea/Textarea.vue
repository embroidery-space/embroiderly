<script setup lang="ts">
import { useCurrentElement } from "@vueuse/core";
import { injectFieldRootContext } from "reka-ui";
import { Field } from "reka-ui/namespaced";
import { nextTick, onMounted, useTemplateRef, watch } from "vue";

export interface TextareaProps {
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
  rows: 3,
  maxrows: 0,
});
const fieldContext = injectFieldRootContext(null);

watch(modelValue, () => {
  nextTick(autoResize);
});

const textarea = useCurrentElement(useTemplateRef("textarea"));
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
  <div data-slot="root" :class="[$style.root, autoresize && $style.autoresize]">
    <Field.Control
      v-if="fieldContext"
      ref="textarea"
      v-model="modelValue"
      v-bind="$attrs"
      as="textarea"
      :rows="rows"
      :disabled="disabled"
      data-slot="base"
      :class="$style.base"
    />
    <textarea
      v-else
      ref="textarea"
      v-model="modelValue"
      v-bind="$attrs"
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
  gap: calc(var(--spacing) * 1.5);

  width: 100%;

  padding-block: calc(var(--spacing) * 1.5);
  padding-inline: calc(var(--spacing) * 2.5);
  border-width: 0;
  border-radius: var(--radius-md);

  font-size: var(--text-sm);

  appearance: none;

  background-color: var(--background-color-elevated);
  box-shadow: inset 0 0 0 1px var(--border-color-accented);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: var(--default-transition-duration);
  transition-property: color, background-color, border-color, outline-color, text-decoration-color, fill, stroke;

  &:focus {
    outline-style: none;
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px var(--color-primary);
  }

  &:disabled {
    cursor: not-allowed;

    opacity: 75%;
  }

  .autoresize > & {
    resize: none;
  }
}
</style>
