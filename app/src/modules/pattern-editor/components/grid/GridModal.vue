<script setup lang="ts">
import { Button, Dialog } from "@embroiderly/ui";

import { ref, toRaw } from "vue";

import { Grid } from "#pattern-editor/lib/pattern/";

import GridForm from "./GridForm.vue";

const props = defineProps<{ grid: Grid; onSave?: (grid: Grid) => void | Promise<void> }>();
const emit = defineEmits<{ close: [] }>();

const grid = ref<Grid>(new Grid(toRaw(props.grid)));

async function handleSave() {
  await props.onSave?.(grid.value);
  emit("close");
}
</script>

<template>
  <Dialog :title="$t('grid-properties')">
    <template #body>
      <GridForm v-model="grid" />
    </template>
    <template #footer>
      <Button :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <Button loading-auto :label="$t('modal-save')" @click="handleSave" />
    </template>
  </Dialog>
</template>
