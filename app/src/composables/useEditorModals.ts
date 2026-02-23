import { useOverlay } from "@embroiderly/ui";

import { createSharedComposable } from "@vueuse/core";
import { defineAsyncComponent } from "vue";

export const useEditorModals = createSharedComposable(() => {
  const overlay = useOverlay();

  const patternCreationModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/fabric/PatternCreationModal.vue")),
  );

  const imageImportModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/image-import/ImageImportModal.vue")),
  );

  const pdfExportModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/pdf-export/PdfExportModal.vue")),
  );
  const pdfExportOptionsModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/pdf-export/PdfExportOptionsModal.vue")),
  );

  const patternInfoModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/pattern-info/PatternInfoModal.vue")),
  );
  const fabricModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/fabric/FabricModal.vue")),
  );
  const gridModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/grid/GridModal.vue")),
  );

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
