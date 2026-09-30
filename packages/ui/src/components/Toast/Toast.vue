<script setup lang="ts">
import type { ToastRootEmits, ToastRootProps } from "reka-ui";
import { Toast } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";
import type { ButtonProps } from "../Button/Button.vue";
import Progress from "../Progress/Progress.vue";

export interface ToastProps extends Pick<ToastRootProps, "type" | "duration"> {
  title?: string;
  description?: string;

  /**
   * The color of the toast.
   * @default "primary"
   */
  color?: "primary" | "error" | "warning" | "success" | "info" | "help" | "neutral";

  /** Display a list of action buttons under the title and description. */
  actions?: ButtonProps[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToastEmits extends ToastRootEmits {}

export interface ToastSlots {
  title(): any;
  description(): any;
  actions(): any;
  close(): any;
}

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(defineProps<ToastProps>(), {
  color: "primary",
});
const slots = defineSlots<ToastSlots>();

const { icons } = useComponentIcons();
const locale = useLocale();

const hasTitle = computed(() => !!props.title || !!slots.title);
</script>

<template>
  <Toast.Root
    v-slot="{ remaining, duration: totalDuration }"
    v-model:open="open"
    :type="type"
    :duration="duration"
    data-slot="root"
    :class="[$style.root, $style[`color-${color}`], hasTitle && $style.hasTitle]"
  >
    <div data-slot="wrapper" :class="$style.wrapper">
      <Toast.Title v-if="title || !!slots.title" data-slot="title" :class="$style.title">
        <slot name="title">
          {{ title }}
        </slot>
      </Toast.Title>

      <Toast.Description v-if="description || !!slots.description" data-slot="description" :class="$style.description">
        <slot name="description">
          {{ description }}
        </slot>
      </Toast.Description>

      <div v-if="actions?.length || !!slots.actions" data-slot="actions" :class="$style.actions">
        <slot name="actions">
          <Toast.Action
            v-for="(action, index) in actions"
            :key="index"
            :alt-text="action.label || 'Action'"
            as-child
            @click.stop
          >
            <Button size="sm" v-bind="action" />
          </Toast.Action>
        </slot>
      </div>
    </div>

    <Toast.Close as-child>
      <slot name="close">
        <Button
          :icon="icons.close"
          color="neutral"
          variant="link"
          size="md"
          :aria-label="locale.messages.toast.close"
          data-slot="close"
          :class="$style.close"
          @click.stop
          @pointerdown.stop
          @pointermove.stop
          @pointerup.stop
        />
      </slot>
    </Toast.Close>

    <Progress
      v-if="remaining > 0 && totalDuration"
      :model-value="(remaining / totalDuration) * 100"
      :color="color"
      size="sm"
      data-slot="progress"
      :class="$style.progress"
    />
  </Toast.Root>
</template>

<style module>
.root {
  position: relative;

  overflow: hidden;
  display: flex;
  gap: calc(var(--spacing) * 2.5);
  align-items: flex-start;

  padding: calc(var(--spacing) * 4);
  border-radius: var(--radius-lg);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-lg);

  &:focus {
    outline-style: none;
  }

  &.color-primary:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--color-primary),
      var(--shadow-lg);
  }

  &.color-error:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--color-error),
      var(--shadow-lg);
  }

  &.color-warning:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--color-warning),
      var(--shadow-lg);
  }

  &.color-success:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--color-success),
      var(--shadow-lg);
  }

  &.color-info:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--color-info),
      var(--shadow-lg);
  }

  &.color-help:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--color-help),
      var(--shadow-lg);
  }

  &.color-neutral:focus-visible {
    box-shadow:
      inset 0 0 0 2px var(--border-color-inverted),
      var(--shadow-lg);
  }
}

.wrapper {
  display: flex;
  flex: 1;
  flex-direction: column;

  width: 0;
}

.title {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}

.description {
  font-size: var(--text-sm);
  color: var(--text-color-muted);
  white-space: pre-line;

  .has-title > * > & {
    margin-top: calc(var(--spacing) * 1);
  }
}

.actions {
  display: flex;
  flex-shrink: 0;
  gap: calc(var(--spacing) * 1.5);
  align-items: flex-start;

  margin-top: calc(var(--spacing) * 2.5);
}

button.close[data-slot="close"] {
  padding: 0;
}

.progress[data-slot="progress"] {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
}
</style>
