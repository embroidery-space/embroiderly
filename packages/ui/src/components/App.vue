<template>
  <ConfigProvider>
    <TooltipProvider>
      <slot />
    </TooltipProvider>
  </ConfigProvider>
</template>

<script setup lang="ts">
  import { ConfigProvider, TooltipProvider } from "reka-ui";
</script>
