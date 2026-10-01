<script setup lang="ts">
import Editable from "../Editable.vue";
</script>

<template>
  <div id="editable-states">
    <Editable default-value="Default" />
    <Editable default-value="Disabled" disabled />
  </div>
</template>

<style>
#editable-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>
