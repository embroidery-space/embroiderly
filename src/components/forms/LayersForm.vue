<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <NuxtCheckbox v-model="layers.fullstitches" label="Full Stitches" />
      <NuxtCheckbox v-model="layers.petitestitches" label="Petite Stitches" />

      <NuxtCheckbox v-model="layers.halfstitches" label="Half Stitches" />
      <NuxtCheckbox v-model="layers.quarterstitches" label="Quarter Stitches" />

      <NuxtCheckbox v-model="layers.backstitches" label="Back Stitches" />
      <NuxtCheckbox v-model="layers.straightstitches" label="Straight Stitches" />

      <NuxtCheckbox v-model="layers.frenchknots" label="French Knots" />
      <NuxtCheckbox v-model="layers.beads" label="Beads" />

      <NuxtCheckbox v-model="layers.specialstitches" label="Special Stitches" class="col-span-2" />

      <NuxtCheckbox v-model="layers.grid" label="Grid" />
      <NuxtCheckbox v-model="layers.rulers" label="Rulers" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { LayersVisibility } from "#/schemas/display.ts";

  const layers = defineModel<LayersVisibility>({ required: true });
</script>
