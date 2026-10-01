import type { Meta, StoryObj } from "@storybook/vue3-vite";

import FormFieldGroup from "./FormFieldGroup.vue";
import FormFieldGroupDemo from "./stories/FormFieldGroupDemo.vue";
import FormFieldGroupSizes from "./stories/FormFieldGroupSizes.vue";
import FormFieldGroupWithButtons from "./stories/FormFieldGroupWithButtons.vue";
import FormFieldGroupWithInput from "./stories/FormFieldGroupWithInput.vue";
import FormFieldGroupWithInputNumber from "./stories/FormFieldGroupWithInputNumber.vue";

const sizes = ["sm", "md", "lg"] as const;

const meta = {
  title: "Form/FormFieldGroup",
  component: FormFieldGroup,
  argTypes: {
    size: { control: "select", options: sizes },
  },
} satisfies Meta<typeof FormFieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: {
    size: "md",
  },
  render: (args) => ({
    components: { FormFieldGroupDemo },
    setup: () => ({ args }),
    template: `<FormFieldGroupDemo v-bind="args" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { FormFieldGroupSizes },
    template: `<FormFieldGroupSizes />`,
  }),
};

export const WithButtons: Story = {
  render: () => ({
    components: { FormFieldGroupWithButtons },
    template: `<FormFieldGroupWithButtons />`,
  }),
};

export const WithInput: Story = {
  render: () => ({
    components: { FormFieldGroupWithInput },
    template: `<FormFieldGroupWithInput />`,
  }),
};

export const WithInputNumber: Story = {
  render: () => ({
    components: { FormFieldGroupWithInputNumber },
    template: `<FormFieldGroupWithInputNumber />`,
  }),
};
