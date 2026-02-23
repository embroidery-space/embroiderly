import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import ColorPicker from "./ColorPicker.vue";
import type { ColorPickerProps } from "./ColorPicker.vue";

describe("ColorPicker", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with disabled", { props: { disabled: true } }],
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { selector: "rounded-lg" } } }],
  ] as [string, { props?: ColorPickerProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(ColorPicker, options);
    await nextTick();

    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  describe("emits", () => {
    test("update:modelValue on selector click", async () => {
      const screen = page.render(ColorPicker, { props: { modelValue: "#FF0000" } });
      await nextTick();

      const selector = screen.container.querySelector("[data-color-picker-selector]");
      expect(selector).toBeTruthy();

      const rect = selector!.getBoundingClientRect();
      const event = new MouseEvent("mousedown", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      });
      selector!.dispatchEvent(event);

      window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      await nextTick();

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("update:modelValue on track click", async () => {
      const screen = page.render(ColorPicker, { props: { modelValue: "#FF0000" } });
      await nextTick();

      const track = screen.container.querySelector("[data-color-picker-track]");
      expect(track).toBeTruthy();

      const rect = track!.getBoundingClientRect();
      const event = new MouseEvent("mousedown", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      });
      track!.dispatchEvent(event);

      window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      await nextTick();

      expect(screen.emitted()).toHaveProperty("update:modelValue");
    });

    test("does not emit when disabled", async () => {
      const screen = page.render(ColorPicker, { props: { modelValue: "#FF0000", disabled: true } });
      await nextTick();

      const selector = screen.container.querySelector("[data-color-picker-selector]");
      expect(selector).toBeTruthy();

      const rect = selector!.getBoundingClientRect();
      const event = new MouseEvent("mousedown", {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true,
      });
      selector!.dispatchEvent(event);

      window.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
      await nextTick();

      expect(screen.emitted()).not.toHaveProperty("update:modelValue");
    });
  });
});
