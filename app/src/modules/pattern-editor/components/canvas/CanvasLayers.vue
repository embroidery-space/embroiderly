<script setup lang="ts">
import { Checkbox } from "@embroiderly/ui";

import type { LayersVisibility } from "#pattern-editor/lib/pattern/";

const layers = defineModel<LayersVisibility>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <Checkbox
        v-model="layers.referenceImage"
        :label="$t('canvas-toolbar-layers-reference-image')"
        class="col-span-2"
      />

      <Checkbox v-model="layers.fullstitches" :label="$t('canvas-toolbar-layers-fullstitches')" />
      <Checkbox v-model="layers.petitestitches" :label="$t('canvas-toolbar-layers-petitestitches')" />

      <Checkbox v-model="layers.halfstitches" :label="$t('canvas-toolbar-layers-halfstitches')" />
      <Checkbox v-model="layers.quarterstitches" :label="$t('canvas-toolbar-layers-quarterstitches')" />

      <Checkbox v-model="layers.backstitches" :label="$t('canvas-toolbar-layers-backstitches')" />
      <Checkbox v-model="layers.straightstitches" :label="$t('canvas-toolbar-layers-straightstitches')" />

      <Checkbox v-model="layers.frenchknots" :label="$t('canvas-toolbar-layers-frenchknots')" />
      <Checkbox v-model="layers.beads" :label="$t('canvas-toolbar-layers-beads')" />

      <Checkbox
        v-model="layers.specialstitches"
        :label="$t('canvas-toolbar-layers-specialstitches')"
        class="col-span-2"
      />

      <Checkbox v-model="layers.grid" :label="$t('canvas-toolbar-layers-grid')" />
      <Checkbox v-model="layers.rulers" :label="$t('canvas-toolbar-layers-rulers')" />
    </div>
  </div>
</template>
