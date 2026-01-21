import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import type { ButtonProps, ButtonSlots } from "./Button.vue";
import Button from "./Button.vue";

describe("Button", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;

  test.each([
    ["with label", { props: { label: "Button" } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { label: "Button", size } }]),
    ...variants.map((variant: string) => [`with primary variant ${variant}`, { props: { label: "Button", variant } }]),
    ...variants.map((variant: string) => [
      `with neutral variant ${variant}`,
      { props: { label: "Button", variant, color: "neutral" } },
    ]),
    [
      "with slots",
      {
        slots: {
          leading: () => "Leading slot",
          default: () => "Default slot",
          trailing: () => "Trailing slot",
        },
      },
    ],
  ] as [string, { props?: ButtonProps; slots?: Partial<ButtonSlots> }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = page.render(Button, options);
      expect(screen.container).toMatchSnapshot();
    },
  );
});
