import type { Meta, StoryObj } from "@storybook/vue3-vite";

import InputFile from "./InputFile.vue";
import InputFileSizes from "./stories/InputFileSizes.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/InputFile",
  // @ts-expect-error `InputFile` is a generic component.
  component: InputFile,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof InputFile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
    disabled: false,
  },
};

export const Sizes: Story = {
  render: () => ({
    components: { InputFileSizes },
    template: `<InputFileSizes />`,
  }),
};
