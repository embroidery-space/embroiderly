<script setup lang="ts">
import Textarea from "../Textarea.vue";
import type { TextareaProps } from "../Textarea.vue";

const variants: NonNullable<TextareaProps["variant"]>[] = ["subtle", "outline"];
</script>

<template>
  <div id="textarea-variants">
    <template v-for="variant in variants" :key="variant">
      <Textarea :model-value="`Variant: ${variant}`" :variant="variant" />
    </template>
  </div>
</template>

<style>
#textarea-variants {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>
