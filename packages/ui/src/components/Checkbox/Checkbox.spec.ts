import { describe, it, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import Checkbox from "./Checkbox.vue";
import type { CheckboxProps } from "./Checkbox.vue";

describe("Checkbox", () => {
  const sizes = ["sm", "md", "lg"] as const;

  it.each([
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
