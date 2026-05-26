import { tv } from "tailwind-variants";

export const ToasterTheme = tv({
  slots: {
    base: `
      pointer-events-auto
      data-[state=closed]:animate-[slide-out-right_200ms_ease-in]
      data-[state=open]:animate-[slide-in-right_200ms_ease-out]
      data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform
      data-[swipe=end]:animate-[slide-out-right_100ms_ease-out]
      data-[swipe=move]:translate-x-(--reka-toast-swipe-move-x)
    `,
    viewport: `
      fixed right-4 bottom-4 z-100 flex w-[calc(100%-2rem)] flex-col-reverse
      gap-4 outline-none
      sm:w-96
    `,
  },
  variants: {
    /**
     * When `true`, renders the viewport inline (static positioning).
     * This is a test-only feature used in stories and specs where portal is disabled.
     */
    inline: {
      true: {
        viewport: "static w-auto",
      },
    },
  },
});

export type ToasterThemeSlots = Partial<(typeof ToasterTheme)["slots"]>;
