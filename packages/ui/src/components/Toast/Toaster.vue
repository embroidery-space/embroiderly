<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { ToastPortal, ToastProvider, ToastViewport, useForwardProps } from "reka-ui";
import type { ToastProviderProps } from "reka-ui";
import { computed, toRef } from "vue";

import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import { useToast } from "../../composables/useToast.ts";

import Toast from "./Toast.vue";
import { ToasterTheme } from "./Toaster.theme.ts";
import type { ToasterThemeSlots } from "./Toaster.theme.ts";

export interface ToasterProps extends Pick<ToastProviderProps, "duration" | "label" | "swipeThreshold"> {
  /**
   * Render the toaster in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: ToasterThemeSlots;
}

export interface ToasterSlots {
  default(): any;
}

const props = withDefaults(defineProps<ToasterProps>(), {
  duration: 5000,
  portal: true,
});
defineSlots<ToasterSlots>();

const locale = useLocale();
const { toasts, remove } = useToast();

const providerProps = useForwardProps(reactivePick(props, "duration", "label", "swipeThreshold"));
const portalProps = usePortal(toRef(() => props.portal));

const ui = computed(() =>
  ToasterTheme({
    inline: props.portal === false,
  }),
);

function onUpdateOpen(value: boolean, id: string | number) {
  if (value) return;
  remove(id);
}
</script>

<template>
  <ToastProvider swipe-direction="right" v-bind="providerProps" :label="locale.messages.toast.notification">
    <slot />

    <Toast
      v-for="toast of toasts"
      :key="toast.id"
      v-bind="{
        title: toast.title,
        description: toast.description,
        color: toast.color,
        actions: toast.actions,
        duration: toast.duration,
        type: toast.type,
        open: toast.open,
      }"
      data-slot="base"
      :class="ui.base({ class: props.ui?.base })"
      @update:open="onUpdateOpen($event, toast.id)"
    />

    <ToastPortal v-bind="portalProps">
      <ToastViewport
        :label="locale.messages.toast.focus"
        data-slot="viewport"
        :class="ui.viewport({ class: [props.ui?.viewport, props.class] })"
      />
    </ToastPortal>
  </ToastProvider>
</template>
