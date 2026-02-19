<script setup lang="ts">
import { reactivePick } from "@vueuse/core";
import defu from "defu";
import { useForwardPropsEmits } from "reka-ui";
import type { DropdownMenuContentProps, DropdownMenuRootEmits, DropdownMenuRootProps } from "reka-ui";
import { DropdownMenu } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";

import { DropdownMenuTheme } from "./DropdownMenu.theme.ts";
import type { DropdownMenuThemeSlots, DropdownMenuThemeVariants } from "./DropdownMenu.theme.ts";
import DropdownMenuContent from "./DropdownMenuContent.vue";

export interface DropdownMenuItem {
  /** The type of the item. */
  type?: "separator" | "label" | "checkbox";

  /** The label to display. */
  label?: string;
  /** A description displayed below the label. */
  description?: string;

  /** An icon to display before the label. */
  icon?: string;

  /** Whether the checkbox item is checked. Only used when `type` is `"checkbox"`. */
  checked?: boolean;
  /** Whether the item is disabled. */
  disabled?: boolean;
  /** Whether the item is in a loading state. */
  loading?: boolean;

  /** Submenu items. Creates a nested submenu when provided. */
  children?: DropdownMenuItem[] | DropdownMenuItem[][];

  /** Keyboard shortcut. */
  shortcut?: string;

  /** Callback when the item is selected. Call `event.preventDefault()` to prevent the menu from closing. */
  onSelect?: (event: Event) => void;
  /** Callback when the checkbox checked state changes. Only used when `type` is `"checkbox"`. */
  onUpdateChecked?: (checked: boolean) => void;

  /** Additional CSS class(es) for the item. */
  class?: any;
}

export interface DropdownMenuProps extends Pick<DropdownMenuRootProps, "open" | "defaultOpen" | "modal"> {
  /** The items to display in the dropdown menu. */
  items?: DropdownMenuItem[] | DropdownMenuItem[][];

  /**
   * The content positioning props.
   * @default { side: "bottom", sideOffset: 8, collisionPadding: 8 }
   */
  content?: Omit<DropdownMenuContentProps, "as" | "asChild">;

  /**
   * The size of the dropdown menu.
   * @default "md"
   */
  size?: DropdownMenuThemeVariants["size"];

  /** Whether the dropdown menu trigger is disabled. */
  disabled?: boolean;

  /**
   * Render the dropdown menu in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: DropdownMenuThemeSlots;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DropdownMenuEmits extends DropdownMenuRootEmits {}

const props = withDefaults(defineProps<DropdownMenuProps>(), {
  size: "md",
  portal: true,
});
const emits = defineEmits<DropdownMenuEmits>();

const rootProps = useForwardPropsEmits(reactivePick(props, "open", "defaultOpen", "modal"), emits);
const portalProps = usePortal(toRef(() => props.portal));
const contentProps = computed(
  () =>
    defu(props.content, {
      side: "bottom",
      sideOffset: 8,
      collisionPadding: 8,
    }) as DropdownMenuContentProps,
);

const normalizedItems = computed<DropdownMenuItem[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) return props.items as DropdownMenuItem[][];
  return [props.items as DropdownMenuItem[]];
});

const ui = computed(() => DropdownMenuTheme({ size: props.size }));
</script>

<template>
  <DropdownMenu.Root v-slot="{ open }" v-bind="rootProps">
    <DropdownMenu.Trigger :disabled="disabled" as-child>
      <slot :open="open" />
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal v-bind="portalProps">
      <DropdownMenuContent
        v-bind="contentProps"
        :items="normalizedItems"
        :size="size"
        :portal="portal"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        :ui="ui"
      />
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
</template>
