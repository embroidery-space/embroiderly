import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import Kbd from "./Kbd.vue";
import type { KbdProps } from "./Kbd.vue";

describe("Kbd", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with value", { props: { value: "K" } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { value: "K", size } }]),
    ["with as", { props: { value: "K", as: "span" } }],
    ["with class", { props: { value: "K", class: "font-bold" } }],
  ] as [string, { props?: KbdProps }][])("renders correctly %s", async (_, options) => {
    const screen = await page.render(Kbd, options);
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
