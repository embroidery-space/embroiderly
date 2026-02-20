<script setup lang="ts">
import { reactive } from "vue";

import { useToast } from "../../composables/useToast.ts";
import Button from "../Button/Button.vue";

import Toast from "./Toast.vue";
import type { ToastProps } from "./Toast.vue";
import Toaster from "./Toaster.vue";

const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"] as const;

const state = reactive<Pick<ToastProps, "title" | "description" | "color">>({
  title: "Toast Title",
  description: "This is a description of the toast.",

  color: "primary",
});

const toast = useToast();

let counter = 0;

function addToast() {
  counter++;
  toast.add({
    title: `Toast #${counter}`,
    description: `This is toast number ${counter}.`,
    color: colors[counter % colors.length],
  });
}

function addToastWithActions() {
  counter++;
  toast.add({
    title: "Something went wrong",
    description: "There was a problem with your request.",
    color: "error",
    actions: [{ label: "Retry", color: "neutral", variant: "outline" }],
  });
}

defineExpose({ state });
</script>

<template>
  <Story id="toast" group="overlay" title="Toast" :layout="{ type: 'single', iframe: false }">
    <Variant id="demo" title="Demo" auto-props-disabled>
      <Toaster :portal="false">
        <Toast v-bind="state" open class="w-2xs" />
      </Toaster>

      <template #controls>
        <HstText v-model="state.title" title="Title" />
        <HstText v-model="state.description" title="Description" />

        <HstSelect v-model="state.color" title="Color" :options="colors" />
      </template>
    </Variant>

    <Variant id="colors" title="Colors" auto-props-disabled>
      <Toaster :portal="false">
        <div class="flex flex-col gap-4">
          <Toast v-for="color in colors" :key="color" :color="color" :title="color" open class="w-2xs" />
        </div>
      </Toaster>
    </Variant>

    <Variant id="dynamic" title="Dynamic" auto-props-disabled>
      <Toaster>
        <div class="flex items-start gap-4">
          <Button label="Add Toast" @click="addToast" />
          <Button label="Add Toast with Actions" color="neutral" variant="outline" @click="addToastWithActions" />
          <Button label="Clear All" color="neutral" variant="ghost" @click="toast.clear()" />
        </div>
      </Toaster>
    </Variant>
  </Story>
</template>
