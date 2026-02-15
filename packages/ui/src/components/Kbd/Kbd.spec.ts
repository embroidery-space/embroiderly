import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { nextTick } from "vue";

import type { KbdProps } from "./Kbd.vue";
import Kbd from "./Kbd.vue";

describe("Kbd", () => {
  const sizes = ["sm", "md", "lg"] as const;

  test.each([
    ["with value", { props: { value: "K" } }],
    ...sizes.map((size) => [`with size ${size}`, { props: { value: "K", size } }]),
    ["with as", { props: { value: "K", as: "span" } }],
    ["with class", { props: { value: "K", class: "font-bold" } }],
  ] as [string, { props?: KbdProps }][])("renders correctly %s", async (_, options) => {
    const screen = page.render(Kbd, options);
    await nextTick();

    expect(screen.container).toMatchSnapshot();
  });
});
