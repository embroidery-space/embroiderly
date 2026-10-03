<script setup lang="ts">
import Listbox from "../Listbox.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Listbox v-bind="$attrs" class="listbox-demo" />
</template>

<style>
.listbox-demo {
  width: calc(var(--spacing) * 56);
}
</style>
