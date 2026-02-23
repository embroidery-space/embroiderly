import { describe, expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import Button from "./Button.vue";
import type { ButtonProps, ButtonSlots } from "./Button.vue";

describe("Button", () => {
  const sizes = ["sm", "md", "lg"] as const;
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;

  test.each([
    ["with label", { props: { label: "Button" } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { label: "Button", size } }]),
    ...variants.map((variant: string) => [`with primary variant ${variant}`, { props: { label: "Button", variant } }]),
    ...variants.map((variant: string) => [
      `with neutral variant ${variant}`,
      { props: { label: "Button", variant, color: "neutral" } },
    ]),
    ["with icon", { props: { label: "Button", icon: "lucide:rocket" } }],
    ["with icon and leading", { props: { label: "Button", icon: "lucide:rocket", leading: true } }],
    ["with icon and trailing", { props: { label: "Button", icon: "lucide:rocket", trailing: true } }],
    ["with leading icon", { props: { label: "Button", leadingIcon: "lucide:rocket" } }],
    ["with trailing icon", { props: { label: "Button", trailingIcon: "lucide:rocket" } }],
    [
      "with leading and trailing icons",
      { props: { label: "Button", leadingIcon: "lucide:rocket", trailingIcon: "lucide:rocket" } },
    ],
    ...sizes.map((size: string) => [
      `with square icon-only and size ${size}`,
      { props: { square: true, size, icon: "lucide:rocket" } },
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
      // @ts-expect-error Partial slots type is not compatible with `ComponentRenderOptions`.
      const screen = page.render(Button, options);
      await nextTick();

      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );

  describe("loading", () => {
    test("handles auto loading correctly", async () => {
      let resolvePromise: () => void;
      const asyncHandler = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolvePromise = resolve;
          }),
      );

      const screen = page.render(Button, {
        props: {
          label: "Submit",
          loadingAuto: true,
          onClick: asyncHandler,
        },
      });
      await nextTick();

      const button = screen.getByRole("button");
      await expect.element(button).not.toBeDisabled();

      await button.click();

      await expect.element(button).toBeDisabled();
      expect(asyncHandler).toHaveBeenCalledTimes(1);

      resolvePromise!();

      await expect.element(button).not.toBeDisabled();
    });

    test("handles multiple click handlers", async () => {
      const handler1 = vi.fn(() => Promise.resolve());
      const handler2 = vi.fn(() => Promise.resolve());

      const screen = page.render(Button, {
        props: {
          label: "Submit",
          loadingAuto: true,
          onClick: [handler1, handler2],
        },
      });
      await nextTick();

      await screen.getByRole("button").click();

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });
});
