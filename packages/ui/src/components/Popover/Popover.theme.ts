import { tv } from "tailwind-variants";

export const PopoverTheme = tv({
  slots: {
    content: `
      pointer-events-auto origin-(--reka-popover-content-transform-origin)
      rounded-md bg-default shadow-lg ring ring-default
      focus:outline-none
      data-[state=closed]:animate-[scale-out_100ms_ease-in]
      data-[state=open]:animate-[scale-in_100ms_ease-out]
    `,
    arrow: "fill-default",
  },
});

export type PopoverThemeSlots = Partial<(typeof PopoverTheme)["slots"]>;
