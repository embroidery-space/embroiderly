<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Tooltip from "../Tooltip.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="tooltip-demo">
    <Tooltip v-bind="$attrs">
      <Button label="Button" />
    </Tooltip>
  </div>
</template>

<style>
#tooltip-demo {
  display: inline-flex;
  padding: calc(var(--spacing) * 8);
}
</style>
