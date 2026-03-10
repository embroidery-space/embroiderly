<script setup lang="ts" generic="T extends TabsItem">
import type { TabsRootProps } from "reka-ui";
import { Tabs } from "reka-ui/namespaced";
import { computed } from "vue";

import ScrollArea from "../ScrollArea/ScrollArea.vue";

import { TabsTheme } from "./Tabs.theme.ts";
import type { TabsThemeSlots, TabsThemeVariants } from "./Tabs.theme.ts";

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
   * The size of the tabs.
   * @default "md"
   */
  size?: TabsThemeVariants["size"];

  /**
   * The orientation of the tabs.
   * @default "horizontal"
   */
  orientation?: TabsThemeVariants["orientation"];

  /**
   * Whether to render tab content panels.
   * @default true
   */
  content?: boolean;

  class?: any;
  ui?: TabsThemeSlots;
}

export interface TabsSlots<T extends TabsItem = TabsItem> {
  "leading"(props: { item: T; index: number }): any;
  "default"(props: { item: T; index: number }): any;
  "trailing"(props: { item: T; index: number }): any;
  "content"(props: { item: T; index: number }): any;
  "list-leading"(props?: object): any;
  "list-trailing"(props?: object): any;
  [key: string]: (props: { item: T; index: number }) => any;
}

const modelValue = defineModel<string | number>();
const props = withDefaults(defineProps<TabsProps<T>>(), {
  defaultValue: "0",

  size: "md",
  orientation: "horizontal",

  content: true,

  unmountOnHide: true,
});
const slots = defineSlots<TabsSlots<T>>();

const ui = computed(() => {
  return TabsTheme({
    orientation: props.orientation,
    size: props.size,
  });
});
</script>

<template>
  <Tabs.Root
    v-model="modelValue"
    :default-value="defaultValue"
    :orientation="orientation"
    :activation-mode="activationMode"
    :unmount-on-hide="unmountOnHide"
    data-slot="root"
    :class="ui.root({ class: [props.ui?.root, props.class] })"
  >
    <div data-slot="wrapper" :class="ui.wrapper({ class: props.ui?.wrapper })">
      <slot name="list-leading" />

      <ScrollArea
        :orientation="orientation"
        :size="size"
        type="hover"
        data-slot="scroll"
        :class="ui.scroll({ class: props.ui?.scroll })"
      >
        <Tabs.List data-slot="list" :class="ui.list({ class: props.ui?.list })">
          <Tabs.Indicator data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" />

          <Tabs.Trigger
            v-for="(item, index) in items"
            :key="index"
            :value="item.value ?? String(index)"
            :disabled="item.disabled"
            data-slot="trigger"
            :class="ui.trigger({ class: props.ui?.trigger })"
          >
            <slot name="leading" :item="item" :index="index" />

            <span v-if="item.label || !!slots.default" data-slot="label" :class="ui.label({ class: props.ui?.label })">
              <slot :item="item" :index="index">{{ item.label }}</slot>
            </span>

            <slot name="trailing" :item="item" :index="index" />
          </Tabs.Trigger>
        </Tabs.List>
      </ScrollArea>

      <slot name="list-trailing" />
    </div>

    <template v-if="!!content">
      <Tabs.Content
        v-for="(item, index) in items"
        :key="index"
        :value="item.value ?? String(index)"
        data-slot="content"
        :class="ui.content({ class: props.ui?.content })"
      >
        <slot :name="(item.slot || 'content') as keyof TabsSlots" :item="item" :index="index">
          {{ item.content }}
        </slot>
      </Tabs.Content>
    </template>
  </Tabs.Root>
</template>
