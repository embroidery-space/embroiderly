import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { defineComponent } from "vue";

import Input from "../Input/Input.vue";

import FormField from "./FormField.vue";
import type { FormFieldProps } from "./FormField.vue";

const FormFieldWrapper = defineComponent({
  components: { FormField, Input },
  template: `<FormField><Input /></FormField>`,
});

describe("FormField", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with label", { props: { label: "Label" } }],
    ["with description", { props: { label: "Label", description: "Description" } }],
    ["with hint", { props: { label: "Label", hint: "Hint" } }],
    ["with help", { props: { label: "Label", help: "Help" } }],
    ["with all elements", { props: { label: "Label", description: "Description", hint: "Hint", help: "Help" } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { label: "Label", size } }]),
    ["with class", { props: { label: "Label", class: "custom-class" } }],
    ["with ui", { props: { label: "Label", ui: { root: "rounded-lg" } } }],
  ] as [string, { props?: FormFieldProps; slots?: { default: () => string } }][])(
    "renders correctly %s",
    async (_, options) => {
      const screen = await page.render(FormFieldWrapper, options);
      expect(screen.container.outerHTML).toMatchSnapshot();
    },
  );

  describe("accessibility", () => {
    test("generates unique id for label association", async () => {
      const screen = await page.render(FormFieldWrapper, {
        props: { label: "Label" },
      });

      const input = screen.getByRole("textbox");
      const label = screen.getByText("Label");

      const inputId = input.element().getAttribute("id");
      const labelFor = label.element().getAttribute("for");

      expect(inputId).not.toBeNull();
      expect(labelFor).not.toBeNull();
      expect(labelFor).toEqual(inputId);
    });

    test("applies aria id to description element", async () => {
      const screen = await page.render(FormFieldWrapper, {
        props: { label: "Label", description: "Description" },
      });

      const input = screen.getByRole("textbox");
      const description = screen.getByText("Description");

      const inputId = input.element().getAttribute("id");
      const descriptionId = description.element().getAttribute("id");

      expect(inputId).not.toBeNull();
      expect(descriptionId).not.toBeNull();
      expect(descriptionId).toEqual(inputId + "-description");
    });

    test("applies aria id to hint element", async () => {
      const screen = await page.render(FormFieldWrapper, {
        props: { label: "Label", hint: "Hint" },
      });

      const input = screen.getByRole("textbox");
      const hint = screen.getByText("Hint");

      const inputId = input.element().getAttribute("id");
      const hintId = hint.element().getAttribute("id");

      expect(inputId).not.toBeNull();
      expect(hintId).not.toBeNull();
      expect(hintId).toEqual(inputId + "-hint");
    });

    test("applies aria id to help element", async () => {
      const screen = await page.render(FormFieldWrapper, {
        props: { label: "Label", help: "Help" },
      });

      const input = screen.getByRole("textbox");
      const help = screen.getByText("Help");

      const inputId = input.element().getAttribute("id");
      const helpId = help.element().getAttribute("id");

      expect(inputId).not.toBeNull();
      expect(helpId).not.toBeNull();
      expect(helpId).toEqual(inputId + "-help");
    });
  });
});
