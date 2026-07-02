<script setup lang="ts">
import { reactive, ref } from "vue";

import { useConfirm } from "../../composables/useConfirm.ts";
import Button from "../Button/Button.vue";

import ConfirmDialog from "./ConfirmDialog.vue";
import type { ConfirmDialogProps } from "./ConfirmDialog.vue";

const state = reactive<Pick<ConfirmDialogProps, "title" | "description">>({
  title: "Save changes",
  description: "Do you want to save your changes before closing?",
});

const confirm = useConfirm();
const dynamicResult = ref<string>("No result yet");

async function openDynamicConfirm() {
  const result = await confirm.open({
    title: "Unsaved changes",
    description: "You have unsaved changes. Do you want to save them?",
  });
  dynamicResult.value = `Result: ${result}`;
}

defineExpose({ state });
</script>

<template>
  <Story id="confirm-dialog" group="overlay" title="ConfirmDialog" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <ConfirmDialog v-bind="state">
        <Button label="Open Confirm Dialog" />
      </ConfirmDialog>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstTextarea v-model="state.description" title="Description" />
      </template>
    </Variant>

    <Variant id="dynamic" title="Dynamic Confirm Dialog" auto-props-disabled>
      <div class="flex flex-col items-start gap-4">
        <Button label="Open Dynamic Confirm" @click="openDynamicConfirm" />
        <p class="text-sm text-muted">{{ dynamicResult }}</p>
      </div>
    </Variant>
  </Story>
</template>
