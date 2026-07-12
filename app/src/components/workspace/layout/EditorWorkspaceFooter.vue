<script lang="ts" setup>
import { ButtonIcon } from "@embroiderly/ui";

import { IconPanelLeftClose, IconPanelLeftOpen, IconPanelRightClose, IconPanelRightOpen } from "~/assets/icons/";
import { CanvasZoomControls } from "~/components/canvas/";
import { PaletteMode, useEditorStateStore } from "~/stores/";

const { disabled = false } = defineProps<{
  disabled?: boolean;
}>();

const editorStateStore = useEditorStateStore();
</script>

<template>
  <div class="flex items-center gap-2 border-t border-default px-2 py-1">
    <ButtonIcon
      color="neutral"
      variant="ghost"
      shortcut="Ctrl+Shift+L"
      :icon="editorStateStore.palettePanelCollapsed ? IconPanelLeftOpen : IconPanelLeftClose"
      :tooltip="editorStateStore.palettePanelCollapsed ? $t('palette-panel-expand') : $t('palette-panel-collapse')"
      :disabled="disabled || editorStateStore.paletteMode === PaletteMode.Editing"
      @click="
        () => {
          editorStateStore.palettePanelCollapsed = !editorStateStore.palettePanelCollapsed;
        }
      "
    />

    <CanvasZoomControls
      v-model="editorStateStore.canvasZoom"
      :min="1"
      :max="100"
      :disabled="disabled"
      class="ml-auto w-full max-w-3xs"
    />

    <ButtonIcon
      color="neutral"
      variant="ghost"
      shortcut="Ctrl+Shift+R"
      :icon="editorStateStore.canvasPanelCollapsed ? IconPanelRightOpen : IconPanelRightClose"
      :tooltip="editorStateStore.canvasPanelCollapsed ? $t('canvas-panel-expand') : $t('canvas-panel-collapse')"
      :disabled="disabled"
      @click="
        () => {
          editorStateStore.canvasPanelCollapsed = !editorStateStore.canvasPanelCollapsed;
        }
      "
    />
  </div>
</template>
