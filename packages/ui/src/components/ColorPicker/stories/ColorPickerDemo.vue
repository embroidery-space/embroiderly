<script setup lang="ts">
import ColorPicker from "../ColorPicker.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="color-picker-demo">
    <ColorPicker v-bind="$attrs" />
  </div>
</template>

<style>
#color-picker-demo {
  width: calc(var(--spacing) * 64);
}
</style>
