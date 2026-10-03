<script setup lang="ts">
import RadioGroup from "../RadioGroup.vue";
</script>

<template>
  <div id="radio-group-states">
    <RadioGroup :items="['Default']" />
    <RadioGroup :items="['Disabled']" disabled />
    <RadioGroup :items="['Selected']" :model-value="'Selected'" />
    <RadioGroup :items="['Selected disabled']" :model-value="'Selected disabled'" disabled />
  </div>
</template>

<style>
#radio-group-states {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 2);
}
</style>
