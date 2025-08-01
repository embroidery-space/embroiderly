/* eslint-disable @typescript-eslint/no-explicit-any */
import ui from "@nuxt/ui/vite";
import RekaResolver from "reka-ui/resolver";

const STANDARD_VARIANTS: any = {
  size: "xl",
  color: "primary",
};
const FORM_FIELD_DEFAULT_VARIANTS: any = {
  ...STANDARD_VARIANTS,
  variant: "subtle",
};
const CHECKBOX_DEFAULT_VARIANTS: any = {
  ...STANDARD_VARIANTS,
  variant: "list",
  indicator: "start",
};

export const NuxtUIConfig: Parameters<typeof ui>[0] = {
  components: {
    resolvers: [RekaResolver({ prefix: "Reka" })],
  },
  autoImport: {
    dirs: ["src/components/", "src/composables/", "src/stores/"],
    packagePresets: ["fluent-vue"],
  },
  prefix: "Nuxt",
  ui: {
    colors: {
      primary: "primary",
      error: "error",
      success: "success",
      warning: "warning",
      info: "info",
    },
    button: {
      slots: {
        base: "text-base hover:cursor-pointer",
      },
      variants: {
        variant: {
          link: "text-base font-normal",
        },
        size: {
          md: {
            base: "text-base",
          },
        },
      },
    },
    modal: {
      slots: {
        overlay: "bg-black/50",
        footer: "justify-end",
      },
      variants: {
        fullscreen: {
          false: {
            content: "max-w-[90%] min-w-md max-h-[90%] w-auto",
          },
        },
      },
    },
    dropdownMenu: {
      slots: {
        content: "rounded-sm",
      },
    },
    contextMenu: {
      slots: {
        content: "rounded-sm",
      },
    },
    checkbox: { defaultVariants: CHECKBOX_DEFAULT_VARIANTS },
    input: { defaultVariants: FORM_FIELD_DEFAULT_VARIANTS },
    inputNumber: { defaultVariants: FORM_FIELD_DEFAULT_VARIANTS },
    select: { defaultVariants: FORM_FIELD_DEFAULT_VARIANTS },
    textarea: { defaultVariants: FORM_FIELD_DEFAULT_VARIANTS },
    toast: {
      slots: {
        description: [
          // This is needed to allow line breaks (`\n`) in toast messages.
          "whitespace-pre-line",
        ],
      },
    },
  },
};
