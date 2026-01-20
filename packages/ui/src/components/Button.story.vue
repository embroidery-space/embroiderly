<script setup lang="ts">
  import Button from "./Button.vue";
</script>

<template>
  <Story title="Button">
    <Variant title="default">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </Variant>
  </Story>
</template>
