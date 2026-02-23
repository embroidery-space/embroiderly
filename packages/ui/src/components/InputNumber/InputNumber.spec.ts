import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";
import { Key } from "webdriverio";

import FormField from "../FormField/FormField.vue";

import InputNumber from "./InputNumber.vue";
import type { InputNumberProps } from "./InputNumber.vue";

describe("InputNumber", () => {
  const sizes = ["sm", "md", "lg"] as const;
  const variants = ["subtle", "outline"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with disabled", { props: { disabled: true } }],
    ["with min and max", { props: { min: 0, max: 100 } }],
    ["with step", { props: { step: 5 } }],
    ["without increment", { props: { increment: false } }],
    ["without decrement", { props: { decrement: false } }],
    ["without increment and decrement", { props: { increment: false, decrement: false } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ...variants.map((variant: string) => [`with variant ${variant}`, { props: { variant } }]),
    ["with class", { props: { class: "absolute" } }],
    ["with ui", { props: { ui: { base: "rounded-full" } } }],
  ] as [string, { props?: InputNumberProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(InputNumber, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, InputNumber },
      template: `
        <FormField label="Label" hint="Hint" description="Description" help="Help">
          <InputNumber />
        </FormField>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(InputNumber);
      await nextTick();

      const input = screen.getByRole("spinbutton");

      await userEvent.fill(input, "42");
      await userEvent.keyboard(Key.Enter);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });

  describe("increment/decrement buttons", () => {
    test("increment button increases value", async () => {
      const screen = page.render(InputNumber, { props: { modelValue: 5 } });
      await nextTick();

      const incrementButton = screen.getByRole("button", { name: "Increment" });
      await expect.element(incrementButton).toBeInTheDocument();

      await userEvent.click(incrementButton);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("decrement button decreases value", async () => {
      const screen = page.render(InputNumber, { props: { modelValue: 5 } });
      await nextTick();

      const decrementButton = screen.getByRole("button", { name: "Decrement" });
      await expect.element(decrementButton).toBeInTheDocument();

      await userEvent.click(decrementButton);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("buttons are hidden when increment=false and decrement=false", async () => {
      const screen = page.render(InputNumber, { props: { increment: false, decrement: false } });
      await nextTick();

      await expect.element(screen.getByRole("button", { name: "Increment" })).not.toBeInTheDocument();
      await expect.element(screen.getByRole("button", { name: "Decrement" })).not.toBeInTheDocument();
    });
  });
});
