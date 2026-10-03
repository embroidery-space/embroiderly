<script setup lang="ts">
import { ContextMenu } from "reka-ui/namespaced";

import { useComponentIcons } from "../../composables/useComponentIcons.ts";
import { getLinkRel, isExternalHref } from "../../utils/link.ts";
import { parseShortcutDisplay } from "../../utils/shortcut.ts";
import Icon from "../Icon/Icon.vue";
import Kbd from "../Kbd/Kbd.vue";

import type { ContextMenuItem } from "./ContextMenu.vue";

interface ContextMenuContentInternalProps {
  items: ContextMenuItem[][];

  size: string;

  sub?: boolean;

  alignOffset?: number;
  collisionPadding?: number | Partial<Record<"top" | "bottom" | "left" | "right", number>>;
  sideOffset?: number;
}

withDefaults(defineProps<ContextMenuContentInternalProps>(), {
  sub: false,
});

const { icons } = useComponentIcons();

function normalizeChildren(children: ContextMenuItem[] | ContextMenuItem[][]): ContextMenuItem[][] {
  if (!children?.length) return [];
  if (Array.isArray(children[0])) return children as ContextMenuItem[][];
  return [children as ContextMenuItem[]];
}
</script>

<template>
  <component
    :is="sub ? ContextMenu.SubContent : ContextMenu.Content"
    :align-offset="sub ? undefined : alignOffset"
    :collision-padding="collisionPadding"
    :side-offset="sub ? (sideOffset ?? 0) : undefined"
    :class="[$style.content, $style[`size-${size}`]]"
  >
    <ContextMenu.Group
      v-for="(group, groupIndex) in items"
      :key="`group-${groupIndex}`"
      data-slot="group"
      :class="$style.group"
    >
      <template v-for="(item, index) in group" :key="`group-${groupIndex}-${index}`">
        <ContextMenu.Separator
          v-if="item.type === 'separator'"
          data-slot="separator"
          :class="[$style.separator, item.class]"
        />

        <ContextMenu.Label v-else-if="item.type === 'label'" data-slot="label" :class="[$style.label, item.class]">
          {{ item.label }}
        </ContextMenu.Label>

        <ContextMenu.CheckboxItem
          v-else-if="item.type === 'checkbox'"
          :model-value="item.checked"
          :disabled="item.disabled"
          data-slot="item"
          :class="[$style.item, item.class]"
          @update:model-value="item.onUpdateChecked"
          @select="item.onSelect"
        >
          <span data-slot="item-label" :class="$style.itemLabel">{{ item.label }}</span>
          <ContextMenu.ItemIndicator as-child>
            <Icon
              :name="icons.check"
              data-slot="item-trailing-icon"
              :class="[$style.itemTrailing, $style.itemTrailingIcon]"
            />
          </ContextMenu.ItemIndicator>
        </ContextMenu.CheckboxItem>

        <ContextMenu.Item
          v-else-if="item.type === 'link'"
          as-child
          :disabled="item.disabled"
          :class="[$style.item, item.class]"
          @select="item.onSelect"
        >
          <a :href="item.href" :target="item.target" :rel="getLinkRel(item)" data-slot="item">
            <Icon v-if="item.icon" :name="item.icon" data-slot="item-leading-icon" :class="$style.itemLeadingIcon" />

            <span v-if="item.label || item.description" data-slot="item-body" :class="$style.itemBody">
              <span v-if="item.label" data-slot="item-label" :class="$style.itemLabel">{{ item.label }}</span>
              <span v-if="item.description" data-slot="item-description" :class="$style.itemDescription">
                {{ item.description }}
              </span>
            </span>

            <span v-if="isExternalHref(item.href)" data-slot="item-trailing" :class="$style.itemTrailing">
              <Icon :name="icons.external" data-slot="item-trailing-icon" :class="$style.itemTrailingIcon" />
            </span>
          </a>
        </ContextMenu.Item>

        <ContextMenu.Sub v-else-if="item.children?.length">
          <ContextMenu.SubTrigger :disabled="item.disabled" data-slot="item" :class="[$style.item, item.class]">
            <Icon v-if="item.icon" :name="item.icon" data-slot="item-leading-icon" :class="$style.itemLeadingIcon" />
            <span data-slot="item-label" :class="$style.itemLabel">{{ item.label }}</span>
            <span data-slot="item-trailing" :class="$style.itemTrailing">
              <Icon :name="icons.chevronRight" data-slot="item-trailing-icon" :class="$style.itemTrailingIcon" />
            </span>
          </ContextMenu.SubTrigger>

          <ContextMenuContent
            sub
            :items="normalizeChildren(item.children)"
            :size="size"
            :align-offset="-4"
            data-slot="content"
          />
        </ContextMenu.Sub>

        <ContextMenu.Item
          v-else
          :disabled="item.disabled"
          data-slot="item"
          :class="[$style.item, item.class]"
          @select="item.onSelect"
        >
          <Icon
            v-if="item.loading"
            :name="icons.loading"
            data-slot="item-leading-icon"
            :class="[$style.itemLeadingIcon, $style.loading]"
          />
          <Icon v-else-if="item.icon" :name="item.icon" data-slot="item-leading-icon" :class="$style.itemLeadingIcon" />

          <span v-if="item.label || item.description" data-slot="item-body" :class="$style.itemBody">
            <span v-if="item.label" data-slot="item-label" :class="$style.itemLabel">
              {{ item.label }}
            </span>
            <span v-if="item.description" data-slot="item-description" :class="$style.itemDescription">
              {{ item.description }}
            </span>
          </span>

          <span v-if="item.shortcut" data-slot="item-kbd" :class="$style.itemKbd">
            <Kbd v-for="(key, i) in parseShortcutDisplay(item.shortcut)" :key="i" :value="key" size="sm" />
          </span>
        </ContextMenu.Item>
      </template>
    </ContextMenu.Group>
  </component>
