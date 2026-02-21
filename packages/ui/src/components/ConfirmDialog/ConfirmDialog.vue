<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import type { AlertDialogProps as AlertDialogRootProps } from "reka-ui";
import { AlertDialog } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import Button from "../Button/Button.vue";
import type { ButtonProps } from "../Button/Button.vue";

import { ConfirmDialogTheme } from "./ConfirmDialog.theme.ts";
import type { ConfirmDialogThemeSlots } from "./ConfirmDialog.theme.ts";

export interface ConfirmDialogProps extends Pick<AlertDialogRootProps, "open" | "defaultOpen"> {
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

  class?: any;
  ui?: ConfirmDialogThemeSlots;
}

export interface ConfirmDialogEmits {
  "update:open": [value: boolean];
  close: [value?: boolean];
  "after:enter": [];
  "after:leave": [];
}

export interface ConfirmDialogSlots {
  default(props: { open: boolean }): any;
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  portal: true,
});
const emits = defineEmits<ConfirmDialogEmits>();
defineSlots<ConfirmDialogSlots>();

const { messages } = useLocale();

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen"), emits);
const portalProps = usePortal(toRef(() => props.portal));

// eslint-disable-next-line vue/no-dupe-keys
const ui = ConfirmDialogTheme();

function onClose(value?: boolean) {
  emits("close", value);
}
</script>

<template>
  <AlertDialog.Root v-slot="{ open, close }" v-bind="rootProps">
    <AlertDialog.Trigger as-child>
      <slot :open="open" />
    </AlertDialog.Trigger>

    <AlertDialog.Portal v-bind="portalProps">
      <AlertDialog.Overlay data-slot="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <AlertDialog.Content
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        @escape-key-down="
          () => {
            onClose();
            close();
          }
        "
        @after-enter="emits('after:enter')"
        @after-leave="emits('after:leave')"
      >
        <header data-slot="header" :class="ui.header({ class: props.ui?.header })">
          <div>
            <AlertDialog.Title data-slot="title" :class="ui.title({ class: props.ui?.title })">
              {{ title }}
            </AlertDialog.Title>

            <AlertDialog.Description data-slot="description" :class="ui.description({ class: props.ui?.description })">
              {{ description }}
            </AlertDialog.Description>
          </div>
        </header>

        <footer data-slot="footer" :class="ui.footer({ class: props.ui?.footer })">
          <AlertDialog.Cancel as-child>
            <Button color="neutral" variant="outline" :label="messages.confirmDialog.cancel" @click="onClose()" />
          </AlertDialog.Cancel>

          <AlertDialog.Action v-if="props.noButton !== null" as-child>
            <Button
              color="neutral"
              variant="soft"
              :label="messages.confirmDialog.no"
              v-bind="props.noButton"
              @click="onClose(false)"
            />
          </AlertDialog.Action>

          <AlertDialog.Action v-if="props.yesButton !== null" as-child>
            <Button
              color="primary"
              variant="solid"
              :label="messages.confirmDialog.yes"
              v-bind="props.yesButton"
              @click="onClose(true)"
            />
          </AlertDialog.Action>
        </footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</template>
