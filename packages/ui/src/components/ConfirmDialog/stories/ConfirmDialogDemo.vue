<script setup lang="ts">
import Button from "../../Button/Button.vue";
import ConfirmDialog from "../ConfirmDialog.vue";

defineOptions({ inheritAttrs: false });
</script>

<template>
  <ConfirmDialog v-bind="$attrs">
    <Button label="Open Confirm Dialog" />
  </ConfirmDialog>
</template>
