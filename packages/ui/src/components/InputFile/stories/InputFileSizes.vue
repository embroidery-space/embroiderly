<script setup lang="ts">
import InputFile from "../InputFile.vue";
import type { InputFileProps } from "../InputFile.vue";

const sizes: NonNullable<InputFileProps["size"]>[] = ["sm", "md", "lg"];
</script>

<template>
  <div id="input-file-sizes">
    <InputFile v-for="size in sizes" :key="size" :size="size" />
  </div>
</template>

<style>
#input-file-sizes {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 4);
}
</style>
