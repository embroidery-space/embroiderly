<script setup lang="ts">
import type { TabsRootProps } from "reka-ui";
import { Tabs } from "reka-ui/namespaced";
import { computed } from "vue";

import { get } from "../../utils/object.ts";

import { TabsTheme } from "./Tabs.theme.ts";
import type { TabsThemeSlots, TabsThemeVariants } from "./Tabs.theme.ts";

export interface TabsItem {
  label?: string;
  value?: string | number;
  slot?: string;
  content?: string;
  disabled?: boolean;
}

export interface TabsProps extends Pick<
  TabsRootProps<string | number>,
  "defaultValue" | "activationMode" | "unmountOnHide"
> {
  /** The items to display as tabs. */
  items?: TabsItem[];

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

export interface TabsSlots {
  "leading"(props: { item: TabsItem; index: number }): any;
  "default"(props: { item: TabsItem; index: number }): any;
  "trailing"(props: { item: TabsItem; index: number }): any;
  "content"(props: { item: TabsItem; index: number }): any;
  "list-leading"(props?: object): any;
  "list-trailing"(props?: object): any;
  [key: string]: (props: { item: TabsItem; index: number }) => any;
}

const modelValue = defineModel<string | number>();
const props = withDefaults(defineProps<TabsProps>(), {
  defaultValue: "0",

  size: "md",
  orientation: "horizontal",

  content: true,

  unmountOnHide: true,
});
const slots = defineSlots<TabsSlots>();

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
    <Tabs.List data-slot="list" :class="ui.list({ class: props.ui?.list })">
      <Tabs.Indicator data-slot="indicator" :class="ui.indicator({ class: props.ui?.indicator })" />

      <slot name="list-leading" />

      <Tabs.Trigger
        v-for="(item, index) in items"
        :key="index"
        :value="get(item, 'value') ?? String(index)"
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

      <slot name="list-trailing" />
    </Tabs.List>

    <template v-if="!!content">
      <Tabs.Content
        v-for="(item, index) in items"
        :key="index"
        :value="get(item, 'value') ?? String(index)"
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
