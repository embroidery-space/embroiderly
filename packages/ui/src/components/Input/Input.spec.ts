import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import FormField from "../FormField/FormField.vue";

import type { InputProps, InputSlots } from "./Input.vue";
import Input from "./Input.vue";

describe("Input", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with disabled", { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "absolute" } }],
    ["with ui", { props: { ui: { base: "rounded-full" } } }],
    ["with leading slot", { slots: { leading: () => "Leading slot" } }],
    ["with trailing slot", { slots: { trailing: () => "Trailing slot" } }],
  ] as [string, { props?: InputProps; slots?: Partial<InputSlots> }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Input, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, Input },
      template: `
        <FormField label="Label" hint="Hint" description="Description" help="Help">
          <Input />
        </FormField>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(Input);
      await nextTick();

      const input = screen.getByRole("textbox");

      await userEvent.fill(input, "qwerty");

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
