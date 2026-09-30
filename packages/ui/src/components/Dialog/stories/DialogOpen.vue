<script setup lang="ts">
import Button from "../../Button/Button.vue";
import Dialog from "../Dialog.vue";
import type { DialogProps } from "../Dialog.vue";

defineOptions({ inheritAttrs: false });
defineProps<Pick<DialogProps, "title">>();
</script>

<template>
  <div id="dialog-open">
    <Dialog v-bind="$attrs" :title="title">
      <Button label="Open Dialog" />

      <template #body>
        <Placeholder class="dialog-open-placeholder" />
      </template>

      <template #footer="{ close }">
        <Button label="Cancel" color="neutral" variant="outline" @click="close" />
        <Button label="Confirm" @click="close" />
      </template>
    </Dialog>
  </div>
</template>

<style>
#dialog-open {
  width: 100vw;
  height: 100vh;
}

.dialog-open-placeholder {
  display: inline-flex;

  width: 100%;
  height: calc(var(--spacing) * 48);
}
</style>
