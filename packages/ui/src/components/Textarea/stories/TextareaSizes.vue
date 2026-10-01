<script setup lang="ts">
import Textarea from "../Textarea.vue";
import type { TextareaProps } from "../Textarea.vue";

const sizes: NonNullable<TextareaProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="textarea-sizes">
    <template v-for="size in sizes" :key="size">
      <Textarea :size="size" :model-value="`Size: ${size}`" />
    </template>
  </div>
</template>

<style>
#textarea-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>
