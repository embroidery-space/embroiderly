<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Dialog from "../Dialog.vue";
import type { DialogProps } from "../Dialog.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<DialogProps, "title">>();
</script>

<template>
  <Dialog v-bind="$attrs" :title="title">
    <Button label="Open Dialog" />

    <template #body>
      <Placeholder class="dialog-demo-placeholder" />
    </template>

    <template #footer="{ close }">
      <Button label="Cancel" color="neutral" variant="outline" @click="close" />
      <Button label="Confirm" @click="close" />
    </template>
  </Dialog>
</template>

<style>
.dialog-demo-placeholder {
  display: inline-flex;

  width: 100%;
  height: calc(var(--spacing) * 48);
}
</style>
