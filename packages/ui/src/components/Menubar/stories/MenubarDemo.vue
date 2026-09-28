<script setup lang="ts">
import Menubar from "../Menubar.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Menubar v-bind="$attrs" />
</template>
