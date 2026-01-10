<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <UCheckbox
        v-model="layers.referenceImage"
        :label="$t('canvas-toolbar-layers-reference-image')"
        class="col-span-2"
      />

      <UCheckbox v-model="layers.fullstitches" :label="$t('canvas-toolbar-layers-fullstitches')" />
      <UCheckbox v-model="layers.petitestitches" :label="$t('canvas-toolbar-layers-petitestitches')" />

      <UCheckbox v-model="layers.halfstitches" :label="$t('canvas-toolbar-layers-halfstitches')" />
      <UCheckbox v-model="layers.quarterstitches" :label="$t('canvas-toolbar-layers-quarterstitches')" />

      <UCheckbox v-model="layers.backstitches" :label="$t('canvas-toolbar-layers-backstitches')" />
      <UCheckbox v-model="layers.straightstitches" :label="$t('canvas-toolbar-layers-straightstitches')" />

      <UCheckbox v-model="layers.frenchknots" :label="$t('canvas-toolbar-layers-frenchknots')" />
      <UCheckbox v-model="layers.beads" :label="$t('canvas-toolbar-layers-beads')" />

      <UCheckbox
        v-model="layers.specialstitches"
        :label="$t('canvas-toolbar-layers-specialstitches')"
        class="col-span-2"
      />

      <UCheckbox v-model="layers.grid" :label="$t('canvas-toolbar-layers-grid')" />
      <UCheckbox v-model="layers.rulers" :label="$t('canvas-toolbar-layers-rulers')" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { LayersVisibility } from "#pattern-editor/lib/pattern/";

  const layers = defineModel<LayersVisibility>({ required: true });
</script>
