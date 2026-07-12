<script setup lang="ts">
import defu from "defu";
import { Dialog } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import Button from "../Button/Button.vue";
import ScrollArea from "../ScrollArea/ScrollArea.vue";
import type { ScrollAreaProps } from "../ScrollArea/ScrollArea.vue";

import { DialogTheme } from "./Dialog.theme.ts";
import type { DialogThemeSlots } from "./Dialog.theme.ts";

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
   * Render the dialog in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  /**
   * Configuration for the body scroll area.
   * Set to `false` to disable, `true` to use defaults.
   * @default { type: "auto", size: "sm" }
   */
  scroll?: boolean | Pick<ScrollAreaProps, "type" | "size" | "ui">;

  class?: any;
  ui?: DialogThemeSlots;
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

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(defineProps<DialogProps>(), {
  dismissible: true,
  portal: true,
  scroll: true,
});
const emit = defineEmits<DialogEmits>();
const slots = defineSlots<DialogSlots>();

const portalProps = usePortal(toRef(() => props.portal));
const scrollProps = computed<Pick<ScrollAreaProps, "type" | "size" | "ui"> | null>(() => {
  if (props.scroll === false) return null;
  return defu(typeof props.scroll === "object" ? props.scroll : {}, { type: "auto", size: "sm" } as const);
});

const { icons } = useComponentIcons();
const locale = useLocale();

// oxlint-disable-next-line vue/no-dupe-keys
const ui = DialogTheme();

function close(value?: unknown) {
  emit("close", value);
  open.value = false;
}
</script>

<template>
  <Dialog.Root v-model:open="open" modal>
    <Dialog.Trigger as-child>
      <slot :open="open" />
    </Dialog.Trigger>

    <Dialog.Portal v-bind="portalProps">
      <Dialog.Overlay data-slot="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <Dialog.Content
        :aria-describedby="description ? undefined : ''"
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        @pointer-down-outside="!dismissible && $event.preventDefault()"
        @interact-outside="!dismissible && $event.preventDefault()"
        @escape-key-down="!dismissible && $event.preventDefault()"
        @after-enter="emit('after:enter')"
        @after-leave="emit('after:leave')"
      >
        <header data-slot="header" :class="ui.header({ class: props.ui?.header })">
          <div class="flex-1">
            <Dialog.Title data-slot="title" :class="ui.title({ class: props.ui?.title })">
              {{ title }}
            </Dialog.Title>

            <Dialog.Description
              v-if="description"
              data-slot="description"
              :class="ui.description({ class: props.ui?.description })"
            >
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
                :class="ui.close({ class: props.ui?.close })"
              />
            </slot>
          </Dialog.Close>
        </header>

        <ScrollArea v-if="scrollProps" v-bind="scrollProps">
          <div data-slot="body" :class="ui.body({ class: props.ui?.body })">
            <slot name="body" :close="close" />
          </div>
        </ScrollArea>
        <div v-else data-slot="body" :class="ui.body({ class: [props.ui?.body, 'overflow-hidden'] })">
          <slot name="body" :close="close" />
        </div>

        <footer v-if="slots.footer" data-slot="footer" :class="ui.footer({ class: props.ui?.footer })">
          <slot name="footer" :close="close" />
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
