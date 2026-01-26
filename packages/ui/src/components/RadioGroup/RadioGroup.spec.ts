import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import RadioGroup from "./RadioGroup.vue";
import type { RadioGroupProps } from "./RadioGroup.vue";

describe("RadioGroup", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const items = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
  ];

  const props = { items };

  test.each([
    ["with items", { props }],
    [
      "with description",
      { props: { items: items.map((opt, count) => ({ ...opt, description: `Description ${count}` })) } },
    ],
    ["with disabled", { props: { ...props, disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { ...props, size, defaultValue: "1" } }]),
    ["with class", { props: { ...props, class: "absolute" } }],
    ["with ui", { props: { ...props, ui: { wrapper: "ms-4" } } }],
  ] as [string, { props?: RadioGroupProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(RadioGroup, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(RadioGroup, { props });
      await nextTick();

      const radio = screen.getByRole("radio").first();

      await userEvent.click(radio);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
