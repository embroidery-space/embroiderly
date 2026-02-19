<script setup lang="ts">
import { Menubar } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { usePortal } from "../../composables/usePortal.ts";
import { parseShortcutDisplay } from "../../utils/shortcut.ts";
import Icon from "../Icon/Icon.vue";
import Kbd from "../Kbd/Kbd.vue";

import type { MenubarTheme } from "./Menubar.theme.ts";
import type { MenubarItem } from "./Menubar.vue";

interface MenubarContentInternalProps {
  items: MenubarItem[][];

  size?: string;

  portal?: boolean | string | HTMLElement;
  sub?: boolean;

  alignOffset?: number;
  collisionPadding?: number | Partial<Record<"top" | "bottom" | "left" | "right", number>>;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;

  ui: ReturnType<typeof MenubarTheme>;
}

const props = withDefaults(defineProps<MenubarContentInternalProps>(), {
  sub: false,
});

const { icons } = useComponentIcons();

const portalProps = usePortal(toRef(() => props.portal ?? true));

function normalizeChildren(children: MenubarItem[] | MenubarItem[][]): MenubarItem[][] {
  if (!children?.length) return [];
  if (Array.isArray(children[0])) return children as MenubarItem[][];
  return [children as MenubarItem[]];
}
</script>

<template>
  <component
    :is="sub ? Menubar.SubContent : Menubar.Content"
    v-bind="sub ? { sideOffset: sideOffset ?? 0 } : { alignOffset, side, sideOffset }"
    :collision-padding="collisionPadding"
  >
    <template v-for="(group, groupIndex) in items" :key="`group-${groupIndex}`">
      <Menubar.Separator v-if="groupIndex > 0" data-slot="separator" :class="ui.separator()" />

      <Menubar.Group data-slot="group" :class="ui.group()">
        <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
          <Menubar.Separator
            v-if="item.type === 'separator'"
            data-slot="separator"
            :class="ui.separator({ class: item.class })"
          />

          <Menubar.Label v-else-if="item.type === 'label'" data-slot="label" :class="ui.label({ class: item.class })">
            {{ item.label }}
          </Menubar.Label>

          <Menubar.CheckboxItem
            v-else-if="item.type === 'checkbox'"
            :model-value="item.checked"
            :disabled="item.disabled"
            data-slot="item"
            :class="ui.item({ class: item.class })"
            @update:model-value="item.onUpdateChecked"
            @select="item.onSelect"
          >
            <span data-slot="itemLabel" :class="ui.itemLabel()">{{ item.label }}</span>
            <Menubar.ItemIndicator as-child>
              <Icon
                :name="icons.check"
                data-slot="itemTrailingIcon"
                :class="[ui.itemTrailing(), ui.itemTrailingIcon()]"
              />
            </Menubar.ItemIndicator>
          </Menubar.CheckboxItem>

          <Menubar.Sub v-else-if="item.children?.length">
            <Menubar.SubTrigger :disabled="item.disabled" data-slot="item" :class="ui.item({ class: item.class })">
              <Icon v-if="item.icon" :name="item.icon" data-slot="itemLeadingIcon" :class="ui.itemLeadingIcon()" />
              <span data-slot="itemLabel" :class="ui.itemLabel()">{{ item.label }}</span>
              <span data-slot="itemTrailing" :class="ui.itemTrailing()">
                <Icon :name="icons.chevronRight" data-slot="itemTrailingIcon" :class="ui.itemTrailingIcon()" />
              </span>
            </Menubar.SubTrigger>

            <Menubar.Portal v-bind="portalProps">
              <MenubarContent
                sub
                :items="normalizeChildren(item.children)"
                :ui="ui"
                :size="size"
                :portal="portal"
                :align-offset="-4"
                data-slot="content"
                :class="ui.content()"
              />
            </Menubar.Portal>
          </Menubar.Sub>

          <Menubar.Item
            v-else
            :disabled="item.disabled"
            data-slot="item"
            :class="ui.item({ class: item.class })"
            @select="item.onSelect"
          >
            <Icon
              v-if="item.loading"
              :name="icons.loading"
              data-slot="itemLeadingIcon"
              :class="[ui.itemLeadingIcon(), 'animate-spin']"
            />
            <Icon v-else-if="item.icon" :name="item.icon" data-slot="itemLeadingIcon" :class="ui.itemLeadingIcon()" />

            <span v-if="item.label || item.description" class="flex min-w-0 flex-1 flex-col">
              <span v-if="item.label" data-slot="itemLabel" :class="ui.itemLabel()">{{ item.label }}</span>
              <span v-if="item.description" data-slot="itemDescription" :class="ui.itemDescription()">{{
                item.description
              }}</span>
            </span>

            <span v-if="item.shortcut" data-slot="itemTrailing" :class="[ui.itemTrailing(), ui.itemKbd()]">
              <Kbd v-for="(key, i) in parseShortcutDisplay(item.shortcut)" :key="i" :value="key" size="sm" />
            </span>
          </Menubar.Item>
        </template>
      </Menubar.Group>
    </template>
  </component>
</template>
