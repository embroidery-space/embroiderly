<script setup lang="ts">
import type { InputNumberProps } from "@nuxt/ui";

type InputNumberSliderProps = Pick<
  InputNumberProps,
  "increment" | "decrement" | "min" | "max" | "step" | "formatOptions"
>;

const value = defineModel<number>();
const props = withDefaults(defineProps<InputNumberSliderProps>(), {
  increment: false,
  decrement: false,
});
</script>

<template>
  <div class="flex items-center gap-x-2">
    <UInputNumber v-model="value" v-bind="props" />
    <USlider v-model="value" v-bind="props" class="w-full" />
  </div>
</template>
