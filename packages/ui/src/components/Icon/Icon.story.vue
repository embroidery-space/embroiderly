<script setup lang="ts">
import { reactive } from "vue";

import Icon from "./Icon.vue";
import type { IconProps } from "./Icon.vue";

const state = reactive<IconProps>({
  name: "lucide:lightbulb",
});

defineExpose({ state });
</script>

<template>
  <Story id="icon" group="element" title="Icon" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Icon v-bind="state" />

      <template #controls>
        <HstText v-model="state.name" title="Name" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex items-end gap-4">
        <Icon name="lucide:rocket" class="size-4" />
        <Icon name="lucide:rocket" class="size-6" />
        <Icon name="lucide:rocket" class="size-8" />
        <Icon name="lucide:rocket" class="size-12" />
        <Icon name="lucide:rocket" class="size-16" />
      </div>
    </Variant>
  </Story>
</template>
