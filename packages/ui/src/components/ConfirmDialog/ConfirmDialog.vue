<script setup lang="ts">
import { AlertDialog } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import Button from "../Button/Button.vue";
import type { ButtonProps } from "../Button/Button.vue";

export interface ConfirmDialogProps {
  /** The title displayed in the confirm dialog header. */
  title?: string;
  /** The description displayed below the title. */
  description?: string;

  /** Props for the "Yes" button. If `null`, the button is hidden. */
  yesButton?: ButtonProps | null;
  /** Props for the "No" button. If `null`, the button is hidden. */
  noButton?: ButtonProps | null;

  /**
   * Render the confirm dialog in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;
}

export interface ConfirmDialogEmits {
  close: [value?: boolean];
  "after:enter": [];
  "after:leave": [];
}

export interface ConfirmDialogSlots {
  default(props: { open: boolean }): any;
}

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  portal: true,
});
const emit = defineEmits<ConfirmDialogEmits>();
defineSlots<ConfirmDialogSlots>();

const portalProps = usePortal(toRef(() => props.portal));

const locale = useLocale();

function close(value?: boolean) {
  emit("close", value);
  open.value = false;
}
</script>

<template>
  <AlertDialog.Root v-model:open="open">
    <AlertDialog.Trigger as-child>
      <slot :open="open" />
    </AlertDialog.Trigger>

    <AlertDialog.Portal v-bind="portalProps">
      <AlertDialog.Overlay data-slot="overlay" :class="$style.overlay" />

      <AlertDialog.Content
        data-slot="content"
        :class="$style.content"
        @escape-key-down="close()"
        @after-enter="emit('after:enter')"
        @after-leave="emit('after:leave')"
      >
        <header data-slot="header" :class="$style.header">
          <AlertDialog.Title data-slot="title" :class="$style.title">
            {{ title }}
          </AlertDialog.Title>

          <AlertDialog.Description data-slot="description" :class="$style.description">
            {{ description }}
          </AlertDialog.Description>
        </header>

        <footer data-slot="footer" :class="$style.footer">
          <AlertDialog.Cancel as-child>
            <Button color="neutral" variant="outline" :label="locale.messages.confirmDialog.cancel" @click="close()" />
          </AlertDialog.Cancel>

          <AlertDialog.Action v-if="props.noButton !== null" as-child>
            <Button
              color="neutral"
              variant="soft"
              :label="locale.messages.confirmDialog.no"
              v-bind="props.noButton"
              @click="close(false)"
            />
          </AlertDialog.Action>

          <AlertDialog.Action v-if="props.yesButton !== null" as-child>
            <Button
              color="primary"
              variant="solid"
              :label="locale.messages.confirmDialog.yes"
              v-bind="props.yesButton"
              @click="close(true)"
            />
          </AlertDialog.Action>
        </footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</template>

<style module>
.overlay {
  position: fixed;
  inset: 0;
  background-color: color-mix(in oklab, var(--background-color-elevated) 75%, transparent);

  &[data-state="closed"] {
    animation: global(fade-out) 200ms ease-in;
  }

  &[data-state="open"] {
    animation: global(fade-in) 200ms ease-out;
  }
}

.content {
  position: fixed;
  top: 50%;
  left: 50%;
  translate: -50% -50%;

  display: flex;
  flex-direction: column;

  width: max-content;
  min-width: var(--container-md);
  max-width: 90%;
  height: max-content;
  max-height: 90%;
  border-radius: var(--radius-lg);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-lg);

  &:focus {
    outline-style: none;
  }

  &[data-state="closed"] {
    animation: global(scale-out) 200ms ease-in;
  }

  &[data-state="open"] {
    animation: global(scale-in) 200ms ease-out;
  }
}

.header {
  min-height: calc(var(--spacing) * 12);
  padding: calc(var(--spacing) * 4);
  padding-bottom: 0;
}

.title {
  font-weight: var(--font-weight-semibold);
}

.description {
  margin-top: calc(var(--spacing) * 1);

  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
  color: var(--text-color-muted);
  white-space: pre-line;
}

.footer {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;
  justify-content: flex-end;

  padding: calc(var(--spacing) * 4);
}
</style>
