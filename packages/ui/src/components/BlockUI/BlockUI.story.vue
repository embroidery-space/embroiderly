<script setup lang="ts">
  import { reactive } from "vue";

  import type { BlockUIProps } from "./BlockUI.vue";
  import BlockUI from "./BlockUI.vue";

  const state = reactive<BlockUIProps>({
    blocked: false,
  });

  defineExpose({ state });
</script>

<template>
  <Story id="block-ui" group="overlay" title="BlockUI" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <BlockUI v-bind="state" :ui="{ mask: 'rounded-lg' }">
        <div class="rounded-lg bg-inverted p-2 text-inverted">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Architecto nemo consequatur dolor. Officia aut
          perspiciatis iure accusamus dolor sit alias autem. Odio et aut qui consequatur, laboriosam hic porro at!
        </div>
      </BlockUI>

      <template #controls>
        <HstCheckbox v-model="state.blocked" title="Blocked" />
      </template>
    </Variant>
  </Story>
</template>
