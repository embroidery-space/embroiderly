import { useOverlay } from "@embroiderly/ui";

import { createSharedComposable } from "@vueuse/core";
import { defineAsyncComponent } from "vue";

const ImageImportModal = defineAsyncComponent(() => import("~/components/image-import/ImageImportModal.vue"));

const PdfExportModal = defineAsyncComponent(() => import("~/pdf-export/components/PdfExportModal.vue"));

const PatternInfoModal = defineAsyncComponent(() => import("~/components/pattern-info/PatternInfoModal.vue"));
const FabricModal = defineAsyncComponent(() => import("~/fabric/components/FabricModal.vue"));
const FabricColorsModal = defineAsyncComponent(() => import("~/fabric/components/FabricColorsModal.vue"));
const GridModal = defineAsyncComponent(() => import("~/components/grid/GridModal.vue"));

export const useEditorModals = createSharedComposable(() => {
  const overlay = useOverlay();
  return {
    imageImportModal: overlay.create(ImageImportModal),

    pdfExportModal: overlay.create(PdfExportModal),

    patternInfoModal: overlay.create(PatternInfoModal),
    fabricModal: overlay.create(FabricModal),
    fabricColorsModal: overlay.create(FabricColorsModal),
    gridModal: overlay.create(GridModal),
  };
});
