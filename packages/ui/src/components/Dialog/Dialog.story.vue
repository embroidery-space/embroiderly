<script setup lang="ts">
import { reactive, ref } from "vue";

import { useOverlay } from "../../composables/useOverlay.ts";
import Button from "../Button/Button.vue";

import Dialog from "./Dialog.vue";
import type { DialogProps } from "./Dialog.vue";
import DynamicDialogExample from "./story/DynamicDialogExample.vue";

const state = reactive<Pick<DialogProps, "title" | "description" | "dismissible">>({
  title: "Dialog Title",
  description: "This is a description of the dialog.",

  dismissible: true,
});

const overlay = useOverlay();

const dynamicDialog = overlay.create(DynamicDialogExample);
const dynamicResult = ref<string>("No result yet");

async function openDynamicDialog() {
  const result = await dynamicDialog.open();
  dynamicResult.value = `Result: ${result}`;
}

defineExpose({ state });
</script>

<template>
  <Story id="dialog" group="overlay" title="Dialog" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Dialog v-bind="state">
        <Button label="Open Dialog" />

        <template #body>
          <Placeholder class="inline-flex h-48 w-full" />
        </template>

        <template #footer="{ close }">
          <Button label="Cancel" color="neutral" variant="outline" @click="close" />
          <Button label="Confirm" @click="close" />
        </template>
      </Dialog>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.description" title="Description" />

        <HstCheckbox v-model="state.dismissible" title="Dismissible" />
      </template>
    </Variant>

    <Variant id="dynamic" title="Dynamic Dialog" auto-props-disabled>
      <div class="flex flex-col items-start gap-4">
        <Button label="Open Dynamic Dialog" @click="openDynamicDialog" />
        <p class="text-sm text-muted">{{ dynamicResult }}</p>
      </div>
    </Variant>
  </Story>
</template>