</template>

<style module>
.content {
  pointer-events: auto;

  transform-origin: var(--reka-context-menu-content-transform-origin);

  overflow: hidden;

  min-width: calc(var(--spacing) * 32);
  border-radius: var(--radius-md);

  background-color: var(--background-color-default);
  box-shadow:
    0 0 0 1px var(--border-color-default),
    var(--shadow-lg);

  &:focus {
    outline-style: none;
  }

  &[data-state="closed"] {
    animation: global(scale-out) 100ms ease-in;
  }

  &[data-state="open"] {
    animation: global(scale-in) 100ms ease-out;
  }

  & > :not(:last-child) {
    border-bottom: 1px solid var(--border-color-default);
  }
}

.group {
  isolation: isolate;

  padding: calc(var(--spacing) * 1);
}

.separator {
  height: 1px;
  margin-block: calc(var(--spacing) * 1);
  margin-inline: calc(var(--spacing) * -1);

  background-color: var(--border-color-default);
}

.label {
  display: flex;
  align-items: center;

  width: 100%;

  font-weight: 600;

  .size-sm & {
    gap: calc(var(--spacing) * 1);

    padding: calc(var(--spacing) * 1);

    font-size: var(--text-xs);
  }

  .size-md & {
    gap: calc(var(--spacing) * 1.5);

    padding: calc(var(--spacing) * 1.5);

    font-size: var(--text-sm);
  }

  .size-lg & {
    gap: calc(var(--spacing) * 2);

    padding: calc(var(--spacing) * 2);

    font-size: var(--text-sm);
  }
}

.item {
  cursor: pointer;
  user-select: none;

  position: relative;

  display: flex;
  align-items: center;

  width: 100%;
  border-radius: var(--radius-sm);

  color: var(--text-color-default);

  outline-style: none;

  &::before {
    content: "";

    position: absolute;
    z-index: -1;
    inset: 1px;

    border-radius: var(--radius-md);
  }

  &[data-disabled] {
    cursor: not-allowed;

    opacity: 75%;
  }

  &[data-highlighted]::before {
    background-color: color-mix(in oklab, var(--background-color-elevated) 50%, transparent);
  }

  .size-sm & {
    gap: calc(var(--spacing) * 1);

    padding: calc(var(--spacing) * 1);

    font-size: var(--text-xs);
  }

  .size-md & {
    gap: calc(var(--spacing) * 1.5);

    padding: calc(var(--spacing) * 1.5);

    font-size: var(--text-sm);
  }

  .size-lg & {
    gap: calc(var(--spacing) * 2);

    padding: calc(var(--spacing) * 2);

    font-size: var(--text-sm);
  }
}

.item-leading-icon {
  flex-shrink: 0;

  color: var(--text-color-dimmed);

  .size-sm & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-md &,
  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }

  .item[data-highlighted] & {
    color: var(--text-color-default);
  }

  &.loading {
    animation: var(--animate-spin);
  }
}

.item-body {
  display: flex;
  flex: 1;
  flex-direction: column;

  min-width: 0;
}

.item-label {
  overflow: hidden;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-description {
  overflow: hidden;

  color: var(--text-color-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-trailing {
  display: inline-flex;
  align-items: center;

  margin-inline-start: auto;
}

.item-trailing-icon {
  flex-shrink: 0;

  .size-sm & {
    width: calc(var(--spacing) * 4);
    height: calc(var(--spacing) * 4);
  }

  .size-md &,
  .size-lg & {
    width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
  }
}

.item-kbd {
  display: none;
  gap: calc(var(--spacing) * 0.5);
  align-items: center;

  margin-inline-start: auto;

  @media (width >= 64rem) {
    display: inline-flex;
  }
}
</style>
