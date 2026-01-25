import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { Key } from "webdriverio";

import type { InputProps, InputSlots } from "./Input.vue";
import Input from "./Input.vue";

describe("Input", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with name", { props: { name: "name" } }],
    ["with placeholder", { props: { placeholder: "Search..." } }],
    ["with disabled", { props: { disabled: true } }],
    ["with readonly", { props: { readonly: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "absolute" } }],
    ["with ui", { props: { ui: { base: "rounded-full" } } }],
    ["with default slot", { slots: { default: () => "Default slot" } }],
    ["with leading slot", { slots: { leading: () => "Leading slot" } }],
    ["with trailing slot", { slots: { trailing: () => "Trailing slot" } }],
  ] as [string, { props?: InputProps; slots?: Partial<InputSlots> }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Input, options);
    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(Input);
      const input = screen.getByRole("textbox");

      await userEvent.fill(input, "qwerty");

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("blur event", async () => {
      const screen = page.render(Input);
      const input = screen.getByRole("textbox");

      await userEvent.click(input);
      await userEvent.click(screen.baseElement);

      expect(screen.emitted()).toHaveProperty("blur");
    });

    test("change event", async () => {
      const screen = page.render(Input);
      const input = screen.getByRole("textbox");

      await userEvent.fill(input, "qwerty");
      await userEvent.keyboard(Key.Enter);

      expect(screen.emitted()).toHaveProperty("change");
    });
  });
});
