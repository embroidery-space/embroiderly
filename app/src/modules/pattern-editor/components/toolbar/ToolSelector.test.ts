import UApp from "@nuxt/ui/components/App.vue";
import { expect, test, describe } from "vitest";
import { page } from "vitest/browser";
import { defineComponent } from "vue";

import ToolSelector from "./ToolSelector.vue";

const SINGLE_OPTION = [{ label: "Pencil", icon: "i-lucide:pencil", value: "pencil" }];
const MULTIPLE_OPTIONS = [
  { label: "Pencil", icon: "i-lucide:pencil", value: "pencil" },
  { label: "Eraser", icon: "i-lucide:eraser", value: "eraser" },
  { label: "Brush", icon: "i-lucide:brush", value: "brush" },
];

const ToolSelectorWrapper = defineComponent({
  components: { UApp, ToolSelector },
  inheritAttrs: false,
  template: `<UApp> <ToolSelector v-bind="$attrs" /> </UApp>`,
});

describe("ToolSelector", () => {
  describe("Rendering States", () => {
    test("renders a single option without a dropdown button", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: SINGLE_OPTION,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      expect(mainButton).toBeInTheDocument();

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      expect(dropdownButton).not.toBeInTheDocument();
    });

    test("renders multiple options with a dropdown button", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      expect(mainButton).toBeInTheDocument();

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      expect(dropdownButton).toBeInTheDocument();
    });
  });
});
