<script lang="ts" setup>
import { Primitive } from "reka-ui";
import type { PrimitiveProps } from "reka-ui";

import { BlockUITheme } from "./BlockUI.theme.ts";
import type { BlockUIThemeSlots } from "./BlockUI.theme.ts";

export interface BlockUIProps extends PrimitiveProps {
  /** Whether the UI is blocked. */
  blocked?: boolean;

  class?: any;
  ui?: BlockUIThemeSlots;
}

export interface BlockUISlots {
  default(): any;
}

const props = withDefaults(defineProps<BlockUIProps>(), {
  blocked: false,
});
defineSlots<BlockUISlots>();

// eslint-disable-next-line vue/no-dupe-keys
const ui = BlockUITheme();
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :aria-busy="blocked"
    data-slot="base"
    :class="ui.base({ class: [props.ui?.base, props.class] })"
  >
    <slot />
    <div v-if="blocked" data-slot="mask" :class="ui.mask({ class: props.ui?.mask })" />
  </Primitive>
</template>
