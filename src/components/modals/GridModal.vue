<template>
  <NuxtModal :title="$t('title-grid-properties')">
    <template #body>
      <GridForm v-model="grid" />
    </template>
    <template #footer>
      <NuxtButton :label="$t('label-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <NuxtButton :label="$t('label-save')" @click="updateGrid" />
    </template>
  </NuxtModal>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { Grid } from "#/core/pattern/";
  import GridForm from "../forms/GridForm.vue";

  const props = defineProps<{ grid: Grid }>();
  const emit = defineEmits<{ close: [] }>();

  const patternsStore = usePatternsStore();

  // Copy the data from the props to a reactive object.
  const grid = ref<Grid>(new Grid(props.grid));

  async function updateGrid() {
    await patternsStore.updateGrid(grid.value);
    emit("close");
  }
</script>
