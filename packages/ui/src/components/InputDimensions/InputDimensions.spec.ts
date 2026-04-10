/* eslint-disable vue/one-component-per-file */

import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, ref } from "vue";

import InputDimensions from "./InputDimensions.vue";
import type { InputDimensionsProps } from "./InputDimensions.vue";

describe("InputDimensions", () => {
  const sizes = ["sm", "md", "lg"] as const;
  const orientations = ["horizontal", "vertical"] as const;

  test.each([
    ["with disabled", { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ...orientations.map((orientation: string) => [`with orientation ${orientation}`, { props: { orientation } }]),
    ["with aspectRatio", { props: { aspectRatio: 1.5 } }],
    ["with widthInputOptions", { props: { widthinputOptions: { min: 0, max: 100 } } }],
    ["with heightInputOptions", { props: { heightinputOptions: { min: 0, max: 100 } } }],
    ["with widthFieldOptions", { props: { widthFieldOptions: { label: "Width", hint: "px" } } }],
    ["with heightFieldOptions", { props: { heightFieldOptions: { label: "Height", hint: "px" } } }],
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { root: "gap-4" } } }],
  ] as [string, { props?: InputDimensionsProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(InputDimensions, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:width event", async () => {
      const Wrapper = defineComponent({
        components: { InputDimensions },
        setup() {
          return { width: ref(100), height: ref(50) };
        },
        template: `<InputDimensions v-model:width="width" v-model:height="height" />`,
      });
      const screen = await page.render(Wrapper);

      const inputs = screen.container.querySelectorAll<HTMLInputElement>("[role='spinbutton']");
      const widthInput = page.elementLocator(inputs[0]!);

      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");

      expect(screen.getByRole("spinbutton").elements()[0]).toHaveValue("200");
    });

    test("update:height event", async () => {
      const Wrapper = defineComponent({
        components: { InputDimensions },
        setup() {
          return { width: ref(100), height: ref(50) };
        },
        template: `<InputDimensions v-model:width="width" v-model:height="height" />`,
      });
      const screen = await page.render(Wrapper);

      const inputs = screen.container.querySelectorAll<HTMLInputElement>("[role='spinbutton']");
      const heightInput = page.elementLocator(inputs[1]!);

      await userEvent.fill(heightInput, "75");
      await userEvent.keyboard("{Enter}");

      expect(screen.getByRole("spinbutton").elements()[1]).toHaveValue("75");
    });
  });

  describe("aspect ratio lock", () => {
    test("lock starts inactive without aspectRatio prop", async () => {
      const screen = await page.render(InputDimensions);

      const lockButton = screen.getByRole("button", { name: "Lock aspect ratio" });

      await expect.element(lockButton).toBeInTheDocument();
      await expect.element(lockButton).toHaveAttribute("aria-pressed", "false");
    });

    test("lock starts active with aspectRatio prop", async () => {
      const screen = await page.render(InputDimensions, { props: { aspectRatio: 2 } });

      const unlockButton = screen.getByRole("button", { name: "Unlock aspect ratio" });

      await expect.element(unlockButton).toBeInTheDocument();
      await expect.element(unlockButton).toHaveAttribute("aria-pressed", "true");
    });

    test("lock button toggles state", async () => {
      const screen = await page.render(InputDimensions);

      const lockButton = screen.getByRole("button", { name: "Lock aspect ratio" });
      await userEvent.click(lockButton);

      const unlockButton = screen.getByRole("button", { name: "Unlock aspect ratio" });
      await expect.element(unlockButton).toHaveAttribute("aria-pressed", "true");
    });

    test("changing width proportionally updates height when locked", async () => {
      const Wrapper = defineComponent({
        components: { InputDimensions },
        setup() {
          return { width: ref(100), height: ref(50) };
        },
        template: `<InputDimensions v-model:width="width" v-model:height="height" :aspect-ratio="2" />`,
      });
      const screen = await page.render(Wrapper);

      const inputs = screen.container.querySelectorAll<HTMLInputElement>("[role='spinbutton']");
      const widthInput = page.elementLocator(inputs[0]!);

      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");

      expect(inputs[1]).toHaveValue("100");
    });

    test("changing height proportionally updates width when locked", async () => {
      const Wrapper = defineComponent({
        components: { InputDimensions },
        setup() {
          return { width: ref(100), height: ref(50) };
        },
        template: `<InputDimensions v-model:width="width" v-model:height="height" :aspect-ratio="2" />`,
      });
      const screen = await page.render(Wrapper);

      const inputs = screen.container.querySelectorAll<HTMLInputElement>("[role='spinbutton']");
      const heightInput = page.elementLocator(inputs[1]!);

      await userEvent.fill(heightInput, "100");
      await userEvent.keyboard("{Enter}");

      expect(inputs[0]).toHaveValue("200");
    });

    test("changing width does not update height when unlocked", async () => {
      const Wrapper = defineComponent({
        components: { InputDimensions },
        setup() {
          return { width: ref(100), height: ref(50) };
        },
        template: `<InputDimensions v-model:width="width" v-model:height="height" />`,
      });
      const screen = await page.render(Wrapper);

      const inputs = screen.container.querySelectorAll<HTMLInputElement>("[role='spinbutton']");
      const widthInput = page.elementLocator(inputs[0]!);

      await userEvent.fill(widthInput, "200");
      await userEvent.keyboard("{Enter}");

      expect(inputs[1]).toHaveValue("50");
    });
  });
});
