import { tv } from "tailwind-variants";
import type { VariantProps } from "tailwind-variants";

export const ToastTheme = tv({
  slots: {
    root: "group relative flex items-start gap-2.5 overflow-hidden rounded-lg bg-default p-4 shadow-lg ring ring-default focus:outline-none",
    wrapper: "flex w-0 flex-1 flex-col",
    title: "text-sm font-medium",
    description: "text-sm whitespace-pre-line text-muted",
    actions: "mt-2.5 flex shrink-0 items-start gap-1.5",
    progress: "absolute inset-x-0 bottom-0",
    close: "p-0",
  },
  variants: {
    color: {
      primary: {
        root: "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
      },
      error: {
        root: "focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-inset",
      },
      warning: {
        root: "focus-visible:ring-2 focus-visible:ring-warning focus-visible:ring-inset",
      },
      success: {
        root: "focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-inset",
      },
      info: {
        root: "focus-visible:ring-2 focus-visible:ring-info focus-visible:ring-inset",
      },
      help: {
        root: "focus-visible:ring-2 focus-visible:ring-help focus-visible:ring-inset",
      },
      neutral: {
        root: "focus-visible:ring-2 focus-visible:ring-inverted focus-visible:ring-inset",
      },
    },
    title: {
      true: {
        description: "mt-1",
      },
    },
  },
});

export type ToastThemeVariants = VariantProps<typeof ToastTheme>;
export type ToastThemeSlots = Partial<(typeof ToastTheme)["slots"]>;
