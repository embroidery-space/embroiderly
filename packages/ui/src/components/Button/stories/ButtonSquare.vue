<script setup lang="ts">
import Button from "../Button.vue";
import type { ButtonProps } from "../Button.vue";

const sizes: NonNullable<ButtonProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="button-square">
    <template v-for="size in sizes" :key="size">
      <Button :size="size" square icon="lucide:rocket" />
    </template>
  </div>
</template>

<style>
#button-square {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}
</style>
