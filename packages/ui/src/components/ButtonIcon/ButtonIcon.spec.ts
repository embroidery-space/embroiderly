import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent } from "vue";

import ButtonIcon from "./ButtonIcon.vue";
import type { ButtonIconProps } from "./ButtonIcon.vue";

const ButtonIconWrapper = defineComponent({
  components: { TooltipProvider, ButtonIcon },
  inheritAttrs: false,
  template: `
    <TooltipProvider>
      <ButtonIcon v-bind="$attrs" />
    </TooltipProvider>
  `,
});

describe("ButtonIcon", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
  const colors = ["primary", "neutral"] as const;

  const props: ButtonIconProps = {
    icon: "lucide:settings",
    tooltip: "Settings",
    tooltipOptions: {
      open: true,
      portal: false,
    },
  };

  test.each([
    ["with default props", { props }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, size } }]),
    ...variants.map((variant) => [`with variant ${variant}`, { props: { ...props, variant } }]),
    ...colors.map((color) => [`with color ${color}`, { props: { ...props, color } }]),
    ["with loading", { props: { ...props, loading: true } }],
    ["with disabled", { props: { ...props, disabled: true } }],
    ["with custom class", { props: { ...props, class: "font-medium" } }],
  ] as [string, { props: ButtonIconProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(ButtonIconWrapper, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
