import { createSharedComposable } from "@vueuse/core";

import ConfirmDialog from "../components/ConfirmDialog/ConfirmDialog.vue";

import { useOverlay } from "./useOverlay.ts";

export const useConfirm = createSharedComposable(() => {
  const overlay = useOverlay();
  return overlay.create(ConfirmDialog);
});
