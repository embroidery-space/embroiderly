<script setup lang="ts">
import { computed } from "vue";

import { useOverlay } from "../../composables/useOverlay.ts";
import type { Overlay } from "../../composables/useOverlay.ts";

const { overlays, unmount, close } = useOverlay();

const mountedOverlays = computed(() => overlays.filter((overlay: Overlay) => overlay.isMounted));

function onAfterLeave(id: symbol) {
  close(id);
  unmount(id);
}

function onClose(id: symbol, value: unknown) {
  close(id, value);
}
</script>

<template>
  <component
    :is="overlay.component"
    v-for="overlay in mountedOverlays"
    :key="overlay.id"
    v-bind="overlay.props"
    v-model:open="overlay.isOpen"
    @close="(value: unknown) => onClose(overlay.id, value)"
    @after:leave="onAfterLeave(overlay.id)"
  />
</template>
