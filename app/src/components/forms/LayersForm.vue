<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <UCheckbox v-model="layers.referenceImage" :label="$t('label-layers-reference-image')" class="col-span-2" />

      <UCheckbox v-model="layers.fullstitches" :label="$t('label-layers-fullstitches')" />
      <UCheckbox v-model="layers.petitestitches" :label="$t('label-layers-petitestitches')" />

      <UCheckbox v-model="layers.halfstitches" :label="$t('label-layers-halfstitches')" />
      <UCheckbox v-model="layers.quarterstitches" :label="$t('label-layers-quarterstitches')" />

      <UCheckbox v-model="layers.backstitches" :label="$t('label-layers-backstitches')" />
      <UCheckbox v-model="layers.straightstitches" :label="$t('label-layers-straightstitches')" />

      <UCheckbox v-model="layers.frenchknots" :label="$t('label-layers-frenchknots')" />
      <UCheckbox v-model="layers.beads" :label="$t('label-layers-beads')" />

      <UCheckbox v-model="layers.specialstitches" :label="$t('label-layers-specialstitches')" class="col-span-2" />

      <UCheckbox v-model="layers.grid" :label="$t('label-layers-grid')" />
      <UCheckbox v-model="layers.rulers" :label="$t('label-layers-rulers')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { LayersVisibility } from "~/core/pattern/";

  const layers = defineModel<LayersVisibility>({ required: true });
</script>
