<script setup lang="ts">
  import defu from "defu";
  import type { ContextMenuContentProps, ContextMenuRootProps } from "reka-ui";
  import { ContextMenu } from "reka-ui/namespaced";
  import { computed, toRef } from "vue";

  import { usePortal } from "../../composables/usePortal.ts";

  import { ContextMenuTheme } from "./ContextMenu.theme.ts";
  import type { ContextMenuThemeSlots, ContextMenuThemeVariants } from "./ContextMenu.theme.ts";
  import ContextMenuContent from "./ContextMenuContent.vue";

  export interface ContextMenuItem {
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
    children?: ContextMenuItem[] | ContextMenuItem[][];

    /** Callback when the item is selected. Call `event.preventDefault()` to prevent the menu from closing. */
    onSelect?: (event: Event) => void;
    /** Callback when the checkbox checked state changes. Only used when `type` is `"checkbox"`. */
    onUpdateChecked?: (checked: boolean) => void;

    /** Additional CSS class(es) for the item. */
    class?: any;
  }

  export interface ContextMenuProps extends Pick<ContextMenuRootProps, "modal"> {
    /** The items to display in the context menu. */
    items?: ContextMenuItem[] | ContextMenuItem[][];

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

  const props = withDefaults(defineProps<ContextMenuProps>(), {
    size: "md",
    portal: true,
  });
  const emits = defineEmits<ContextMenuEmits>();

  const portalProps = usePortal(toRef(() => props.portal));
  const contentProps = computed(
    () =>
      defu(props.content, {
        alignOffset: -4,
        collisionPadding: 4,
      }) as ContextMenuContentProps,
  );

  const normalizedItems = computed<ContextMenuItem[][]>(() => {
    if (!props.items?.length) return [];
    if (Array.isArray(props.items[0])) return props.items as ContextMenuItem[][];
    return [props.items as ContextMenuItem[]];
  });

  const ui = computed(() => ContextMenuTheme({ size: props.size }));
</script>

<template>
  <ContextMenu.Root :modal="modal" @update:open="emits('update:open', $event)">
    <ContextMenu.Trigger :disabled="disabled" as-child>
      <slot />
    </ContextMenu.Trigger>

    <ContextMenu.Portal v-bind="portalProps">
      <ContextMenuContent
        v-bind="contentProps"
        :items="normalizedItems"
        :size="size"
        :portal="portal"
        :class="ui.content({ class: [props.ui?.content, props.class] })"
        :ui="ui"
      />
    </ContextMenu.Portal>
  </ContextMenu.Root>
</template>
