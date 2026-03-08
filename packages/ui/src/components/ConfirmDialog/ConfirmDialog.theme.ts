import { tv } from "tailwind-variants";

export const ConfirmDialogTheme = tv({
  slots: {
    overlay:
      "fixed inset-0 bg-elevated/75 data-[state=closed]:animate-[fade-out_200ms_ease-in] data-[state=open]:animate-[fade-in_200ms_ease-out]",
    content:
      "fixed top-1/2 left-1/2 flex size-max max-h-[90%] max-w-[90%] min-w-md -translate-1/2 flex-col rounded-lg bg-default shadow-lg ring ring-default focus:outline-none data-[state=closed]:animate-[scale-out_200ms_ease-in] data-[state=open]:animate-[scale-in_200ms_ease-out]",
    header: "min-h-12 p-4 pb-0",
    title: "font-semibold",
    description: "mt-1 text-sm whitespace-pre-line text-muted",
    footer: "flex items-center justify-end gap-1.5 p-4",
  },
});

export type ConfirmDialogThemeSlots = Partial<(typeof ConfirmDialogTheme)["slots"]>;
