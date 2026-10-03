<script setup lang="ts">
import RadioGroup from "../RadioGroup.vue";
import type { RadioGroupItem } from "../RadioGroup.vue";

const items: RadioGroupItem[] = [
  { value: 1, label: "Option 1", description: "Description 1" },
  { value: 2, label: "Option 2", description: "Description 2" },
  { value: 3, label: "Option 3", description: "Description 3" },
];
</script>

<template>
  <RadioGroup orientation="horizontal" :items="items" />
</template>
