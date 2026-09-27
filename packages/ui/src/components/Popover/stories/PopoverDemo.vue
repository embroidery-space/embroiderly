<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Popover from "../Popover.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Popover v-bind="$attrs">
    <Button label="Open Popover" />
    <template #content>
      <Placeholder class="popover-demo-placeholder" />
    </template>
  </Popover>
</template>

<style>
.popover-demo-placeholder {
  display: inline-flex;
  width: calc(var(--spacing) * 48);
  height: calc(var(--spacing) * 48);
  margin: calc(var(--spacing) * 4);
}
</style>
