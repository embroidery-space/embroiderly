import { useOverlay } from "@embroiderly/ui";

import { createSharedComposable } from "@vueuse/core";
import { defineAsyncComponent } from "vue";

const ImageImportModal = defineAsyncComponent(() => import("~/components/image-import/ImageImportModal.vue"));

const PdfExportModal = defineAsyncComponent(() => import("~/components/pdf-export/PdfExportModal.vue"));
const PdfExportOptionsModal = defineAsyncComponent(() => import("~/components/pdf-export/PdfExportOptionsModal.vue"));

const PatternInfoModal = defineAsyncComponent(() => import("~/components/pattern-info/PatternInfoModal.vue"));
const FabricModal = defineAsyncComponent(() => import("~/fabric/components/FabricModal.vue"));
const GridModal = defineAsyncComponent(() => import("~/components/grid/GridModal.vue"));

export const useEditorModals = createSharedComposable(() => {
  const overlay = useOverlay();
  return {
    imageImportModal: overlay.create(ImageImportModal),

    pdfExportModal: overlay.create(PdfExportModal),
    pdfExportOptionsModal: overlay.create(PdfExportOptionsModal),

    patternInfoModal: overlay.create(PatternInfoModal),
    fabricModal: overlay.create(FabricModal),
    gridModal: overlay.create(GridModal),
  };
});
