import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import FormField from "../FormField/FormField.vue";

import Textarea from "./Textarea.vue";
import type { TextareaProps } from "./Textarea.vue";

describe("Textarea", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with disabled", { props: { disabled: true } }],
    ["with rows", { props: { rows: 5 } }],
    ["with autoresize", { props: { autoresize: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "absolute" } }],
    ["with ui", { props: { ui: { base: "rounded-full" } } }],
  ] as [string, { props?: TextareaProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(Textarea, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, Textarea },
      template: `
        <FormField label="Label" hint="Hint" description="Description" help="Help">
          <Textarea />
        </FormField>
      `,
    });
    const screen = await page.render(Wrapper);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = await page.render(Textarea);

      await userEvent.fill(screen.getByRole("textbox"), "Hello, World!");

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
