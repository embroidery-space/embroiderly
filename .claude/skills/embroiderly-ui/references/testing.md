# Testing

Component tests use Vitest with Browser Mode (WebdriverIO) and snapshot testing.

Tests live in `packages/ui/src/components/ComponentName/ComponentName.spec.ts`.

## Standard Test

```ts
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import type { ButtonProps, ButtonSlots } from "./Button.vue";
import Button from "./Button.vue";

describe("Button", () => {
  const sizes = ["sm", "md", "lg"] as const;
  const variants = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;

  test.each([
    ["with label", { props: { label: "Button" } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { label: "Button", size } }]),
    ...variants.map((variant) => [`with primary variant ${variant}`, { props: { label: "Button", variant } }]),
    ...variants.map((variant) => [
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
      await nextTick();

      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );
});
```

## Interaction Tests

For testing behavior, use `userEvent` and `expect.element`:

```ts
import { userEvent } from "vitest/browser";

test("handles async onClick with loadingAuto", async () => {
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
```

## Running Tests

```bash
# Run all tests.
pnpm --filter @embroiderly/ui test

# Run tests for a specific component.
pnpm --filter @embroiderly/ui test Button

# Update snapshots.
pnpm --filter @embroiderly/ui test -u
```
