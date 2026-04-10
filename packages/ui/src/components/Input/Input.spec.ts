import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent } from "vue";

import FormField from "../FormField/FormField.vue";

import Input from "./Input.vue";
import type { InputProps, InputSlots } from "./Input.vue";

describe("Input", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with id", { props: { id: "id" } }],
    ["with disabled", { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "absolute" } }],
    ["with ui", { props: { ui: { base: "rounded-full" } } }],
    ["with icon", { props: { icon: "lucide:rocket" } }],
    ["with icon and leading", { props: { icon: "lucide:rocket", leading: true } }],
    ["with icon and trailing", { props: { icon: "lucide:rocket", trailing: true } }],
    ["with leading icon", { props: { leadingIcon: "lucide:rocket" } }],
    ["with trailing icon", { props: { trailingIcon: "lucide:rocket" } }],
    ["with leading and trailing icons", { props: { leadingIcon: "lucide:rocket", trailingIcon: "lucide:rocket" } }],
    ["with leading slot", { slots: { leading: () => "Leading slot" } }],
    ["with trailing slot", { slots: { trailing: () => "Trailing slot" } }],
  ] as [string, { props?: InputProps; slots?: Partial<InputSlots> }][])("renders correctly %s", async (_, options) => {
    // @ts-expect-error Partial slots type is not compatible with `ComponentRenderOptions`.
    const screen = await page.render(Input, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
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
    const screen = await page.render(Wrapper);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = await page.render(Input);

      await userEvent.fill(screen.getByRole("textbox"), "qwerty");

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
