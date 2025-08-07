<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <UCheckbox v-model="layers.fullstitches" label="Full Stitches" />
      <UCheckbox v-model="layers.petitestitches" label="Petite Stitches" />

      <UCheckbox v-model="layers.halfstitches" label="Half Stitches" />
      <UCheckbox v-model="layers.quarterstitches" label="Quarter Stitches" />

      <UCheckbox v-model="layers.backstitches" label="Back Stitches" />
      <UCheckbox v-model="layers.straightstitches" label="Straight Stitches" />

      <UCheckbox v-model="layers.frenchknots" label="French Knots" />
      <UCheckbox v-model="layers.beads" label="Beads" />

      <UCheckbox v-model="layers.specialstitches" label="Special Stitches" class="col-span-2" />

      <UCheckbox v-model="layers.grid" label="Grid" />
      <UCheckbox v-model="layers.rulers" label="Rulers" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { LayersVisibility } from "#/core/pattern/";

  const layers = defineModel<LayersVisibility>({ required: true });
</script>
