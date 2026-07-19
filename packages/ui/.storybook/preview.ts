import { addCollection } from "@iconify/vue";
import lucideIcons from "@iconify-json/lucide/icons.json";
import { setup } from "@storybook/vue3-vite";
import type { Preview } from "@storybook/vue3-vite";

import App from "../src/components/App/App.vue";

import Placeholder from "./components/Placeholder.vue";
import DocsTemplate from "./DocsTemplate.mdx";

import "../src/index.css";

// Load Lucide icons offline.
addCollection(lucideIcons);

setup((app) => {
  app.component("Placeholder", Placeholder);
});

export default {
  decorators: [
    () => ({
      components: { App },
      template: `
        <App :portal="false" :toaster="null">
          <div data-vis-subject>
            <story />
          </div>
        </App>
      `,
    }),
    (story, context) => {
      document.documentElement.style.colorScheme = String(context.globals["theme"]);
      return story();
    },
  ],
  globalTypes: {
    theme: {
      description: "Color scheme for components",
      toolbar: {
        title: "Theme",
        icon: "sun",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    docs: { page: DocsTemplate },
    options: {
      storySort: {
        order: ["General", "Layout", "Element", "Form", "Toolbar", "Data", "Navigation", "Overlay"],
      },
    },
  },
  tags: ["autodocs", "snapshot", "!dev"],
} satisfies Preview;
