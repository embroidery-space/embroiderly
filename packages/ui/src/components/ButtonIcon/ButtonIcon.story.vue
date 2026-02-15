<script setup lang="ts">
  import ButtonIcon from "./ButtonIcon.vue";
</script>

<template>
  <Story id="button-icon" group="element" title="ButtonIcon" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <ButtonIcon
        variant="ghost"
        color="neutral"
        icon="lucide:settings"
        tooltip="Settings"
        shortcut="Ctrl+,"
        :delay-duration="200"
      />
    </Variant>
  </Story>
</template>
