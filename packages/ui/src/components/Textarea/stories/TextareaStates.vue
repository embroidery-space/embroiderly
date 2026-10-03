<script setup lang="ts">
import Textarea from "../Textarea.vue";
</script>

<template>
  <div id="textarea-states">
    <Textarea model-value="Default" />
    <Textarea model-value="Disabled" disabled />
  </div>
</template>

<style>
#textarea-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>
