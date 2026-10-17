import type { Meta, StoryObj } from "@storybook/vue3-vite";

import InputFile from "./InputFile.vue";

const meta = {
  title: "Form/InputFile",
  // @ts-expect-error `InputFile` is a generic component.
  component: InputFile,
} satisfies Meta<typeof InputFile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {};
