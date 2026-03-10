import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { defineComponent, nextTick } from "vue";

import FormField from "../FormField/FormField.vue";

import Select from "./Select.vue";
import type { SelectItem, SelectProps } from "./Select.vue";

describe("Select", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const items: SelectItem[] = [
    { label: "Backlog", value: "backlog" },
    { label: "Todo", value: "todo" },
    { label: "In Progress", value: "in-progress" },
    { label: "Done", value: "done" },
  ];

  const groupedItems: SelectItem[][] = [
    [
      { type: "label", label: "Active" },
      { label: "Backlog", value: "backlog", icon: "lucide:circle-dashed" },
      { label: "Todo", value: "todo", icon: "lucide:circle" },
    ],
    [
      { type: "label", label: "Closed" },
      { label: "Done", value: "done", icon: "lucide:circle-check" },
      { label: "Cancelled", value: "cancelled", disabled: true },
    ],
  ];

  const itemsWithSeparator: SelectItem[] = [
    { label: "Backlog", value: "backlog" },
    { label: "Todo", value: "todo" },
    { type: "separator" },
    { label: "Done", value: "done" },
  ];

  const props = { items, open: true, portal: false };

  test.each([
    ["with items", { props }],
    ["with modelValue", { props: { ...props, modelValue: "backlog" } }],
    ["with placeholder", { props: { ...props, placeholder: "Select a status..." } }],
    ["with searchInput", { props: { ...props, searchInput: true } }],
    ["with searchInput placeholder", { props: { ...props, searchInput: { placeholder: "Search..." } } }],
    ["with loading", { props: { ...props, loading: true } }],
    ["with disabled", { props: { ...props, disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { ...props, size } }]),
    ["with class", { props: { ...props, class: "absolute" } }],
    ["with ui", { props: { ...props, ui: { base: "rounded-full" } } }],
    ["with grouped items", { props: { ...props, items: groupedItems } }],
    ["with separator", { props: { ...props, items: itemsWithSeparator } }],
    ["with icons", { props: { ...props, items: groupedItems, modelValue: "backlog" } }],
    ["with disabled item", { props: { ...props, items: groupedItems } }],
  ] as [string, { props?: SelectProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Select as any, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly within FormField", async () => {
    const Wrapper = defineComponent({
      components: { FormField, Select },
      template: `
        <FormField label="Label" hint="Hint" description="Description" help="Help">
          <Select :items="['Option 1', 'Option 2']" />
        </FormField>
      `,
    });
    const screen = page.render(Wrapper);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue event", async () => {
      const screen = page.render(Select, { props: { ...props } });
      await nextTick();

      const select = screen.getByRole("button");
      await userEvent.click(select);

      const item = screen.getByRole("option").first();
      await userEvent.click(item);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });
  });
});
