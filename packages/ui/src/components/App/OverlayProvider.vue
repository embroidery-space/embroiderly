<script setup lang="ts">
import { computed } from "vue";

import { useOverlay } from "../../composables/useOverlay.ts";
import type { Overlay } from "../../composables/useOverlay.ts";

const { overlays, unmount, close } = useOverlay();

const mountedOverlays = computed(() => overlays.filter((overlay: Overlay) => overlay.isMounted));
</script>

<template>
  <component
    :is="overlay.component"
    v-for="overlay in mountedOverlays"
    :key="overlay.id"
    v-bind="overlay.props"
    v-model:open="overlay.isOpen"
    @close="close(overlay.id, $event)"
    @after:leave="
      () => {
        close(overlay.id);
        unmount(overlay.id);
      }
    "
  />
</template>
