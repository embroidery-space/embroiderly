<script setup lang="ts" generic="T extends DropdownMenuItem">
import defu from "defu";
import type { DropdownMenuContentProps } from "reka-ui";
import { DropdownMenu } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";
import type { IconValue } from "../../types/icons.ts";

import { DropdownMenuTheme } from "./DropdownMenu.theme.ts";
import type { DropdownMenuThemeSlots, DropdownMenuThemeVariants } from "./DropdownMenu.theme.ts";
import DropdownMenuContent from "./DropdownMenuContent.vue";

export interface DropdownMenuItem {
  /** The type of the item. */
  type?: "separator" | "label" | "checkbox" | "link";

  /** The label to display. */
  label?: string;
  /** A description displayed below the label. */
  description?: string;

  /** An icon to display before the label. */
  icon?: IconValue;

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

  /** The URL for link items. Only used when `type` is `"link"`. */
  href?: string;
  /** The link target. Only used when `type` is `"link"`. */
  target?: "_self" | "_blank" | "_parent" | "_top" | (string & {});
  /** Overrides the auto-computed rel attribute. Only used when `type` is `"link"`. */
  rel?: string;

  /** Callback when the item is selected. Call `event.preventDefault()` to prevent the menu from closing. */
  onSelect?: (event: Event) => void;
  /** Callback when the checkbox checked state changes. Only used when `type` is `"checkbox"`. */
  onUpdateChecked?: (checked: boolean) => void;

  /** Additional CSS class(es) for the item. */
  class?: any;
}

export interface DropdownMenuProps<T extends DropdownMenuItem = DropdownMenuItem> {
  /** The items to display in the dropdown menu. */
  items?: T[] | T[][];

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
   * Reference element for the dropdown menu.
   * If provided, the dropdown will be anchored to this element instead of the trigger.
   */
  reference?: any;

  /**
   * Render the dropdown menu in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: DropdownMenuThemeSlots;
}

export interface DropdownMenuSlots {
  default(props: { open: boolean }): any;
}

const open = defineModel<boolean>("open", { default: false });
const props = withDefaults(defineProps<DropdownMenuProps<T>>(), {
  size: "md",
  portal: true,
});
defineSlots<DropdownMenuSlots>();

const portalProps = usePortal(toRef(() => props.portal));
const contentProps = computed(
  () =>
    defu(props.content, {
      side: "bottom",
      sideOffset: 8,
      collisionPadding: 8,
      reference: props.reference,
    }) as DropdownMenuContentProps,
);

const normalizedItems = computed<T[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) return props.items as T[][];
  return [props.items as T[]];
});

const ui = computed(() => DropdownMenuTheme({ size: props.size }));
</script>

<template>
  <DropdownMenu.Root v-model:open="open">
    <DropdownMenu.Trigger :disabled="disabled" as-child>
      <slot :open="open" />
    </DropdownMenu.Trigger>

    <DropdownMenu.Portal v-bind="portalProps">
      <DropdownMenuContent
        v-bind="contentProps"
        :items="normalizedItems"
        :size="size"
        :portal="portal"
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        :ui="ui"
      />
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
</template>
