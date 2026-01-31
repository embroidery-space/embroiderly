import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { nextTick } from "vue";

import type { InputColorProps } from "./InputColor.vue";
import InputColor from "./InputColor.vue";

describe("InputColor", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ...sizes.map((size) => [`with size ${size}`, { props: { size } }]),
    ["with disabled", { props: { disabled: true } }],
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { root: "rounded-none" } } }],
  ] as [string, { props?: InputColorProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(InputColor, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(InputColor, {
        props: { modelValue: "FF0000" },
      });
      await nextTick();

      const input = screen.getByRole("textbox");
      await userEvent.fill(input, "#00FF00");

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
