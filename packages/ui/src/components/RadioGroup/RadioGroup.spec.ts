import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import FormField from "../FormField/FormField.vue";

import RadioGroup from "./RadioGroup.vue";
import type { RadioGroupProps } from "./RadioGroup.vue";

describe("RadioGroup", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const items = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  test.each([
    ["with items", { props: { items } }],
    [
      "with description",
      { props: { items: items.map((opt, count) => ({ ...opt, description: `Description ${count}` })) } },
    ],
    ["with disabled", { props: { items, disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { items, size, defaultValue: "1" } }]),
    ["with class", { props: { items, class: "absolute" } }],
    ["with ui", { props: { items, ui: { wrapper: "ms-4" } } }],
  ] as [string, { props?: RadioGroupProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(RadioGroup as any, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, RadioGroup },
      template: `
        <FormField>
          <RadioGroup :items="['Option 1', 'Option 2']" />
        </FormField>
      `,
    });
    const screen = await page.render(Wrapper);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = await page.render(RadioGroup, { props: { items } });

      await userEvent.click(screen.getByRole("radio").first());

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
