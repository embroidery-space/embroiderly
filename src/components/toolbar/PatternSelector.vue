<template>
  <Select
    v-model="appStateStore.currentPattern"
    :options="appStateStore.openedPatterns"
    option-label="title"
    pt:root:class="border-0 rounded-none bg-transparent"
    @change="() => emit('switch', appStateStore.currentPattern!.id)"
  />
</template>

<script setup lang="ts">
  import Select from "primevue/select";
  import { useAppStateStore } from "#/stores/state";

  const emit = defineEmits<{ (e: "switch", id: string): void }>();

  const appStateStore = useAppStateStore();
</script>
