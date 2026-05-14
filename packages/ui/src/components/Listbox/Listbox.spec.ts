import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

import Listbox from "./Listbox.vue";
import type { ListboxItem, ListboxProps } from "./Listbox.vue";

describe("Listbox", () => {
  const sizes = ["sm", "md", "lg"] as const;

  const items: ListboxItem[] = ["Backlog", "Todo", "In Progress", "Done"];

  const groupedItems: ListboxItem[][] = [
    [{ type: "label", label: "Active" }, { label: "Backlog" }, { label: "Todo" }],
    [{ type: "separator" }, { label: "Done" }, { label: "Cancelled", disabled: true }],
  ];

  const props: ListboxProps = { items, scroll: false };

  test.each([
    ["with items", { props }],
    ["with modelValue", { props: { ...props, modelValue: items[0] } }],
    ["with multiple modelValue", { props: { ...props, multiple: true, modelValue: [items[0], items[1]] } }],
    ["with grouped items", { props: { ...props, items: groupedItems } }],
    ["with no items", { props: { ...props, items: [] } }],
    ["with filterInput", { props: { ...props, filterInput: true } }],
    ["with filterInput placeholder", { props: { ...props, filterInput: { placeholder: "Search items..." } } }],
    ["with scroll", { props: { ...props, scroll: true } }],
    ["with disabled", { props: { ...props, disabled: true } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, size } }] as const),
    ["with class", { props: { ...props, class: "w-64" } }],
    ["with ui", { props: { ...props, ui: { item: "rounded-none" } } }],
  ] as [string, { props?: ListboxProps; slots?: Record<string, () => any> }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = await page.render(Listbox as any, options);
      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );

  describe("emits", () => {
    test("update:modelValue when option is clicked", async () => {
      const screen = await page.render(Listbox as any, { props });

      const options = screen.getByRole("option").all();
      await userEvent.click(options[0]);

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("option-dblclick on double click", async () => {
      const screen = await page.render(Listbox as any, { props });

      const options = screen.getByRole("option").all();
      await userEvent.dblClick(options[0]);

      expect(screen.emitted()).toHaveProperty("option-dblclick");
    });

    test("update:filterValue when typing in filter input", async () => {
      const screen = await page.render(Listbox as any, { props: { ...props, filterInput: true } });

      const input = screen.getByRole("textbox");
      await userEvent.type(input, "Back");

      expect(screen.emitted()).toHaveProperty("update:filterValue");
    });
  });
});
