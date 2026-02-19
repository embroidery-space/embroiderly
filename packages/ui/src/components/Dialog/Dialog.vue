<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import type { DialogRootProps } from "reka-ui";
import { Dialog } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import Button from "../Button/Button.vue";

import { DialogTheme } from "./Dialog.theme.ts";
import type { DialogThemeSlots } from "./Dialog.theme.ts";

export interface DialogProps extends Pick<DialogRootProps, "open" | "defaultOpen"> {
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

  class?: any;
  ui?: DialogThemeSlots;
}

export interface DialogEmits {
  "update:open": [value: boolean];
}

export interface DialogSlots {
  default(props: { open: boolean }): any;
  body(props: { close: () => void }): any;
  footer(props: { close: () => void }): any;
}

const props = withDefaults(defineProps<DialogProps>(), {
  dismissible: true,
  portal: true,
});
const emits = defineEmits<DialogEmits>();
const slots = defineSlots<DialogSlots>();

const { icons } = useComponentIcons();
const { t } = useLocale();

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen"), emits);
const portalProps = usePortal(toRef(() => props.portal));

// eslint-disable-next-line vue/no-dupe-keys
const ui = DialogTheme();
</script>

<template>
  <Dialog.Root v-slot="{ open, close }" v-bind="rootProps" modal>
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
            <Button
              :icon="icons.close"
              color="neutral"
              variant="ghost"
              size="md"
              square
              :aria-label="t('dialog.close')"
              data-slot="close"
              :class="ui.close({ class: props.ui?.close })"
            />
          </Dialog.Close>
        </header>

        <div data-slot="body" :class="ui.body({ class: props.ui?.body })">
          <slot name="body" :close="close" />
        </div>

        <footer v-if="slots.footer" data-slot="footer" :class="ui.footer({ class: props.ui?.footer })">
          <slot name="footer" :close="close" />
        </footer>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
</template>
