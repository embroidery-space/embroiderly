<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Popover from "../Popover.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="popover-outside-click">
    <Popover v-bind="$attrs">
      <Button label="Open Popover" />
      <template #content>Popover content</template>
    </Popover>
  </div>
</template>

<style>
#popover-outside-click {
  min-width: calc(var(--spacing) * 64);
  min-height: calc(var(--spacing) * 64);
}
</style>
