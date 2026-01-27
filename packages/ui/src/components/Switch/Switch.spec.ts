import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import Switch from "./Switch.vue";
import type { SwitchProps } from "./Switch.vue";

describe("Switch", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with disabled", { props: { disabled: true } }],
    ["with label", { props: { label: "Label" } }],
    ["with description", { props: { label: "Label", description: "Description" } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "inline-flex" } }],
    ["with ui", { props: { ui: { wrapper: "ms-4" } } }],
  ] as [string, { props?: SwitchProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Switch, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(Switch);
      await nextTick();

      const switchElement = screen.getByRole("switch");

      await userEvent.click(switchElement);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
