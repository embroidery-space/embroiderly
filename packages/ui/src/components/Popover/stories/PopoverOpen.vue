<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Popover from "../Popover.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="popover-open">
    <Popover v-bind="$attrs">
      <Button label="Open Popover" />
      <template #content>
        <Placeholder class="popover-open-placeholder" />
      </template>
    </Popover>
  </div>
</template>

<style>
#popover-open {
  min-width: calc(var(--spacing) * 64);
  min-height: calc(var(--spacing) * 64);
}

.popover-open-placeholder {
  display: inline-flex;

  width: calc(var(--spacing) * 48);
  height: calc(var(--spacing) * 48);
  margin: calc(var(--spacing) * 4);
}
</style>
