<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <NuxtCheckbox v-model="layers.fullstitches" :label="$t('label-layers-fullstitches')" />
      <NuxtCheckbox v-model="layers.petitestitches" :label="$t('label-layers-petitestitches')" />

      <NuxtCheckbox v-model="layers.halfstitches" :label="$t('label-layers-halfstitches')" />
      <NuxtCheckbox v-model="layers.quarterstitches" :label="$t('label-layers-quarterstitches')" />

      <NuxtCheckbox v-model="layers.backstitches" :label="$t('label-layers-backstitches')" />
      <NuxtCheckbox v-model="layers.straightstitches" :label="$t('label-layers-straightstitches')" />

      <NuxtCheckbox v-model="layers.frenchknots" :label="$t('label-layers-frenchknots')" />
      <NuxtCheckbox v-model="layers.beads" :label="$t('label-layers-beads')" />

      <NuxtCheckbox v-model="layers.specialstitches" :label="$t('label-layers-specialstitches')" class="col-span-2" />

      <NuxtCheckbox v-model="layers.grid" :label="$t('label-layers-grid')" />
      <NuxtCheckbox v-model="layers.rulers" :label="$t('label-layers-rulers')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { LayersVisibility } from "#/core/pattern/";

  const layers = defineModel<LayersVisibility>({ required: true });
</script>
