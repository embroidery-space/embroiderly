<script setup lang="ts">
import BlockUI from "../BlockUI.vue";
import type { BlockUIProps } from "../BlockUI.vue";

defineProps<BlockUIProps>();
</script>

<template>
  <BlockUI id="block-ui" :blocked="blocked">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto nemo consequatur dolor. Officia aut perspiciatis
    iure accusamus dolor sit alias autem. Odio et aut qui consequatur, laboriosam hic porro at!
  </BlockUI>
</template>

<style>
#block-ui {
  padding: calc(var(--spacing) * 2);

  [data-slot="mask"] {
    border-radius: var(--radius-lg);
  }
}
</style>
