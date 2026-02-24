import { useOverlay } from "@embroiderly/ui";

import { createSharedComposable } from "@vueuse/core";

import FabricModal from "~/components/fabric/FabricModal.vue";
import PatternCreationModal from "~/components/fabric/PatternCreationModal.vue";
import GridModal from "~/components/grid/GridModal.vue";
import ImageImportModal from "~/components/image-import/ImageImportModal.vue";
import PatternInfoModal from "~/components/pattern-info/PatternInfoModal.vue";
import PdfExportModal from "~/components/pdf-export/PdfExportModal.vue";
import PdfExportOptionsModal from "~/components/pdf-export/PdfExportOptionsModal.vue";

export const useEditorModals = createSharedComposable(() => {
  const overlay = useOverlay();
  return {
    patternCreationModal: overlay.create(PatternCreationModal),

    imageImportModal: overlay.create(ImageImportModal),

    pdfExportModal: overlay.create(PdfExportModal),
    pdfExportOptionsModal: overlay.create(PdfExportOptionsModal),

    patternInfoModal: overlay.create(PatternInfoModal),
    fabricModal: overlay.create(FabricModal),
    gridModal: overlay.create(GridModal),
  };
});
