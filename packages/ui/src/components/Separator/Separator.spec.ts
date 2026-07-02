import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import Separator from "./Separator.vue";
import type { SeparatorProps } from "./Separator.vue";

describe("Separator", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const orientations = ["horizontal", "vertical"] as const;

  test.each([
    ...orientations.map((orientation) => [`with orientation ${orientation}`, { props: { orientation } }]),
    ...sizes.map((size) => [`with size ${size}`, { props: { size } }]),
    ["with decorative", { props: { decorative: true } }],
    ["with class", { props: { class: "my-4" } }],
    ["with ui", { props: { ui: { base: "border-primary" } } }],
  ] as [string, { props?: SeparatorProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(Separator, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
