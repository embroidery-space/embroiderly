<script setup lang="ts" generic="T extends TabsItem">
import type { TabsRootProps } from "reka-ui";
import { Tabs } from "reka-ui/namespaced";

export interface TabsItem {
  label?: string;
  value?: string | number;
  slot?: string;
  content?: string;
  disabled?: boolean;
}

export interface TabsProps<T extends TabsItem = TabsItem> extends Pick<
  TabsRootProps<string | number>,
  "defaultValue" | "activationMode" | "unmountOnHide"
> {
  /** The items to display as tabs. */
  items?: T[];

  /**
   * The orientation of the tabs.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The size of the tabs.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";

  /**
   * Whether to render tab content panels.
   * @default true
   */
  content?: boolean;
}

export interface TabsSlots<T extends TabsItem = TabsItem> {
  leading?(props: { item: T; index: number }): any;
  default?(props: { item: T; index: number }): any;
  trailing?(props: { item: T; index: number }): any;
  content?(props: { item: T; index: number }): any;
  "list-leading"?(props?: object): any;
  "list-trailing"?(props?: object): any;
  [key: string]: ((props: { item: T; index: number }) => any) | undefined;
}

const modelValue = defineModel<string | number>();
withDefaults(defineProps<TabsProps<T>>(), {
  defaultValue: "0",

  orientation: "horizontal",
  size: "md",

  content: true,

  unmountOnHide: true,
});
const slots = defineSlots<TabsSlots<T>>();
</script>

<template>
  <Tabs.Root
    v-model="modelValue"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation-mode="activationMode"
    :unmount-on-hide="unmountOnHide"
    data-slot="root"
    :class="[$style.root, $style[`orientation-${orientation}`], $style[`size-${size}`]]"
  >
    <div data-slot="wrapper" :class="$style.wrapper">
      <slot name="list-leading" />

      <div data-slot="scroll" :class="$style.scroll">
        <Tabs.List data-slot="list" :class="$style.list">
          <Tabs.Indicator v-if="items?.length" data-slot="indicator" :class="$style.indicator" />

          <Tabs.Trigger
            v-for="(item, index) in items"
            :key="index"
            :value="item.value ?? String(index)"
            :disabled="item.disabled"
            data-slot="trigger"
            :class="$style.trigger"
          >
            <slot name="leading" :item="item" :index="index" />

            <span v-if="item.label || !!slots.default" data-slot="label" :class="$style.label">
              <slot :item="item" :index="index">{{ item.label }}</slot>
            </span>

            <slot name="trailing" :item="item" :index="index" />
          </Tabs.Trigger>
        </Tabs.List>
      </div>

      <slot name="list-trailing" />
    </div>

    <template v-if="!!content">
      <Tabs.Content
        v-for="(item, index) in items"
        :key="index"
        :value="item.value ?? String(index)"
        data-slot="content"
        :class="$style.content"
      >
        <slot :name="(item.slot || 'content') as keyof TabsSlots" :item="item" :index="index">
          {{ item.content }}
        </slot>
      </Tabs.Content>
    </template>
  </Tabs.Root>
</template>

<style module>
.root {
  display: flex;
  gap: calc(var(--spacing) * 2);

  &.orientation-horizontal {
    flex-direction: column;
  }
}

.wrapper {
  display: inline-flex;
}

.scroll {
  overflow: auto;
  flex-grow: 1;
}

.list {
  position: relative;

  overflow: hidden;
  display: flex;
  align-items: center;

  width: 100%;
  min-width: fit-content;
  height: 100%;
  min-height: fit-content;
  padding: calc(var(--spacing) * 1);
  border-radius: var(--radius-lg);

  background-color: var(--background-color-accented);

  .orientation-vertical > * > * > & {
    flex-direction: column;
  }
}

.indicator {
  position: absolute;

  border-radius: var(--radius-md);

  background-color: var(--background-color-inverted);
  box-shadow: var(--shadow-xs);

  transition-timing-function: var(--default-transition-timing-function);
  transition-duration: 200ms;
  transition-property: translate, width, height;

  .orientation-horizontal > * > * > * > & {
    inset-block: calc(var(--spacing) * 1);
    left: 0;
    translate: var(--reka-tabs-indicator-position) 0;
    width: var(--reka-tabs-indicator-size);
  }

  .orientation-vertical > * > * > * > & {
    inset-inline: calc(var(--spacing) * 1);
    top: 0;
    translate: 0 var(--reka-tabs-indicator-position);
    height: var(--reka-tabs-indicator-size);
  }
}

.trigger {
  cursor: pointer;

  position: relative;

  display: inline-flex;
  flex-shrink: 0;
  gap: calc(var(--spacing) * 1.5);
  align-items: center;

  border-radius: var(--radius-md);

  font-weight: var(--font-weight-medium);
  color: var(--text-color-muted);

  &:focus-visible {
    outline: 2px solid var(--border-color-inverted);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 75%;
  }

  &[data-state="active"] {
    color: var(--text-color-inverted);
  }

  .orientation-vertical > * > * > * > & {
    width: 100%;
  }

  .size-sm > * > * > * > & {
    padding-block: calc(var(--spacing) * 1);
    padding-inline: calc(var(--spacing) * 2);
    font-size: var(--text-xs);
    line-height: var(--text-xs--line-height);
  }

  .size-md > * > * > * > & {
    padding-block: calc(var(--spacing) * 1.5);
    padding-inline: calc(var(--spacing) * 2.5);
    font-size: var(--text-sm);
    line-height: var(--text-sm--line-height);
  }

  .size-lg > * > * > * > & {
    padding-block: calc(var(--spacing) * 2);
    padding-inline: calc(var(--spacing) * 3);
    font-size: var(--text-base);
    line-height: var(--text-base--line-height);
  }
}

.label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.content {
  width: 100%;

  &:focus-visible {
    outline-style: none;
  }
}
</style>
