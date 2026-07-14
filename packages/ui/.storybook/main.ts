import type { StorybookConfig } from "@storybook/vue3-vite";

export default {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.ts"],
  addons: ["@storybook/addon-docs", "@storybook/addon-vitest", "storybook-addon-vis"],
  framework: {
    name: "@storybook/vue3-vite",
    options: { docgen: "vue-component-meta" },
  },
} satisfies StorybookConfig;
