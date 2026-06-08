<script setup lang="ts" generic="T extends ContextMenuItem">
import defu from "defu";
import type { ContextMenuContentProps } from "reka-ui";
import { ContextMenu } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";
import { useShortcuts, extractShortcuts } from "../../composables/useShortcuts.ts";
import type { IconValue } from "../../types/icons.ts";

import { ContextMenuTheme } from "./ContextMenu.theme.ts";
import type { ContextMenuThemeSlots, ContextMenuThemeVariants } from "./ContextMenu.theme.ts";
import ContextMenuContent from "./ContextMenuContent.vue";

export interface ContextMenuItem {
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
  children?: ContextMenuItem[] | ContextMenuItem[][];

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

export interface ContextMenuProps<T extends ContextMenuItem = ContextMenuItem> {
  /** The items to display in the context menu. */
  items?: T[] | T[][];

  /**
   * The content positioning props.
   * @default { alignOffset: -4, collisionPadding: 4 }
   */
  content?: Omit<ContextMenuContentProps, "as" | "asChild">;

  /**
   * The size of the context menu.
   * @default "md"
   */
  size?: ContextMenuThemeVariants["size"];

  /** Whether the context menu trigger is disabled. */
  disabled?: boolean;

  /** Whether the context menu should block interaction with the outside elements. */
  modal?: boolean;

  /**
   * Render the context menu in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: ContextMenuThemeSlots;
}

export interface ContextMenuEmits {
  "update:open": [value: boolean];
}

export interface ContextMenuSlots {
  default(): any;
}

const props = withDefaults(defineProps<ContextMenuProps<T>>(), {
  size: "md",
  portal: true,
});
const emit = defineEmits<ContextMenuEmits>();
defineSlots<ContextMenuSlots>();

const portalProps = usePortal(toRef(() => props.portal));
const contentProps = computed(
  () =>
    defu(props.content, {
      alignOffset: -4,
      collisionPadding: 4,
    }) as ContextMenuContentProps,
);

const normalizedItems = computed<T[][]>(() => {
  if (!props.items?.length) return [];
  if (Array.isArray(props.items[0])) return props.items as T[][];
  return [props.items as T[]];
});
useShortcuts(extractShortcuts(normalizedItems));

const ui = computed(() => ContextMenuTheme({ size: props.size }));
</script>

<template>
  <ContextMenu.Root :modal="modal" @update:open="emit('update:open', $event)">
    <ContextMenu.Trigger :disabled="disabled" as-child>
      <slot />
    </ContextMenu.Trigger>

    <ContextMenu.Portal v-bind="portalProps">
      <ContextMenuContent
        v-bind="contentProps"
        :items="normalizedItems"
        :size="size"
        :portal="portal"
        data-slot="content"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        :ui="ui"
      />
    </ContextMenu.Portal>
  </ContextMenu.Root>
</template>
