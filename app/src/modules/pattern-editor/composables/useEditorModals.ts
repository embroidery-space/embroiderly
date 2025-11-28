import { createSharedComposable } from "@vueuse/core";
import { defineAsyncComponent } from "vue";

import { Fabric, Grid, PatternInfo, PdfExportOptions } from "~/core/pattern/";
import { useFilePicker } from "~/shared/composables/";
import { ANY_IMAGE_FILTER } from "~/shared/constants/";

import { FilesApi } from "../api/";

export const useEditorModals = createSharedComposable(() => {
  const overlay = useOverlay();

  const filePicker = useFilePicker();

  const imageImportModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/image-import/ImageImportModal.vue")),
  );
  async function openImageImportModal() {
    const imagePath = await filePicker.open({ filters: ANY_IMAGE_FILTER });
    if (imagePath === null) return;

    const imageDimensions = await FilesApi.getImageDimensions(imagePath);
    return imageImportModal.open({ imagePath, imageDimensions }).result;
  }

  const pdfExportModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/pdf-export/PdfExportModal.vue")),
  );
  async function openPdfExportModal(patternId: string, options: PdfExportOptions) {
    const filePath = (await FilesApi.getPatternFilePath(patternId)).replace(/\.[^.]+$/, ".pdf");
    return pdfExportModal.open({ filePath, options }).result;
  }

  const patternInfoModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/pattern-info/PatternInfoModal.vue")),
  );
  async function openPatternInfoModal(patternInfo: PatternInfo) {
    return patternInfoModal.open({ patternInfo }).result;
  }

  const fabricModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/fabric/FabricModal.vue")),
  );
  function openFabricModal(fabric: Fabric) {
    return fabricModal.open({ fabric }).result;
  }

  const gridModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/grid/GridModal.vue")),
  );
  function openGridModal(grid: Grid) {
    return gridModal.open({ grid }).result;
  }

  const pdfExportOptionsModal = overlay.create(
    defineAsyncComponent(() => import("~/modules/pattern-editor/components/pdf-export/PdfExportOptionsModal.vue")),
  );
  async function openPdfExportOptionsModal(options: PdfExportOptions) {
    return pdfExportOptionsModal.open({ options }).result;
  }

  return {
    openImageImportModal,
    openPdfExportModal,
    openPatternInfoModal,
    openFabricModal,
    openGridModal,
    openPdfExportOptionsModal,
  };
});
