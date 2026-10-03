<script setup lang="ts">
import { useToast } from "../../../composables/useToast.ts";
import Button from "../../Button/Button.vue";
import Toaster from "../Toaster.vue";

const colors = ["primary", "error", "warning", "success", "info", "help", "neutral"] as const;

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
</script>

<template>
  <Toaster>
    <div id="toast-dynamic">
      <Button label="Add Toast" @click="addToast" />
      <Button label="Add Toast with Actions" color="neutral" variant="outline" @click="addToastWithActions" />
      <Button label="Clear All" color="neutral" variant="ghost" @click="toast.clear" />
    </div>
  </Toaster>
</template>

<style>
#toast-dynamic {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: flex-start;
}
</style>
