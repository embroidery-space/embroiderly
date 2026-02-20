<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import { useForwardPropsEmits } from "reka-ui";
import type { ToastRootEmits, ToastRootProps } from "reka-ui";
import { Toast } from "reka-ui/namespaced";
import { computed } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { useLocale } from "../../composables/useLocale.ts";
import Button from "../Button/Button.vue";
import type { ButtonProps } from "../Button/Button.vue";
import Progress from "../Progress/Progress.vue";

import { ToastTheme } from "./Toast.theme.ts";
import type { ToastThemeSlots, ToastThemeVariants } from "./Toast.theme.ts";

export interface ToastProps extends Pick<ToastRootProps, "as" | "defaultOpen" | "open" | "type" | "duration"> {
  title?: string;
  description?: string;

  /**
   * The color of the toast.
   * @default "primary"
   */
  color?: ToastThemeVariants["color"];

  /** Display a list of action buttons under the title and description. */
  actions?: ButtonProps[];

  class?: any;
  ui?: ToastThemeSlots;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToastEmits extends ToastRootEmits {}

export interface ToastSlots {
  title(): any;
  description(): any;
  actions(): any;
  close(): any;
}

const props = withDefaults(defineProps<ToastProps>(), {
  color: "primary",
});
const emits = defineEmits<ToastEmits>();
const slots = defineSlots<ToastSlots>();

const { icons } = useComponentIcons();
const { t } = useLocale();

const rootProps = useForwardPropsEmits(reactivePick(props, "as", "defaultOpen", "open", "duration", "type"), emits);

const ui = computed(() => {
  return ToastTheme({
    color: props.color,
    title: !!props.title || !!slots.title,
  });
});
</script>

<template>
  <Toast.Root
    v-slot="{ remaining, duration: totalDuration }"
    v-bind="rootProps"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <div data-slot="wrapper" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <Toast.Title v-if="title || !!slots.title" data-slot="title" :class="ui.title({ class: props.ui?.title })">
        <slot name="title">
          {{ title }}
        </slot>
      </Toast.Title>

      <Toast.Description
        v-if="description || !!slots.description"
        data-slot="description"
        :class="ui.description({ class: props.ui?.description })"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </Toast.Description>

      <div
        v-if="actions?.length || !!slots.actions"
        data-slot="actions"
        :class="ui.actions({ class: props.ui?.actions })"
      >
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
          :aria-label="t('toast.close')"
          data-slot="close"
          :class="ui.close({ class: props.ui?.close })"
          @click.stop
        />
      </slot>
    </Toast.Close>

    <Progress
      v-if="remaining > 0 && totalDuration"
      :model-value="(remaining / totalDuration) * 100"
      :color="color"
      size="sm"
      data-slot="progress"
      :class="ui.progress({ class: props.ui?.progress })"
    />
  </Toast.Root>
</template>
