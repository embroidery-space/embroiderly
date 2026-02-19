<script setup lang="ts">
import { DropdownMenu } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { usePortal } from "../../composables/usePortal.ts";
import { parseShortcutDisplay } from "../../utils/shortcut.ts";
import Icon from "../Icon/Icon.vue";
import Kbd from "../Kbd/Kbd.vue";

import type { DropdownMenuTheme } from "./DropdownMenu.theme.ts";
import type { DropdownMenuItem } from "./DropdownMenu.vue";

interface DropdownMenuContentInternalProps {
  items: DropdownMenuItem[][];

  size?: string;

  portal?: boolean | string | HTMLElement;
  sub?: boolean;

  alignOffset?: number;
  collisionPadding?: number | Partial<Record<"top" | "bottom" | "left" | "right", number>>;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;

  ui: ReturnType<typeof DropdownMenuTheme>;
}

const props = withDefaults(defineProps<DropdownMenuContentInternalProps>(), {
  sub: false,
});

const { icons } = useComponentIcons();

const portalProps = usePortal(toRef(() => props.portal ?? true));

function normalizeChildren(children: DropdownMenuItem[] | DropdownMenuItem[][]): DropdownMenuItem[][] {
  if (!children?.length) return [];
  if (Array.isArray(children[0])) return children as DropdownMenuItem[][];
  return [children as DropdownMenuItem[]];
}
</script>

<template>
  <component
    :is="sub ? DropdownMenu.SubContent : DropdownMenu.Content"
    v-bind="sub ? { sideOffset: sideOffset ?? 0 } : { alignOffset, side, sideOffset }"
    :collision-padding="collisionPadding"
  >
    <template v-for="(group, groupIndex) in items" :key="`group-${groupIndex}`">
      <DropdownMenu.Separator v-if="groupIndex > 0" :class="ui.separator()" />

      <DropdownMenu.Group :class="ui.group()">
        <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
          <DropdownMenu.Separator v-if="item.type === 'separator'" :class="ui.separator({ class: item.class })" />

          <DropdownMenu.Label v-else-if="item.type === 'label'" :class="ui.label({ class: item.class })">
            {{ item.label }}
          </DropdownMenu.Label>

          <DropdownMenu.CheckboxItem
            v-else-if="item.type === 'checkbox'"
            :model-value="item.checked"
            :disabled="item.disabled"
            :class="ui.item({ class: item.class })"
            @update:model-value="item.onUpdateChecked"
            @select="item.onSelect"
          >
            <span :class="ui.itemLabel()">{{ item.label }}</span>
            <DropdownMenu.ItemIndicator as-child>
              <Icon :name="icons.check" :class="[ui.itemTrailing(), ui.itemTrailingIcon()]" />
            </DropdownMenu.ItemIndicator>
          </DropdownMenu.CheckboxItem>

          <DropdownMenu.Sub v-else-if="item.children?.length">
            <DropdownMenu.SubTrigger :disabled="item.disabled" :class="ui.item({ class: item.class })">
              <Icon v-if="item.icon" :name="item.icon" :class="ui.itemLeadingIcon()" />
              <span :class="ui.itemLabel()">{{ item.label }}</span>
              <span :class="ui.itemTrailing()">
                <Icon :name="icons.chevronRight" :class="ui.itemTrailingIcon()" />
              </span>
            </DropdownMenu.SubTrigger>

            <DropdownMenu.Portal v-bind="portalProps">
              <DropdownMenuContent
                sub
                :items="normalizeChildren(item.children)"
                :ui="ui"
                :size="size"
                :portal="portal"
                :align-offset="-4"
                :class="ui.content()"
              />
            </DropdownMenu.Portal>
          </DropdownMenu.Sub>

          <DropdownMenu.Item
            v-else
            :disabled="item.disabled"
            :class="ui.item({ class: item.class })"
            @select="item.onSelect"
          >
            <Icon v-if="item.loading" :name="icons.loading" :class="[ui.itemLeadingIcon(), 'animate-spin']" />
            <Icon v-else-if="item.icon" :name="item.icon" :class="ui.itemLeadingIcon()" />

            <span v-if="item.label || item.description" class="flex min-w-0 flex-1 flex-col">
              <span v-if="item.label" :class="ui.itemLabel()">{{ item.label }}</span>
              <span v-if="item.description" :class="ui.itemDescription()">{{ item.description }}</span>
            </span>

            <span v-if="item.shortcut" :class="[ui.itemTrailing(), ui.itemKbd()]">
              <Kbd v-for="(key, i) in parseShortcutDisplay(item.shortcut)" :key="i" :value="key" size="sm" />
            </span>
          </DropdownMenu.Item>
        </template>
      </DropdownMenu.Group>
    </template>
  </component>
</template>
