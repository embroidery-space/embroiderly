import UApp from "@nuxt/ui/components/App.vue";
import { expect, test, describe, vi } from "vitest";
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
      await expect.element(mainButton).toBeInTheDocument();

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await expect.element(dropdownButton).not.toBeInTheDocument();
    });

    test("renders multiple options with a dropdown button", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await expect.element(mainButton).toBeInTheDocument();

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await expect.element(dropdownButton).toBeInTheDocument();
    });
  });

  describe("Click Selection", () => {
    test("a click on the main button emits the model value update", async () => {
      const onUpdate = vi.fn();

      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await expect.element(mainButton).toBeEnabled();

      await mainButton.click();
      expect(onUpdate).toHaveBeenCalledWith(MULTIPLE_OPTIONS[0].value);
    });

    test("a click on the disabled button does not emit the model value update", async () => {
      const onUpdate = vi.fn();

      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
          disabled: true,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await expect.element(mainButton).toBeDisabled();

      await mainButton.click();
      expect(onUpdate).not.toHaveBeenCalled();
    });
  });

  describe("Dropdown Interaction", () => {
    test("a click on the dropdown button opens the dropdown menu", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
        },
      });

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      await dropdownButton.click();

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();

      const dropdownMenuItems = screen.getByRole("menuitem");
      await expect.element(dropdownMenuItems).toHaveLength(MULTIPLE_OPTIONS.length);
    });

    test("a right-click on the main button opens the dropdown menu", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ button: "right" });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();

      const dropdownMenuItems = screen.getByRole("menuitem");
      await expect.element(dropdownMenuItems).toHaveLength(MULTIPLE_OPTIONS.length);
    });

    test("a right-click on the single-option main button does nothing", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: SINGLE_OPTION,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ button: "right" });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).not.toBeInTheDocument();
    });

    test("a long-press on the main button opens the dropdown menu", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ duration: 600 });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();
    });

    test("a long-press on the single-option main button does nothing", async () => {
      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: SINGLE_OPTION,
          "onUpdate:modelValue": vi.fn(),
        },
      });

      const mainButton = screen.getByTestId("tool-selector-main-button");
      await mainButton.click({ duration: 600 });

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).not.toBeInTheDocument();
    });

    test("a click on an option from dropdown menu selects it", async () => {
      const onUpdate = vi.fn();

      const screen = page.render(ToolSelectorWrapper, {
        props: {
          modelValue: "pencil",
          options: MULTIPLE_OPTIONS,
          "onUpdate:modelValue": onUpdate,
        },
      });

      const dropdownButton = screen.getByTestId("tool-selector-dropdown-button");
      expect(dropdownButton).toBeInTheDocument();

      await dropdownButton.click();

      const dropdownMenu = screen.getByRole("menu");
      await expect.element(dropdownMenu).toBeInTheDocument();

      const targetDropdownMenuItem = screen.getByRole("menuitem").nth(1);
      await targetDropdownMenuItem.click();

      expect(onUpdate).toHaveBeenCalledWith(MULTIPLE_OPTIONS[1].value);
      await expect.element(dropdownMenu).not.toBeInTheDocument();
    });
  });
});
