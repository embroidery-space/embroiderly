import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";

import BlockUI from "./BlockUI.vue";

describe("BlockUI", () => {
  test("renders correctly when blocked", async () => {
    const screen = await page.render(BlockUI, {
      props: { blocked: true },
      slots: { default: () => "Content" },
    });
    expect(screen.container.outerHTML).toMatchSnapshot();
  });

  test("renders correctly when not blocked", async () => {
    const screen = await page.render(BlockUI, {
      props: { blocked: false },
      slots: { default: () => "Content" },
    });
    expect(screen.container.outerHTML).toMatchSnapshot();
  });
});
