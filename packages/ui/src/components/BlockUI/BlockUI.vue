<template>
  <div :aria-busy="blocked" :class="ui.base({ class: [props.ui?.base, props.class] })">
    <slot />
    <div v-if="blocked" :class="ui.mask({ class: props.ui?.mask })" />
  </div>
</template>

<script lang="ts" setup>
  import { BlockUITheme } from "./BlockUI.theme.ts";
  import type { BlockUIThemeSlots } from "./BlockUI.theme.ts";

  export interface BlockUIProps {
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

  // eslint-disable-next-line vue/no-dupe-keys
  const ui = BlockUITheme();
</script>
