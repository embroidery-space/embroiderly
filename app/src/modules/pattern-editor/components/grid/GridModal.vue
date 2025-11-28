<template>
  <UModal :title="$t('grid-properties')">
    <template #body>
      <GridForm v-model="grid" />
    </template>
    <template #footer>
      <UButton :label="$t('modal-cancel')" color="neutral" variant="outline" @click="emit('close')" />
      <UButton :label="$t('modal-save')" @click="emit('close', grid)" />
    </template>
  </UModal>
</template>

<script setup lang="ts">
  import { ref, toRaw } from "vue";

  import { Grid } from "~/modules/pattern-editor/lib/pattern/";

  import GridForm from "./GridForm.vue";

  const props = defineProps<{ grid: Grid }>();
  const emit = defineEmits<{ close: [grid?: Grid] }>();

  const grid = ref<Grid>(new Grid(toRaw(props.grid)));
</script>
