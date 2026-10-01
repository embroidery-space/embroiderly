<script setup lang="ts">
import Button from "../Button.vue";
</script>

<template>
  <div id="button-links">
    <Button label="Internal Link" href="/about" />
    <Button label="External Link" href="https://example.com" target="_blank" />
    <Button label="Disabled Link" href="https://example.com" disabled />
  </div>
</template>

<style>
#button-links {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  align-items: center;
}
</style>
