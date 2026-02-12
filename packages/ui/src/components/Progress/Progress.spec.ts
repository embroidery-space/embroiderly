import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import type { ProgressProps } from "./Progress.vue";
import Progress from "./Progress.vue";

describe("Progress", () => {
  const sizes = ["xs", "sm", "md", "lg", "xl"] as const;
  const orientations = ["horizontal", "vertical"] as const;

  test.each([
    ...orientations.map((orientation) => [`with orientation ${orientation}`, { props: { orientation } }]),
    ...sizes.map((size) => [`with size ${size}`, { props: { size } }]),
    ["with class", { props: { class: "my-4" } }],
    ["with ui", { props: { ui: { base: "bg-default" } } }],
  ] as [string, { props?: ProgressProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Progress, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });
});
