import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import InputFile from "./InputFile.vue";
import type { InputFileProps } from "./InputFile.vue";

describe("InputFile", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with custom label", { props: { label: "path/to/file.txt" } }],
    ["with accept", { props: { accept: "image/*" } }],
    ["with multiple", { props: { multiple: true } }],
    ["with disabled", { props: { disabled: true } }],
    ...sizes.map((size: string) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "w-64" } }],
    ["with ui", { props: { ui: { base: "gap-4" } } }],
  ] as [string, { props?: InputFileProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(InputFile, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
