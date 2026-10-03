<script setup lang="ts">
import Tabs from "../Tabs.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <Tabs v-bind="$attrs" />
</template>
