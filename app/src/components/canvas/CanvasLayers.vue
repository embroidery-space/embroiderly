<script setup lang="ts">
import { Checkbox } from "@embroiderly/ui";

import type { LayersVisibility } from "~/lib/pattern/";

const layers = defineModel<LayersVisibility>({ required: true });
</script>

<template>
  <div class="flex flex-col gap-y-2">
    <div class="grid grid-cols-2 grid-rows-2 gap-2">
      <Checkbox v-model="layers.referenceImage" :label="$t('canvas-layers-reference-image')" class="col-span-2" />

      <Checkbox v-model="layers.fullstitches" :label="$t('canvas-layers-fullstitches')" />
      <Checkbox v-model="layers.petitestitches" :label="$t('canvas-layers-petitestitches')" />

      <Checkbox v-model="layers.halfstitches" :label="$t('canvas-layers-halfstitches')" />
      <Checkbox v-model="layers.quarterstitches" :label="$t('canvas-layers-quarterstitches')" />

      <Checkbox v-model="layers.backstitches" :label="$t('canvas-layers-backstitches')" />
      <Checkbox v-model="layers.straightstitches" :label="$t('canvas-layers-straightstitches')" />

      <Checkbox v-model="layers.frenchknots" :label="$t('canvas-layers-frenchknots')" />
      <Checkbox v-model="layers.beads" :label="$t('canvas-layers-beads')" />

      <Checkbox v-model="layers.specialstitches" :label="$t('canvas-layers-specialstitches')" class="col-span-2" />
    </div>
  </div>
</template>
