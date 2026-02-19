import { tv } from "tailwind-variants";

export const DialogTheme = tv({
  slots: {
    overlay:
      "fixed inset-0 bg-elevated/75 data-[state=closed]:animate-[fade-out_200ms_ease-in] data-[state=open]:animate-[fade-in_200ms_ease-out]",
    content:
      "fixed top-1/2 left-1/2 flex size-max max-h-[90%] max-w-[90%] min-w-md -translate-1/2 flex-col rounded-lg bg-default shadow-lg ring ring-default focus:outline-none data-[state=closed]:animate-[scale-out_200ms_ease-in] data-[state=open]:animate-[scale-in_200ms_ease-out]",
    header: "flex min-h-12 items-center gap-1.5 p-4",
    title: "font-semibold",
    description: "mt-1 text-sm text-muted",
    close: "absolute end-4 top-4",
    body: "flex-1 overflow-y-auto p-4",
    footer: "flex items-center justify-end gap-1.5 p-4",
  },
});

export type DialogThemeSlots = Partial<(typeof DialogTheme)["slots"]>;
