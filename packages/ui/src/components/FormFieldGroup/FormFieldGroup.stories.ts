import type { Meta, StoryObj } from "@storybook/vue3-vite";

import FormFieldGroup from "./FormFieldGroup.vue";
import FormFieldGroupDemo from "./stories/FormFieldGroupDemo.vue";
import FormFieldGroupWithButtons from "./stories/FormFieldGroupWithButtons.vue";
import FormFieldGroupWithInput from "./stories/FormFieldGroupWithInput.vue";
import FormFieldGroupWithInputNumber from "./stories/FormFieldGroupWithInputNumber.vue";

const meta = {
  title: "Form/FormFieldGroup",
  component: FormFieldGroup,
} satisfies Meta<typeof FormFieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  render: (args) => ({
    components: { FormFieldGroupDemo },
    setup: () => ({ args }),
    template: `<FormFieldGroupDemo v-bind="args" />`,
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
