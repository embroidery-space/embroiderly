<script setup lang="ts">
import { AlertDialog } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import Button from "../Button/Button.vue";
import type { ButtonProps } from "../Button/Button.vue";

import { ConfirmDialogTheme } from "./ConfirmDialog.theme.ts";
import type { ConfirmDialogThemeSlots } from "./ConfirmDialog.theme.ts";

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

  class?: any;
  ui?: ConfirmDialogThemeSlots;
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

// oxlint-disable-next-line vue/no-dupe-keys
const ui = ConfirmDialogTheme();

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
      <AlertDialog.Overlay data-slot="overlay" :class="ui.overlay({ class: props.ui?.overlay })" />

      <AlertDialog.Content
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        @escape-key-down="close()"
        @after-enter="emit('after:enter')"
        @after-leave="emit('after:leave')"
      >
        <header data-slot="header" :class="ui.header({ class: props.ui?.header })">
          <AlertDialog.Title data-slot="title" :class="ui.title({ class: props.ui?.title })">
            {{ title }}
          </AlertDialog.Title>

          <AlertDialog.Description data-slot="description" :class="ui.description({ class: props.ui?.description })">
            {{ description }}
          </AlertDialog.Description>
        </header>

        <footer data-slot="footer" :class="ui.footer({ class: props.ui?.footer })">
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
