<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { ToastPortal, ToastProvider, ToastViewport, useForwardProps } from "reka-ui";
import type { ToastProviderProps } from "reka-ui";
import { toRef } from "vue";

import { useLocale } from "../../composables/useLocale.ts";
import { usePortal } from "../../composables/usePortal.ts";
import { useToast } from "../../composables/useToast.ts";

import Toast from "./Toast.vue";

export interface ToasterProps extends Pick<ToastProviderProps, "duration" | "label" | "swipeThreshold"> {
  /**
   * Render the toaster in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;
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
      :class="$style.base"
      @update:open="onUpdateOpen($event, toast.id)"
    />

    <ToastPortal v-bind="portalProps">
      <ToastViewport
        :label="locale.messages.toast.focus"
        data-slot="viewport"
        :class="[$style.viewport, { [$style.inline]: portal === false }]"
      />
    </ToastPortal>
  </ToastProvider>
</template>

<style module>
.base {
  pointer-events: auto;

  &[data-state="closed"] {
    animation: global(slide-out-right) 200ms ease-in;
  }

  &[data-state="open"] {
    animation: global(slide-in-right) 200ms ease-out;
  }

  &[data-swipe="cancel"] {
    translate: 0 0;

    transition-timing-function: var(--default-transition-timing-function);
    transition-duration: var(--default-transition-duration);
    transition-property: transform, translate, scale, rotate;
  }

  &[data-swipe="end"] {
    animation: global(slide-out-right) 100ms ease-out;
  }

  &[data-swipe="move"] {
    translate: var(--reka-toast-swipe-move-x) 0;
  }
}

.viewport {
  position: fixed;
  z-index: 100;
  right: calc(var(--spacing) * 4);
  bottom: calc(var(--spacing) * 4);

  display: flex;
  flex-direction: column-reverse;
  gap: calc(var(--spacing) * 4);

  width: calc(100% - 2rem);

  outline-style: none;

  &.inline {
    position: static;

    width: auto;

    @media (width >= 40rem) {
      width: calc(var(--spacing) * 96);
    }
  }

  @media (width >= 40rem) {
    width: calc(var(--spacing) * 96);
  }
}
</style>
