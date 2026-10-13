import type { Meta, StoryObj } from "@storybook/vue3-vite";

import FormField from "./FormField.vue";
import FormFieldDemo from "./stories/FormFieldDemo.vue";

const meta = {
  title: "Form/FormField",
  component: FormField,
} satisfies Meta<typeof FormField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    label: "Email address",
    description: "",
  },
  render: (args) => ({
    components: { FormFieldDemo },
    setup: () => ({ args }),
    template: `<FormFieldDemo v-bind="args" />`,
  }),
};
