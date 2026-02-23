import { useOverlay } from "@embroiderly/ui";

import { createSharedComposable } from "@vueuse/core";
import { defineAsyncComponent } from "vue";

export const useEditorModals = createSharedComposable(() => {
  const overlay = useOverlay();

  const patternCreationModal = overlay.create(
    defineAsyncComponent(() => import("~/components/fabric/PatternCreationModal.vue")),
  );

  const imageImportModal = overlay.create(
    defineAsyncComponent(() => import("~/components/image-import/ImageImportModal.vue")),
  );

  const pdfExportModal = overlay.create(
    defineAsyncComponent(() => import("~/components/pdf-export/PdfExportModal.vue")),
  );
  const pdfExportOptionsModal = overlay.create(
    defineAsyncComponent(() => import("~/components/pdf-export/PdfExportOptionsModal.vue")),
  );

  const patternInfoModal = overlay.create(
    defineAsyncComponent(() => import("~/components/pattern-info/PatternInfoModal.vue")),
  );
  const fabricModal = overlay.create(defineAsyncComponent(() => import("~/components/fabric/FabricModal.vue")));
  const gridModal = overlay.create(defineAsyncComponent(() => import("~/components/grid/GridModal.vue")));

  return {
    patternCreationModal,

    imageImportModal,

    pdfExportModal,
    pdfExportOptionsModal,

    patternInfoModal,
    fabricModal,
    gridModal,
  };
});
