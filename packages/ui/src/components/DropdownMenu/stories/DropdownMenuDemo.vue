<script setup lang="ts">
import Button from "../../Button/Button.vue";
import DropdownMenu from "../DropdownMenu.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <DropdownMenu v-bind="$attrs">
    <Button icon="lucide:menu" label="Open menu" />
  </DropdownMenu>
</template>
