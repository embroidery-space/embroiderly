import { createSharedComposable } from "@vueuse/core";

import { ConfirmDialog } from "#shared/components/";

export const useConfirm = createSharedComposable(() => {
  const overlay = useOverlay();
  return overlay.create(ConfirmDialog);
});
