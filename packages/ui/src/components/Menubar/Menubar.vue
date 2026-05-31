<script setup lang="ts" generic="T extends MenubarItem">
import defu from "defu";
import type { MenubarContentProps } from "reka-ui";
import { Menubar } from "reka-ui/namespaced";
import { computed, toRef } from "vue";

import { usePortal } from "../../composables/usePortal.ts";
import type { IconValue } from "../../types/icons.ts";
import Button from "../Button/Button.vue";

import { MenubarTheme } from "./Menubar.theme.ts";
import type { MenubarThemeSlots, MenubarThemeVariants } from "./Menubar.theme.ts";
import MenubarContent from "./MenubarContent.vue";

export interface MenubarItem {
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
  children?: MenubarItem[] | MenubarItem[][];

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

export interface MenubarMenu<T extends MenubarItem = MenubarItem> {
  /** The label displayed on the menu trigger. */
  label: string;
  /** The icon displayed on the menu trigger. */
  icon?: IconValue;
  /** Whether the menu trigger is disabled. */
  disabled?: boolean;
  /** Whether the menu trigger is hidden. */
  hidden?: boolean;
  /** The items to display in this menu's dropdown. */
  items: T[] | T[][];
}

export interface MenubarProps<T extends MenubarItem = MenubarItem> {
  /** The menus to display in the menubar. */
  menus?: MenubarMenu<T>[];

  /**
   * The content positioning props applied to all menu dropdowns.
   * @default { side: "bottom", sideOffset: 8, collisionPadding: 8 }
   */
  content?: Omit<MenubarContentProps, "as" | "asChild">;

  /**
   * The size of the menubar.
   * @default "md"
   */
  size?: MenubarThemeVariants["size"];

  /**
   * Render the menubar dropdowns in a portal.
   * @default true
   */
  portal?: boolean | string | HTMLElement;

  class?: any;
  ui?: MenubarThemeSlots;
}

const modelValue = defineModel<string>();
const props = withDefaults(defineProps<MenubarProps<T>>(), {
  size: "md",
  portal: true,
});

const portalProps = usePortal(toRef(() => props.portal));
const contentProps = computed(
  () =>
    defu(props.content, {
      side: "bottom",
      sideOffset: 8,
      collisionPadding: 8,
    }) as MenubarContentProps,
);

function normalizeItems(items: T[] | T[][]): T[][] {
  if (!items?.length) return [];
  if (Array.isArray(items[0])) return items as T[][];
  return [items as T[]];
}

const ui = computed(() => MenubarTheme({ size: props.size }));
</script>

<template>
  <Menubar.Root v-model="modelValue" data-slot="root" :class="ui.root({ class: [props.ui?.root, props.class] })">
    <Menubar.Menu v-for="(menu, index) in menus?.filter((menu) => !menu.hidden)" :key="index">
      <Menubar.Trigger as-child :disabled="menu.disabled">
        <Button
          color="neutral"
          variant="ghost"
          :label="menu.label"
          :icon="menu.icon"
          :size="size"
          data-slot="trigger"
          :class="ui.trigger({ class: props.ui?.trigger })"
        />
      </Menubar.Trigger>

      <Menubar.Portal v-bind="portalProps">
        <MenubarContent
          v-bind="contentProps"
          :items="normalizeItems(menu.items)"
          :size="size"
          :portal="portal"
          data-slot="content"
          :class="ui.content({ class: props.ui?.content })"
          :ui="ui"
        />
      </Menubar.Portal>
    </Menubar.Menu>
  </Menubar.Root>
</template>
