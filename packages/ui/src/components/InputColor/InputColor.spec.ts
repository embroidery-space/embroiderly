import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import FormField from "../FormField/FormField.vue";

import InputColor from "./InputColor.vue";
import type { InputColorProps } from "./InputColor.vue";

describe("InputColor", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ...sizes.map((size) => [`with size ${size}`, { props: { size } }]),
    ["with disabled", { props: { disabled: true } }],
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { root: "rounded-none" } } }],
  ] as [string, { props?: InputColorProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(InputColor, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, InputColor },
      template: `
        <FormField label="Label" hint="Hint" description="Description" help="Help">
          <InputColor />
        </FormField>
      `,
    });
    const screen = await page.render(Wrapper);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = await page.render(InputColor, {
        props: { modelValue: "FF0000" },
      });

      await userEvent.fill(screen.getByRole("textbox"), "#00FF00");

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
