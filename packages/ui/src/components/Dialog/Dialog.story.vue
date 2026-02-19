<script setup lang="ts">
import { reactive } from "vue";

import Button from "../Button/Button.vue";

import Dialog from "./Dialog.vue";
import type { DialogProps } from "./Dialog.vue";

const state = reactive<Pick<DialogProps, "title" | "description" | "dismissible">>({
  title: "Dialog Title",
  description: "This is a description of the dialog.",

  dismissible: true,
});

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
  </Story>
</template>
