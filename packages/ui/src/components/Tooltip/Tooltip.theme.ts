import { tv } from "tailwind-variants";

export const TooltipTheme = tv({
  slots: {
    content: `
      pointer-events-auto flex h-6
      origin-(--reka-tooltip-content-transform-origin) items-center gap-1
      rounded-sm bg-default px-2.5 py-1 text-xs shadow-sm ring ring-default
      select-none
      data-[state=closed]:animate-[scale-out_100ms_ease-in]
      data-[state=delayed-open]:animate-[scale-in_100ms_ease-out]
    `,
    arrow: "fill-default",
    text: "truncate",
    kbds: `
      hidden shrink-0 items-center gap-0.5
      not-first:before:me-0.5 not-first:before:content-['·']
      lg:inline-flex
    `,
  },
});

export type TooltipThemeSlots = Partial<(typeof TooltipTheme)["slots"]>;
