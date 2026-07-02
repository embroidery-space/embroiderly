<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Dialog from "../Dialog.vue";
</script>

<template>
  <Dialog title="Dynamic Dialog" description="This dialog was opened programmatically using useOverlay.">
    <template #body>
      <p>Do you want to confirm this action?</p>
    </template>

    <template #footer="{ close }">
      <Button label="Cancel" color="neutral" variant="outline" @click="close(false)" />
      <Button label="Confirm" @click="close(true)" />
    </template>
  </Dialog>
</template>
