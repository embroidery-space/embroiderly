import type { Meta, StoryObj } from "@storybook/vue3-vite";
import z from "zod";

import Form from "./Form.vue";
import FormDemo from "./stories/FormDemo.vue";

const schema = z.object({
  email: z.email("Email must be valid"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/u, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/u, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/u, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/u, "Password must contain at least one special character"),
});

const meta = {
  title: "Form/Form",
  // @ts-expect-error `Form` is a generic component.
  component: Form,
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Demo: Story = {
  args: { schema },
  render: (args) => ({
    components: { FormDemo },
    setup: () => ({ args }),
    template: `<FormDemo v-bind="args" />`,
  }),
};
