import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import ScrollArea from "./ScrollArea.vue";
import type { ScrollAreaProps } from "./ScrollArea.vue";

describe("ScrollArea", () => {
  const orientations = ["vertical", "horizontal"] as const;
  const sizes = ["sm", "md", "lg"] as const;

  const props: ScrollAreaProps = {
    type: "always",
  };

  test.each([
    ...orientations.map((orientation) => [`with orientation ${orientation}`, { props: { ...props, orientation } }]),
    ...sizes.map((size) => [`with size ${size}`, { props: { ...props, size } }]),
    ["with class", { props: { ...props, class: "h-64" } }],
    ["with ui", { props: { ...props, ui: { thumb: "bg-primary" } } }],
  ] as [string, { props?: ScrollAreaProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(ScrollArea, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
