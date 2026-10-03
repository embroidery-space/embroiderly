<script setup lang="ts">
import InputDimensions from "../InputDimensions.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <InputDimensions v-bind="$attrs" />
</template>
