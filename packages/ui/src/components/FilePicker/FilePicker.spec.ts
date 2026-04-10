import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";

import FilePicker from "./FilePicker.vue";
import type { FilePickerProps } from "./FilePicker.vue";

describe("FilePicker", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with model value", { props: { modelValue: "path/to/file.txt" } }],
    ["with disabled", { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { base: "gap-4" } } }],
  ] as [string, { props?: FilePickerProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(FilePicker, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("emits pick event when button is clicked", async () => {
    const screen = await page.render(FilePicker);

    await userEvent.click(screen.getByRole("button", { name: "Choose File" }));

    expect(screen.emitted("pick")).toHaveLength(1);
  });

  test("does not emit pick event when disabled", async () => {
    const screen = await page.render(FilePicker, { props: { disabled: true } });

    await userEvent.click(screen.getByRole("button", { name: "Choose File" }));

    expect(screen.emitted("pick")).toBeUndefined();
  });
});
