import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { expect } from "storybook/test";

import Editable from "./Editable.vue";
import EditableStates from "./stories/EditableStates.vue";

const meta = {
  title: "Form/Editable",
  component: Editable,
  argTypes: {
    activationMode: { control: "select", options: ["dblclick", "focus"] },
    submitMode: { control: "select", options: ["both", "enter", "blur"] },
  },
} satisfies Meta<typeof Editable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    defaultValue: "Hello World!",
    disabled: false,
    autoResize: false,
    activationMode: "dblclick",
    submitMode: "both",
  },
};

export const States: Story = {
  render: () => ({
    components: { EditableStates },
    template: `<EditableStates />`,
  }),
};

export const Editing: Story = {
  args: {
    defaultValue: "Hello World!",
    activationMode: "dblclick",
  },
  tags: ["!autodocs", "!snapshot"],
  async play({ canvas, userEvent }) {
    await userEvent.click(canvas.getByText("Hello World!"));
    await userEvent.keyboard("{F2}");

    await expect(canvas.getByRole("textbox")).toBeVisible();
  },
};
