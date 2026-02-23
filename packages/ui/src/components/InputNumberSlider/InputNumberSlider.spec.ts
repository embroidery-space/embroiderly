/* eslint-disable vue/one-component-per-file */

import { TooltipProvider } from "reka-ui";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";
import { Key } from "webdriverio";

import FormField from "../FormField/FormField.vue";

import InputNumberSlider from "./InputNumberSlider.vue";
import type { InputNumberSliderProps } from "./InputNumberSlider.vue";

describe("InputNumberSlider", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with disabled", { props: { disabled: true } }],
    ["with min and max", { props: { min: 0, max: 50 } }],
    ["with step", { props: { step: 5 } }],
    ["with increment", { props: { increment: true } }],
    ["with decrement", { props: { decrement: true } }],
    ["with increment and decrement", { props: { increment: true, decrement: true } }],
    ["with tooltip", { props: { tooltip: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { root: "gap-4" } } }],
  ] as [string, { props?: InputNumberSliderProps }][])("renders correctly %s", async (_, options) => {
    const Wrapper = defineComponent({
      components: { TooltipProvider, InputNumberSlider },
      inheritAttrs: false,
      template: `
        <TooltipProvider>
          <InputNumberSlider v-bind="$attrs" />
        </TooltipProvider>
      `,
    });

    const screen = page.render(Wrapper, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, InputNumberSlider },
      template: `
        <FormField label="Label" hint="Hint" description="Description" help="Help">
          <InputNumberSlider />
        </FormField>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event from input", async () => {
      const screen = page.render(InputNumberSlider, { props: { min: 0, max: 100 } });
      await nextTick();

      const input = screen.getByRole("spinbutton");

      await userEvent.fill(input, "42");
      await userEvent.keyboard(Key.Enter);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("update:modelValue event from slider", async () => {
      const screen = page.render(InputNumberSlider, { props: { modelValue: 50, min: 0, max: 100 } });
      await nextTick();

      const slider = screen.getByRole("slider");

      await userEvent.click(slider);
      await userEvent.keyboard(Key.ArrowRight);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });

  describe("synchronization", () => {
    test("input and slider share the same value", async () => {
      const screen = page.render(InputNumberSlider, { props: { modelValue: 25, min: 0, max: 100 } });
      await nextTick();

      const input = screen.getByRole("spinbutton");
      const slider = screen.getByRole("slider");

      await expect.element(input).toHaveValue("25");
      await expect.element(slider).toHaveAttribute("aria-valuenow", "25");
    });

    test("changing input updates modelValue", async () => {
      const screen = page.render(InputNumberSlider, { props: { modelValue: 50, min: 0, max: 100 } });
      await nextTick();

      const input = screen.getByRole("spinbutton");

      await userEvent.clear(input);
      await userEvent.fill(input, "75");
      await userEvent.keyboard(Key.Enter);

      const emitted = screen.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toContain(75);
    });

    test("changing slider updates modelValue", async () => {
      const screen = page.render(InputNumberSlider, { props: { modelValue: 50, min: 0, max: 100 } });
      await nextTick();

      const slider = screen.getByRole("slider");

      await userEvent.click(slider);
      await userEvent.keyboard(Key.ArrowRight);

      const emitted = screen.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toContain(51);
    });
  });

  describe("increment/decrement buttons", () => {
    test("increment button is shown when increment=true", async () => {
      const screen = page.render(InputNumberSlider, { props: { increment: true } });
      await nextTick();

      await expect.element(screen.getByRole("button", { name: "Increment" })).toBeInTheDocument();
    });

    test("decrement button is shown when decrement=true", async () => {
      const screen = page.render(InputNumberSlider, { props: { decrement: true } });
      await nextTick();

      await expect.element(screen.getByRole("button", { name: "Decrement" })).toBeInTheDocument();
    });

    test("buttons are hidden by default", async () => {
      const screen = page.render(InputNumberSlider);
      await nextTick();

      await expect.element(screen.getByRole("button", { name: "Increment" })).not.toBeInTheDocument();
      await expect.element(screen.getByRole("button", { name: "Decrement" })).not.toBeInTheDocument();
    });
  });
});
