import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import FormField from "../FormField/FormField.vue";

import Checkbox from "./Checkbox.vue";
import type { CheckboxProps } from "./Checkbox.vue";

describe("Checkbox", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with disabled", { props: { disabled: true } }],
    ["with icon", { props: { icon: "lucide:rocket" } }],
    ["with label", { props: { label: "Label" } }],
    ["with description", { props: { label: "Label", description: "Description" } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size, defaultValue: "1" } }]),
    ["with class", { props: { class: "inline-flex" } }],
    ["with ui", { props: { ui: { wrapper: "ms-4" } } }],
  ] as [string, { props?: CheckboxProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Checkbox, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, Checkbox },
      template: `
        <FormField>
          <Checkbox label="Label" />
        </FormField>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(Checkbox);
      await nextTick();

      const checkbox = screen.getByRole("checkbox");

      await userEvent.click(checkbox);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
