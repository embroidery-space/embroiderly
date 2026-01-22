<script setup lang="ts">
  import ButtonIcon from "./ButtonIcon.vue";
</script>

<template>
  <Story title="ButtonIcon" :layout="{ type: 'single', iframe: false }">
    <Variant title="Demo" auto-props-disabled>
      <ButtonIcon variant="ghost" color="neutral" icon="lucide:settings" tooltip="Settings" :delay-duration="200" />
    </Variant>
  </Story>
</template>
