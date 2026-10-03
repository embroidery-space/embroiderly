import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { useArgs } from "storybook/preview-api";
import { expect, fn } from "storybook/test";
import { computed, ref } from "vue";

import Listbox from "./Listbox.vue";
import type { ListboxItem } from "./Listbox.vue";
import ListboxDemo from "./stories/ListboxDemo.vue";
import ListboxSizes from "./stories/ListboxSizes.vue";
import ListboxStates from "./stories/ListboxStates.vue";

const sizes = ["sm", "md", "lg"] as const;
const colors = ["primary", "neutral"] as const;

const flatItems: ListboxItem[] = ["Backlog", "Todo", "In Progress", "Done", "Cancelled"];

const groupedItems: ListboxItem[][] = [
  [{ type: "label", label: "Active" }, { label: "Backlog" }, { label: "Todo" }, { label: "In Progress" }],
  [{ type: "separator" }, { label: "Done" }, { label: "Cancelled", disabled: true }],
];

const meta = {
  title: "Form/Listbox",
  // @ts-expect-error `Listbox` is a generic component.
  component: Listbox,
  argTypes: {
    color: { control: "select", options: colors },
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof Listbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    multiple: false,
    disabled: false,
    highlightOnHover: true,
    filterInput: false,
    size: "md",
    color: "primary",
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    return {
      components: { ListboxDemo },
      setup: () => ({ args, flatItems, updateArgs }),
      template: `
        <ListboxDemo
          v-bind="args"
          :items="flatItems"
          @update:model-value="(value) => updateArgs({ modelValue: value })"
        />
      `,
    };
  },
};

export const Grouped: Story = {
  render: () => ({
    components: { ListboxDemo },
    setup: () => ({ groupedItems }),
    template: `<ListboxDemo :items="groupedItems" />`,
  }),
};

export const Filtering: Story = {
  render: () => ({
    components: { ListboxDemo },
    setup() {
      const filterValue = ref("");
      const filteredItems = computed(() =>
        flatItems.filter((item) =>
          typeof item === "object" && item.label
            ? item.label.toLowerCase().includes(filterValue.value.toLowerCase())
            : String(item).toLowerCase().includes(filterValue.value.toLowerCase()),
        ),
      );
      return { filterValue, filteredItems };
    },
    template: `<ListboxDemo v-model:filter-value="filterValue" :items="filteredItems" filter-input />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { ListboxSizes },
    setup: () => ({ flatItems }),
    template: `<ListboxSizes :items="flatItems" />`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { ListboxStates },
    setup: () => ({ flatItems }),
    template: `<ListboxStates :items="flatItems" />`,
  }),
};

export const Selected: Story = {
  args: { items: flatItems, "onUpdate:modelValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.click(canvas.getAllByRole("option")[0]!);
    await expect(args["onUpdate:modelValue"]).toHaveBeenCalledWith("Backlog");
  },
};

export const DoubleClicked: Story = {
  args: { items: flatItems, onOptionDblclick: fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.dblClick(canvas.getAllByRole("option")[0]!);
    await expect(args.onOptionDblclick).toHaveBeenCalled();
  },
};

export const Filtered: Story = {
  args: { items: flatItems, filterInput: true, "onUpdate:filterValue": fn() },
  tags: ["!autodocs"],
  async play({ canvas, userEvent, args }) {
    await userEvent.type(canvas.getByRole("textbox"), "Back");
    await expect(args["onUpdate:filterValue"]).toHaveBeenLastCalledWith("Back");
  },
};
