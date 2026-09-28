<script setup lang="ts">
import Button from "../../Button/Button.vue";
import ConfirmDialog from "../ConfirmDialog.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div id="confirm-dialog-open">
    <ConfirmDialog v-bind="$attrs">
      <Button label="Open Confirm Dialog" />
    </ConfirmDialog>
  </div>
</template>

<style>
#confirm-dialog-open {
  width: 100vw;
  height: 100vh;
}
</style>
