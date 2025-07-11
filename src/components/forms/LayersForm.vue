<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <NuxtCheckbox v-model="layers.fullstitches" label="Full Stitches" />
      <NuxtCheckbox v-model="layers.petitestitches" label="Petite Stitches" />

      <NuxtCheckbox v-model="layers.halfstitches" label="Half Stitches" />
      <NuxtCheckbox v-model="layers.quarterstitches" label="Quarter Stitches" />

      <NuxtCheckbox v-model="layers.lines" label="Lines" />
      <NuxtCheckbox v-model="layers.nodes" label="Nodes" />

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
