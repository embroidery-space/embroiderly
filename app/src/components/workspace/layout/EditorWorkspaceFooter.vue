<script lang="ts" setup>
import { CanvasZoomControls } from "~/components/canvas/";
import { MIN_SCALE, MAX_SCALE } from "~/lib/pixi/";
import { useEditorStateStore } from "~/stores/";

const { disabled = false } = defineProps<{
  disabled?: boolean;
}>();

const editorStateStore = useEditorStateStore();
</script>

<template>
  <div class="flex items-center justify-between border-t border-default px-2 py-1">
    <CanvasZoomControls
      v-model="editorStateStore.canvasZoom"
      :min="MIN_SCALE"
      :max="MAX_SCALE"
      :disabled="disabled"
      class="ml-auto w-full max-w-3xs"
    />
  </div>
</template>
