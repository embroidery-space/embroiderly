<script setup lang="ts">
import { DropdownMenu } from "reka-ui/namespaced";
import { toRef } from "vue";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { usePortal } from "../../composables/usePortal.ts";
import { getLinkRel, isExternalHref } from "../../utils/link.ts";
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

  align?: "start" | "center" | "end";
  alignOffset?: number;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
  collisionPadding?: number | Partial<Record<"top" | "bottom" | "left" | "right", number>>;

  reference?: any;

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
    v-bind="sub ? { sideOffset: sideOffset ?? 0 } : { align, alignOffset, side, sideOffset }"
    :collision-padding="collisionPadding"
    :reference="reference"
  >
    <DropdownMenu.Group
      v-for="(group, groupIndex) in items"
      :key="`group-${groupIndex}`"
      data-slot="group"
      :class="ui.group()"
    >
      <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
        <DropdownMenu.Separator
          v-if="item.type === 'separator'"
          data-slot="separator"
          :class="ui.separator({ class: item.class })"
        />

        <DropdownMenu.Label
          v-else-if="item.type === 'label'"
          data-slot="label"
          :class="ui.label({ class: item.class })"
        >
          {{ item.label }}
        </DropdownMenu.Label>

        <DropdownMenu.CheckboxItem
          v-else-if="item.type === 'checkbox'"
          :model-value="item.checked"
          :disabled="item.disabled"
          data-slot="item"
          :class="ui.item({ class: item.class })"
          @update:model-value="item.onUpdateChecked"
          @select="item.onSelect"
        >
          <span data-slot="itemLabel" :class="ui.itemLabel()">{{ item.label }}</span>
          <DropdownMenu.ItemIndicator as-child>
            <Icon
              :name="icons.check"
              data-slot="itemTrailingIcon"
              :class="[ui.itemTrailing(), ui.itemTrailingIcon()]"
            />
          </DropdownMenu.ItemIndicator>
        </DropdownMenu.CheckboxItem>

        <DropdownMenu.Item
          v-else-if="item.type === 'link'"
          as-child
          :disabled="item.disabled"
          :class="ui.item({ class: item.class })"
          @select="item.onSelect"
        >
          <a :href="item.href" :target="item.target" :rel="getLinkRel(item)" data-slot="item">
            <Icon v-if="item.icon" :name="item.icon" data-slot="itemLeadingIcon" :class="ui.itemLeadingIcon()" />

            <span v-if="item.label || item.description" data-slot="itemBody" :class="ui.itemBody()">
              <span v-if="item.label" data-slot="itemLabel" :class="ui.itemLabel()">{{ item.label }}</span>
              <span v-if="item.description" data-slot="itemDescription" :class="ui.itemDescription()">
                {{ item.description }}
              </span>
            </span>

            <span v-if="isExternalHref(item.href)" data-slot="itemTrailing" :class="ui.itemTrailing()">
              <Icon :name="icons.external" data-slot="itemTrailingIcon" :class="ui.itemTrailingIcon()" />
            </span>
          </a>
        </DropdownMenu.Item>

        <DropdownMenu.Sub v-else-if="item.children?.length">
          <DropdownMenu.SubTrigger :disabled="item.disabled" data-slot="item" :class="ui.item({ class: item.class })">
            <Icon v-if="item.icon" :name="item.icon" data-slot="itemLeadingIcon" :class="ui.itemLeadingIcon()" />
            <span data-slot="itemLabel" :class="ui.itemLabel()">{{ item.label }}</span>
            <span data-slot="itemTrailing" :class="ui.itemTrailing()">
              <Icon :name="icons.chevronRight" data-slot="itemTrailingIcon" :class="ui.itemTrailingIcon()" />
            </span>
          </DropdownMenu.SubTrigger>

          <DropdownMenu.Portal v-bind="portalProps">
            <DropdownMenuContent
              sub
              :items="normalizeChildren(item.children)"
              :ui="ui"
              :size="size"
              :portal="portal"
              :side-offset="sideOffset"
              :align-offset="-4"
              data-slot="content"
              :class="ui.content()"
            />
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>

        <DropdownMenu.Item
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

          <span v-if="item.label || item.description" data-slot="itemBody" :class="ui.itemBody()">
            <span v-if="item.label" data-slot="itemLabel" :class="ui.itemLabel()">
              {{ item.label }}
            </span>
            <span v-if="item.description" data-slot="itemDescription" :class="ui.itemDescription()">
              {{ item.description }}
            </span>
          </span>

          <span v-if="item.shortcut" data-slot="itemTrailing" :class="[ui.itemTrailing(), ui.itemKbd()]">
            <Kbd v-for="(key, i) in parseShortcutDisplay(item.shortcut)" :key="i" :value="key" size="sm" />
          </span>
        </DropdownMenu.Item>
      </template>
    </DropdownMenu.Group>
  </component>
</template>
