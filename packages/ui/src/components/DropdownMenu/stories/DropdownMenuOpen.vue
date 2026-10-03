<script setup lang="ts">
import Button from "../../Button/Button.vue";
import DropdownMenu from "../DropdownMenu.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="dropdown-menu-open">
    <DropdownMenu v-bind="$attrs">
      <Button icon="lucide:menu" label="Open menu" />
    </DropdownMenu>
  </div>
</template>

<style>
#dropdown-menu-open {
  width: calc(var(--spacing) * 96);
  height: calc(var(--spacing) * 96);
}
</style>
