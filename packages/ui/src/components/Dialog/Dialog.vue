<script setup lang="ts">
import { Dialog } from "reka-ui/namespaced";
import { toRef, useTemplateRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import Button from "../Button/Button.vue";

export interface DialogProps {
  /** The title displayed in the dialog header. */
  title: string;
  /** The description displayed below the title. */
  description?: string;

  /**
   * Whether the dialog can be dismissed via close button, clicking outside, or pressing Escape.
   * @default true
   */
  dismissible?: boolean;
  /**
   * Whether to display the dialog in fullscreen mode.
   * @default false
   */
  fullscreen?: boolean;

  /**
   * Render the dialog in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;
}

export interface DialogEmits {
  close: [value?: unknown];
  "after:enter": [];
  "after:leave": [];
}

export interface DialogSlots {
  default(props: { open: boolean }): any;
  body(props: { close: (value?: unknown) => void }): any;
  footer(props: { close: (value?: unknown) => void }): any;
  close?(props: { close: (value?: unknown) => void }): any;
}

defineOptions({ inheritAttrs: false });

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(defineProps<DialogProps>(), {
  dismissible: true,
  fullscreen: false,

  portal: true,
});
const emit = defineEmits<DialogEmits>();
const slots = defineSlots<DialogSlots>();

const portalProps = usePortal(toRef(() => props.portal));

const { icons } = useComponentIcons();
const locale = useLocale();

function close(value?: unknown) {
  emit("close", value);
  open.value = false;
}

const contentRef = useTemplateRef("content");
defineExpose({ contentRef });
</script>

<template>
  <Dialog.Root v-model:open="open" modal>
    <Dialog.Trigger as-child>
      <slot :open="open" />
    </Dialog.Trigger>

    <Dialog.Portal v-bind="portalProps">
      <Dialog.Overlay data-slot="overlay" :class="$style.overlay" />

      <Dialog.Content
        ref="content"
        v-bind="$attrs"
        :aria-describedby="description ? undefined : ''"
        data-slot="content"
        :class="[$style.content, { [$style.fullscreen]: fullscreen }]"
        @pointer-down-outside="!dismissible && $event.preventDefault()"
        @interact-outside="!dismissible && $event.preventDefault()"
        @escape-key-down="!dismissible && $event.preventDefault()"
        @after-enter="emit('after:enter')"
        @after-leave="emit('after:leave')"
      >
        <header data-slot="header" :class="$style.header">
          <div :class="$style.heading">
            <Dialog.Title data-slot="title" :class="$style.title">
              {{ title }}
            </Dialog.Title>

            <Dialog.Description v-if="description" data-slot="description" :class="$style.description">
              {{ description }}
            </Dialog.Description>
          </div>

          <Dialog.Close as-child>
            <slot name="close" :close="close">
              <Button
                :icon="icons.close"
                color="neutral"
                variant="ghost"
                size="md"
                square
                :aria-label="locale.messages.dialog.close"
                data-slot="close"
                :class="$style.close"
              />
            </slot>
          </Dialog.Close>
        </header>

        <div data-slot="body" :class="$style.body">
          <slot name="body" :close="close" />
        </div>

        <footer v-if="slots.footer" data-slot="footer" :class="$style.footer">
          <slot name="footer" :close="close" />
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
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

  display: grid;
  grid-template-rows: auto 1fr auto;

  width: var(--container-lg);
  max-width: 90%;
  max-height: 90%;
  border-radius: var(--radius-lg);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-lg);

  &.fullscreen {
    inset: 0;
    translate: none;

    width: auto;
    max-width: none;
    max-height: none;
    border-radius: 0;

    box-shadow: none;
  }

  &:focus {
    outline-style: none;
  }

  &[data-state="closed"] {
    animation: global(scale-out) 200ms ease-in;
  }

  &[data-state="open"] {
    animation: global(scale-in) 200ms ease-out;
  }

  & > :not(:last-child) {
    border-bottom: 1px solid var(--border-color-default);
  }
}

.header {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  min-height: calc(var(--spacing) * 14);
  padding: calc(var(--spacing) * 4);
}

.heading {
  flex: 1;
}

.title {
  font-weight: 600;
}

.description {
  margin-top: calc(var(--spacing) * 1);

  font-size: var(--text-sm);
  color: var(--text-color-muted);
}

.close {
  position: absolute;
  inset-inline-end: calc(var(--spacing) * 4);
  top: calc(var(--spacing) * 4);
}

.body {
  overflow-y: auto;

  padding: calc(var(--spacing) * 4);
}

.footer {
  display: flex;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;
  justify-content: flex-end;

  padding: calc(var(--spacing) * 4);
}
</style>
