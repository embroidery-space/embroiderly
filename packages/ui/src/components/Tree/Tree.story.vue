<script setup lang="ts">
import { logEvent } from "histoire/client";
import { reactive } from "vue";

import Tree from "./Tree.vue";
import type { TreeItem, TreeProps } from "./Tree.vue";

const sizes = ["sm", "md", "lg"] as const;

const items: TreeItem[] = [
  {
    label: "My Layers",
    value: "my-layer",
    children: [
      { label: "Full Stitches", value: "full" },
      { label: "Petite Stitches", value: "petite" },
      { label: "Half Stitches", value: "half" },
      { label: "Quarter Stitches", value: "Quarter" },
      { label: "Special Stitches", value: "special" },
      { label: "Back Stitches", value: "back" },
      { label: "Straight Stitches", value: "straight" },
      { label: "French Knots", value: "french-knot" },
      { label: "Bead", value: "bead" },
    ],
    defaultExpanded: true,
  },
  { label: "Reference Image", value: "reference-image" },
];

const state = reactive<TreeProps>({
  size: "md",
});

defineExpose({ state });
</script>

<template>
  <Story id="tree" group="data" title="Tree" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Tree
        v-bind="state"
        :items="items"
        @update:model-value="logEvent('update:model-value', { value: $event?.value })"
        @update:expanded="logEvent('update:expanded', { value: $event })"
      />

      <template #controls>
        <HstSelect v-model="state.size" title="Size" :options="sizes" />
        <HstCheckbox v-model="state.disabled" title="Disabled" />
      </template>
    </Variant>

    <Variant id="sizes" title="Sizes" auto-props-disabled>
      <div class="flex gap-4">
        <Tree v-for="size in sizes" :key="size" :items="items" :size="size" />
      </div>
    </Variant>
  </Story>
</template>
