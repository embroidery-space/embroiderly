import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import InputDimensions from "./InputDimensions.vue";
import type { InputDimensionsProps } from "./InputDimensions.vue";

const InputDimensionsWrapper = defineComponent({
  components: { TooltipProvider, InputDimensions },
  inheritAttrs: false,
  template: `
    <TooltipProvider>
      <InputDimensions v-bind="$attrs" />
    </TooltipProvider>
  `,
});

describe("InputDimensions", () => {
  const sizes = ["sm", "md", "lg"] as const;
  const orientations = ["horizontal", "vertical"] as const;

  test.each([
    ["with disabled", { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ...orientations.map((orientation: string) => [`with orientation ${orientation}`, { props: { orientation } }]),
    ["with aspectRatio", { props: { aspectRatio: 1.5 } }],
    ["with widthInputOptions", { props: { widthInputOptions: { min: 0, max: 100 } } }],
    ["with heightInputOptions", { props: { heightInputOptions: { min: 0, max: 100 } } }],
    ["with widthFieldOptions", { props: { widthFieldOptions: { label: "Width", hint: "px" } } }],
    ["with heightFieldOptions", { props: { heightFieldOptions: { label: "Height", hint: "px" } } }],
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { root: "gap-4" } } }],
  ] as [string, { props?: InputDimensionsProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(InputDimensionsWrapper, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:width event", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { width: 100, height: 50 },
      });

      const widthInput = screen.getByRole("spinbutton").nth(0);

      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");

      await expect.element(widthInput).toHaveValue("200");
    });

    test("update:height event", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { width: 100, height: 50 },
      });

      const heightInput = screen.getByRole("spinbutton").nth(1);

      await userEvent.fill(heightInput, "75");
      await userEvent.keyboard("{Enter}");

      await expect.element(heightInput).toHaveValue("75");
    });
  });

  describe("aspect ratio lock", () => {
    test("lock starts inactive without aspectRatio prop", async () => {
      const screen = await page.render(InputDimensionsWrapper);

      const lockButton = screen.getByRole("button", { name: "Lock aspect ratio" });

      await expect.element(lockButton).toBeInTheDocument();
      await expect.element(lockButton).toHaveAttribute("aria-pressed", "false");
    });

    test("lock starts active with aspectRatio prop", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { aspectRatio: 2 },
      });

      const unlockButton = screen.getByRole("button", { name: "Unlock aspect ratio" });

      await expect.element(unlockButton).toBeInTheDocument();
      await expect.element(unlockButton).toHaveAttribute("aria-pressed", "true");
    });

    test("lock button toggles state", async () => {
      const screen = await page.render(InputDimensionsWrapper);

      const lockButton = screen.getByRole("button", { name: "Lock aspect ratio" });
      await userEvent.click(lockButton);

      const unlockButton = screen.getByRole("button", { name: "Unlock aspect ratio" });
      await expect.element(unlockButton).toHaveAttribute("aria-pressed", "true");
    });

    test("changing width proportionally updates height when locked", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { width: 100, height: 50, aspectRatio: 2 },
      });

      const widthInput = screen.getByRole("spinbutton").nth(0);
      const heightInput = screen.getByRole("spinbutton").nth(1);

      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");

      await expect.element(heightInput).toHaveValue("100");
    });

    test("changing height proportionally updates width when locked", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { width: 100, height: 50, aspectRatio: 2 },
      });

      const widthInput = screen.getByRole("spinbutton").nth(0);
      const heightInput = screen.getByRole("spinbutton").nth(1);

      await userEvent.fill(heightInput, "100");
      await userEvent.keyboard("{Enter}");

      await expect.element(widthInput).toHaveValue("200");
    });

    test("changing width does not update height when unlocked", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { width: 100, height: 50 },
      });

      const widthInput = screen.getByRole("spinbutton").nth(0);
      const heightInput = screen.getByRole("spinbutton").nth(1);

      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");

      await expect.element(heightInput).toHaveValue("50");
    });

    test("reacts to aspectRatio prop changes", async () => {
      const screen = await page.render(InputDimensionsWrapper, {
        props: { width: 100, height: 50, aspectRatio: 2 },
      });

      const widthInput = screen.getByRole("spinbutton").nth(0);
      const heightInput = screen.getByRole("spinbutton").nth(1);

      // Verify initial ratio (2:1).
      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");
      await expect.element(heightInput).toHaveValue("100");

      // Update ratio to 1:1.
      await screen.rerender({ aspectRatio: 1 });

      // Verify new ratio.
      await userEvent.fill(widthInput, "300");
      await userEvent.keyboard("{Enter}");
      await expect.element(heightInput).toHaveValue("300");
    });
  });
});
